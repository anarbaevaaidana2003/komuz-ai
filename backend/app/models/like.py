from sqlalchemy import Column, String, ForeignKey
from app.core.database import Base


class Like(Base):
    __tablename__ = "likes"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    generation_id = Column(
        String(36), ForeignKey("generations.id", ondelete="CASCADE"), primary_key=True
    )
