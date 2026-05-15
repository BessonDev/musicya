import asyncio
import os
import tempfile
import shutil

import httpx

DOWNLOAD_TIMEOUT = 120  # seconds
COBALT_API = "https://api.cobalt.tools/api/json"


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
    Uses yt-dlp with --skip-download (only searches, doesn't download).
    """
    query = f"ytsearch:{artist} - {title}"
    result = await run_cmd([
        "yt-dlp",
        "--skip-download",
        "--print", "url",
        "--default-search", "ytsearch",
        "--extractor-args", "youtube:player_client=web",
        "--user-agent",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "--geo-bypass",
        "--extractor-retries", "3",
        "--ignore-errors",
        "--", query,
    ], timeout=30)

    lines = result.strip().split("\n")
    for line in lines:
        line = line.strip()
        if line.startswith("http"):
            return line

    raise DownloadError("No se encontró ningún video en YouTube para esa canción")


async def cobalt_download(video_url: str, temp_dir: str) -> str:
    """
    Download audio from a YouTube URL via cobalt.tools API.
    Returns path to the downloaded MP3 file.
    """
    output_path = os.path.join(temp_dir, "output.mp3")

    async with httpx.AsyncClient() as client:
        # Step 1: Request the download from cobalt
        resp = await client.post(
            COBALT_API,
            json={
                "url": video_url,
                "isAudioOnly": True,
            },
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()

        if data.get("status") != "redirect":
            raise DownloadError(
                f"Error del servicio de descarga: {data.get('text', 'error desconocido')}"
            )

        download_url = data.get("url")
        if not download_url:
            raise DownloadError("No se pudo obtener el enlace de descarga")

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
    If video_url is provided, skip search and use it directly.
    Returns (temp_dir_path, mp3_file_path).
    Caller MUST clean up temp_dir.
    """
    temp_dir = tempfile.mkdtemp(prefix="musicya_")

    try:
        # Use provided URL or search for one
        if not video_url:
            video_url = await search_youtube_video(artist, title)
        
        mp3_path = await cobalt_download(video_url, temp_dir)
        return temp_dir, mp3_path

    except Exception:
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise
