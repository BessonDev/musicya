import httpx
from mutagen.mp3 import MP3
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
    try:
        audio = MP3(mp3_path, ID3=ID3)
    except MutagenError:
        audio = MP3(mp3_path)
        audio.add_tags()

    # Remove existing tags to start fresh
    audio.delete()
    audio.add_tags()

    # Text frames
    if title:
        audio.tags.add(TIT2(encoding=3, text=title))
    if artist:
        audio.tags.add(TPE1(encoding=3, text=artist))
    if album:
        audio.tags.add(TALB(encoding=3, text=album))
    if year:
        audio.tags.add(TYER(encoding=3, text=str(year)))
    if genre:
        audio.tags.add(TCON(encoding=3, text=genre))

    # Cover art (APIC frame)
    if cover_url:
        try:
            cover_data = download_cover(cover_url)
            if cover_data:
                mime = _detect_mime(cover_data[:4])
                audio.tags.add(
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

    audio.save(v2_version=3)


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
