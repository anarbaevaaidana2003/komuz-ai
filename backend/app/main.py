import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.database import init_db
from app.routers import auth, generations, gallery, playlists

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

AUDIO_DIR = "audio_files"

# Создаём директорию сразу — StaticFiles требует её при старте
os.makedirs(AUDIO_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    logger.info("Database initialised")
    yield
    # Shutdown
    logger.info("Shutting down")


app = FastAPI(
    title="Komuz-AI",
    description="AI Music Generation Platform — cultural heritage of Kyrgyzstan",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://komuz-ai.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve locally-stored mock audio files
app.mount("/audio", StaticFiles(directory=AUDIO_DIR), name="audio")

app.include_router(auth.router)
app.include_router(generations.router)
app.include_router(gallery.router)
app.include_router(playlists.router)


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok", "service": "komuz-ai"}
