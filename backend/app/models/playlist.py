import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from app.core.database import Base


class Playlist(Base):
    __tablename__ = "playlists"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class PlaylistGeneration(Base):
    __tablename__ = "playlist_generations"

    playlist_id = Column(
        String(36),
        ForeignKey("playlists.id", ondelete="CASCADE"),
        primary_key=True,
    )
    generation_id = Column(
        String(36),
        ForeignKey("generations.id", ondelete="CASCADE"),
        primary_key=True,
    )
