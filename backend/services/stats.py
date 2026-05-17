"""
Contador de visitas y descargas persistido en JSON.

Thread-safe con threading.Lock. Se guarda en /app/data/stats.json
y persiste entre reinicios del container gracias al volume Docker.
"""

import json
import os
import threading
from pathlib import Path

DATA_DIR = Path(os.environ.get("STATS_DIR", "/app/data"))
DATA_FILE = DATA_DIR / "stats.json"

# Valores acumulados (pre-contador + lo que ya contó)
INITIAL_VISITS = 264
INITIAL_DOWNLOADS = 23

_lock = threading.Lock()


def _ensure_data():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not DATA_FILE.exists():
        DATA_FILE.write_text(
            json.dumps({"visits": INITIAL_VISITS, "downloads": INITIAL_DOWNLOADS})
        )


def get_stats() -> dict:
    _ensure_data()
    with _lock:
        return json.loads(DATA_FILE.read_text())


def increment_visits() -> dict:
    _ensure_data()
    with _lock:
        stats = json.loads(DATA_FILE.read_text())
        stats["visits"] += 1
        DATA_FILE.write_text(json.dumps(stats, indent=2))
        return stats


def increment_downloads() -> dict:
    _ensure_data()
    with _lock:
        stats = json.loads(DATA_FILE.read_text())
        stats["downloads"] += 1
        DATA_FILE.write_text(json.dumps(stats, indent=2))
        return stats
