#services/customer_risk.py
"""
Customer Risk Profile Service (Member 5)

Member 2's services.customers already owns the core counters and the
risk-score formula (apply_transaction_to_customer, apply_outcome_to_customer,
recompute_customer_risk_level). This module does NOT duplicate that logic.
It adds three things that were still missing from the spec:

  1. A read-side aggregated profile (devices used, locations used, fraud
     history) -- the Customer model itself has no columns for these, they
     have to be derived from Transaction/Alert/Investigation data.
  2. The missing hook: propagating a finalized Investigation outcome to the
     customer's risk profile (was previously only done for Alert review).
  3. A reconciliation tool to recompute a customer's counters from source
     transaction data, for when counters drift (e.g. after a bug, a manual
     DB edit, or a bulk CSV import that bypassed the normal pipeline).
"""

from typing import Optional

from sqlalchemy.orm import Session

from app.models.alerts import Alert, AlertStatus
from app.models.customers import Customer
from app.models.investigations import Investigation, InvestigationOutcome
from app.models.transactions import RiskLevel, Transaction, TransactionOutcome
from app.services.customers import (
    apply_outcome_to_customer,
    recompute_customer_risk_level,
)
from app.services.investigations import (
    _get_customer_devices,
    _get_customer_ips,
    _get_customer_locations,
)


# ===== Aggregated read-side profile =====


def _get_fraud_history(db: Session, customer_id: int) -> list[dict]:
    """Confirmed-fraud / false-positive history from both alerts and
    investigations, newest first."""
    alerts = (
        db.query(Alert)
        .filter(Alert.customer_id == customer_id)
        .filter(Alert.status.in_([AlertStatus.CONFIRMED_FRAUD, AlertStatus.FALSE_POSITIVE]))
        .order_by(Alert.updated_at.desc())
        .all()
    )

    investigations = (
        db.query(Investigation)
        .filter(Investigation.customer_id == customer_id)
        .filter(
            Investigation.outcome.in_(
                [InvestigationOutcome.CONFIRMED_FRAUD, InvestigationOutcome.FALSE_POSITIVE]
            )
        )
        .order_by(Investigation.updated_at.desc())
        .all()
    )

    history = [
        {
            "source": "ALERT",
            "id": alert.id,
            "outcome": alert.status.value,
            "date": alert.updated_at,
        }
        for alert in alerts
    ] + [
        {
            "source": "INVESTIGATION",
            "id": investigation.id,
            "outcome": investigation.outcome.value,
            "date": investigation.updated_at,
        }
        for investigation in investigations
    ]

    history.sort(key=lambda entry: entry["date"], reverse=True)
    return history


def get_customer_risk_profile(db: Session, customer_id: int) -> Optional[dict]:
    """
    Full customer risk profile: the stored counters from the Customer model
    plus derived data (devices used, locations used, fraud history) that
    isn't stored as columns and has to be computed from transaction history.
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if customer is None:
        return None

    return {
        "customer": customer,
        "devices_used": _get_customer_devices(db, customer_id),
        "ip_addresses_used": _get_customer_ips(db, customer_id),
        "locations_used": _get_customer_locations(db, customer_id),
        "fraud_history": _get_fraud_history(db, customer_id),
    }


# ===== Investigation outcome -> customer profile hook =====

_INVESTIGATION_OUTCOME_TO_TRANSACTION_OUTCOME: dict[InvestigationOutcome, TransactionOutcome] = {
    InvestigationOutcome.CONFIRMED_FRAUD: TransactionOutcome.CONFIRMED_FRAUD,
    InvestigationOutcome.FALSE_POSITIVE: TransactionOutcome.FALSE_POSITIVE,
}


def apply_investigation_outcome_to_customer(
    db: Session,
    *,
    investigation: Investigation,
) -> None:
    """
    Propagate a finalized investigation outcome to the customer's risk
    profile. Call this from services.investigations.update_investigation
    whenever an investigation's outcome is newly set to CONFIRMED_FRAUD or
    FALSE_POSITIVE.

    If the investigation is tied to a specific transaction, updates that
    transaction's outcome too -- guarded against double-counting in case an
    alert review already set the same outcome on the same transaction.
    If the investigation has no linked transaction (a customer-level
    investigation), the outcome is applied to the customer directly.

    Does not commit; the caller is expected to commit as part of its own
    transaction (matches the pattern in services.customers).
    """
    mapped_outcome = _INVESTIGATION_OUTCOME_TO_TRANSACTION_OUTCOME.get(investigation.outcome)
    if mapped_outcome is None:
        return

    customer = db.query(Customer).filter(Customer.id == investigation.customer_id).first()
    if customer is None:
        return

    if investigation.transaction_id:
        transaction = (
            db.query(Transaction)
            .filter(Transaction.id == investigation.transaction_id)
            .first()
        )
        if transaction is not None and transaction.outcome != mapped_outcome:
            transaction.outcome = mapped_outcome
            apply_outcome_to_customer(db, customer=customer, outcome=mapped_outcome)
    else:
        apply_outcome_to_customer(db, customer=customer, outcome=mapped_outcome)


# ===== Reconciliation =====


def recalculate_full_customer_profile(db: Session, customer_id: int) -> Optional[Customer]:
    """
    Recompute a customer's counters directly from their transaction history,
    rather than trusting the incrementally-maintained counters. Use this as
    an admin/repair tool if counters are ever suspected to have drifted
    (e.g. a bulk import that bypassed the normal risk pipeline, or a bug in
    an incremental update path).
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if customer is None:
        return None

    transactions = (
        db.query(Transaction).filter(Transaction.customer_id == customer_id).all()
    )

    customer.total_transactions = len(transactions)
    customer.total_spending = sum(t.amount for t in transactions)
    customer.suspicious_transactions = sum(
        1 for t in transactions if t.risk_level in (RiskLevel.MEDIUM, RiskLevel.HIGH)
    )
    customer.confirmed_fraud_count = sum(
        1 for t in transactions if t.outcome == TransactionOutcome.CONFIRMED_FRAUD
    )
    customer.false_positive_count = sum(
        1 for t in transactions if t.outcome == TransactionOutcome.FALSE_POSITIVE
    )

    if transactions:
        customer.last_active_at = max(t.occurred_at for t in transactions)

    recompute_customer_risk_level(customer)

    db.commit()
    db.refresh(customer)
    return customer