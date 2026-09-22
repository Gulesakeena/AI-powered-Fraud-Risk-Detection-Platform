from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_bearer_token, get_current_user
from app.core.security import (
    create_access_token,
    decode_access_token,
    verify_password,
)
from app.models.security import User, UserStatus
from app.models.token import RevokedToken
from app.schemas.security import LoginRequest, TokenResponse
from app.services.audit import create_audit_log


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post("/login", response_model=TokenResponse)
def login(
    data: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if user is None or not verify_password(
        data.password,
        user.hashed_password,
    ):
        create_audit_log(
            db,
            user_id=user.id if user else None,
            action="LOGIN_FAILED",
            resource_type="USER",
            resource_id=str(user.id) if user else None,
            details=f"Failed login attempt for {data.email}.",
            ip_address=request.client.host if request.client else None,
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if (
        not user.is_active
        or user.status != UserStatus.ACTIVE
    ):
        create_audit_log(
            db,
            user_id=user.id,
            action="LOGIN_BLOCKED",
            resource_type="USER",
            resource_id=str(user.id),
            details="Login blocked because account is inactive or suspended.",
            ip_address=request.client.host if request.client else None,
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive or suspended.",
        )

    token = create_access_token(
        user_id=user.id,
        role=user.role.name.value,
    )

    create_audit_log(
        db,
        user_id=user.id,
        action="LOGIN",
        resource_type="USER",
        resource_id=str(user.id),
        details="Successful login.",
        ip_address=request.client.host if request.client else None,
    )

    return TokenResponse(
        access_token=token,
    )


@router.post("/logout")
def logout(
    request: Request,
    token: str = Depends(get_bearer_token),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
        )

    jti = payload.get("jti")
    exp = payload.get("exp")

    if jti is None or exp is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )

    expires_at = datetime.fromtimestamp(
        exp,
        tz=timezone.utc,
    ).replace(tzinfo=None)

    revoked_token = RevokedToken(
        jti=jti,
        expires_at=expires_at,
    )

    db.add(revoked_token)
    db.commit()

    create_audit_log(
        db,
        user_id=current_user.id,
        action="LOGOUT",
        resource_type="USER",
        resource_id=str(current_user.id),
        details="User logged out and token was revoked.",
        ip_address=request.client.host if request.client else None,
    )

    return {
        "message": "Logged out successfully."
    }