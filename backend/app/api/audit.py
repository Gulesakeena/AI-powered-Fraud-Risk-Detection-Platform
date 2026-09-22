from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_permission
from app.models.security import AuditLog, User
from app.schemas.security import AuditLogResponse


router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"],
)


@router.get(
    "",
    response_model=list[AuditLogResponse],
)
def list_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("audit.read")
    ),
):
    return (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .all()
    )