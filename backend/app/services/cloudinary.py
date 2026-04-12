import asyncio
import os
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

AUDIO_DIR = "audio_files"


async def upload_audio(audio_bytes: bytes, public_id: str) -> str:
    """
    Загружает аудио в Cloudinary (production) или сохраняет локально (mock/dev).
    Возвращает публичный URL файла.
    """
    if not settings.CLOUDINARY_CLOUD_NAME or settings.USE_MOCK_AI:
        return _save_local(audio_bytes, public_id)

    return await asyncio.to_thread(_cloudinary_upload, audio_bytes, public_id)


def _save_local(audio_bytes: bytes, public_id: str) -> str:
    """Сохраняет .wav в папку audio_files/ и возвращает URL через /audio/ endpoint."""
    os.makedirs(AUDIO_DIR, exist_ok=True)
    filepath = os.path.join(AUDIO_DIR, f"{public_id}.wav")
    with open(filepath, "wb") as f:
        f.write(audio_bytes)
    url = f"{settings.BACKEND_URL}/audio/{public_id}.wav"
    logger.info("Saved audio locally: %s", url)
    return url


def _cloudinary_upload(audio_bytes: bytes, public_id: str) -> str:
    """Синхронная загрузка в Cloudinary — вызывается через asyncio.to_thread."""
    import cloudinary
    import cloudinary.uploader

    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
    )
    result = cloudinary.uploader.upload(
        audio_bytes,
        resource_type="video",  # Cloudinary использует "video" для аудио
        public_id=f"komuz-ai/generations/{public_id}",
        format="wav",
    )
    url = result["secure_url"]
    logger.info("Uploaded to Cloudinary: %s", url)
    return url
