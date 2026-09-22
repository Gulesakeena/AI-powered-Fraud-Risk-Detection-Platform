"""
Fraud Pattern Detection Service (Member 5)

Detects fraud patterns that span relationships between customers, devices,
IPs, locations and behavior history -- as opposed to app.services.risk_scoring,
which scores a single transaction in isolation.

Output from this module feeds:
  - Alert creation (services/alerts.py)
  - Investigation system (services/investigations.py)
  - Fraud network APIs (Member 3's relationship graph)
  - Customer risk profile updates (services/customer_risk.py)
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum

from sqlalchemy.orm import Session

from app.models.customers import Customer
from app.models.transactions import Transaction


# ===== Thresholds =====

RAPID_WINDOW_MINUTES = 10
RAPID_TRANSACTION_COUNT = 3

VELOCITY_WINDOW_HOURS = 1
VELOCITY_TRANSACTION_COUNT = 5

BEHAVIOR_AMOUNT_MULTIPLIER_HIGH = 3.0
BEHAVIOR_AMOUNT_MULTIPLIER_MEDIUM = 2.0

IMPOSSIBLE_TRAVEL_WINDOW_MINUTES = 60

NETWORK_LOOKBACK_DAYS = 180


class PatternType(str, Enum):
    RAPID_TRANSACTIONS = "RAPID_TRANSACTIONS"
    DEVICE_SHARING = "DEVICE_SHARING"
    IP_SHARING = "IP_SHARING"
    LOCATION_ANOMALY = "LOCATION_ANOMALY"
    IMPOSSIBLE_TRAVEL = "IMPOSSIBLE_TRAVEL"
    BEHAVIOR_CHANGE = "BEHAVIOR_CHANGE"
    AMOUNT_ANOMALY = "AMOUNT_ANOMALY"
    SUSPICIOUS_NETWORK = "SUSPICIOUS_NETWORK"


class PatternSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


_SEVERITY_ORDER = [
    PatternSeverity.LOW,
    PatternSeverity.MEDIUM,
    PatternSeverity.HIGH,
    PatternSeverity.CRITICAL,
]


@dataclass
class FraudPattern:
    """A single detected fraud pattern."""
    pattern_type: PatternType
    severity: PatternSeverity
    reason: str
    details: dict = field(default_factory=dict)


@dataclass
class FraudDetectionResult:
    """Aggregated result of running all detectors against one transaction."""
    transaction_id: int
    customer_id: int
    patterns: list[FraudPattern] = field(default_factory=list)

    @property
    def triggered(self) -> bool:
        return len(self.patterns) > 0

    @property
    def highest_severity(self) -> PatternSeverity | None:
        if not self.patterns:
            return None
        return max(
            self.patterns,
            key=lambda p: _SEVERITY_ORDER.index(p.severity),
        ).severity

    @property
    def pattern_types(self) -> list[PatternType]:
        return [p.pattern_type for p in self.patterns]


# ===== Individual detectors =====
# Each detector takes the transaction (already persisted, so it has an id)
# and returns a FraudPattern if triggered, or None.


def detect_rapid_transactions(
    db: Session,
    *,
    transaction: Transaction,
) -> FraudPattern | None:
    """Flag 3+ transactions by the same customer within a short window."""
    window_start = transaction.occurred_at - timedelta(minutes=RAPID_WINDOW_MINUTES)

    recent_count = (
        db.query(Transaction)
        .filter(Transaction.customer_id == transaction.customer_id)
        .filter(Transaction.occurred_at >= window_start)
        .filter(Transaction.occurred_at <= transaction.occurred_at)
        .filter(Transaction.id != transaction.id)
        .count()
    )

    if recent_count + 1 >= RAPID_TRANSACTION_COUNT:
        return FraudPattern(
            pattern_type=PatternType.RAPID_TRANSACTIONS,
            severity=PatternSeverity.HIGH if recent_count + 1 >= RAPID_TRANSACTION_COUNT * 2
            else PatternSeverity.MEDIUM,
            reason=(
                f"{recent_count + 1} transactions by this customer occurred "
                f"within {RAPID_WINDOW_MINUTES} minutes."
            ),
            details={
                "transaction_count": recent_count + 1,
                "window_minutes": RAPID_WINDOW_MINUTES,
            },
        )
    return None


def detect_device_sharing(
    db: Session,
    *,
    transaction: Transaction,
) -> FraudPattern | None:
    """Flag when this transaction's device has been used by other customers."""
    if not transaction.device_id:
        return None

    other_customers = (
        db.query(Transaction.customer_id)
        .filter(Transaction.device_id == transaction.device_id)
        .filter(Transaction.customer_id != transaction.customer_id)
        .distinct()
        .all()
    )
    other_customer_ids = [row[0] for row in other_customers]

    if not other_customer_ids:
        return None

    severity = PatternSeverity.HIGH if len(other_customer_ids) >= 3 else PatternSeverity.MEDIUM

    return FraudPattern(
        pattern_type=PatternType.DEVICE_SHARING,
        severity=severity,
        reason=(
            f"Device {transaction.device_id} is shared with "
            f"{len(other_customer_ids)} other customer(s)."
        ),
        details={
            "device_id": transaction.device_id,
            "shared_customer_ids": other_customer_ids,
        },
    )


def detect_ip_sharing(
    db: Session,
    *,
    transaction: Transaction,
) -> FraudPattern | None:
    """Flag when this transaction's IP has been used by other customers."""
    if not transaction.ip_address:
        return None

    other_customers = (
        db.query(Transaction.customer_id)
        .filter(Transaction.ip_address == transaction.ip_address)
        .filter(Transaction.customer_id != transaction.customer_id)
        .distinct()
        .all()
    )
    other_customer_ids = [row[0] for row in other_customers]

    if not other_customer_ids:
        return None

    severity = PatternSeverity.HIGH if len(other_customer_ids) >= 3 else PatternSeverity.MEDIUM

    return FraudPattern(
        pattern_type=PatternType.IP_SHARING,
        severity=severity,
        reason=(
            f"IP address {transaction.ip_address} is shared with "
            f"{len(other_customer_ids)} other customer(s)."
        ),
        details={
            "ip_address": transaction.ip_address,
            "shared_customer_ids": other_customer_ids,
        },
    )


def detect_location_anomaly(
    db: Session,
    *,
    transaction: Transaction,
    customer: Customer,
) -> FraudPattern | None:
    """Flag a country never seen before for this customer, and impossible travel."""
    if not transaction.country or customer.total_transactions == 0:
        return None

    prior_same_country = (
        db.query(Transaction)
        .filter(Transaction.customer_id == customer.id)
        .filter(Transaction.country == transaction.country)
        .filter(Transaction.id != transaction.id)
        .filter(Transaction.occurred_at < transaction.occurred_at)
        .first()
    )

    if prior_same_country is not None:
        return None

    # Check for impossible travel: a transaction from a different country
    # within a very short window suggests a compromised account rather than
    # legitimate travel.
    window_start = transaction.occurred_at - timedelta(minutes=IMPOSSIBLE_TRAVEL_WINDOW_MINUTES)
    recent_other_country = (
        db.query(Transaction)
        .filter(Transaction.customer_id == customer.id)
        .filter(Transaction.country.isnot(None))
        .filter(Transaction.country != transaction.country)
        .filter(Transaction.occurred_at >= window_start)
        .filter(Transaction.occurred_at < transaction.occurred_at)
        .order_by(Transaction.occurred_at.desc())
        .first()
    )

    if recent_other_country is not None:
        return FraudPattern(
            pattern_type=PatternType.IMPOSSIBLE_TRAVEL,
            severity=PatternSeverity.CRITICAL,
            reason=(
                f"Transaction from {transaction.country} occurred within "
                f"{IMPOSSIBLE_TRAVEL_WINDOW_MINUTES} minutes of a transaction "
                f"from {recent_other_country.country}."
            ),
            details={
                "current_country": transaction.country,
                "previous_country": recent_other_country.country,
                "previous_transaction_id": recent_other_country.id,
                "window_minutes": IMPOSSIBLE_TRAVEL_WINDOW_MINUTES,
            },
        )

    return FraudPattern(
        pattern_type=PatternType.LOCATION_ANOMALY,
        severity=PatternSeverity.MEDIUM,
        reason=f"New location detected for this customer: {transaction.country}.",
        details={"country": transaction.country},
    )


