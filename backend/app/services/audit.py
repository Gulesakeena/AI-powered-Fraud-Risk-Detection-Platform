from sqlalchemy.orm import Session

from app.models.security import AuditLog


def create_audit_log(
    db: Session,
    *,
    user_id: int | None,
    action: str,
    resource_type: str | None = None,
    resource_id: str | None = None,
    details: str | None = None,
    ip_address: str | None = None,
) -> AuditLog:
    log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        ip_address=ip_address,
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return log


def log_user_action(
    db: Session,
    *,
    user_id: int | None,
    action: str,
    resource_type: str,
    resource_id: str | int | None = None,
    details: str | None = None,
    ip_address: str | None = None,
) -> AuditLog:
    return create_audit_log(
        db,
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=(
            str(resource_id)
            if resource_id is not None
            else None
        ),
        details=details,
        ip_address=ip_address,
    )