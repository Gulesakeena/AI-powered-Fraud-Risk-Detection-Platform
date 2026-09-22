from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.alerts import Alert
from app.models.customers import Customer
from app.models.transactions import (
    RiskLevel,
    Transaction,
    TransactionOutcome,
    TransactionStatus,
)


def get_dashboard_stats(db: Session) -> dict:
    total_transactions = db.query(Transaction).count()

    high_risk = (
        db.query(Transaction)
        .filter(Transaction.risk_level == RiskLevel.HIGH)
        .count()
    )

    medium_risk = (
        db.query(Transaction)
        .filter(Transaction.risk_level == RiskLevel.MEDIUM)
        .count()
    )

    low_risk = (
        db.query(Transaction)
        .filter(Transaction.risk_level == RiskLevel.LOW)
        .count()
    )

    fraud_alerts = db.query(Alert).count()

    confirmed_fraud = (
        db.query(Transaction)
        .filter(Transaction.outcome == TransactionOutcome.CONFIRMED_FRAUD)
        .count()
    )

    false_positives = (
        db.query(Transaction)
        .filter(Transaction.outcome == TransactionOutcome.FALSE_POSITIVE)
        .count()
    )

    blocked = (
        db.query(Transaction)
        .filter(Transaction.status == TransactionStatus.BLOCKED)
        .count()
    )

    average_risk_score = (
        db.query(func.avg(Transaction.risk_score)).scalar() or 0.0
    )

    total_value = (
        db.query(func.sum(Transaction.amount)).scalar() or 0.0
    )

    return {
        "total_transactions": total_transactions,
        "high_risk_transactions": high_risk,
        "medium_risk_transactions": medium_risk,
        "low_risk_transactions": low_risk,
        "fraud_alerts": fraud_alerts,
        "confirmed_fraud": confirmed_fraud,
        "false_positives": false_positives,
        "average_risk_score": round(float(average_risk_score), 2),
        "total_transaction_value": round(float(total_value), 2),
        "blocked_transactions": blocked,
    }


def get_risk_trends(db: Session, days: int = 7) -> list[dict]:
    trends = []
    today = datetime.utcnow().date()

    for offset in range(days - 1, -1, -1):
        day = today - timedelta(days=offset)
        day_start = datetime.combine(day, datetime.min.time())
        day_end = day_start + timedelta(days=1)

        day_query = db.query(Transaction).filter(
            Transaction.occurred_at >= day_start,
            Transaction.occurred_at < day_end,
        )

        total = day_query.count()

        high_risk = day_query.filter(
            Transaction.risk_level == RiskLevel.HIGH
        ).count()

        confirmed_fraud = day_query.filter(
            Transaction.outcome == TransactionOutcome.CONFIRMED_FRAUD
        ).count()

        avg_score = (
            db.query(func.avg(Transaction.risk_score))
            .filter(
                Transaction.occurred_at >= day_start,
                Transaction.occurred_at < day_end,
            )
            .scalar()
            or 0.0
        )

        trends.append(
            {
                "label": day.strftime("%b %d"),
                "date": day.isoformat(),
                "total": total,
                "high_risk": high_risk,
                "confirmed_fraud": confirmed_fraud,
                "average_risk_score": round(float(avg_score), 2),
            }
        )

    return trends


def get_risk_distribution(db: Session) -> list[dict]:
    total_transactions = db.query(Transaction).count()
    buckets = []

    for level in (RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH):
        count = (
            db.query(Transaction)
            .filter(Transaction.risk_level == level)
            .count()
        )

        total_value = (
            db.query(func.sum(Transaction.amount))
            .filter(Transaction.risk_level == level)
            .scalar()
            or 0.0
        )

        percentage = (
            round((count / total_transactions) * 100, 2)
            if total_transactions
            else 0.0
        )

        buckets.append(
            {
                "risk_level": level.value,
                "count": count,
                "percentage": percentage,
                "total_value": round(float(total_value), 2),
            }
        )

    return buckets


def get_suspicious_customers(db: Session, limit: int = 5) -> list[dict]:
    customers = (
        db.query(Customer)
        .filter(Customer.suspicious_transactions > 0)
        .order_by(Customer.risk_score.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "identifier": customer.customer_ref,
            "label": customer.name,
            "transaction_count": customer.total_transactions,
            "risk_score": customer.risk_score,
        }
        for customer in customers
    ]


def get_suspicious_devices(db: Session, limit: int = 5) -> list[dict]:
    rows = (
        db.query(
            Transaction.device_id,
            func.count(Transaction.id).label("txn_count"),
            func.avg(Transaction.risk_score).label("avg_score"),
        )
        .filter(Transaction.device_id.isnot(None))
        .filter(Transaction.risk_level.in_([RiskLevel.MEDIUM, RiskLevel.HIGH]))
        .group_by(Transaction.device_id)
        .order_by(func.avg(Transaction.risk_score).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "identifier": row.device_id,
            "label": row.device_id,
            "transaction_count": row.txn_count,
            "risk_score": round(float(row.avg_score), 2),
        }
        for row in rows
    ]


def get_suspicious_ips(db: Session, limit: int = 5) -> list[dict]:
    rows = (
        db.query(
            Transaction.ip_address,
            func.count(Transaction.id).label("txn_count"),
            func.avg(Transaction.risk_score).label("avg_score"),
        )
        .filter(Transaction.ip_address.isnot(None))
        .filter(Transaction.risk_level.in_([RiskLevel.MEDIUM, RiskLevel.HIGH]))
        .group_by(Transaction.ip_address)
        .order_by(func.avg(Transaction.risk_score).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "identifier": row.ip_address,
            "label": row.ip_address,
            "transaction_count": row.txn_count,
            "risk_score": round(float(row.avg_score), 2),
        }
        for row in rows
    ]
