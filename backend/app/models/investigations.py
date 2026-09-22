#models/investigations.py
import enum
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class InvestigationStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    ESCALATED = "ESCALATED"
    CLOSED = "CLOSED"


class InvestigationOutcome(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED_FRAUD = "CONFIRMED_FRAUD"
    FALSE_POSITIVE = "FALSE_POSITIVE"
    INCONCLUSIVE = "INCONCLUSIVE"


class Investigation(Base):
    """
    An investigation case opened against a customer, usually triggered by an
    Alert or a specific high-risk Transaction. Aggregates everything an
    analyst needs: transaction history, related alerts, shared devices/IPs,
    locations, and risk factors (see services.investigations for the
    aggregation logic).
    """
    __tablename__ = "investigations"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(
        Integer,
        ForeignKey("customers.id"),
        nullable=False,
        index=True,
    )

    transaction_id = Column(
        Integer,
        ForeignKey("transactions.id"),
        nullable=True,
        index=True,
    )

    alert_id = Column(
        Integer,
        ForeignKey("alerts.id"),
        nullable=True,
        index=True,
    )

    title = Column(String(255), nullable=False)

    status = Column(
        Enum(InvestigationStatus),
        default=InvestigationStatus.OPEN,
        nullable=False,
        index=True,
    )

    outcome = Column(
        Enum(InvestigationOutcome),
        default=InvestigationOutcome.PENDING,
        nullable=False,
        index=True,
    )

    summary = Column(Text, nullable=True)
    findings = Column(Text, nullable=True)

    assigned_to_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    created_by_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
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

    closed_at = Column(DateTime, nullable=True)

    customer = relationship("Customer")
    transaction = relationship("Transaction")
    alert = relationship("Alert")

    notes = relationship(
        "InvestigationNote",
        back_populates="investigation",
        cascade="all, delete-orphan",
        order_by="InvestigationNote.created_at",
    )


class InvestigationNote(Base):
    """A single note/history entry on an investigation, authored by an analyst."""
    __tablename__ = "investigation_notes"

    id = Column(Integer, primary_key=True, index=True)

    investigation_id = Column(
        Integer,
        ForeignKey("investigations.id"),
        nullable=False,
        index=True,
    )

    author_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    note = Column(Text, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )

    investigation = relationship("Investigation", back_populates="notes")