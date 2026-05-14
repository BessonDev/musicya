from fastapi import APIRouter, Query, HTTPException
import httpx

from models.schemas import TrackResponse, SearchResponse

router = APIRouter()

ITUNES_SEARCH_URL = "https://itunes.apple.com/search"


async def fetch_itunes_search(query: str, limit: int = 25) -> list[dict]:
    params = {"term": query, "limit": limit, "media": "music"}
    async with httpx.AsyncClient() as client:
        resp = await client.get(ITUNES_SEARCH_URL, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
    return data.get("results", [])


def map_itunes_track(r: dict) -> TrackResponse:
    artwork = r.get("artworkUrl100", "")
    return TrackResponse(
        id=str(r.get("trackId", "")),
        title=r.get("trackName", ""),
        artist=r.get("artistName", ""),
        album=r.get("collectionName", ""),
        duration=r.get("trackTimeMillis", 0) // 1000,
        previewUrl=r.get("previewUrl", ""),
        coverUrl=artwork.replace("100x100", "300x300") if artwork else "",
        coverSmall=artwork,
        coverMedium=artwork.replace("100x100", "300x300") if artwork else "",
        coverBig=artwork.replace("100x100", "600x600") if artwork else "",
        genre=r.get("primaryGenreName"),
        year=r.get("releaseDate", "")[:4] if r.get("releaseDate") else None,
    )


@router.get("/search", response_model=SearchResponse)
async def search(q: str = Query(..., min_length=1)):
    try:
        results = await fetch_itunes_search(q)
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Error contacting iTunes API: {str(e)}")

    tracks = [map_itunes_track(r) for r in results]
    return SearchResponse(results=tracks)
