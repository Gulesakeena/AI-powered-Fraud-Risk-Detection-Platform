from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from app.core.database import Base


class RevokedToken(Base):
    __tablename__ = "revoked_tokens"

    id = Column(Integer, primary_key=True, index=True)

    jti = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    expires_at = Column(
        DateTime,
        nullable=False,
        index=True,
    )

    revoked_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )