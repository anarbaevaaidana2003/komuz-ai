from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./komuz.db"

    # JWT
    SECRET_KEY: str = "dev-secret-key-change-in-production-min-32-chars!!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # Hugging Face
    HF_SPACE_URL: str = "https://your-space.hf.space"

    # AI mode: true = mock WAV, false = real HF Spaces
    USE_MOCK_AI: bool = True

    # Backend URL used to build audio file links in mock mode
    BACKEND_URL: str = "http://localhost:8000"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
