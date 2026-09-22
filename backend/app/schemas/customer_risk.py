#schemas/customer_risk.py
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.customers import CustomerRiskLevel, CustomerStatus


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


class FraudHistoryEntry(BaseModel):
    source: str  # "ALERT" or "INVESTIGATION"
    id: int
    outcome: str
    date: datetime


class CustomerRiskProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    customer_id: int
    customer_ref: str
    name: str
    status: CustomerStatus

    risk_score: float
    risk_level: CustomerRiskLevel

    total_transactions: int
    suspicious_transactions: int
    total_spending: float

    confirmed_fraud_count: int
    false_positive_count: int

    account_opened_at: datetime
    last_active_at: datetime

    devices_used: list[DeviceUsage]
    ip_addresses_used: list[IpUsage]
    locations_used: list[LocationUsage]
    fraud_history: list[FraudHistoryEntry]