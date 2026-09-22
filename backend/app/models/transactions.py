import enum
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class TransactionStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    BLOCKED = "BLOCKED"
    REVIEWING = "REVIEWING"


class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class RiskDecision(str, enum.Enum):
    APPROVE = "APPROVE"
    REVIEW = "REVIEW"
    BLOCK = "BLOCK"


class TransactionOutcome(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED_FRAUD = "CONFIRMED_FRAUD"
    FALSE_POSITIVE = "FALSE_POSITIVE"
    RESOLVED = "RESOLVED"


class TransactionSource(str, enum.Enum):
    MANUAL = "MANUAL"
    API = "API"
    CSV_IMPORT = "CSV_IMPORT"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    transaction_ref = Column(
        String(64),
        unique=True,
        nullable=False,
        index=True,
    )

    customer_id = Column(
        Integer,
        ForeignKey("customers.id"),
        nullable=False,
        index=True,
    )

    amount = Column(Float, nullable=False)
    currency = Column(String(8), default="USD", nullable=False)

    merchant = Column(String(255), nullable=True)
    merchant_category = Column(String(100), nullable=True)

    payment_method_type = Column(String(50), nullable=True)
    payment_method_last4 = Column(String(8), nullable=True)

    device_id = Column(String(100), nullable=True, index=True)
    device_type = Column(String(50), nullable=True)
    device_os = Column(String(100), nullable=True)
    device_browser = Column(String(100), nullable=True)

    ip_address = Column(String(45), nullable=True, index=True)
    is_vpn = Column(Boolean, default=False, nullable=False)

    city = Column(String(120), nullable=True)
    country = Column(String(120), nullable=True)
    country_code = Column(String(8), nullable=True)

    risk_score = Column(Float, default=0.0, nullable=False)

    risk_level = Column(
        Enum(RiskLevel),
        default=RiskLevel.LOW,
        nullable=False,
        index=True,
    )

    decision = Column(
        Enum(RiskDecision),
        default=RiskDecision.APPROVE,
        nullable=False,
        index=True,
    )

    risk_factors = Column(Text, nullable=True)

    status = Column(
        Enum(TransactionStatus),
        default=TransactionStatus.COMPLETED,
        nullable=False,
        index=True,
    )

    outcome = Column(
        Enum(TransactionOutcome),
        default=TransactionOutcome.PENDING,
        nullable=False,
        index=True,
    )

    source = Column(
        Enum(TransactionSource),
        default=TransactionSource.MANUAL,
        nullable=False,
    )

    description = Column(Text, nullable=True)

    created_by_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    occurred_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    customer = relationship(
        "Customer",
        back_populates="transactions",
    )

    alerts = relationship(
        "Alert",
        back_populates="transaction",
        cascade="all, delete-orphan",
    )
