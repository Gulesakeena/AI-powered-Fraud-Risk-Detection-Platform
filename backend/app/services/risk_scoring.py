from dataclasses import dataclass, field
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models.customers import Customer
from app.models.transactions import RiskDecision, RiskLevel, Transaction


HIGH_AMOUNT_THRESHOLD = 2000.0
VERY_HIGH_AMOUNT_THRESHOLD = 5000.0
RAPID_WINDOW_MINUTES = 10
RAPID_TRANSACTION_COUNT = 3


@dataclass
class RiskResult:
    score: float
    level: RiskLevel
    decision: RiskDecision
    factors: list[str] = field(default_factory=list)


def _clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


def evaluate_transaction_risk(
    db: Session,
    *,
    customer: Customer,
    amount: float,
    device_id: str | None,
    ip_address: str | None,
    country: str | None,
    occurred_at: datetime,
) -> RiskResult:
    score = 0.0
    factors: list[str] = []

    if amount >= VERY_HIGH_AMOUNT_THRESHOLD:
        score += 35
        factors.append("Transaction amount is unusually high.")
    elif amount >= HIGH_AMOUNT_THRESHOLD:
        score += 20
        factors.append("Transaction amount is above typical thresholds.")

    window_start = occurred_at - timedelta(minutes=RAPID_WINDOW_MINUTES)

    recent_count = (
        db.query(Transaction)
        .filter(Transaction.customer_id == customer.id)
        .filter(Transaction.occurred_at >= window_start)
        .filter(Transaction.occurred_at <= occurred_at)
        .count()
    )

    if recent_count >= RAPID_TRANSACTION_COUNT:
        score += 25
        factors.append(
            "Multiple transactions occurred within a short period."
        )

    if device_id:
        known_device = (
            db.query(Transaction)
            .filter(Transaction.customer_id == customer.id)
            .filter(Transaction.device_id == device_id)
            .filter(Transaction.id.isnot(None))
            .first()
        )

        if known_device is None and customer.total_transactions > 0:
            score += 15
            factors.append("New device detected.")

    if country:
        known_location = (
            db.query(Transaction)
            .filter(Transaction.customer_id == customer.id)
            .filter(Transaction.country == country)
            .first()
        )

        if known_location is None and customer.total_transactions > 0:
            score += 15
            factors.append("New location detected.")

    if ip_address:
        shared_ip_customers = (
            db.query(Transaction.customer_id)
            .filter(Transaction.ip_address == ip_address)
            .filter(Transaction.customer_id != customer.id)
            .distinct()
            .count()
        )

        if shared_ip_customers > 0:
            score += 10
            factors.append(
                "IP address is associated with other customers."
            )

    if customer.total_transactions == 0:
        score += 5
        factors.append("Customer has no prior transaction history.")

    score = _clamp(score)

    if score <= 30:
        level = RiskLevel.LOW
        decision = RiskDecision.APPROVE
    elif score <= 70:
        level = RiskLevel.MEDIUM
        decision = RiskDecision.REVIEW
    else:
        level = RiskLevel.HIGH
        decision = RiskDecision.BLOCK

    if not factors:
        factors.append("No significant risk indicators detected.")

    return RiskResult(
        score=score,
        level=level,
        decision=decision,
        factors=factors,
    )
