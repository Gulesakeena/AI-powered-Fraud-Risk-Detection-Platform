"""
Alerts Service (Member 5)

Creates fraud alerts from transaction risk results + fraud pattern detection,
and manages their review lifecycle (NEW -> INVESTIGATING -> CONFIRMED_FRAUD /
FALSE_POSITIVE / RESOLVED).

Reviewing an alert propagates the outcome to the related Transaction and,
through services.customers.apply_outcome_to_customer, to the Customer risk
profile -- keeping alerts, transactions and customer risk in sync.
"""

import json
from typing import Optional

from sqlalchemy.orm import Session

from app.models.alerts import Alert, AlertSeverity, AlertStatus
from app.models.customers import Customer
from app.models.transactions import RiskLevel, Transaction, TransactionOutcome
from app.services.customers import apply_outcome_to_customer, recompute_customer_risk_level
from app.services.fraud_detection import FraudDetectionResult, PatternSeverity


# ===== Severity mapping =====

_RISK_LEVEL_TO_ALERT_SEVERITY: dict[RiskLevel, AlertSeverity] = {
    RiskLevel.LOW: AlertSeverity.LOW,
    RiskLevel.MEDIUM: AlertSeverity.MEDIUM,
    RiskLevel.HIGH: AlertSeverity.HIGH,
}

_PATTERN_SEVERITY_TO_ALERT_SEVERITY: dict[PatternSeverity, AlertSeverity] = {
    PatternSeverity.LOW: AlertSeverity.LOW,
    PatternSeverity.MEDIUM: AlertSeverity.MEDIUM,
    PatternSeverity.HIGH: AlertSeverity.HIGH,
    PatternSeverity.CRITICAL: AlertSeverity.CRITICAL,
}

_SEVERITY_RANK = [
    AlertSeverity.LOW,
    AlertSeverity.MEDIUM,
    AlertSeverity.HIGH,
    AlertSeverity.CRITICAL,
]


def _max_severity(a: AlertSeverity, b: AlertSeverity) -> AlertSeverity:
    return a if _SEVERITY_RANK.index(a) >= _SEVERITY_RANK.index(b) else b


def determine_alert_severity(
    *,
    risk_level: RiskLevel,
    fraud_result: Optional[FraudDetectionResult] = None,
) -> AlertSeverity:
    """Combine the transaction's risk level with any detected fraud pattern
    severity, taking the higher of the two."""
    severity = _RISK_LEVEL_TO_ALERT_SEVERITY.get(risk_level, AlertSeverity.LOW)

    if fraud_result and fraud_result.triggered and fraud_result.highest_severity:
        pattern_severity = _PATTERN_SEVERITY_TO_ALERT_SEVERITY.get(
            fraud_result.highest_severity, AlertSeverity.LOW
        )
        severity = _max_severity(severity, pattern_severity)

    return severity


def build_alert_reason(
    *,
    risk_factors: list[str] | None,
    fraud_result: Optional[FraudDetectionResult] = None,
) -> str:
    """Combine the risk engine's factors with fraud pattern reasons into one
    human-readable alert reason, de-duplicated and order-preserving."""
    reasons: list[str] = list(risk_factors or [])

    if fraud_result:
        reasons.extend(pattern.reason for pattern in fraud_result.patterns)

    if not reasons:
        reasons = ["Transaction flagged for review."]

    return " | ".join(dict.fromkeys(reasons))


def should_create_alert(
    *,
    transaction: Transaction,
    fraud_result: Optional[FraudDetectionResult] = None,
) -> bool:
    """Decide whether a transaction warrants a fraud alert."""
    if transaction.risk_level in (RiskLevel.MEDIUM, RiskLevel.HIGH):
        return True
    if fraud_result and fraud_result.triggered:
        return True
    return False


