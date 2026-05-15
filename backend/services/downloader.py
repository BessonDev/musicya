import asyncio
import json
import logging
import os
import tempfile
import shutil

import httpx

logger = logging.getLogger("musicya.downloader")

DOWNLOAD_TIMEOUT = 120  # seconds
COBALT_API = "https://api.cobalt.tools/api/json"
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")
COOKIES_PATH = os.getenv("COOKIES_FILE", "/app/cookies.txt")


class DownloadError(Exception):
    pass


async def run_cmd(cmd: list[str], timeout: int = DOWNLOAD_TIMEOUT) -> str:
    """Run a shell command asynchronously and return stdout."""
    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )

    try:
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=timeout)
    except asyncio.TimeoutError:
        proc.kill()
        await proc.wait()
        raise DownloadError(f"Command timed out after {timeout}s")

    if proc.returncode != 0:
        err_msg = stderr.decode(errors="replace").strip()
        raise DownloadError(f"Command failed (code {proc.returncode}): {err_msg}")

    return stdout.decode(errors="replace")


async def search_youtube_video(artist: str, title: str) -> str:
    """
    Search YouTube for a song and return the first video URL.
    Uses YouTube Data API v3.
    """
    if not YOUTUBE_API_KEY:
        raise DownloadError("YOUTUBE_API_KEY no configurada en el servidor")

    query = f"{artist} {title}"
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://www.googleapis.com/youtube/v3/search",
            params={
                "part": "snippet",
                "q": query,
                "type": "video",
                "maxResults": 1,
                "key": YOUTUBE_API_KEY,
            },
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()

        items = data.get("items", [])
        if not items:
            raise DownloadError("No se encontró ningún video en YouTube para esa canción")

        video_id = items[0]["id"]["videoId"]
        return f"https://www.youtube.com/watch?v={video_id}"


# Invidious instances - se prueban en orden hasta que una funcione
INVIDIOUS_INSTANCES = [
    "https://yewtu.be",
    "https://invidious.snopyta.org",
    "https://invidious.kavin.rocks",
    "https://iv.datura.app",
]


async def invidious_download(video_url: str, temp_dir: str) -> str:
    """
    Download audio from YouTube via Invidious (no blocks, no auth needed).
    """
    # Extract video ID from URL
    import re
    match = re.search(r'(?:v=|youtu\.be/)([a-zA-Z0-9_-]{11})', video_url)
    if not match:
        raise DownloadError("No se pudo extraer el ID del video de YouTube")
    
    video_id = match.group(1)
    output_path = os.path.join(temp_dir, "output.mp3")
    
    # Try each Invidious instance
    for instance in INVIDIOUS_INSTANCES:
        try:
            async with httpx.AsyncClient() as client:
                for itag in ("251", "140"):
                    url = f"{instance}/latestversion?id={video_id}&itag={itag}"
                    resp = await client.get(url, timeout=60, follow_redirects=True)
                    if resp.status_code != 200:
                        logger.warning("Invidious %s itag %s: HTTP %d", instance, itag, resp.status_code)
                        continue
                    
                    ext = "opus" if itag == "251" else "m4a"
                    temp_audio = os.path.join(temp_dir, f"audio.{ext}")
                    with open(temp_audio, "wb") as f:
                        f.write(resp.content)
                    
                    await run_cmd([
                        "ffmpeg",
                        "-i", temp_audio,
                        "-codec:a", "libmp3lame",
                        "-b:a", "320k",
                        "-y",
                        output_path,
                    ], timeout=DOWNLOAD_TIMEOUT)
                    
                    if os.path.exists(output_path):
                        return output_path
        except Exception as e:
            logger.warning("Invidious %s falló: %s", instance, e)
            continue
    
    raise DownloadError("No se pudo descargar desde ninguna instancia de Invidious")


async def download_itunes_preview(preview_url: str, temp_dir: str) -> str:
    """
    Download the iTunes preview URL directly and transcode to MP3.
    The preview URL comes from iTunes search results.
    """
    output_path = os.path.join(temp_dir, "preview.m4a")
    mp3_path = os.path.join(temp_dir, "output.mp3")
    
    # Download the preview file
    async with httpx.AsyncClient() as client:
        resp = await client.get(preview_url, timeout=60)
        resp.raise_for_status()
        
        with open(output_path, "wb") as f:
            f.write(resp.content)
    
    # Convert to MP3 with FFmpeg
    await run_cmd([
        "ffmpeg",
        "-i", output_path,
        "-codec:a", "libmp3lame",
        "-b:a", "320k",
        "-y",
        mp3_path,
    ], timeout=DOWNLOAD_TIMEOUT)
    
    if not os.path.exists(mp3_path):
        raise DownloadError("La conversión a MP3 falló")
    
    return mp3_path


