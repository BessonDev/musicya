from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.search import router as search_router
from routes.download import router as download_router
from routes.stats import router as stats_router

app = FastAPI(title="Musicya API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search_router, prefix="/api")
app.include_router(download_router, prefix="/api")
app.include_router(stats_router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
