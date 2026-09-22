"""API endpoints for Rules Engine and Risk Explanations"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_permission
from app.models.rules import Rule, RuleType
from app.models.security import User
from app.models.transactions import Transaction
from app.schemas.rules import (
    RuleCreate,
    RuleListResponse,
    RuleResponse,
    RuleToggleRequest,
    RuleUpdate,
    RiskExplanationDetailedResponse,
    RiskExplanationResponse,
    RulesEvaluationSummary,
)
from app.services.risk_explanation import (
    format_explanation_for_report,
    generate_risk_explanation,
    get_explanation_for_display,
    get_risk_explanation,
)
from app.services.rules_engine import (
    create_rule,
    delete_rule,
    get_or_create_default_rules,
    get_rule,
    list_rules,
    toggle_rule,
    update_rule,
)

# ===== RULES MANAGEMENT ENDPOINTS =====

rules_router = APIRouter(
    prefix="/rules",
    tags=["Rules Engine"],
)


@rules_router.post(
    "",
    response_model=RuleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_rule(
    data: RuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("rules.create")),
):
    """Create a new fraud detection rule"""
    try:
        rule = create_rule(
            db,
            name=data.name,
            description=data.description,
            rule_type=data.rule_type,
            risk_points=data.risk_points,
            weight=data.weight,
            priority=data.priority,
            enabled=data.enabled,
            conditions=data.conditions,
            amount_threshold=data.amount_threshold,
            time_window_minutes=data.time_window_minutes,
            count_threshold=data.count_threshold,
            velocity_threshold=data.velocity_threshold,
            fields=data.fields,
            tags=data.tags,
            created_by_id=current_user.id,
        )
        return RuleResponse.from_orm(rule)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create rule: {str(exc)}",
        )


@rules_router.get(
    "",
    response_model=RuleListResponse,
)
def list_all_rules(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("rules.read")),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    rule_type: RuleType | None = Query(default=None),
    enabled_only: bool = Query(default=False),
):
    """List all fraud detection rules with pagination"""
    rules = list_rules(
        db,
        enabled_only=enabled_only,
        rule_type=rule_type,
    )

    total = len(rules)
    start = (page - 1) * page_size
    end = start + page_size

    items = rules[start:end]
    total_pages = (total + page_size - 1) // page_size if total else 0

    return RuleListResponse(
        items=[RuleResponse.from_orm(rule) for rule in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@rules_router.get(
    "/{rule_id}",
    response_model=RuleResponse,
)
def get_rule_details(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("rules.read")),
):
    """Get details of a specific rule"""
    rule = get_rule(db, rule_id)
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rule not found",
        )
    return RuleResponse.from_orm(rule)


@rules_router.put(
    "/{rule_id}",
    response_model=RuleResponse,
)
def update_rule_details(
    rule_id: int,
    data: RuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("rules.update")),
):
    """Update a fraud detection rule"""
    # Check if rule is system rule
    rule = get_rule(db, rule_id)
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rule not found",
        )

    if rule.is_system_rule:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="System rules cannot be fully modified. Use toggle endpoint to enable/disable.",
        )

    try:
        updated_rule = update_rule(
            db,
            rule_id,
            **data.dict(exclude_unset=True),
        )
        return RuleResponse.from_orm(updated_rule)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update rule: {str(exc)}",
        )


@rules_router.delete(
    "/{rule_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_rule_endpoint(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("rules.delete")),
):
    """Delete a fraud detection rule (not allowed for system rules)"""
    rule = get_rule(db, rule_id)
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rule not found",
        )

    if not delete_rule(db, rule_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete system rules",
        )


@rules_router.patch(
    "/{rule_id}/toggle",
    response_model=RuleResponse,
)
def toggle_rule_endpoint(
    rule_id: int,
    data: RuleToggleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("rules.update")),
):
    """Enable or disable a rule"""
    rule = toggle_rule(db, rule_id, data.enabled)
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rule not found",
        )
    return RuleResponse.from_orm(rule)


@rules_router.post(
    "/init/defaults",
    status_code=status.HTTP_201_CREATED,
)
def initialize_default_rules(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("rules.create")),
):
    """Initialize system default rules (idempotent)"""
    try:
        get_or_create_default_rules(db)
        return {"status": "success", "message": "Default rules initialized"}
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to initialize default rules: {str(exc)}",
        )


# ===== RISK EXPLANATION ENDPOINTS =====

risk_explanation_router = APIRouter(
    prefix="/risk",
    tags=["Risk Explanation"],
)


@risk_explanation_router.get(
    "/{transaction_id}/explanation",
    response_model=RiskExplanationResponse,
)
def get_transaction_risk_explanation(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("transactions.read")),
):
    """
    Get AI-generated risk explanation for a transaction.
    
    Returns:
    - Risk Score (0-100) and Level (LOW/MEDIUM/HIGH)
    - Human-readable reasons for the risk assessment
    - Breakdown of contributing factors
    - Recommendation (APPROVE/REVIEW/BLOCK)
    """
    # Check if transaction exists
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    # Get or generate explanation
    explanation = get_risk_explanation(db, transaction_id)
    if not explanation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Risk explanation not yet generated for this transaction",
        )

    # Format for display
    return get_explanation_for_display(explanation)


@risk_explanation_router.get(
    "/{transaction_id}/explanation/detailed",
    response_model=RiskExplanationDetailedResponse,
)
def get_detailed_risk_explanation(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("transactions.read")),
):
    """
    Get detailed risk explanation including audit information.
    
    Includes:
    - Complete score breakdown with weightings
    - All triggering factors by category
    - Rule IDs that triggered
    - Assessment timestamp and notes
    """
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    explanation = get_risk_explanation(db, transaction_id)
    if not explanation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Risk explanation not yet generated for this transaction",
        )

    return format_explanation_for_report(explanation)
