import hashlib
import secrets
from datetime import datetime

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.api_keys import ApiKey


API_KEY_PREFIX_LENGTH = 8


def generate_api_key() -> tuple[str, str, str]:
    raw_key = secrets.token_urlsafe(32)
    prefix = raw_key[:API_KEY_PREFIX_LENGTH]
    hashed = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()

    return raw_key, prefix, hashed


def hash_api_key(raw_key: str) -> str:
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()


def verify_api_key(
    x_api_key: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> ApiKey:
    if not x_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-API-Key header.",
        )

    hashed = hash_api_key(x_api_key)

    api_key = (
        db.query(ApiKey)
        .filter(ApiKey.hashed_key == hashed)
        .first()
    )

    if api_key is None or not api_key.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or inactive API key.",
        )

    api_key.last_used_at = datetime.utcnow()
    db.commit()

    return api_key


def get_transaction_actor(
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    from app.core.security import decode_access_token
    from app.models.security import User, UserStatus
    from app.models.token import RevokedToken

    if x_api_key:
        return verify_api_key(x_api_key=x_api_key, db=db)

    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1]
        payload = decode_access_token(token)

        if payload is not None:
            jti = payload.get("jti")
            user_id = payload.get("sub")

            if jti is not None and user_id is not None:
                revoked = (
                    db.query(RevokedToken)
                    .filter(RevokedToken.jti == jti)
                    .first()
                )

                if revoked is None:
                    user = (
                        db.query(User)
                        .filter(User.id == int(user_id))
                        .first()
                    )

                    if (
                        user is not None
                        and user.is_active
                        and user.status == UserStatus.ACTIVE
                    ):
                        return user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required: provide a Bearer token or X-API-Key.",
    )
