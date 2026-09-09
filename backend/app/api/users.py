from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_permission
from app.core.security import (
    hash_password,
    verify_password,
)
from app.models.security import Role, User
from app.schemas.security import (
    ChangePasswordRequest,
    ProfileUpdate,
    UserCreate,
    UserDetailResponse,
    UserUpdate,
)
from app.services.audit import create_audit_log


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get(
    "/me",
    response_model=UserDetailResponse,
)
def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.patch(
    "/me",
    response_model=UserDetailResponse,
)
def update_my_profile(
    data: ProfileUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.full_name = data.full_name

    db.commit()
    db.refresh(current_user)

    create_audit_log(
        db,
        user_id=current_user.id,
        action="PROFILE_UPDATED",
        resource_type="USER",
        resource_id=str(current_user.id),
        details="User updated their profile.",
        ip_address=request.client.host if request.client else None,
    )

    return current_user


@router.post("/me/change-password")
def change_my_password(
    data: ChangePasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(
        data.current_password,
        current_user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    if data.current_password == data.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from the current password.",
        )

    current_user.hashed_password = hash_password(
        data.new_password
    )

    db.commit()

    create_audit_log(
        db,
        user_id=current_user.id,
        action="PASSWORD_CHANGED",
        resource_type="USER",
        resource_id=str(current_user.id),
        details="User changed their password.",
        ip_address=request.client.host if request.client else None,
    )

    return {
        "message": "Password changed successfully."
    }


@router.get(
    "",
    response_model=list[UserDetailResponse],
)
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("users.read")
    ),
):
    return db.query(User).all()


@router.post(
    "",
    response_model=UserDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    data: UserCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("users.create")
    ),
):
    existing_user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    role = (
        db.query(Role)
        .filter(Role.name == data.role)
        .first()
    )

    if role is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role.",
        )

    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role_id=role.id,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    create_audit_log(
        db,
        user_id=current_user.id,
        action="USER_CREATED",
        resource_type="USER",
        resource_id=str(user.id),
        details=f"Created user {user.email} with role {data.role.value}.",
        ip_address=request.client.host if request.client else None,
    )

    return user


@router.get(
    "/{user_id}",
    response_model=UserDetailResponse,
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("users.read")
    ),
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return user


@router.patch(
    "/{user_id}",
    response_model=UserDetailResponse,
)
def update_user(
    user_id: int,
    data: UserUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("users.update")
    ),
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    old_role = user.role.name.value

    if data.full_name is not None:
        user.full_name = data.full_name

    if data.status is not None:
        user.status = data.status

    if data.is_active is not None:
        user.is_active = data.is_active

    role_changed = False

    if data.role is not None:
        role = (
            db.query(Role)
            .filter(Role.name == data.role)
            .first()
        )

        if role is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role.",
            )

        role_changed = role.id != user.role_id
        user.role_id = role.id

    db.commit()
    db.refresh(user)

    create_audit_log(
        db,
        user_id=current_user.id,
        action="USER_UPDATED",
        resource_type="USER",
        resource_id=str(user.id),
        details=f"Updated user {user.email}.",
        ip_address=request.client.host if request.client else None,
    )

    if role_changed:
        create_audit_log(
            db,
            user_id=current_user.id,
            action="ROLE_CHANGED",
            resource_type="USER",
            resource_id=str(user.id),
            details=(
                f"Changed role for {user.email} "
                f"from {old_role} to {user.role.name.value}."
            ),
            ip_address=request.client.host if request.client else None,
        )

    return user


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("users.delete")
    ),
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account.",
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    email = user.email

    db.delete(user)
    db.commit()

    create_audit_log(
        db,
        user_id=current_user.id,
        action="USER_DELETED",
        resource_type="USER",
        resource_id=str(user_id),
        details=f"Deleted user {email}.",
        ip_address=request.client.host if request.client else None,
    )

    return {
        "message": "User deleted successfully."
    }