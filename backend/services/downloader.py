import asyncio
import json
import os
import tempfile
import shutil

import httpx

DOWNLOAD_TIMEOUT = 120  # seconds
COBALT_API = "https://api.cobalt.tools/api/json"
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")


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


async def ytdlp_download(video_url: str, temp_dir: str) -> str:
    """
    Download audio from YouTube URL using yt-dlp directly.
    Since we're using the API for search, the URL is known-good.
    """
    output_template = os.path.join(temp_dir, "%(title)s.%(ext)s")
    
    # Download best audio and convert to mp3
    await run_cmd([
        "yt-dlp",
        "-f", "bestaudio",
        "--extract-audio",
        "--audio-format", "mp3",
        "--audio-quality", "0",  # best quality
        "-o", output_template,
        "--no-playlist",
        "--js-runtimes", "node",
        "--", video_url,
    ], timeout=DOWNLOAD_TIMEOUT)
    
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
    Search YouTube and download audio via cobalt.tools.
    If video_url is provided and is a YouTube URL, use it directly.
    Otherwise search on YouTube.
    Returns (temp_dir_path, mp3_file_path).
    Caller MUST clean up temp_dir.
    """
    temp_dir = tempfile.mkdtemp(prefix="musicya_")

    try:
        # If no URL provided, search on YouTube
        if not video_url:
            video_url = await search_youtube_video(artist, title)
        # If URL provided but not YouTube, search anyway
        elif "youtube.com" not in video_url.lower() and "youtu.be" not in video_url.lower():
            video_url = await search_youtube_video(artist, title)
        
        mp3_path = await ytdlp_download(video_url, temp_dir)
        return temp_dir, mp3_path

    except Exception:
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise
