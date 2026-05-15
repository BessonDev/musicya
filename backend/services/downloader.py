import asyncio
import logging
import os
import tempfile
import shutil

import httpx

logger = logging.getLogger("musicya.downloader")

DOWNLOAD_TIMEOUT = 120
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")
COOKIES_PATH = os.getenv("COOKIES_FILE", "/app/cookies.txt")
COOKIES_B64 = os.getenv("COOKIES_B64", "")

logger.info("COOKIES_B64 set: %s", "yes" if COOKIES_B64 else "no")
logger.info("COOKIES_PATH exists: %s", os.path.exists(COOKIES_PATH))


def _ensure_cookies_file() -> str:
    if os.path.exists(COOKIES_PATH):
        logger.info("Usando cookies desde archivo: %s", COOKIES_PATH)
        return COOKIES_PATH
    if COOKIES_B64:
        import base64
        path = os.path.join(tempfile.gettempdir(), "musicya_cookies.txt")
        decoded = base64.b64decode(COOKIES_B64)
        logger.info("Decodificando COOKIES_B64 (%d bytes)", len(decoded))
        with open(path, "wb") as f:
            f.write(decoded)
        return path
    logger.warning("No hay cookies disponibles")
    return ""


class DownloadError(Exception):
    pass


async def run_cmd(cmd: list[str], timeout: int = DOWNLOAD_TIMEOUT) -> str:
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


async def ytdlp_download(video_url: str, temp_dir: str, use_cookies: bool = False) -> str:
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
        "--remote-components", "ejs:github",
    ]
    if use_cookies:
        cookies_file = _ensure_cookies_file()
        if cookies_file:
            cmd.extend(["--cookies", cookies_file])
    cmd.extend(["--", video_url])
    await run_cmd(cmd, timeout=DOWNLOAD_TIMEOUT)
    for f in os.listdir(temp_dir):
        if f.endswith('.mp3'):
            return os.path.join(temp_dir, f)
    raise DownloadError("No se encontró el archivo MP3 descargado")


async def download_audio(artist: str, title: str, video_url: str | None = None) -> tuple[str, str]:
    temp_dir = tempfile.mkdtemp(prefix="musicya_")
    try:
        if not (video_url and ("youtube.com" in video_url.lower() or "youtu.be" in video_url.lower())):
            video_url = await search_youtube_video(artist, title)

        cookies_file = _ensure_cookies_file()
        if cookies_file:
            try:
                mp3_path = await ytdlp_download(video_url, temp_dir, use_cookies=True)
                return temp_dir, mp3_path
            except Exception as e:
                logger.warning("yt-dlp con cookies falló: %s", e)

        mp3_path = await ytdlp_download(video_url, temp_dir, use_cookies=False)
        return temp_dir, mp3_path
    except Exception:
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise
