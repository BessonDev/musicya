"""
Contador de visitas, descargas y canciones más populares persistido en JSON.

Thread-safe con threading.Lock. Se guarda en /app/data/stats.json
y persiste entre reinicios del container gracias al volume Docker.
"""

import json
import os
import threading
from pathlib import Path

DATA_DIR = Path(os.environ.get("STATS_DIR", "/app/data"))
DATA_FILE = DATA_DIR / "stats.json"

INITIAL_VISITS = 264
INITIAL_DOWNLOADS = 23

_lock = threading.Lock()


def _default_data() -> dict:
    return {
        "visits": INITIAL_VISITS,
        "downloads": INITIAL_DOWNLOADS,
        "songs": {},
    }


def _ensure_data():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not DATA_FILE.exists():
        DATA_FILE.write_text(json.dumps(_default_data()))


def _migrate(stats: dict) -> dict:
    """Asegura que stats tenga todos los campos necesarios."""
    if "songs" not in stats:
        stats["songs"] = {}
    return stats


def get_stats() -> dict:
    _ensure_data()
    with _lock:
        return _migrate(json.loads(DATA_FILE.read_text()))


def get_top_songs(limit: int = 10) -> list[dict]:
    _ensure_data()
    with _lock:
        stats = _migrate(json.loads(DATA_FILE.read_text()))
        songs = stats.get("songs", {})
        sorted_songs = sorted(songs.values(), key=lambda s: s["count"], reverse=True)
        return sorted_songs[:limit]


def increment_visits() -> dict:
    _ensure_data()
    with _lock:
        stats = _migrate(json.loads(DATA_FILE.read_text()))
        stats["visits"] += 1
        DATA_FILE.write_text(json.dumps(stats, indent=2))
        return stats


def increment_downloads() -> dict:
    _ensure_data()
    with _lock:
        stats = _migrate(json.loads(DATA_FILE.read_text()))
        stats["downloads"] += 1
        DATA_FILE.write_text(json.dumps(stats, indent=2))
        return stats


def increment_song_download(title: str, artist: str) -> dict:
    _ensure_data()
    with _lock:
        stats = _migrate(json.loads(DATA_FILE.read_text()))
        key = f"{artist} - {title}"
        if key in stats["songs"]:
            stats["songs"][key]["count"] += 1
        else:
            stats["songs"][key] = {"title": title, "artist": artist, "count": 1}
        stats["downloads"] += 1
        DATA_FILE.write_text(json.dumps(stats, indent=2))
        return stats
