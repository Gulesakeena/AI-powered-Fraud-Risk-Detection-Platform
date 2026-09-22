import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    Float,
    Integer,
    String,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class CustomerRiskLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class CustomerStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    FLAGGED = "FLAGGED"
    SUSPENDED = "SUSPENDED"


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)

    customer_ref = Column(
        String(64),
        unique=True,
        nullable=False,
        index=True,
    )

    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(32), nullable=True)

    status = Column(
        Enum(CustomerStatus),
        default=CustomerStatus.ACTIVE,
        nullable=False,
    )

    risk_score = Column(Float, default=0.0, nullable=False)

    risk_level = Column(
        Enum(CustomerRiskLevel),
        default=CustomerRiskLevel.LOW,
        nullable=False,
    )

    total_transactions = Column(Integer, default=0, nullable=False)
    suspicious_transactions = Column(Integer, default=0, nullable=False)
    total_spending = Column(Float, default=0.0, nullable=False)

    confirmed_fraud_count = Column(Integer, default=0, nullable=False)
    false_positive_count = Column(Integer, default=0, nullable=False)

    account_opened_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    last_active_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    transactions = relationship(
        "Transaction",
        back_populates="customer",
        cascade="all, delete-orphan",
    )

    alerts = relationship(
        "Alert",
        back_populates="customer",
    )