def detect_behavior_change(
    db: Session,
    *,
    transaction: Transaction,
    customer: Customer,
) -> FraudPattern | None:
    """Flag a transaction that deviates sharply from the customer's historical
    spending pattern, or a sudden spike in transaction frequency."""
    patterns: list[str] = []
    details: dict = {}
    severity = PatternSeverity.LOW

    if customer.total_transactions > 0:
        avg_amount = customer.total_spending / customer.total_transactions
        if avg_amount > 0:
            if transaction.amount > avg_amount * BEHAVIOR_AMOUNT_MULTIPLIER_HIGH:
                patterns.append(
                    f"Amount (${transaction.amount:.2f}) is more than "
                    f"{BEHAVIOR_AMOUNT_MULTIPLIER_HIGH:.0f}x this customer's "
                    f"average (${avg_amount:.2f})."
                )
                details["avg_amount"] = avg_amount
                details["amount_multiplier"] = round(transaction.amount / avg_amount, 2)
                severity = PatternSeverity.HIGH
            elif transaction.amount > avg_amount * BEHAVIOR_AMOUNT_MULTIPLIER_MEDIUM:
                patterns.append(
                    f"Amount (${transaction.amount:.2f}) is well above this "
                    f"customer's average (${avg_amount:.2f})."
                )
                details["avg_amount"] = avg_amount
                details["amount_multiplier"] = round(transaction.amount / avg_amount, 2)
                if severity == PatternSeverity.LOW:
                    severity = PatternSeverity.MEDIUM

    window_start = transaction.occurred_at - timedelta(hours=VELOCITY_WINDOW_HOURS)
    hour_count = (
        db.query(Transaction)
        .filter(Transaction.customer_id == customer.id)
        .filter(Transaction.occurred_at >= window_start)
        .filter(Transaction.occurred_at <= transaction.occurred_at)
        .count()
    )
    if hour_count >= VELOCITY_TRANSACTION_COUNT:
        patterns.append(
            f"{hour_count} transactions occurred in the last "
            f"{VELOCITY_WINDOW_HOURS} hour(s), well above normal frequency."
        )
        details["hour_transaction_count"] = hour_count
        severity = PatternSeverity.HIGH

    if not patterns:
        return None

    return FraudPattern(
        pattern_type=PatternType.BEHAVIOR_CHANGE,
        severity=severity,
        reason=" ".join(patterns),
        details=details,
    )


def detect_suspicious_network(
    db: Session,
    *,
    transaction: Transaction,
) -> FraudPattern | None:
    """Flag when this transaction's device or IP links back to a customer with
    a confirmed fraud history -- the strongest signal in the network."""
    if not transaction.device_id and not transaction.ip_address:
        return None

    linked_customer_ids: set[int] = set()

    if transaction.device_id:
        rows = (
            db.query(Transaction.customer_id)
            .filter(Transaction.device_id == transaction.device_id)
            .filter(Transaction.customer_id != transaction.customer_id)
            .distinct()
            .all()
        )
        linked_customer_ids.update(row[0] for row in rows)

    if transaction.ip_address:
        rows = (
            db.query(Transaction.customer_id)
            .filter(Transaction.ip_address == transaction.ip_address)
            .filter(Transaction.customer_id != transaction.customer_id)
            .distinct()
            .all()
        )
        linked_customer_ids.update(row[0] for row in rows)

    if not linked_customer_ids:
        return None

    fraud_customers = (
        db.query(Customer)
        .filter(Customer.id.in_(linked_customer_ids))
        .filter(Customer.confirmed_fraud_count > 0)
        .all()
    )

    if not fraud_customers:
        return None

    return FraudPattern(
        pattern_type=PatternType.SUSPICIOUS_NETWORK,
        severity=PatternSeverity.CRITICAL,
        reason=(
            f"Shares a device or IP with {len(fraud_customers)} customer(s) "
            f"who have confirmed fraud history."
        ),
        details={
            "linked_customer_ids": [c.id for c in fraud_customers],
            "linked_customer_refs": [c.customer_ref for c in fraud_customers],
        },
    )


# ===== Orchestrator =====


def run_fraud_detection(
    db: Session,
    *,
    transaction: Transaction,
    customer: Customer,
) -> FraudDetectionResult:
    """Run every detector against a transaction and return the aggregated result.

    `transaction` must already be persisted (have an id) so relationship
    queries can exclude it from its own comparisons.
    """
    result = FraudDetectionResult(
        transaction_id=transaction.id,
        customer_id=customer.id,
    )

    detectors = [
        lambda: detect_rapid_transactions(db, transaction=transaction),
        lambda: detect_device_sharing(db, transaction=transaction),
        lambda: detect_ip_sharing(db, transaction=transaction),
        lambda: detect_location_anomaly(db, transaction=transaction, customer=customer),
        lambda: detect_behavior_change(db, transaction=transaction, customer=customer),
        lambda: detect_suspicious_network(db, transaction=transaction),
    ]

    for detector in detectors:
        try:
            pattern = detector()
        except Exception as exc:  # keep one bad detector from blocking the rest
            print(f"Fraud detection error: {exc}")
            continue
        if pattern is not None:
            result.patterns.append(pattern)

    return result


def detect_patterns_for_transaction(
    db: Session,
    *,
    transaction_id: int,
) -> FraudDetectionResult | None:
    """Convenience entry point: load a transaction + customer by id and run detection."""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if transaction is None:
        return None

    customer = db.query(Customer).filter(Customer.id == transaction.customer_id).first()
    if customer is None:
        return None

    return run_fraud_detection(db, transaction=transaction, customer=customer)