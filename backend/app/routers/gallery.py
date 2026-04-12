import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.generation import Generation
from app.models.like import Like
from app.schemas.generation import GenerationRead
from app.services.auth import get_current_active_user
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
