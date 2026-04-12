import logging
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db, AsyncSessionLocal
from app.models.generation import Generation
from app.schemas.generation import GenerationCreate, GenerationRead
from app.services.auth import get_current_active_user
from app.services.huggingface import generate_music
from app.services.cloudinary import upload_audio
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/generations", tags=["generations"])


async def _process_generation(generation_id: str, prompt: str, duration: int) -> None:
    """Background task: generate audio and upload, then update DB status."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Generation).where(Generation.id == generation_id))
        gen = result.scalar_one_or_none()
        if not gen:
            logger.error("Generation %s not found for processing", generation_id)
            return
        try:
            gen.status = "processing"
            await db.commit()

            audio_bytes = await generate_music(prompt, duration)
            audio_url = await upload_audio(audio_bytes, generation_id)

            gen.audio_url = audio_url
            gen.status = "done"
            await db.commit()
            logger.info("Generation %s completed: %s", generation_id, audio_url)
        except Exception as exc:
            logger.error("Generation %s failed: %s", generation_id, exc)
            gen.status = "error"
            await db.commit()


@router.post("/", response_model=GenerationRead, status_code=status.HTTP_201_CREATED)
async def create_generation(
    data: GenerationCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    gen = Generation(
        user_id=current_user.id,
        prompt=data.prompt,
        duration=data.duration,
        is_public=data.is_public,
        status="pending",
    )
    db.add(gen)
    await db.commit()
    await db.refresh(gen)

    background_tasks.add_task(_process_generation, gen.id, data.prompt, data.duration)
    return gen


@router.get("/", response_model=list[GenerationRead])
async def list_generations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(
        select(Generation)
        .where(Generation.user_id == current_user.id)
        .order_by(Generation.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{generation_id}", response_model=GenerationRead)
async def get_generation(
    generation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(
        select(Generation).where(
            Generation.id == generation_id,
            Generation.user_id == current_user.id,
        )
    )
    gen = result.scalar_one_or_none()
    if not gen:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generation not found")
    return gen


@router.delete("/{generation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_generation(
    generation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(
        select(Generation).where(
            Generation.id == generation_id,
            Generation.user_id == current_user.id,
        )
    )
    gen = result.scalar_one_or_none()
    if not gen:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generation not found")
    await db.delete(gen)
    await db.commit()
