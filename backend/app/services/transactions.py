import json
from datetime import datetime
from uuid import uuid4

from sqlalchemy.orm import Session

<<<<<<< HEAD
=======
from app.models.alerts import Alert, AlertSeverity
>>>>>>> 7dc32d20311dacb615026cefea7a42666a4b94e1
from app.models.transactions import (
    RiskDecision,
    RiskLevel,
    Transaction,
    TransactionSource,
    TransactionStatus,
)
from app.schemas.transactions import TransactionCreate
<<<<<<< HEAD
from app.services.alerts import create_alert_for_transaction
=======
>>>>>>> 7dc32d20311dacb615026cefea7a42666a4b94e1
from app.services.customers import (
    apply_transaction_to_customer,
    get_or_create_customer,
)
<<<<<<< HEAD
from app.services.fraud_detection import run_fraud_detection
from app.services.risk_explanation import generate_risk_explanation
from app.services.risk_scoring import evaluate_transaction_risk
=======
from app.services.risk_scoring import evaluate_transaction_risk
from app.services.risk_explanation import generate_risk_explanation


SEVERITY_BY_RISK_LEVEL = {
    RiskLevel.LOW: AlertSeverity.LOW,
    RiskLevel.MEDIUM: AlertSeverity.MEDIUM,
    RiskLevel.HIGH: AlertSeverity.HIGH,
}
>>>>>>> 7dc32d20311dacb615026cefea7a42666a4b94e1


def generate_transaction_ref() -> str:
    return f"TXN-{uuid4().hex[:12].upper()}"


def create_transaction_with_risk_check(
    db: Session,
    *,
    data: TransactionCreate,
    source: TransactionSource,
    created_by_id: int | None,
) -> Transaction:
    transaction_ref = data.transaction_ref or generate_transaction_ref()

    existing = (
        db.query(Transaction)
        .filter(Transaction.transaction_ref == transaction_ref)
        .first()
    )

    if existing is not None:
        raise ValueError(
            f"Transaction with reference '{transaction_ref}' already exists."
        )

    customer = get_or_create_customer(
        db,
        customer_ref=data.customer.customer_ref,
        name=data.customer.name,
        email=data.customer.email,
        phone=data.customer.phone,
    )

    occurred_at = data.occurred_at or datetime.utcnow()

    risk_result = evaluate_transaction_risk(
        db,
        customer=customer,
        amount=data.amount,
        device_id=data.device_id,
        ip_address=data.ip_address,
        country=data.country,
        occurred_at=occurred_at,
    )

    status = TransactionStatus.COMPLETED

    if risk_result.decision == RiskDecision.BLOCK:
        status = TransactionStatus.BLOCKED
    elif risk_result.decision == RiskDecision.REVIEW:
        status = TransactionStatus.REVIEWING

    transaction = Transaction(
        transaction_ref=transaction_ref,
        customer_id=customer.id,
        amount=data.amount,
        currency=data.currency,
        merchant=data.merchant,
        merchant_category=data.merchant_category,
        payment_method_type=data.payment_method_type,
        payment_method_last4=data.payment_method_last4,
        device_id=data.device_id,
        device_type=data.device_type,
        device_os=data.device_os,
        device_browser=data.device_browser,
        ip_address=data.ip_address,
        is_vpn=data.is_vpn,
        city=data.city,
        country=data.country,
        country_code=data.country_code,
        risk_score=risk_result.score,
        risk_level=risk_result.level,
        decision=risk_result.decision,
        risk_factors=json.dumps(risk_result.factors),
        status=status,
        source=source,
        description=data.description,
        created_by_id=created_by_id,
        occurred_at=occurred_at,
    )

    db.add(transaction)
    db.flush()

    apply_transaction_to_customer(
        db,
        customer=customer,
        amount=data.amount,
        risk_level=risk_result.level,
        occurred_at=occurred_at,
    )

<<<<<<< HEAD
    fraud_result = run_fraud_detection(db, transaction=transaction, customer=customer)
    create_alert_for_transaction(
        db,
        transaction=transaction,
        customer=customer,
        fraud_result=fraud_result,
    )
=======
    if risk_result.decision in (RiskDecision.REVIEW, RiskDecision.BLOCK):
        alert = Alert(
            transaction_id=transaction.id,
            customer_id=customer.id,
            severity=SEVERITY_BY_RISK_LEVEL[risk_result.level],
            reason="; ".join(risk_result.factors),
            risk_score=risk_result.score,
        )

        db.add(alert)
>>>>>>> 7dc32d20311dacb615026cefea7a42666a4b94e1

    # Generate comprehensive risk explanation
    generate_risk_explanation(
        db,
        transaction=transaction,
        ml_score=risk_result.ml_score,
        rules_score=risk_result.rules_score,
        behavior_score=risk_result.behavior_score,
        ml_factors=risk_result.ml_factors,
        rules_factors=risk_result.rules_factors,
        behavior_factors=risk_result.behavior_factors,
        triggered_rule_ids=risk_result.triggered_rule_ids,
    )

    db.commit()
    db.refresh(transaction)

<<<<<<< HEAD
    return transaction
=======
    return transaction
>>>>>>> 7dc32d20311dacb615026cefea7a42666a4b94e1
