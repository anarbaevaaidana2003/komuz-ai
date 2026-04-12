from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional


class GenerationCreate(BaseModel):
    prompt: str
    duration: int = 10
    is_public: bool = False

    @field_validator("duration")
    @classmethod
    def duration_range(cls, v: int) -> int:
        if not 5 <= v <= 60:
            raise ValueError("Duration must be between 5 and 60 seconds")
        return v

    @field_validator("prompt")
    @classmethod
    def prompt_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Prompt cannot be empty")
        return v


class GenerationRead(BaseModel):
    id: str
    user_id: str
    prompt: str
    duration: int
    audio_url: Optional[str] = None
    status: str
    is_public: bool
    likes_count: int
    created_at: datetime

    model_config = {"from_attributes": True}
