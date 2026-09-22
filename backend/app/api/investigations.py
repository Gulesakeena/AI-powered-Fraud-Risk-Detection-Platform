#api/investigations.py
"""API endpoints for the Investigation System (Member 5)"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_permission
from app.models.investigations import (
    Investigation,
    InvestigationOutcome,
    InvestigationStatus,
)
from app.models.security import User
from app.schemas.investigations import (
    InvestigationAlertSummary,
    InvestigationAssignRequest,
    InvestigationCreate,
    InvestigationDetailResponse,
    InvestigationNoteCreate,
    InvestigationNoteResponse,
    InvestigationResponse,
    InvestigationTransactionSummary,
    InvestigationUpdate,
    PaginatedInvestigationsResponse,
)
from app.services.investigations import (
    add_note,
    assign_investigation,
    create_investigation,
    get_investigation,
    get_investigation_context,
    list_investigations,
    update_investigation,
)


router = APIRouter(prefix="/investigations", tags=["Investigations"])


def _build_detail(db: Session, investigation: Investigation) -> InvestigationDetailResponse:
    context = get_investigation_context(db, investigation)
    customer = context["customer"]

    base = InvestigationResponse.model_validate(investigation).model_dump()

    base["customer_ref"] = customer.customer_ref if customer else ""
    base["customer_name"] = customer.name if customer else ""
    base["customer_risk_score"] = customer.risk_score if customer else 0.0
    base["customer_risk_level"] = customer.risk_level.value if customer else "LOW"

    base["notes"] = [
        InvestigationNoteResponse.model_validate(n) for n in context["notes"]
    ]

    base["related_transactions"] = [
        InvestigationTransactionSummary(
            id=t.id,
            transaction_ref=t.transaction_ref,
            amount=t.amount,
            risk_score=t.risk_score,
            risk_level=t.risk_level.value,
            decision=t.decision.value,
            occurred_at=t.occurred_at,
        )
        for t in context["related_transactions"]
    ]

    base["related_alerts"] = [
        InvestigationAlertSummary(
            id=a.id,
            severity=a.severity.value,
            status=a.status.value,
            reason=a.reason,
            created_at=a.created_at,
        )
        for a in context["related_alerts"]
    ]

    base["devices"] = context["devices"]
    base["ip_addresses"] = context["ip_addresses"]
    base["locations"] = context["locations"]
    base["risk_factors"] = context["risk_factors"]
    base["fraud_pattern_reasons"] = context["fraud_pattern_reasons"]

    return InvestigationDetailResponse(**base)


@router.post(
    "",
    response_model=InvestigationDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_investigation(
    data: InvestigationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("investigations.manage")),
):
    """Open a new investigation for a customer, optionally tied to a specific
    transaction and/or alert."""
    investigation = create_investigation(
        db,
        customer_id=data.customer_id,
        transaction_id=data.transaction_id,
        alert_id=data.alert_id,
        title=data.title,
        summary=data.summary,
        created_by_id=current_user.id,
    )
    return _build_detail(db, investigation)


@router.get("", response_model=PaginatedInvestigationsResponse)
def list_all_investigations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("investigations.read")),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status_filter: InvestigationStatus | None = Query(default=None, alias="status"),
    customer_id: int | None = Query(default=None),
    assigned_to_id: int | None = Query(default=None),
):
    investigations = list_investigations(
        db,
        status_filter=status_filter,
        customer_id=customer_id,
        assigned_to_id=assigned_to_id,
    )

    total = len(investigations)
    start = (page - 1) * page_size
    end = start + page_size
    items = investigations[start:end]
    total_pages = (total + page_size - 1) // page_size if total else 0

    return PaginatedInvestigationsResponse(
        items=[InvestigationResponse.model_validate(i) for i in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{investigation_id}", response_model=InvestigationDetailResponse)
def get_investigation_details(
    investigation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("investigations.read")),
):
    """
    Full investigation context: customer profile, transaction history,
    related alerts, shared devices/IPs, locations, risk factors, and live
    fraud pattern detection on the primary transaction.
    """
    investigation = get_investigation(db, investigation_id)
    if not investigation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investigation not found.",
        )
    return _build_detail(db, investigation)


@router.patch("/{investigation_id}", response_model=InvestigationDetailResponse)
def update_investigation_endpoint(
    investigation_id: int,
    data: InvestigationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("investigations.manage")),
):
    """Update investigation status, outcome, and/or findings."""
    investigation = update_investigation(
        db,
        investigation_id,
        status=data.status,
        outcome=data.outcome,
        findings=data.findings,
    )
    if not investigation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investigation not found.",
        )
    return _build_detail(db, investigation)


@router.patch("/{investigation_id}/assign", response_model=InvestigationDetailResponse)
def assign_investigation_endpoint(
    investigation_id: int,
    data: InvestigationAssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("investigations.manage")),
):
    """Assign an investigation to an analyst."""
    investigation = assign_investigation(db, investigation_id, data.user_id)
    if not investigation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investigation not found.",
        )
    return _build_detail(db, investigation)


@router.post(
    "/{investigation_id}/notes",
    response_model=InvestigationNoteResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_investigation_note(
    investigation_id: int,
    data: InvestigationNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("investigations.manage")),
):
    """Add a note to an investigation's history."""
    note = add_note(
        db,
        investigation_id=investigation_id,
        author_id=current_user.id,
        note=data.note,
    )
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investigation not found.",
        )
    return InvestigationNoteResponse.model_validate(note)