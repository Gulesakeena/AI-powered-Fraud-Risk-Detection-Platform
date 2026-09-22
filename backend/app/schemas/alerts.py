#schemas/alerts.py
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.alerts import AlertSeverity, AlertStatus


class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    transaction_id: int
    customer_id: int
    severity: AlertSeverity
    reason: str | None
    risk_score: float
    status: AlertStatus
    assigned_to_id: int | None
    created_at: datetime
    updated_at: datetime


class AlertDetailResponse(AlertResponse):
    transaction_ref: str | None = None
    customer_ref: str | None = None
    customer_name: str | None = None


class PaginatedAlertsResponse(BaseModel):
    items: list[AlertResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class AlertReviewRequest(BaseModel):
    status: AlertStatus
    notes: str | None = None


class AlertAssignRequest(BaseModel):
    user_id: int