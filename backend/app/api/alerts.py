#api/alerts.py
"""API endpoints for Fraud Alerts (Member 5)"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_permission
from app.models.alerts import Alert, AlertSeverity, AlertStatus
from app.models.customers import Customer
from app.models.security import User
from app.models.transactions import Transaction
from app.schemas.alerts import (
    AlertAssignRequest,
    AlertDetailResponse,
    AlertResponse,
    AlertReviewRequest,
    PaginatedAlertsResponse,
)
from app.services.alerts import (
    assign_alert,
    get_alert,
    list_alerts,
    review_alert,
)


router = APIRouter(prefix="/alerts", tags=["Alerts"])


def _build_detail(db: Session, alert: Alert) -> AlertDetailResponse:
    transaction = (
        db.query(Transaction).filter(Transaction.id == alert.transaction_id).first()
    )
    customer = (
        db.query(Customer).filter(Customer.id == alert.customer_id).first()
    )

    base = AlertResponse.model_validate(alert).model_dump()
    base["transaction_ref"] = transaction.transaction_ref if transaction else None
    base["customer_ref"] = customer.customer_ref if customer else None
    base["customer_name"] = customer.name if customer else None

    return AlertDetailResponse(**base)


@router.get("", response_model=PaginatedAlertsResponse)
def list_all_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("alerts.read")),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status_filter: AlertStatus | None = Query(default=None, alias="status"),
    severity: AlertSeverity | None = Query(default=None),
    customer_id: int | None = Query(default=None),
    assigned_to_id: int | None = Query(default=None),
):
    """List fraud alerts with optional filters and pagination."""
    alerts = list_alerts(
        db,
        status_filter=status_filter,
        severity=severity,
        customer_id=customer_id,
        assigned_to_id=assigned_to_id,
    )

    total = len(alerts)
    start = (page - 1) * page_size
    end = start + page_size
    items = alerts[start:end]
    total_pages = (total + page_size - 1) // page_size if total else 0

    return PaginatedAlertsResponse(
        items=[AlertResponse.model_validate(a) for a in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{alert_id}", response_model=AlertDetailResponse)
def get_alert_details(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("alerts.read")),
):
    """Get full alert details, including transaction and customer identifiers."""
    alert = get_alert(db, alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found.",
        )
    return _build_detail(db, alert)


@router.post("/{alert_id}/review", response_model=AlertDetailResponse)
def review_alert_endpoint(
    alert_id: int,
    data: AlertReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("alerts.review")),
):
    """
    Review an alert and update its status.

    Setting status to CONFIRMED_FRAUD, FALSE_POSITIVE or RESOLVED also
    updates the related transaction's outcome and the customer's risk
    profile (confirmed fraud / false positive counters, risk score).
    """
    alert = get_alert(db, alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found.",
        )

    updated = review_alert(
        db,
        alert_id=alert_id,
        new_status=data.status,
        reviewed_by_id=current_user.id,
        notes=data.notes,
    )

    return _build_detail(db, updated)


@router.patch("/{alert_id}/assign", response_model=AlertDetailResponse)
def assign_alert_endpoint(
    alert_id: int,
    data: AlertAssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("alerts.assign")),
):
    """Assign an alert to an analyst for investigation."""
    alert = assign_alert(db, alert_id, data.user_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found.",
        )
    return _build_detail(db, alert)