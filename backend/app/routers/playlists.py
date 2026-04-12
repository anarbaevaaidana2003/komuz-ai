import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from app.core.database import get_db
from app.models.playlist import Playlist, PlaylistGeneration
from app.models.generation import Generation
from app.schemas.playlist import PlaylistCreate, PlaylistRead, AddToPlaylistRequest
from app.services.auth import get_current_active_user
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/playlists", tags=["playlists"])


@router.post("/", response_model=PlaylistRead, status_code=status.HTTP_201_CREATED)
async def create_playlist(
    data: PlaylistCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    playlist = Playlist(
        user_id=current_user.id,
        name=data.name,
        description=data.description,
    )
    db.add(playlist)
    await db.commit()
    await db.refresh(playlist)
    return playlist


@router.get("/", response_model=list[PlaylistRead])
async def list_playlists(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(
        select(Playlist)
        .where(Playlist.user_id == current_user.id)
        .order_by(Playlist.created_at.desc())
    )
    return result.scalars().all()


@router.post("/{playlist_id}/add")
async def add_to_playlist(
    playlist_id: str,
    data: AddToPlaylistRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(
        select(Playlist).where(
            Playlist.id == playlist_id,
            Playlist.user_id == current_user.id,
        )
    )
    playlist = result.scalar_one_or_none()
    if not playlist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found")

    gen_result = await db.execute(
        select(Generation).where(Generation.id == data.generation_id)
    )
    gen = gen_result.scalar_one_or_none()
    if not gen:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generation not found")

    entry = PlaylistGeneration(playlist_id=playlist_id, generation_id=data.generation_id)
    db.add(entry)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Generation already in this playlist",
        )
    return {"message": "Added to playlist", "playlist_id": playlist_id}
