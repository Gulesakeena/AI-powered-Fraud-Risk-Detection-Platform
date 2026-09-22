from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.password_policy import validate_password_strength
from app.core.security import hash_password
from app.models.security import (
    Role,
    User,
    UserRole,
    UserStatus,
)


def create_initial_admin(db: Session) -> None:
    existing_admin = (
        db.query(User)
        .filter(User.email == settings.ADMIN_EMAIL)
        .first()
    )

    if existing_admin is not None:
        return

    validate_password_strength(
        settings.ADMIN_PASSWORD
    )

    admin_role = (
        db.query(Role)
        .filter(Role.name == UserRole.ADMIN)
        .first()
    )

    if admin_role is None:
        raise RuntimeError(
            "ADMIN role has not been initialized."
        )

    admin = User(
        email=settings.ADMIN_EMAIL,
        full_name=settings.ADMIN_FULL_NAME,
        hashed_password=hash_password(
            settings.ADMIN_PASSWORD
        ),
        role_id=admin_role.id,
        status=UserStatus.ACTIVE,
        is_active=True,
    )

    db.add(admin)
    db.commit()