def create_alert_for_transaction(
    db: Session,
    *,
    transaction: Transaction,
    customer: Customer,
    fraud_result: Optional[FraudDetectionResult] = None,
) -> Optional[Alert]:
    """
    Create an Alert for a transaction if it meets the criteria.

    Call this after the transaction has been risk-scored (Member 4) and,
    ideally, after fraud_detection.run_fraud_detection has run against it.
    Returns None if no alert was warranted. Idempotent: returns the existing
    alert if one already exists for this transaction.
    """
    if not should_create_alert(transaction=transaction, fraud_result=fraud_result):
        return None

    existing = (
        db.query(Alert)
        .filter(Alert.transaction_id == transaction.id)
        .first()
    )
    if existing is not None:
        return existing

    risk_factors = (
        json.loads(transaction.risk_factors) if transaction.risk_factors else []
    )

    severity = determine_alert_severity(
        risk_level=transaction.risk_level,
        fraud_result=fraud_result,
    )

    reason = build_alert_reason(risk_factors=risk_factors, fraud_result=fraud_result)

    alert = Alert(
        transaction_id=transaction.id,
        customer_id=customer.id,
        severity=severity,
        reason=reason,
        risk_score=transaction.risk_score,
        status=AlertStatus.NEW,
    )
    db.add(alert)

    # services.customers.apply_transaction_to_customer already increments
    # suspicious_transactions for MEDIUM/HIGH risk_level transactions. Only
    # count it here for the case that misses: a fraud pattern (device/IP
    # sharing, impossible travel, etc.) triggering an alert on an otherwise
    # LOW-risk transaction. Avoids double-counting the common case.
    if transaction.risk_level not in (RiskLevel.MEDIUM, RiskLevel.HIGH):
        customer.suspicious_transactions = (customer.suspicious_transactions or 0) + 1
        recompute_customer_risk_level(customer)

    db.commit()
    db.refresh(alert)
    return alert


def get_alert(db: Session, alert_id: int) -> Optional[Alert]:
    return db.query(Alert).filter(Alert.id == alert_id).first()


def list_alerts(
    db: Session,
    *,
    status_filter: AlertStatus | None = None,
    severity: AlertSeverity | None = None,
    customer_id: int | None = None,
    assigned_to_id: int | None = None,
) -> list[Alert]:
    """List alerts with optional filters, newest first."""
    query = db.query(Alert)

    if status_filter:
        query = query.filter(Alert.status == status_filter)
    if severity:
        query = query.filter(Alert.severity == severity)
    if customer_id:
        query = query.filter(Alert.customer_id == customer_id)
    if assigned_to_id:
        query = query.filter(Alert.assigned_to_id == assigned_to_id)

    return query.order_by(Alert.created_at.desc()).all()


def assign_alert(db: Session, alert_id: int, user_id: int) -> Optional[Alert]:
    """Assign an alert to an analyst. Moves NEW alerts into INVESTIGATING."""
    alert = get_alert(db, alert_id)
    if not alert:
        return None

    alert.assigned_to_id = user_id
    if alert.status == AlertStatus.NEW:
        alert.status = AlertStatus.INVESTIGATING

    db.commit()
    db.refresh(alert)
    return alert


_STATUS_TO_OUTCOME: dict[AlertStatus, TransactionOutcome] = {
    AlertStatus.CONFIRMED_FRAUD: TransactionOutcome.CONFIRMED_FRAUD,
    AlertStatus.FALSE_POSITIVE: TransactionOutcome.FALSE_POSITIVE,
    AlertStatus.RESOLVED: TransactionOutcome.RESOLVED,
}


def review_alert(
    db: Session,
    *,
    alert_id: int,
    new_status: AlertStatus,
    reviewed_by_id: int,
    notes: str | None = None,
) -> Optional[Alert]:
    """
    Review an alert: update its status and, when the new status implies a
    fraud outcome (CONFIRMED_FRAUD / FALSE_POSITIVE / RESOLVED), propagate
    that outcome to the related transaction and customer risk profile via
    services.customers.apply_outcome_to_customer.
    """
    alert = get_alert(db, alert_id)
    if not alert:
        return None

    alert.status = new_status

    if notes:
        existing_reason = alert.reason or ""
        note_line = f"[Review by user {reviewed_by_id}]: {notes}"
        alert.reason = f"{existing_reason}\n{note_line}".strip()

    outcome = _STATUS_TO_OUTCOME.get(new_status)

    if outcome is not None:
        transaction = (
            db.query(Transaction)
            .filter(Transaction.id == alert.transaction_id)
            .first()
        )

        if transaction is not None and transaction.outcome != outcome:
            transaction.outcome = outcome

            customer = (
                db.query(Customer)
                .filter(Customer.id == transaction.customer_id)
                .first()
            )

            if customer is not None:
                apply_outcome_to_customer(db, customer=customer, outcome=outcome)

    db.commit()
    db.refresh(alert)
    return alert