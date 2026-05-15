import httpx
from mutagen.id3 import ID3, TIT2, TPE1, TALB, TYER, TCON, APIC, error as MutagenError
from typing import Optional


def write_id3_tags(
    mp3_path: str,
    title: str,
    artist: str,
    album: Optional[str] = None,
    year: Optional[int] = None,
    genre: Optional[str] = None,
    cover_url: Optional[str] = None,
) -> None:
    """
    Write ID3v2.3 tags to an MP3 file using mutagen.
    Cover art is downloaded from cover_url if provided.
    """
    # Start fresh — delete any existing ID3 tags
    try:
        existing = ID3(mp3_path)
        existing.delete()
    except MutagenError:
        pass
    
    # Create new tags
    tags = ID3()
    
    # Text frames
    if title:
        tags.add(TIT2(encoding=3, text=title))
    if artist:
        tags.add(TPE1(encoding=3, text=artist))
    if album:
        tags.add(TALB(encoding=3, text=album))
    if year:
        tags.add(TYER(encoding=3, text=str(year)))
    if genre:
        tags.add(TCON(encoding=3, text=genre))
    
    # Cover art (APIC frame)
    if cover_url:
        try:
            cover_data = download_cover(cover_url)
            if cover_data:
                mime = _detect_mime(cover_data[:4])
                tags.add(
                    APIC(
                        encoding=3,
                        mime=mime,
                        type=3,  # front cover
                        desc="",
                        data=cover_data,
                    )
                )
        except Exception:
            pass  # Cover is optional
    
    tags.save(mp3_path, v2_version=3)


def download_cover(url: str) -> Optional[bytes]:
    """Download cover image from URL. Returns raw bytes or None."""
    try:
        resp = httpx.get(url, timeout=15, follow_redirects=True)
        resp.raise_for_status()
        return resp.content
    except httpx.HTTPError:
        return None


def _detect_mime(header: bytes) -> str:
    """Detect image MIME type from file header bytes."""
    if header[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if header[:4] == b"\x89PNG":
        return "image/png"
    if header[:4] == b"RIFF":
        return "image/webp"
    return "image/jpeg"
