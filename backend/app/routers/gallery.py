import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.generation import Generation
from app.models.like import Like
from app.schemas.generation import GenerationRead
from app.services.auth import get_current_active_user
from app.services.cloudinary import upload_audio
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/gallery", tags=["gallery"])


@router.get("/", response_model=list[GenerationRead])
async def get_gallery(db: AsyncSession = Depends(get_db)):
    """Публичная галерея — открыта без авторизации."""
    result = await db.execute(
        select(Generation)
        .where(Generation.is_public == True, Generation.status == "done")  # noqa: E712
        .order_by(Generation.likes_count.desc(), Generation.created_at.desc())
    )
    return result.scalars().all()


@router.post("/{generation_id}/like")
async def toggle_like(
    generation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Лайк/анлайк публичной генерации. Повторный запрос снимает лайк."""
    result = await db.execute(
        select(Generation).where(
            Generation.id == generation_id,
            Generation.is_public == True,  # noqa: E712
        )
    )
    gen = result.scalar_one_or_none()
    if not gen:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generation not found")

    like_result = await db.execute(
        select(Like).where(
            Like.user_id == current_user.id,
            Like.generation_id == generation_id,
        )
    )
    existing_like = like_result.scalar_one_or_none()

    if existing_like:
        await db.delete(existing_like)
        gen.likes_count = max(0, gen.likes_count - 1)
        await db.commit()
        return {"liked": False, "likes_count": gen.likes_count}

    like = Like(user_id=current_user.id, generation_id=generation_id)
    db.add(like)
    gen.likes_count += 1
    await db.commit()
    return {"liked": True, "likes_count": gen.likes_count}


@router.post("/upload", response_model=GenerationRead)
async def upload_to_gallery(
    file: UploadFile = File(...),
    prompt: str = Form(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Загрузить готовый аудиофайл напрямую в публичную галерею."""
    if file.content_type not in ("audio/wav", "audio/wave", "audio/mpeg", "audio/mp3", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Только WAV или MP3 файлы")

    audio_bytes = await file.read()
    if len(audio_bytes) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Файл слишком большой (макс 50 МБ)")

    gen_id = str(uuid.uuid4())
    try:
        audio_url = await upload_audio(audio_bytes, gen_id)
    except Exception as e:
        logger.error("Upload failed: %s", e)
        raise HTTPException(status_code=500, detail="Ошибка загрузки файла")

    gen = Generation(
        id=gen_id,
        user_id=current_user.id,
        prompt=prompt,
        duration=0,
        audio_url=audio_url,
        status="done",
        is_public=True,
        likes_count=0,
    )
    db.add(gen)
    await db.commit()
    await db.refresh(gen)
    return gen
