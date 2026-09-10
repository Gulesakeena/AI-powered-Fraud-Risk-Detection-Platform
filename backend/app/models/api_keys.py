from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
)

from app.core.database import Base


class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(120), nullable=False)

    key_prefix = Column(String(12), nullable=False, index=True)
    hashed_key = Column(String(255), nullable=False)

    is_active = Column(Boolean, default=True, nullable=False)

    created_by_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    last_used_at = Column(
        DateTime,
        nullable=True,
    )