async def ytdlp_download(video_url: str, temp_dir: str, use_cookies: bool = False) -> str:
    """
    Download audio from YouTube URL using yt-dlp directly.
    If use_cookies=True and cookies.txt exists, it will be passed to yt-dlp.
    """
    output_template = os.path.join(temp_dir, "%(title)s.%(ext)s")
    
    cmd = [
        "yt-dlp",
        "-f", "bestaudio",
        "--extract-audio",
        "--audio-format", "mp3",
        "--audio-quality", "0",
        "-o", output_template,
        "--no-playlist",
        "--js-runtimes", "node",
    ]
    
    if use_cookies and os.path.exists(COOKIES_PATH):
        cmd.extend(["--cookies", COOKIES_PATH])
    
    cmd.extend(["--", video_url])
    
    await run_cmd(cmd, timeout=DOWNLOAD_TIMEOUT)
    
    # Find the downloaded file
    mp3_file = None
    for f in os.listdir(temp_dir):
        if f.endswith('.mp3'):
            mp3_file = os.path.join(temp_dir, f)
            break
    
    if not mp3_file:
        raise DownloadError("No se encontró el archivo MP3 descargado")
    
    return mp3_file


async def cobalt_download(video_url: str, temp_dir: str) -> str:
    """
    Download audio from a YouTube URL via cobalt.tools API.
    Returns path to the downloaded MP3 file.
    """
    output_path = os.path.join(temp_dir, "output.mp3")

    async with httpx.AsyncClient() as client:
        # Try multiple cobalt endpoints
        endpoints = [
            "https://api.cobalt.tools/api/json",
            "https://api.cobalt.tools/api/v10/json",
            "https://co.wukko.me/",
        ]
        
        download_url = None
        
        for endpoint in endpoints:
            try:
                resp = await client.post(
                    endpoint,
                    json={
                        "url": video_url,
                        "v": "v10",
                    },
                    timeout=30,
                )
                
                if resp.status_code == 200:
                    data = resp.json()
                    
                    if data.get("status") == "redirect":
                        download_url = data.get("url")
                        break
                    elif data.get("status") == "success":
                        download_url = data.get("url")
                        break
            except Exception:
                continue
        
        if not download_url:
            raise DownloadError("No se pudo obtener el enlace de descarga desde ningún endpoint de cobalt")

        # Step 2: Download the actual file
        file_resp = await client.get(
            download_url,
            timeout=180,
            follow_redirects=True,
        )
        file_resp.raise_for_status()

        with open(output_path, "wb") as f:
            f.write(file_resp.content)

    if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
        raise DownloadError("La descarga no generó ningún archivo")

    return output_path


async def download_audio(artist: str, title: str, video_url: str | None = None) -> tuple[str, str]:
    """
    Download audio. Priority:
    1. If previewUrl is provided and NOT from YouTube -> download iTunes preview directly
    2. If previewUrl is YouTube URL or not provided -> search YouTube and download
    Returns (temp_dir_path, mp3_file_path).
    Caller MUST clean up temp_dir.
    """
    temp_dir = tempfile.mkdtemp(prefix="musicya_")

    try:
        # If we have a non-YouTube URL (iTunes preview), download it directly
        if video_url and "youtube.com" not in video_url.lower() and "youtu.be" not in video_url.lower():
            mp3_path = await download_itunes_preview(video_url, temp_dir)
            return temp_dir, mp3_path
        
        # Otherwise use YouTube
        if not video_url:
            video_url = await search_youtube_video(artist, title)
        
        # Priority 1: yt-dlp with cookies (most reliable)
        has_cookies = os.path.exists(COOKIES_PATH)
        if has_cookies:
            try:
                mp3_path = await ytdlp_download(video_url, temp_dir, use_cookies=True)
                return temp_dir, mp3_path
            except Exception as e:
                logger.warning("yt-dlp con cookies falló: %s", e)
        
        # Priority 2: Invidious
        try:
            mp3_path = await invidious_download(video_url, temp_dir)
            return temp_dir, mp3_path
        except Exception as e:
            logger.warning("Invidious falló: %s", e)
        
        # Priority 3: yt-dlp sin cookies (último intento)
        if not has_cookies:
            mp3_path = await ytdlp_download(video_url, temp_dir, use_cookies=False)
            return temp_dir, mp3_path
        
        raise DownloadError("Todos los métodos de descarga fallaron")

    except Exception:
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise
