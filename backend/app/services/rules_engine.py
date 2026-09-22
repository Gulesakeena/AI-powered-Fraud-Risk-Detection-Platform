"""Rules Engine Service - Manages and evaluates fraud detection rules"""

import json
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from app.models.customers import Customer
from app.models.rules import ConditionOperator, Rule, RuleEvaluation, RuleType
from app.models.transactions import Transaction


@dataclass
class RuleScore:
    """Result of rule evaluation"""
    rule_id: int
    rule_name: str
    triggered: bool
    risk_points: float
    reason: str
    details: dict = field(default_factory=dict)


@dataclass
class RulesEvaluationResult:
    """Result of evaluating all rules against a transaction"""
    total_rules_score: float  # Aggregated score from all rules (0-100)
    triggered_rules: list[RuleScore] = field(default_factory=list)
    skipped_rules: list[RuleScore] = field(default_factory=list)


def get_or_create_default_rules(db: Session) -> None:
    """Create system default rules if they don't exist"""
    default_rules = [
        {
            "name": "Very High Amount Transaction",
            "description": "Alert on transaction amounts >= 5000",
            "rule_type": RuleType.AMOUNT_THRESHOLD,
            "risk_points": 35.0,
            "weight": 1.0,
            "amount_threshold": 5000.0,
            "is_system_rule": True,
            "priority": 10,
            "enabled": True,
        },
        {
            "name": "High Amount Transaction",
            "description": "Alert on transaction amounts >= 2000",
            "rule_type": RuleType.AMOUNT_THRESHOLD,
            "risk_points": 20.0,
            "weight": 1.0,
            "amount_threshold": 2000.0,
            "is_system_rule": True,
            "priority": 9,
            "enabled": True,
        },
        {
            "name": "Rapid Transactions",
            "description": "Alert on 3+ transactions within 10 minutes",
            "rule_type": RuleType.RAPID_TRANSACTIONS,
            "risk_points": 25.0,
            "weight": 1.0,
            "time_window_minutes": 10,
            "count_threshold": 3,
            "is_system_rule": True,
            "priority": 8,
            "enabled": True,
        },
        {
            "name": "New Device Detected",
            "description": "Alert on new device for existing customer",
            "rule_type": RuleType.NEW_DEVICE,
            "risk_points": 15.0,
            "weight": 1.0,
            "is_system_rule": True,
            "priority": 7,
            "enabled": True,
        },
        {
            "name": "New Location Detected",
            "description": "Alert on new country for existing customer",
            "rule_type": RuleType.NEW_LOCATION,
            "risk_points": 15.0,
            "weight": 1.0,
            "is_system_rule": True,
            "priority": 6,
            "enabled": True,
        },
        {
            "name": "Shared IP Address",
            "description": "Alert when IP is used by multiple customers",
            "rule_type": RuleType.SHARED_IP,
            "risk_points": 10.0,
            "weight": 1.0,
            "is_system_rule": True,
            "priority": 5,
            "enabled": True,
        },
    ]

    for rule_data in default_rules:
        existing = db.query(Rule).filter_by(
            name=rule_data["name"],
            is_system_rule=True
        ).first()
        if not existing:
            new_rule = Rule(**rule_data)
            db.add(new_rule)

    db.commit()


def _clamp_score(value: float, low: float = 0.0, high: float = 100.0) -> float:
    """Clamp a value between low and high"""
    return max(low, min(high, value))


def evaluate_rule_against_transaction(
    db: Session,
    *,
    rule: Rule,
    customer: Customer,
    transaction_data: dict,
) -> RuleScore:
    """
    Evaluate a single rule against transaction data.
    
    Returns RuleScore with trigger status and points.
    """
    amount = transaction_data.get("amount", 0.0)
    device_id = transaction_data.get("device_id")
    ip_address = transaction_data.get("ip_address")
    country = transaction_data.get("country")
    occurred_at = transaction_data.get("occurred_at", datetime.utcnow())

    triggered = False
    reason = ""
    details = {}

    # AMOUNT_THRESHOLD rules
    if rule.rule_type == RuleType.AMOUNT_THRESHOLD:
        if rule.amount_threshold and amount >= rule.amount_threshold:
            triggered = True
            reason = f"Transaction amount ${amount:.2f} exceeds threshold ${rule.amount_threshold:.2f}"
            details = {"amount": amount, "threshold": rule.amount_threshold}

    # RAPID_TRANSACTIONS rule
    elif rule.rule_type == RuleType.RAPID_TRANSACTIONS:
        if rule.time_window_minutes and rule.count_threshold:
            window_start = occurred_at - timedelta(minutes=rule.time_window_minutes)
            recent_count = (
                db.query(Transaction)
                .filter(Transaction.customer_id == customer.id)
                .filter(Transaction.occurred_at >= window_start)
                .filter(Transaction.occurred_at <= occurred_at)
                .count()
            )
            if recent_count >= rule.count_threshold:
                triggered = True
                reason = f"{recent_count} transactions within {rule.time_window_minutes} minutes"
                details = {
                    "transaction_count": recent_count,
                    "threshold": rule.count_threshold,
                    "window_minutes": rule.time_window_minutes,
                }

    # NEW_DEVICE rule
    elif rule.rule_type == RuleType.NEW_DEVICE:
        if device_id and customer.total_transactions > 0:
            known_device = (
                db.query(Transaction)
                .filter(Transaction.customer_id == customer.id)
                .filter(Transaction.device_id == device_id)
                .first()
            )
            if known_device is None:
                triggered = True
                reason = f"New device detected: {device_id}"
                details = {"device_id": device_id, "is_new": True}

    # NEW_LOCATION rule
    elif rule.rule_type == RuleType.NEW_LOCATION:
        if country and customer.total_transactions > 0:
            known_location = (
                db.query(Transaction)
                .filter(Transaction.customer_id == customer.id)
                .filter(Transaction.country == country)
                .first()
            )
            if known_location is None:
                triggered = True
                reason = f"New location detected: {country}"
                details = {"country": country, "is_new": True}

    # SHARED_IP rule
    elif rule.rule_type == RuleType.SHARED_IP:
        if ip_address:
            shared_ip_customers = (
                db.query(Transaction.customer_id)
                .filter(Transaction.ip_address == ip_address)
                .filter(Transaction.customer_id != customer.id)
                .distinct()
                .count()
            )
            if shared_ip_customers > 0:
                triggered = True
                reason = f"IP address shared by {shared_ip_customers} other customers"
                details = {"ip_address": ip_address, "shared_customer_count": shared_ip_customers}

    # VELOCITY_CHECK - transactions per hour
    elif rule.rule_type == RuleType.VELOCITY_CHECK:
        if rule.velocity_threshold:
            window_start = occurred_at - timedelta(hours=1)
            velocity_count = (
                db.query(Transaction)
                .filter(Transaction.customer_id == customer.id)
                .filter(Transaction.occurred_at >= window_start)
                .filter(Transaction.occurred_at <= occurred_at)
                .count()
            )
            if velocity_count >= rule.velocity_threshold:
                triggered = True
                reason = f"{velocity_count} transactions in last hour exceeds threshold of {rule.velocity_threshold}"
                details = {
                    "transaction_count": velocity_count,
                    "threshold": rule.velocity_threshold,
                    "window": "1_hour",
                }

    risk_points = rule.risk_points if triggered else 0.0

    return RuleScore(
        rule_id=rule.id,
        rule_name=rule.name,
        triggered=triggered,
        risk_points=risk_points,
        reason=reason,
        details=details,
    )


def evaluate_all_rules(
    db: Session,
    *,
    customer: Customer,
    transaction_data: dict,
) -> RulesEvaluationResult:
    """
    Evaluate all enabled rules against a transaction.
    
    Returns aggregated score and list of triggered rules.
    """
    # Get all enabled rules, ordered by priority
    rules = (
        db.query(Rule)
        .filter(Rule.enabled == True)
        .order_by(Rule.priority.desc())
        .all()
    )

    triggered_rules: list[RuleScore] = []
    skipped_rules: list[RuleScore] = []
    total_score = 0.0

    for rule in rules:
        try:
            rule_score = evaluate_rule_against_transaction(
                db,
                rule=rule,
                customer=customer,
                transaction_data=transaction_data,
            )

            if rule_score.triggered:
                triggered_rules.append(rule_score)
                # Apply weight to risk points
                weighted_points = rule_score.risk_points * rule.weight
                total_score += weighted_points
            else:
                skipped_rules.append(rule_score)

        except Exception as e:
            # Log error but continue evaluating other rules
            print(f"Error evaluating rule {rule.id}: {str(e)}")
            continue

    # Clamp final score to 0-100 range
    total_score = _clamp_score(total_score)

    return RulesEvaluationResult(
        total_rules_score=total_score,
        triggered_rules=triggered_rules,
        skipped_rules=skipped_rules,
    )


def log_rule_evaluation(
    db: Session,
    *,
    rule_id: int,
    transaction_id: int,
    triggered: bool,
    risk_points: float,
    details: dict,
) -> RuleEvaluation:
    """Log a rule evaluation for audit trail"""
    evaluation = RuleEvaluation(
        rule_id=rule_id,
        transaction_id=transaction_id,
        triggered=triggered,
        risk_points_added=risk_points,
        evaluation_details=json.dumps(details) if details else None,
    )
    db.add(evaluation)
    db.commit()
    return evaluation


# CRUD Operations for Rules


def create_rule(
    db: Session,
    *,
    name: str,
    description: str | None,
    rule_type: RuleType,
    risk_points: float,
    weight: float = 1.0,
    priority: int = 0,
    enabled: bool = True,
    conditions: dict | None = None,
    amount_threshold: float | None = None,
    time_window_minutes: int | None = None,
    count_threshold: int | None = None,
    velocity_threshold: int | None = None,
    fields: dict | None = None,
    tags: list[str] | None = None,
    created_by_id: int | None = None,
) -> Rule:
    """Create a new rule"""
    rule = Rule(
        name=name,
        description=description,
        rule_type=rule_type,
        risk_points=_clamp_score(risk_points),
        weight=weight,
        priority=priority,
        enabled=enabled,
        conditions=json.dumps(conditions) if conditions else None,
        amount_threshold=amount_threshold,
        time_window_minutes=time_window_minutes,
        count_threshold=count_threshold,
        velocity_threshold=velocity_threshold,
        fields=json.dumps(fields) if fields else None,
        tags=json.dumps(tags) if tags else None,
        created_by_id=created_by_id,
        is_system_rule=False,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


def get_rule(db: Session, rule_id: int) -> Optional[Rule]:
    """Get a rule by ID"""
    return db.query(Rule).filter(Rule.id == rule_id).first()


def list_rules(
    db: Session,
    *,
    enabled_only: bool = False,
    rule_type: RuleType | None = None,
) -> list[Rule]:
    """List all rules with optional filters"""
    query = db.query(Rule)

    if enabled_only:
        query = query.filter(Rule.enabled == True)

    if rule_type:
        query = query.filter(Rule.rule_type == rule_type)

    return query.order_by(Rule.priority.desc()).all()


def update_rule(
    db: Session,
    rule_id: int,
    **kwargs,
) -> Optional[Rule]:
    """Update a rule"""
    rule = get_rule(db, rule_id)
    if not rule:
        return None

    # Prevent modification of system rules
    if rule.is_system_rule and "is_system_rule" not in kwargs:
        # Allow updates to some fields only for system rules
        allowed_fields = {"enabled", "priority", "risk_points", "weight"}
        kwargs = {k: v for k, v in kwargs.items() if k in allowed_fields}

    # Handle JSON fields
    if "conditions" in kwargs and isinstance(kwargs["conditions"], dict):
        kwargs["conditions"] = json.dumps(kwargs["conditions"])
    if "fields" in kwargs and isinstance(kwargs["fields"], dict):
        kwargs["fields"] = json.dumps(kwargs["fields"])
    if "tags" in kwargs and isinstance(kwargs["tags"], list):
        kwargs["tags"] = json.dumps(kwargs["tags"])

    for key, value in kwargs.items():
        if hasattr(rule, key):
            setattr(rule, key, value)

    db.commit()
    db.refresh(rule)
    return rule


def delete_rule(db: Session, rule_id: int) -> bool:
    """Delete a rule (not allowed for system rules)"""
    rule = get_rule(db, rule_id)
    if not rule or rule.is_system_rule:
        return False

    # Clean up related evaluations
    db.query(RuleEvaluation).filter(RuleEvaluation.rule_id == rule_id).delete()

    db.delete(rule)
    db.commit()
    return True


def toggle_rule(db: Session, rule_id: int, enabled: bool) -> Optional[Rule]:
    """Enable or disable a rule"""
    return update_rule(db, rule_id, enabled=enabled)
