from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.customers import CustomerRiskLevel, CustomerStatus
from app.models.transactions import (
    RiskDecision,
    RiskLevel,
    TransactionOutcome,
    TransactionSource,
    TransactionStatus,
)


class CustomerInput(BaseModel):
    customer_ref: str
    name: str
    email: str | None = None
    phone: str | None = None


class TransactionCreate(BaseModel):
    transaction_ref: str | None = None
    customer: CustomerInput

    amount: float = Field(gt=0)
    currency: str = "USD"

    merchant: str | None = None
    merchant_category: str | None = None

    payment_method_type: str | None = None
    payment_method_last4: str | None = None

    device_id: str | None = None
    device_type: str | None = None
    device_os: str | None = None
    device_browser: str | None = None

    ip_address: str | None = None
    is_vpn: bool = False

    city: str | None = None
    country: str | None = None
    country_code: str | None = None

    description: str | None = None
    occurred_at: datetime | None = None


class RiskCheckRequest(TransactionCreate):
    pass


class CustomerSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_ref: str
    name: str
    email: str | None
    status: CustomerStatus
    risk_score: float
    risk_level: CustomerRiskLevel
    total_transactions: int
    suspicious_transactions: int


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    transaction_ref: str
    customer_id: int
    amount: float
    currency: str
    merchant: str | None
    merchant_category: str | None
    payment_method_type: str | None
    payment_method_last4: str | None
    device_id: str | None
    device_type: str | None
    ip_address: str | None
    is_vpn: bool
    city: str | None
    country: str | None
    risk_score: float
    risk_level: RiskLevel
    decision: RiskDecision
    risk_factors: list[str]
    status: TransactionStatus
    outcome: TransactionOutcome
    source: TransactionSource
    occurred_at: datetime
    created_at: datetime

    @classmethod
    def from_model(cls, transaction):
        import json

        data = {
            column.name: getattr(transaction, column.name)
            for column in transaction.__table__.columns
        }

        raw_factors = data.get("risk_factors")

        data["risk_factors"] = (
            json.loads(raw_factors) if raw_factors else []
        )

        return cls(**data)


class TransactionDetailResponse(TransactionResponse):
    customer: CustomerSummaryResponse


class PaginatedTransactionsResponse(BaseModel):
    items: list[TransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class RiskCheckResponse(BaseModel):
    risk_score: float
    risk_level: RiskLevel
    decision: RiskDecision
    risk_factors: list[str]


class TransactionRiskResponse(BaseModel):
    transaction_id: int
    transaction_ref: str
    risk_score: float
    risk_level: RiskLevel
    decision: RiskDecision
    risk_factors: list[str]
    outcome: TransactionOutcome


class TransactionUpdate(BaseModel):
    status: TransactionStatus | None = None
    outcome: TransactionOutcome | None = None
    description: str | None = None


class CSVImportRowError(BaseModel):
    row_number: int
    reason: str


class CSVImportResponse(BaseModel):
    job_id: int
    status: str
    total_rows: int
    processed_rows: int
    inserted_rows: int
    duplicate_rows: int
    error_rows: int
    errors: list[CSVImportRowError]
    async_processing: bool


class DashboardStatsResponse(BaseModel):
    total_transactions: int
    high_risk_transactions: int
    medium_risk_transactions: int
    low_risk_transactions: int
    fraud_alerts: int
    confirmed_fraud: int
    false_positives: int
    average_risk_score: float
    total_transaction_value: float
    blocked_transactions: int


class RiskTrendPoint(BaseModel):
    label: str
    date: str
    total: int
    high_risk: int
    confirmed_fraud: int
    average_risk_score: float


class RiskDistributionBucket(BaseModel):
    risk_level: str
    count: int
    percentage: float
    total_value: float


class SuspiciousEntityItem(BaseModel):
    identifier: str
    label: str
    transaction_count: int
    risk_score: float


class DashboardOverviewResponse(BaseModel):
    stats: DashboardStatsResponse
    suspicious_customers: list[SuspiciousEntityItem]
    suspicious_devices: list[SuspiciousEntityItem]
    suspicious_ips: list[SuspiciousEntityItem]


class ReportRiskStatistics(BaseModel):
    total_transactions: int
    total_value: float
    average_risk_score: float
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    confirmed_fraud_count: int
    false_positive_count: int
    fraud_loss_estimate: float


class ReportPeriodRow(BaseModel):
    period: str
    total_transactions: int
    high_risk_transactions: int
    confirmed_fraud: int
    false_positives: int
    total_value: float


class FraudTrendRow(BaseModel):
    period: str
    total_transactions: int
    confirmed_fraud: int
    false_positives: int
    fraud_rate: float
    total_value: float
