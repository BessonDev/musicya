from fastapi import APIRouter

from services.stats import get_stats, increment_visits, get_top_songs

router = APIRouter()


@router.get("/stats")
async def stats():
    return get_stats()


@router.post("/stats/visit")
async def visit():
    return increment_visits()


@router.get("/stats/top-songs")
async def top_songs():
    return get_top_songs(limit=5)
