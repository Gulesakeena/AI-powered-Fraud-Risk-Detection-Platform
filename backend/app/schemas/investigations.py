#schemas/investigations.py
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.investigations import InvestigationOutcome, InvestigationStatus


class InvestigationCreate(BaseModel):
    customer_id: int
    transaction_id: int | None = None
    alert_id: int | None = None
    title: str
    summary: str | None = None


class InvestigationUpdate(BaseModel):
    status: InvestigationStatus | None = None
    outcome: InvestigationOutcome | None = None
    findings: str | None = None


class InvestigationAssignRequest(BaseModel):
    user_id: int


class InvestigationNoteCreate(BaseModel):
    note: str


class InvestigationNoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    author_id: int | None
    note: str
    created_at: datetime


class InvestigationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    transaction_id: int | None
    alert_id: int | None
    title: str
    status: InvestigationStatus
    outcome: InvestigationOutcome
    summary: str | None
    findings: str | None
    assigned_to_id: int | None
    created_by_id: int | None
    created_at: datetime
    updated_at: datetime
    closed_at: datetime | None


class DeviceUsage(BaseModel):
    device_id: str
    shared_with_other_customers: int


class IpUsage(BaseModel):
    ip_address: str
    shared_with_other_customers: int


class LocationUsage(BaseModel):
    country: str | None
    city: str | None
    transaction_count: int


class InvestigationTransactionSummary(BaseModel):
    id: int
    transaction_ref: str
    amount: float
    risk_score: float
    risk_level: str
    decision: str
    occurred_at: datetime


class InvestigationAlertSummary(BaseModel):
    id: int
    severity: str
    status: str
    reason: str | None
    created_at: datetime


class InvestigationDetailResponse(InvestigationResponse):
    customer_ref: str
    customer_name: str
    customer_risk_score: float
    customer_risk_level: str

    notes: list[InvestigationNoteResponse]
    related_transactions: list[InvestigationTransactionSummary]
    related_alerts: list[InvestigationAlertSummary]
    devices: list[DeviceUsage]
    ip_addresses: list[IpUsage]
    locations: list[LocationUsage]
    risk_factors: list[str]
    fraud_pattern_reasons: list[str]


class PaginatedInvestigationsResponse(BaseModel):
    items: list[InvestigationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int