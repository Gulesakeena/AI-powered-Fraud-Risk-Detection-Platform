from datetime import datetime

from sqlalchemy.orm import Session

from app.models.customers import Customer, CustomerRiskLevel
from app.models.transactions import RiskLevel, TransactionOutcome


def get_or_create_customer(
    db: Session,
    *,
    customer_ref: str,
    name: str,
    email: str | None = None,
    phone: str | None = None,
) -> Customer:
    customer = (
        db.query(Customer)
        .filter(Customer.customer_ref == customer_ref)
        .first()
    )

    if customer is not None:
        return customer

    customer = Customer(
        customer_ref=customer_ref,
        name=name,
        email=email,
        phone=phone,
    )

    db.add(customer)
    db.flush()

    return customer


def apply_transaction_to_customer(
    db: Session,
    *,
    customer: Customer,
    amount: float,
    risk_level: RiskLevel,
    occurred_at: datetime,
) -> None:
    customer.total_transactions += 1
    customer.total_spending += amount
    customer.last_active_at = occurred_at

    if risk_level in (RiskLevel.MEDIUM, RiskLevel.HIGH):
        customer.suspicious_transactions += 1

    recompute_customer_risk_level(customer)


def recompute_customer_risk_level(customer: Customer) -> None:
    if customer.total_transactions == 0:
        customer.risk_score = 0.0
        customer.risk_level = CustomerRiskLevel.LOW
        return

    suspicious_ratio = (
        customer.suspicious_transactions / customer.total_transactions
    )

    base_score = suspicious_ratio * 70

    fraud_penalty = min(customer.confirmed_fraud_count * 15, 30)

    score = min(100.0, base_score + fraud_penalty)

    customer.risk_score = round(score, 2)

    if score <= 30:
        customer.risk_level = CustomerRiskLevel.LOW
    elif score <= 70:
        customer.risk_level = CustomerRiskLevel.MEDIUM
    else:
        customer.risk_level = CustomerRiskLevel.HIGH


def apply_outcome_to_customer(
    db: Session,
    *,
    customer: Customer,
    outcome: TransactionOutcome,
) -> None:
    if outcome == TransactionOutcome.CONFIRMED_FRAUD:
        customer.confirmed_fraud_count += 1
    elif outcome == TransactionOutcome.FALSE_POSITIVE:
        customer.false_positive_count += 1

    recompute_customer_risk_level(customer)
