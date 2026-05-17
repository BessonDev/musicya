from fastapi import APIRouter

from services.stats import get_stats, increment_visits

router = APIRouter()


@router.get("/stats")
async def stats():
    return get_stats()


@router.post("/stats/visit")
async def visit():
    return increment_visits()
