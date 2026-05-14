import asyncio
import os
import tempfile
import shutil
from pathlib import Path

DOWNLOAD_TIMEOUT = 120  # seconds


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


def find_audio_file(temp_dir: str) -> str | None:
    """Find the downloaded audio file in temp_dir (first non-empty audio file)."""
    for f in os.listdir(temp_dir):
        path = os.path.join(temp_dir, f)
        if os.path.isfile(path) and os.path.getsize(path) > 0:
            ext = Path(f).suffix.lower()
            if ext in (".m4a", ".webm", ".opus", ".mp3", ".ogg", ".wav"):
                return path
    return None


async def download_audio(artist: str, title: str) -> tuple[str, str]:
    """
    Search YouTube with yt-dlp and download the best audio.
    Returns (temp_dir_path, audio_file_path).
    Caller MUST clean up temp_dir.
    """
    temp_dir = tempfile.mkdtemp(prefix="musicya_")
    query = f"ytsearch:{artist} - {title} audio"

    try:
        # Step 1: Download best audio
        output_template = os.path.join(temp_dir, "%(id)s.%(ext)s")
        await run_cmd([
            "yt-dlp",
            "-f", "bestaudio[ext=m4a]/bestaudio",
            "-o", output_template,
            "--no-playlist",
            "--print", "filename",
            "--extractor-args", "youtube:player_client=android,web",
            "--", query,
        ], timeout=DOWNLOAD_TIMEOUT)

        # Step 2: Find the downloaded file
        audio_file = find_audio_file(temp_dir)
        if not audio_file:
            raise DownloadError("No se encontró archivo de audio descargado")

        return temp_dir, audio_file

    except Exception:
        # Clean up on error — caller also cleans, but be defensive
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise


async def transcode_to_mp3(input_path: str, output_path: str, bitrate: int) -> str:
    """
    Transcode audio file to MP3 using FFmpeg.
    Returns the path to the transcoded MP3.
    """
    await run_cmd([
        "ffmpeg",
        "-i", input_path,
        "-codec:a", "libmp3lame",
        "-b:a", f"{bitrate}k",
        "-id3v2_version", "3",
        "-y",
        output_path,
    ], timeout=DOWNLOAD_TIMEOUT)

    if not os.path.exists(output_path):
        raise DownloadError("FFmpeg transcoding failed: no output file")

    return output_path
