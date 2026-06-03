import httpx
import wave
import struct
import math
import io
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


def _translate_to_english(text: str) -> str:
    """Translate prompt to English using Google Translate (silent fallback on error)."""
    try:
        from deep_translator import GoogleTranslator
        translated = GoogleTranslator(source="auto", target="en").translate(text)
        logger.info("Translated prompt: %r → %r", text, translated)
        return translated
    except Exception as exc:
        logger.warning("Translation skipped (%s: %s), using original", type(exc).__name__, exc)
        return text


async def generate_music(prompt: str, duration: int) -> bytes:
    """
    Если USE_MOCK_AI=true — возвращает синтетический .wav (sine wave).
    Если USE_MOCK_AI=false — реальный запрос к HF Space.
    """
    if settings.USE_MOCK_AI:
        logger.info("Mock mode: generating %ds wav for prompt: %r", duration, prompt)
        return _generate_mock_wav(duration)

    prompt = _translate_to_english(prompt)
    prompt = f"{prompt}, folk music, plucked string instrument, komuz, no flute, no wind instrument, no brass, no piano, slow tempo, no drums, no bass"
    url = f"{settings.HF_SPACE_URL}/generate"
    logger.info("HF Spaces: POST %s  prompt=%r duration=%d", url, prompt, duration)
    try:
        async with httpx.AsyncClient(timeout=300) as client:
            response = await client.post(
                url,
                json={"prompt": prompt, "duration": duration},
            )
            logger.info("HF Spaces response: status=%d size=%d", response.status_code, len(response.content))
            response.raise_for_status()
        return response.content
    except httpx.TimeoutException as exc:
        logger.error("HF Spaces TIMEOUT after 300s: %s", exc)
        raise
    except httpx.ConnectError as exc:
        logger.error("HF Spaces CONNECT ERROR (space sleeping or wrong URL?): %s", exc)
        raise
    except httpx.HTTPStatusError as exc:
        logger.error("HF Spaces HTTP %d: %s", exc.response.status_code, exc.response.text[:500])
        raise
    except httpx.HTTPError as exc:
        logger.error("HF Spaces request failed: %s %s", type(exc).__name__, exc)
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
