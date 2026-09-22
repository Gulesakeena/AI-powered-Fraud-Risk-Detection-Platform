from dataclasses import dataclass, field
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models.customers import Customer
from app.models.transactions import RiskDecision, RiskLevel, Transaction
from app.services.rules_engine import evaluate_all_rules


HIGH_AMOUNT_THRESHOLD = 2000.0
VERY_HIGH_AMOUNT_THRESHOLD = 5000.0
RAPID_WINDOW_MINUTES = 10
RAPID_TRANSACTION_COUNT = 3


@dataclass
class RiskResult:
    """Enhanced risk result with breakdown of scoring components"""
    score: float
    level: RiskLevel
    decision: RiskDecision
    factors: list[str] = field(default_factory=list)
    # New fields for comprehensive scoring
    ml_score: float = 0.0  # Machine learning/behavior-based score
    rules_score: float = 0.0  # Rules engine score
    behavior_score: float = 0.0  # Customer behavior analysis score
    ml_factors: list[str] = field(default_factory=list)
    rules_factors: list[str] = field(default_factory=list)
    behavior_factors: list[str] = field(default_factory=list)
    triggered_rule_ids: list[int] = field(default_factory=list)


def _clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


def _calculate_behavior_score(
    db: Session,
    *,
    customer: Customer,
    amount: float,
    occurred_at: datetime,
) -> tuple[float, list[str]]:
    """
    Calculate customer behavior-based risk score.
    
    Returns (score, factors) tuple.
    """
    score = 0.0
    factors: list[str] = []

    # Check for new customer
    if customer.total_transactions == 0:
        score += 5
        factors.append("Customer has no prior transaction history.")

    # Analyze transaction amount against customer's history
    if customer.total_transactions > 0:
        avg_transaction = customer.total_transaction_amount / customer.total_transactions
        if amount > avg_transaction * 3:
            score += 15
            factors.append(
                f"Transaction amount (${amount:.2f}) is significantly above "
                f"customer's average (${avg_transaction:.2f})."
            )
        elif amount > avg_transaction * 2:
            score += 10
            factors.append(
                f"Transaction amount is above customer's average."
            )

    # Check for velocity (transactions per time period)
    hour_ago = occurred_at - timedelta(hours=1)
    hour_transaction_count = (
        db.query(Transaction)
        .filter(Transaction.customer_id == customer.id)
        .filter(Transaction.occurred_at >= hour_ago)
        .count()
    )
    if hour_transaction_count > 5:
        score += 12
        factors.append(
            f"High transaction velocity: {hour_transaction_count} transactions in last hour."
        )

    # Check for time-of-day anomalies
    hour_of_day = occurred_at.hour
    if hour_of_day < 6 or hour_of_day > 23:
        score += 8
        factors.append("Transaction occurred at unusual time of day.")

    return _clamp(score), factors


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
    """
    Comprehensive transaction risk evaluation combining multiple scoring methods.
    
    Combines:
    - ML/Heuristic Score (traditional risk factors)
    - Rules Engine Score (configurable business rules)
    - Customer Behavior Score (customer history and patterns)
    
    Final score is weighted average: ML(40%) + Rules(35%) + Behavior(25%)
    """
    ml_factors: list[str] = []
    rules_factors: list[str] = []
    behavior_factors: list[str] = []
    triggered_rule_ids: list[int] = []

    # ===== ML/HEURISTIC SCORING =====
    ml_score = 0.0

    if amount >= VERY_HIGH_AMOUNT_THRESHOLD:
        ml_score += 35
        ml_factors.append("Transaction amount is significantly above normal.")
    elif amount >= HIGH_AMOUNT_THRESHOLD:
        ml_score += 20
        ml_factors.append("Transaction amount is above typical thresholds.")

    window_start = occurred_at - timedelta(minutes=RAPID_WINDOW_MINUTES)

    recent_count = (
        db.query(Transaction)
        .filter(Transaction.customer_id == customer.id)
        .filter(Transaction.occurred_at >= window_start)
        .filter(Transaction.occurred_at <= occurred_at)
        .count()
    )

    if recent_count >= RAPID_TRANSACTION_COUNT:
        ml_score += 25
        ml_factors.append(
            f"{recent_count} transactions occurred within {RAPID_WINDOW_MINUTES} minutes."
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
            ml_score += 15
            ml_factors.append("New device detected.")

    if country:
        known_location = (
            db.query(Transaction)
            .filter(Transaction.customer_id == customer.id)
            .filter(Transaction.country == country)
            .first()
        )

        if known_location is None and customer.total_transactions > 0:
            ml_score += 15
            ml_factors.append("New location detected.")

    if ip_address:
        shared_ip_customers = (
            db.query(Transaction.customer_id)
            .filter(Transaction.ip_address == ip_address)
            .filter(Transaction.customer_id != customer.id)
            .distinct()
            .count()
        )

        if shared_ip_customers > 0:
            ml_score += 10
            ml_factors.append(
                f"IP address is shared by {shared_ip_customers} other customers."
            )

    ml_score = _clamp(ml_score)

    # ===== RULES ENGINE SCORING =====
    transaction_data = {
        "amount": amount,
        "device_id": device_id,
        "ip_address": ip_address,
        "country": country,
        "occurred_at": occurred_at,
    }

    rules_result = evaluate_all_rules(
        db,
        customer=customer,
        transaction_data=transaction_data,
    )

    rules_score = rules_result.total_rules_score

    for triggered in rules_result.triggered_rules:
        rules_factors.append(triggered.reason)
        triggered_rule_ids.append(triggered.rule_id)

    # ===== CUSTOMER BEHAVIOR SCORING =====
    behavior_score, behavior_factors = _calculate_behavior_score(
        db,
        customer=customer,
        amount=amount,
        occurred_at=occurred_at,
    )

    # ===== FINAL SCORE CALCULATION =====
    # Weighted combination: ML(40%) + Rules(35%) + Behavior(25%)
    final_score = (
        (ml_score * 0.40) +
        (rules_score * 0.35) +
        (behavior_score * 0.25)
    )
    final_score = _clamp(final_score)

    # Combine all factors
    all_factors = ml_factors + rules_factors + behavior_factors
    if not all_factors:
        all_factors.append("No significant risk indicators detected.")

    # Determine risk level and decision
    if final_score <= 30:
        level = RiskLevel.LOW
        decision = RiskDecision.APPROVE
    elif final_score <= 70:
        level = RiskLevel.MEDIUM
        decision = RiskDecision.REVIEW
    else:
        level = RiskLevel.HIGH
        decision = RiskDecision.BLOCK

    return RiskResult(
        score=final_score,
        level=level,
        decision=decision,
        factors=all_factors,
        ml_score=ml_score,
        rules_score=rules_score,
        behavior_score=behavior_score,
        ml_factors=ml_factors,
        rules_factors=rules_factors,
        behavior_factors=behavior_factors,
        triggered_rule_ids=triggered_rule_ids,
    )
