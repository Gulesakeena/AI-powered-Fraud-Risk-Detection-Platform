from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_permission
from app.models.security import User
from app.schemas.transactions import (
    CustomerSummaryResponse,
    FraudTrendRow,
    ReportPeriodRow,
    ReportRiskStatistics,
    TransactionResponse,
)
from app.services.export import export_to_csv, export_to_excel, export_to_pdf
from app.services.reports import (
    get_confirmed_fraud_transactions,
    get_daily_fraud_activity,
    get_false_positive_transactions,
    get_fraud_trends,
    get_high_risk_customers,
    get_high_risk_transactions,
    get_monthly_fraud_activity,
    get_risk_statistics,
)


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


TRANSACTION_EXPORT_COLUMNS = [
    "transaction_ref",
    "amount",
    "currency",
    "merchant",
    "risk_score",
    "risk_level",
    "decision",
    "status",
    "outcome",
    "occurred_at",
]

CUSTOMER_EXPORT_COLUMNS = [
    "customer_ref",
    "name",
    "email",
    "risk_score",
    "risk_level",
    "total_transactions",
    "suspicious_transactions",
    "confirmed_fraud_count",
    "false_positive_count",
]

FRAUD_TREND_EXPORT_COLUMNS = [
    "period",
    "total_transactions",
    "confirmed_fraud",
    "false_positives",
    "fraud_rate",
    "total_value",
]


@router.get(
    "/daily-fraud-activity",
    response_model=list[ReportPeriodRow],
)
def daily_fraud_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("reports.read")),
    days: int = Query(default=30, ge=1, le=365),
):
    return [
        ReportPeriodRow(**row)
        for row in get_daily_fraud_activity(db, days=days)
    ]


@router.get(
    "/monthly-fraud-activity",
    response_model=list[ReportPeriodRow],
)
def monthly_fraud_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("reports.read")),
    months: int = Query(default=12, ge=1, le=36),
):
    return [
        ReportPeriodRow(**row)
        for row in get_monthly_fraud_activity(db, months=months)
    ]


@router.get(
    "/fraud-trends",
    response_model=list[FraudTrendRow],
)
def fraud_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("reports.read")),
    granularity: str = Query(default="daily", pattern="^(daily|monthly)$"),
    periods: int = Query(default=30, ge=1, le=365),
):
    return [
        FraudTrendRow(**row)
        for row in get_fraud_trends(db, granularity=granularity, periods=periods)
    ]


@router.get(
    "/high-risk-transactions",
    response_model=list[TransactionResponse],
)
def high_risk_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("reports.read")),
    limit: int = Query(default=100, ge=1, le=500),
):
    transactions = get_high_risk_transactions(db, limit=limit)
    return [TransactionResponse.from_model(item) for item in transactions]


@router.get(
    "/high-risk-customers",
    response_model=list[CustomerSummaryResponse],
)
def high_risk_customers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("reports.read")),
    limit: int = Query(default=100, ge=1, le=500),
):
    return get_high_risk_customers(db, limit=limit)


@router.get(
    "/confirmed-fraud",
    response_model=list[TransactionResponse],
)
def confirmed_fraud(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("reports.read")),
    limit: int = Query(default=200, ge=1, le=1000),
):
    transactions = get_confirmed_fraud_transactions(db, limit=limit)
    return [TransactionResponse.from_model(item) for item in transactions]


@router.get(
    "/false-positives",
    response_model=list[TransactionResponse],
)
def false_positives(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("reports.read")),
    limit: int = Query(default=200, ge=1, le=1000),
):
    transactions = get_false_positive_transactions(db, limit=limit)
    return [TransactionResponse.from_model(item) for item in transactions]


@router.get(
    "/risk-statistics",
    response_model=ReportRiskStatistics,
)
def risk_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("reports.read")),
):
    return ReportRiskStatistics(**get_risk_statistics(db))


@router.get("/export")
def export_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("reports.export")),
    report: str = Query(...),
    format: str = Query(..., pattern="^(csv|excel|pdf)$"),
    limit: int = Query(default=500, ge=1, le=2000),
    granularity: str = Query(default="daily", pattern="^(daily|monthly)$"),
):
    if report == "fraud-trends":
        periods = min(limit, 365 if granularity == "daily" else 36)
        rows = get_fraud_trends(db, granularity=granularity, periods=periods)
        columns = FRAUD_TREND_EXPORT_COLUMNS
        filename_base = "fraud_trends"

    elif report == "high-risk-transactions":
        rows = [
            TransactionResponse.from_model(item).model_dump()
            for item in get_high_risk_transactions(db, limit=limit)
        ]
        columns = TRANSACTION_EXPORT_COLUMNS
        filename_base = "high_risk_transactions"

    elif report == "confirmed-fraud":
        rows = [
            TransactionResponse.from_model(item).model_dump()
            for item in get_confirmed_fraud_transactions(db, limit=limit)
        ]
        columns = TRANSACTION_EXPORT_COLUMNS
        filename_base = "confirmed_fraud"

    elif report == "false-positives":
        rows = [
            TransactionResponse.from_model(item).model_dump()
            for item in get_false_positive_transactions(db, limit=limit)
        ]
        columns = TRANSACTION_EXPORT_COLUMNS
        filename_base = "false_positives"

    elif report == "high-risk-customers":
        rows = [
            CustomerSummaryResponse.model_validate(item).model_dump()
            for item in get_high_risk_customers(db, limit=limit)
        ]
        columns = CUSTOMER_EXPORT_COLUMNS
        filename_base = "high_risk_customers"

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unknown report type.",
        )

    if format == "csv":
        content = export_to_csv(rows, columns)
        media_type = "text/csv"
        extension = "csv"
    elif format == "excel":
        content = export_to_excel(rows, columns, sheet_name=filename_base)
        media_type = (
            "application/vnd.openxmlformats-officedocument"
            ".spreadsheetml.sheet"
        )
        extension = "xlsx"
    else:
        content = export_to_pdf(rows, columns, title=filename_base)
        media_type = "application/pdf"
        extension = "pdf"

    filename = f"{filename_base}.{extension}"

    return Response(
        content=content,
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )
