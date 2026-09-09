from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_permission
from app.models.security import Permission, Role, User, UserRole
from app.schemas.security import (
    PermissionResponse,
    PermissionUpdateRequest,
    RolePermissionResponse,
)
from app.services.audit import create_audit_log


router = APIRouter(
    prefix="/roles",
    tags=["Roles & Permissions"],
)


@router.get(
    "",
    response_model=list[RolePermissionResponse],
)
def list_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Role).all()


@router.get(
    "/permissions",
    response_model=list[PermissionResponse],
)
def list_permissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Permission)
        .order_by(Permission.name.asc())
        .all()
    )


@router.get(
    "/{role_name}",
    response_model=RolePermissionResponse,
)
def get_role(
    role_name: UserRole,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role = (
        db.query(Role)
        .filter(Role.name == role_name)
        .first()
    )

    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found.",
        )

    return role


@router.put(
    "/{role_name}/permissions",
    response_model=RolePermissionResponse,
)
def update_role_permissions(
    role_name: UserRole,
    data: PermissionUpdateRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("users.manage_roles")
    ),
):
    role = (
        db.query(Role)
        .filter(Role.name == role_name)
        .first()
    )

    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found.",
        )

    requested_names = set(data.permissions)

    permissions = (
        db.query(Permission)
        .filter(Permission.name.in_(requested_names))
        .all()
    )

    found_names = {
        permission.name
        for permission in permissions
    }

    invalid_permissions = requested_names - found_names

    if invalid_permissions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Invalid permissions.",
                "invalid_permissions": sorted(
                    invalid_permissions
                ),
            },
        )

    role.permissions = permissions

    db.commit()
    db.refresh(role)

    create_audit_log(
        db,
        user_id=current_user.id,
        action="ROLE_PERMISSIONS_CHANGED",
        resource_type="ROLE",
        resource_id=role_name.value,
        details=(
            f"Permissions for {role_name.value} changed to: "
            f"{', '.join(sorted(requested_names))}"
        ),
        ip_address=request.client.host if request.client else None,
    )

    return role