from pydantic import BaseModel
from typing import Optional


class DownloadRequest(BaseModel):
    artist: str
    title: str
    quality: int = 320  # 128 or 320 kbps
    album: Optional[str] = None
    year: Optional[int] = None
    genre: Optional[str] = None
    coverUrl: Optional[str] = None
    previewUrl: Optional[str] = None  # YouTube URL from iTunes search


class TrackResponse(BaseModel):
    id: str
    title: str
    artist: str
    album: str
    duration: int
    previewUrl: str
    coverUrl: str
    coverSmall: str
    coverMedium: str
    coverBig: str
    genre: Optional[str] = None
    year: Optional[int] = None


class SearchResponse(BaseModel):
    results: list[TrackResponse]


class ErrorResponse(BaseModel):
    error: str
