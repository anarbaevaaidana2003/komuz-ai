from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PlaylistCreate(BaseModel):
    name: str
    description: Optional[str] = None


class PlaylistRead(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AddToPlaylistRequest(BaseModel):
    generation_id: str
