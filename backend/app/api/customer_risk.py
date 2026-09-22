#api/customer_risk.py
"""API endpoints for the Customer Risk Profile (Member 5)"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_permission
from app.models.security import User
from app.schemas.customer_risk import CustomerRiskProfileResponse
from app.services.customer_risk import (
    get_customer_risk_profile,
    recalculate_full_customer_profile,
)


router = APIRouter(prefix="/customers", tags=["Customer Risk Profile"])


def _to_response(profile: dict) -> CustomerRiskProfileResponse:
    customer = profile["customer"]
    return CustomerRiskProfileResponse(
        customer_id=customer.id,
        customer_ref=customer.customer_ref,
        name=customer.name,
        status=customer.status,
        risk_score=customer.risk_score,
        risk_level=customer.risk_level,
        total_transactions=customer.total_transactions,
        suspicious_transactions=customer.suspicious_transactions,
        total_spending=customer.total_spending,
        confirmed_fraud_count=customer.confirmed_fraud_count,
        false_positive_count=customer.false_positive_count,
        account_opened_at=customer.account_opened_at,
        last_active_at=customer.last_active_at,
        devices_used=profile["devices_used"],
        ip_addresses_used=profile["ip_addresses_used"],
        locations_used=profile["locations_used"],
        fraud_history=profile["fraud_history"],
    )


@router.get(
    "/{customer_id}/risk-profile",
    response_model=CustomerRiskProfileResponse,
)
def get_risk_profile(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("customers.risk_profile.read")),
):
    """
    Full customer risk profile: stored risk score/level/counters plus
    derived data -- devices used, locations used, and confirmed-fraud /
    false-positive history from both alerts and investigations.
    """
    profile = get_customer_risk_profile(db, customer_id)
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found.",
        )
    return _to_response(profile)


@router.post(
    "/{customer_id}/risk-profile/recalculate",
    response_model=CustomerRiskProfileResponse,
)
def recalculate_risk_profile(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("customers.risk_profile.manage")),
):
    """
    Admin/repair tool: recompute this customer's transaction counters and
    risk score directly from their transaction history, in case the
    incrementally-maintained counters have drifted.
    """
    customer = recalculate_full_customer_profile(db, customer_id)
    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found.",
        )
    profile = get_customer_risk_profile(db, customer_id)
    return _to_response(profile)