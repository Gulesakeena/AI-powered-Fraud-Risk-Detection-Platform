"""Schemas for Rules Engine and Risk Explanations"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.rules import ConditionOperator, RuleType


# ===== RULES SCHEMAS =====


class RuleCreate(BaseModel):
    """Schema for creating a new rule"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    rule_type: RuleType
    risk_points: float = Field(..., ge=0, le=100)
    weight: float = Field(default=1.0, ge=0.1, le=10.0)
    priority: int = Field(default=0, ge=0)
    enabled: bool = Field(default=True)
    
    # Thresholds
    amount_threshold: Optional[float] = None
    time_window_minutes: Optional[int] = None
    count_threshold: Optional[int] = None
    velocity_threshold: Optional[int] = None
    
    # Advanced
    conditions: Optional[dict] = None
    fields: Optional[dict] = None
    tags: Optional[list[str]] = None


class RuleUpdate(BaseModel):
    """Schema for updating a rule"""
    name: Optional[str] = None
    description: Optional[str] = None
    risk_points: Optional[float] = Field(None, ge=0, le=100)
    weight: Optional[float] = Field(None, ge=0.1, le=10.0)
    priority: Optional[int] = Field(None, ge=0)
    enabled: Optional[bool] = None
    
    amount_threshold: Optional[float] = None
    time_window_minutes: Optional[int] = None
    count_threshold: Optional[int] = None
    velocity_threshold: Optional[int] = None
    
    conditions: Optional[dict] = None
    fields: Optional[dict] = None
    tags: Optional[list[str]] = None


class RuleResponse(BaseModel):
    """Schema for rule response"""
    id: int
    name: str
    description: Optional[str]
    rule_type: RuleType
    risk_points: float
    weight: float
    priority: int
    enabled: bool
    is_system_rule: bool
    
    # Configuration
    amount_threshold: Optional[float]
    time_window_minutes: Optional[int]
    count_threshold: Optional[int]
    velocity_threshold: Optional[int]
    
    # Metadata
    created_at: datetime
    updated_at: datetime
    tags: Optional[list[str]]

    class Config:
        from_attributes = True


class RuleListResponse(BaseModel):
    """Paginated list of rules"""
    items: list[RuleResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class RuleToggleRequest(BaseModel):
    """Request to toggle rule enable/disable"""
    enabled: bool


# ===== RISK EXPLANATION SCHEMAS =====


class RiskScoreBreakdown(BaseModel):
    """Breakdown of risk score components"""
    final: float = Field(..., ge=0, le=100)
    level: str  # LOW, MEDIUM, HIGH
    breakdown: dict = Field(
        ...,
        description="Component scores: ml_model, rules_engine, customer_behavior"
    )


class RiskReasonResponse(BaseModel):
    """Individual risk reason"""
    reason: str
    category: str  # "ml_model", "rules_engine", "behavior"
    severity: str = "medium"  # low, medium, high


class RiskExplanationResponse(BaseModel):
    """Complete risk explanation for a transaction"""
    transaction_id: int
    risk_score: RiskScoreBreakdown
    summary: str
    reasons: list[str]
    factors: dict = Field(
        ...,
        description="Risk factors by category: ml_model, rules_engine, customer_behavior"
    )
    triggered_rules: list[int] = Field(
        default_factory=list,
        description="IDs of rules that triggered"
    )
    recommendation: str  # APPROVE, REVIEW, BLOCK
    generated_at: Optional[datetime] = None


class RiskExplanationDetailedResponse(RiskExplanationResponse):
    """Detailed explanation with additional audit information"""
    score_components: dict = Field(
        ...,
        description="Weighted contribution of each component"
    )
    triggering_factors: list[str]
    rule_ids_triggered: list[int]
    assessment_timestamp: Optional[datetime] = None
    assessment_notes: str


# ===== RULE EVALUATION SCHEMAS =====


class RuleEvaluationResult(BaseModel):
    """Result of evaluating a single rule"""
    rule_id: int
    rule_name: str
    triggered: bool
    risk_points: float
    reason: str
    details: dict = Field(default_factory=dict)


class RulesEvaluationSummary(BaseModel):
    """Summary of rules evaluation for a transaction"""
    total_rules_evaluated: int
    rules_triggered: int
    total_rules_score: float
    triggered_rules: list[RuleEvaluationResult]
    skipped_rules: list[RuleEvaluationResult]
