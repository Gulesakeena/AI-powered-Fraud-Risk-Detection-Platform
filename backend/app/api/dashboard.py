from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_permission
from app.models.security import User
from app.models.transactions import Transaction
from app.schemas.transactions import (
    DashboardOverviewResponse,
    DashboardStatsResponse,
    PaginatedTransactionsResponse,
    RiskDistributionBucket,
    RiskTrendPoint,
    SuspiciousEntityItem,
    TransactionResponse,
)
from app.services.dashboard import (
    get_dashboard_stats,
    get_risk_distribution,
    get_risk_trends,
    get_suspicious_customers,
    get_suspicious_devices,
    get_suspicious_ips,
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "/stats",
    response_model=DashboardOverviewResponse,
)
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("dashboard.read")),
):
    stats = get_dashboard_stats(db)

    return DashboardOverviewResponse(
        stats=DashboardStatsResponse(**stats),
        suspicious_customers=[
            SuspiciousEntityItem(**item)
            for item in get_suspicious_customers(db)
        ],
        suspicious_devices=[
            SuspiciousEntityItem(**item)
            for item in get_suspicious_devices(db)
        ],
        suspicious_ips=[
            SuspiciousEntityItem(**item)
            for item in get_suspicious_ips(db)
        ],
    )


@router.get(
    "/transactions",
    response_model=PaginatedTransactionsResponse,
)
def dashboard_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("dashboard.read")),
    limit: int = Query(default=20, ge=1, le=100),
):
    items = (
        db.query(Transaction)
        .order_by(Transaction.created_at.desc())
        .limit(limit)
        .all()
    )

    total = db.query(Transaction).count()

    return PaginatedTransactionsResponse(
        items=[TransactionResponse.from_model(item) for item in items],
        total=total,
        page=1,
        page_size=limit,
        total_pages=1,
    )


@router.get(
    "/risk-trends",
    response_model=list[RiskTrendPoint],
)
def dashboard_risk_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("dashboard.read")),
    days: int = Query(default=7, ge=1, le=90),
):
    return [
        RiskTrendPoint(**point)
        for point in get_risk_trends(db, days=days)
    ]


@router.get(
    "/risk-distribution",
    response_model=list[RiskDistributionBucket],
)
def dashboard_risk_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("dashboard.read")),
):
    return [
        RiskDistributionBucket(**bucket)
        for bucket in get_risk_distribution(db)
    ]
