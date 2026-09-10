from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.customers import Customer
from app.models.transactions import (
    RiskLevel,
    Transaction,
    TransactionOutcome,
)


def get_daily_fraud_activity(db: Session, days: int = 30) -> list[dict]:
    today = datetime.utcnow().date()
    rows = []

    for offset in range(days - 1, -1, -1):
        day = today - timedelta(days=offset)
        day_start = datetime.combine(day, datetime.min.time())
        day_end = day_start + timedelta(days=1)

        base_query = db.query(Transaction).filter(
            Transaction.occurred_at >= day_start,
            Transaction.occurred_at < day_end,
        )

        total = base_query.count()

        high_risk = base_query.filter(
            Transaction.risk_level == RiskLevel.HIGH
        ).count()

        confirmed_fraud = base_query.filter(
            Transaction.outcome == TransactionOutcome.CONFIRMED_FRAUD
        ).count()

        false_positives = base_query.filter(
            Transaction.outcome == TransactionOutcome.FALSE_POSITIVE
        ).count()

        total_value = (
            db.query(func.sum(Transaction.amount))
            .filter(
                Transaction.occurred_at >= day_start,
                Transaction.occurred_at < day_end,
            )
            .scalar()
            or 0.0
        )

        rows.append(
            {
                "period": day.isoformat(),
                "total_transactions": total,
                "high_risk_transactions": high_risk,
                "confirmed_fraud": confirmed_fraud,
                "false_positives": false_positives,
                "total_value": round(float(total_value), 2),
            }
        )

    return rows


def get_monthly_fraud_activity(db: Session, months: int = 12) -> list[dict]:
    rows = []
    today = datetime.utcnow().date().replace(day=1)

    for offset in range(months - 1, -1, -1):
        month_start_year = today.year
        month_start_month = today.month - offset

        while month_start_month <= 0:
            month_start_month += 12
            month_start_year -= 1

        month_start = datetime(month_start_year, month_start_month, 1)

        if month_start_month == 12:
            month_end = datetime(month_start_year + 1, 1, 1)
        else:
            month_end = datetime(month_start_year, month_start_month + 1, 1)

        base_query = db.query(Transaction).filter(
            Transaction.occurred_at >= month_start,
            Transaction.occurred_at < month_end,
        )

        total = base_query.count()

        high_risk = base_query.filter(
            Transaction.risk_level == RiskLevel.HIGH
        ).count()

        confirmed_fraud = base_query.filter(
            Transaction.outcome == TransactionOutcome.CONFIRMED_FRAUD
        ).count()

        false_positives = base_query.filter(
            Transaction.outcome == TransactionOutcome.FALSE_POSITIVE
        ).count()

        total_value = (
            db.query(func.sum(Transaction.amount))
            .filter(
                Transaction.occurred_at >= month_start,
                Transaction.occurred_at < month_end,
            )
            .scalar()
            or 0.0
        )

        rows.append(
            {
                "period": month_start.strftime("%Y-%m"),
                "total_transactions": total,
                "high_risk_transactions": high_risk,
                "confirmed_fraud": confirmed_fraud,
                "false_positives": false_positives,
                "total_value": round(float(total_value), 2),
            }
        )

    return rows


def get_fraud_trends(
    db: Session,
    granularity: str = "daily",
    periods: int = 30,
) -> list[dict]:
    if granularity == "monthly":
        base_rows = get_monthly_fraud_activity(db, months=periods)
    else:
        base_rows = get_daily_fraud_activity(db, days=periods)

    trends = []

    for row in base_rows:
        total = row["total_transactions"]
        confirmed_fraud = row["confirmed_fraud"]
        fraud_rate = round((confirmed_fraud / total) * 100, 2) if total else 0.0

        trends.append(
            {
                "period": row["period"],
                "total_transactions": total,
                "confirmed_fraud": confirmed_fraud,
                "false_positives": row["false_positives"],
                "fraud_rate": fraud_rate,
                "total_value": row["total_value"],
            }
        )

    return trends


def get_high_risk_transactions(db: Session, limit: int = 100) -> list[Transaction]:
    return (
        db.query(Transaction)
        .filter(Transaction.risk_level == RiskLevel.HIGH)
        .order_by(Transaction.risk_score.desc())
        .limit(limit)
        .all()
    )


def get_high_risk_customers(db: Session, limit: int = 100) -> list[Customer]:
    return (
        db.query(Customer)
        .order_by(Customer.risk_score.desc())
        .limit(limit)
        .all()
    )


def get_confirmed_fraud_transactions(db: Session, limit: int = 200) -> list[Transaction]:
    return (
        db.query(Transaction)
        .filter(Transaction.outcome == TransactionOutcome.CONFIRMED_FRAUD)
        .order_by(Transaction.occurred_at.desc())
        .limit(limit)
        .all()
    )


def get_false_positive_transactions(db: Session, limit: int = 200) -> list[Transaction]:
    return (
        db.query(Transaction)
        .filter(Transaction.outcome == TransactionOutcome.FALSE_POSITIVE)
        .order_by(Transaction.occurred_at.desc())
        .limit(limit)
        .all()
    )


def get_risk_statistics(db: Session) -> dict:
    total_transactions = db.query(Transaction).count()

    total_value = (
        db.query(func.sum(Transaction.amount)).scalar() or 0.0
    )

    average_score = (
        db.query(func.avg(Transaction.risk_score)).scalar() or 0.0
    )

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

    confirmed_fraud = (
        db.query(Transaction)
        .filter(Transaction.outcome == TransactionOutcome.CONFIRMED_FRAUD)
        .count()
    )

    false_positive = (
        db.query(Transaction)
        .filter(Transaction.outcome == TransactionOutcome.FALSE_POSITIVE)
        .count()
    )

    fraud_loss_estimate = (
        db.query(func.sum(Transaction.amount))
        .filter(Transaction.outcome == TransactionOutcome.CONFIRMED_FRAUD)
        .scalar()
        or 0.0
    )

    return {
        "total_transactions": total_transactions,
        "total_value": round(float(total_value), 2),
        "average_risk_score": round(float(average_score), 2),
        "high_risk_count": high_risk,
        "medium_risk_count": medium_risk,
        "low_risk_count": low_risk,
        "confirmed_fraud_count": confirmed_fraud,
        "false_positive_count": false_positive,
        "fraud_loss_estimate": round(float(fraud_loss_estimate), 2),
    }
