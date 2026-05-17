import os
import shutil
import asyncio
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from models.schemas import DownloadRequest, ErrorResponse
from services.downloader import download_audio, DownloadError
from services.metadata import write_id3_tags
from services.stats import increment_downloads

router = APIRouter()

# Cleanup interval: remove stale temp dirs older than 1 hour
CLEANUP_INTERVAL = 3600
TEMP_BASE = "/tmp/musicya"


async def cleanup_stale_temp():
    """Periodically remove stale temp directories."""
    while True:
        await asyncio.sleep(CLEANUP_INTERVAL)
        try:
            if not os.path.exists(TEMP_BASE):
                continue
            now = asyncio.get_event_loop().time()
            for entry in os.listdir(TEMP_BASE):
                path = os.path.join(TEMP_BASE, entry)
                if os.path.isdir(path):
                    age = now - os.path.getmtime(path)
                    if age > CLEANUP_INTERVAL:
                        shutil.rmtree(path, ignore_errors=True)
        except Exception:
            pass


@router.on_event("startup")
async def start_cleanup():
    os.makedirs(TEMP_BASE, exist_ok=True)
    asyncio.create_task(cleanup_stale_temp())


@router.post(
    "/download",
    responses={
        200: {"description": "MP3 file"},
        404: {"model": ErrorResponse},
        504: {"model": ErrorResponse},
    },
)
async def download(req: DownloadRequest):
    if req.quality not in (128, 320):
        raise HTTPException(status_code=400, detail="Quality must be 128 or 320")

    temp_dir = None
    try:
        # 1. Search YouTube + download MP3 via cobalt.tools
        # Use previewUrl from iTunes if available, otherwise search
        temp_dir, mp3_path = await download_audio(req.artist, req.title, req.previewUrl)

        # 2. Write ID3 tags
        write_id3_tags(
            mp3_path=mp3_path,
            title=req.title,
            artist=req.artist,
            album=req.album,
            year=req.year,
            genre=req.genre,
            cover_url=req.coverUrl,
        )

        # 3. Increment download counter
        increment_downloads()

        # 4. Read file into memory, clean up, then return
        filename = f"{_sanitize(req.artist)} - {_sanitize(req.title)}.mp3"
        with open(mp3_path, "rb") as f:
            data = f.read()

        return Response(
            content=data,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
            },
        )

    except DownloadError as e:
        raise HTTPException(status_code=404, detail=str(e))

    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="La descarga tomó demasiado tiempo")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

    finally:
        # Always clean up temp directory
        if temp_dir and os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)


def _sanitize(name: str) -> str:
    """Remove characters invalid for filenames."""
    return "".join(c for c in name if c not in '<>:"/\\|?*').strip()
