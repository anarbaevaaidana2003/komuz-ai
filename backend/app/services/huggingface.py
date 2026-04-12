import httpx
import wave
import struct
import math
import io
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


async def generate_music(prompt: str, duration: int) -> bytes:
    """
    Если USE_MOCK_AI=true — возвращает синтетический .wav (sine wave).
    Если USE_MOCK_AI=false — реальный запрос к HF Space.
    """
    if settings.USE_MOCK_AI:
        logger.info("Mock mode: generating %ds wav for prompt: %r", duration, prompt)
        return _generate_mock_wav(duration)

    logger.info("HF Spaces: requesting %ds generation for prompt: %r", duration, prompt)
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                f"{settings.HF_SPACE_URL}/api/predict",
                json={"data": [prompt, duration]},
            )
            response.raise_for_status()
        return response.content
    except httpx.HTTPError as exc:
        logger.error("HF Spaces request failed: %s", exc)
        raise


def _generate_mock_wav(duration: int, sr: int = 32000) -> bytes:
    """Генерирует простой sine wave как заглушку для тестирования."""
    n_samples = sr * duration
    buf = io.BytesIO()
    with wave.open(buf, "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        for i in range(n_samples):
            # Простой аккорд из 3 частот — звучит как тест-тон
            val = (
                math.sin(2 * math.pi * 220 * i / sr) * 0.4
                + math.sin(2 * math.pi * 330 * i / sr) * 0.3
                + math.sin(2 * math.pi * 440 * i / sr) * 0.3
            )
            wf.writeframes(struct.pack("<h", int(val * 32767 * 0.7)))
    return buf.getvalue()
