#services/investigations.py
"""
Investigation Service (Member 5)

Manages the investigation lifecycle (create, assign, update, note-taking)
and, critically, aggregates real database data -- customer profile,
transaction history, related alerts, shared devices/IPs, locations and risk
factors -- so an analyst can investigate suspicious activity without
hallucinated or mock data. This is also the data source the AI Investigation
Assistant (Member 4) should query from rather than the raw tables directly.
"""

import json
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models.alerts import Alert, AlertStatus
from app.models.customers import Customer
from app.models.investigations import (
    Investigation,
    InvestigationNote,
    InvestigationOutcome,
    InvestigationStatus,
)
from app.models.risk_explanation import RiskExplanation
from app.models.transactions import Transaction

TRANSACTION_HISTORY_LIMIT = 25


# ===== Lifecycle =====


def create_investigation(
    db: Session,
    *,
    customer_id: int,
    created_by_id: int | None,
    title: str,
    transaction_id: int | None = None,
    alert_id: int | None = None,
    summary: str | None = None,
) -> Investigation:
    """Open a new investigation. If it's tied to an alert still in NEW
    status, moves that alert to INVESTIGATING."""
    investigation = Investigation(
        customer_id=customer_id,
        transaction_id=transaction_id,
        alert_id=alert_id,
        title=title,
        summary=summary,
        status=InvestigationStatus.OPEN,
        outcome=InvestigationOutcome.PENDING,
        created_by_id=created_by_id,
    )
    db.add(investigation)

    if alert_id:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if alert and alert.status == AlertStatus.NEW:
            alert.status = AlertStatus.INVESTIGATING

    db.commit()
    db.refresh(investigation)
    return investigation


def get_investigation(db: Session, investigation_id: int) -> Optional[Investigation]:
    return db.query(Investigation).filter(Investigation.id == investigation_id).first()


def list_investigations(
    db: Session,
    *,
    status_filter: InvestigationStatus | None = None,
    customer_id: int | None = None,
    assigned_to_id: int | None = None,
) -> list[Investigation]:
    query = db.query(Investigation)

    if status_filter:
        query = query.filter(Investigation.status == status_filter)
    if customer_id:
        query = query.filter(Investigation.customer_id == customer_id)
    if assigned_to_id:
        query = query.filter(Investigation.assigned_to_id == assigned_to_id)

    return query.order_by(Investigation.created_at.desc()).all()


def assign_investigation(
    db: Session, investigation_id: int, user_id: int
) -> Optional[Investigation]:
    """Assign an investigation to an analyst. Moves OPEN investigations to IN_PROGRESS."""
    investigation = get_investigation(db, investigation_id)
    if not investigation:
        return None

    investigation.assigned_to_id = user_id
    if investigation.status == InvestigationStatus.OPEN:
        investigation.status = InvestigationStatus.IN_PROGRESS

    db.commit()
    db.refresh(investigation)
    return investigation


def update_investigation(
    db: Session,
    investigation_id: int,
    *,
    status: InvestigationStatus | None = None,
    outcome: InvestigationOutcome | None = None,
    findings: str | None = None,
) -> Optional[Investigation]:
    """
    Update investigation status/outcome/findings. Closing sets closed_at.

    Setting outcome to CONFIRMED_FRAUD or FALSE_POSITIVE for the first time
    propagates that result to the customer's risk profile (see
    services.customer_risk.apply_investigation_outcome_to_customer) -- the
    same way reviewing an alert does. Re-saving with an unchanged outcome
    does not re-apply it.
    """
    investigation = get_investigation(db, investigation_id)
    if not investigation:
        return None

    previous_outcome = investigation.outcome

    if status is not None:
        investigation.status = status
        if status == InvestigationStatus.CLOSED:
            investigation.closed_at = datetime.utcnow()

    if outcome is not None:
        investigation.outcome = outcome

    if findings is not None:
        investigation.findings = findings

    if outcome is not None and outcome != previous_outcome:
        from app.services.customer_risk import apply_investigation_outcome_to_customer

        apply_investigation_outcome_to_customer(db, investigation=investigation)

    db.commit()
    db.refresh(investigation)
    return investigation


