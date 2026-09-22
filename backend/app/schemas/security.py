from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    field_validator,
)

from app.core.password_policy import validate_password_strength
from app.models.security import UserRole, UserStatus


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: UserRole

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_password_strength(value)


class UserUpdate(BaseModel):
    full_name: str | None = None
    role: UserRole | None = None
    status: UserStatus | None = None
    is_active: bool | None = None


class ProfileUpdate(BaseModel):
    full_name: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, value: str) -> str:
        return validate_password_strength(value)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    status: UserStatus
    is_active: bool
    created_at: datetime


class PermissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None = None


class RoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: UserRole
    permissions: list[PermissionResponse] = []


class UserDetailResponse(UserResponse):
    role: RoleResponse


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int | None
    action: str
    resource_type: str | None
    resource_id: str | None
    details: str | None
    ip_address: str | None
    created_at: datetime


class PermissionUpdateRequest(BaseModel):
    permissions: list[str]


class RolePermissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: UserRole
    permissions: list[PermissionResponse] = []