def add_note(
    db: Session,
    *,
    investigation_id: int,
    author_id: int | None,
    note: str,
) -> Optional[InvestigationNote]:
    """Append a note to an investigation's history."""
    investigation = get_investigation(db, investigation_id)
    if not investigation:
        return None

    entry = InvestigationNote(
        investigation_id=investigation_id,
        author_id=author_id,
        note=note,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


# ===== Context aggregation (real DB data, no mock data) =====


def _get_customer_devices(db: Session, customer_id: int) -> list[dict]:
    rows = (
        db.query(Transaction.device_id)
        .filter(Transaction.customer_id == customer_id)
        .filter(Transaction.device_id.isnot(None))
        .distinct()
        .all()
    )
    devices = []
    for (device_id,) in rows:
        shared_count = (
            db.query(Transaction.customer_id)
            .filter(Transaction.device_id == device_id)
            .filter(Transaction.customer_id != customer_id)
            .distinct()
            .count()
        )
        devices.append(
            {"device_id": device_id, "shared_with_other_customers": shared_count}
        )
    return devices


def _get_customer_ips(db: Session, customer_id: int) -> list[dict]:
    rows = (
        db.query(Transaction.ip_address)
        .filter(Transaction.customer_id == customer_id)
        .filter(Transaction.ip_address.isnot(None))
        .distinct()
        .all()
    )
    ips = []
    for (ip_address,) in rows:
        shared_count = (
            db.query(Transaction.customer_id)
            .filter(Transaction.ip_address == ip_address)
            .filter(Transaction.customer_id != customer_id)
            .distinct()
            .count()
        )
        ips.append(
            {"ip_address": ip_address, "shared_with_other_customers": shared_count}
        )
    return ips


def _get_customer_locations(db: Session, customer_id: int) -> list[dict]:
    rows = (
        db.query(Transaction.country, Transaction.city)
        .filter(Transaction.customer_id == customer_id)
        .all()
    )
    counts: dict[tuple, int] = {}
    for country, city in rows:
        key = (country, city)
        counts[key] = counts.get(key, 0) + 1
    return [
        {"country": country, "city": city, "transaction_count": count}
        for (country, city), count in counts.items()
    ]


def _get_risk_factors(db: Session, transaction: Transaction | None) -> list[str]:
    """Prefer the transaction's own stored risk_factors; fall back to the
    RiskExplanation record (Member 4) if that's empty."""
    if transaction is None:
        return []

    if transaction.risk_factors:
        try:
            return json.loads(transaction.risk_factors)
        except (TypeError, ValueError):
            pass

    explanation = (
        db.query(RiskExplanation)
        .filter(RiskExplanation.transaction_id == transaction.id)
        .first()
    )
    if explanation and explanation.reasons:
        try:
            return json.loads(explanation.reasons)
        except (TypeError, ValueError):
            return []

    return []


def get_investigation_context(db: Session, investigation: Investigation) -> dict:
    """
    Build the full set of real database data an analyst needs for this
    investigation: customer profile, transaction history, related alerts,
    shared devices/IPs, location history, risk factors, and any live fraud
    patterns on the primary transaction. Everything here is queried live --
    nothing is mocked or fabricated.
    """
    customer = (
        db.query(Customer).filter(Customer.id == investigation.customer_id).first()
    )

    primary_transaction = None
    if investigation.transaction_id:
        primary_transaction = (
            db.query(Transaction)
            .filter(Transaction.id == investigation.transaction_id)
            .first()
        )

    related_transactions = (
        db.query(Transaction)
        .filter(Transaction.customer_id == investigation.customer_id)
        .order_by(Transaction.occurred_at.desc())
        .limit(TRANSACTION_HISTORY_LIMIT)
        .all()
    )

    related_alerts = (
        db.query(Alert)
        .filter(Alert.customer_id == investigation.customer_id)
        .order_by(Alert.created_at.desc())
        .all()
    )

    notes = (
        db.query(InvestigationNote)
        .filter(InvestigationNote.investigation_id == investigation.id)
        .order_by(InvestigationNote.created_at.asc())
        .all()
    )

    devices = _get_customer_devices(db, investigation.customer_id)
    ips = _get_customer_ips(db, investigation.customer_id)
    locations = _get_customer_locations(db, investigation.customer_id)
    risk_factors = _get_risk_factors(db, primary_transaction)

    fraud_pattern_reasons: list[str] = []
    if primary_transaction is not None and customer is not None:
        from app.services.fraud_detection import run_fraud_detection

        fraud_result = run_fraud_detection(
            db, transaction=primary_transaction, customer=customer
        )
        fraud_pattern_reasons = [p.reason for p in fraud_result.patterns]

    return {
        "investigation": investigation,
        "customer": customer,
        "primary_transaction": primary_transaction,
        "related_transactions": related_transactions,
        "related_alerts": related_alerts,
        "notes": notes,
        "devices": devices,
        "ip_addresses": ips,
        "locations": locations,
        "risk_factors": risk_factors,
        "fraud_pattern_reasons": fraud_pattern_reasons,
    }