"""Risk Explanation Service - Generates human-readable risk explanations"""

import json
from typing import Optional

from sqlalchemy.orm import Session

from app.models.risk_explanation import RiskExplanation
from app.models.transactions import RiskDecision, RiskLevel, Transaction


def generate_risk_explanation(
    db: Session,
    *,
    transaction: Transaction,
    ml_score: float = 0.0,
    rules_score: float = 0.0,
    behavior_score: float = 0.0,
    ml_factors: list[str] | None = None,
    rules_factors: list[str] | None = None,
    behavior_factors: list[str] | None = None,
    triggered_rule_ids: list[int] | None = None,
) -> RiskExplanation:
    """
    Generate a comprehensive risk explanation for a transaction.
    
    Combines multiple scoring components into a final risk score with
    human-readable explanations.
    """
    ml_factors = ml_factors or []
    rules_factors = rules_factors or []
    behavior_factors = behavior_factors or []
    triggered_rule_ids = triggered_rule_ids or []

    # Calculate weighted combined score
    # Weights: ML (40%), Rules (35%), Behavior (25%)
    final_risk_score = (
        (ml_score * 0.40) +
        (rules_score * 0.35) +
        (behavior_score * 0.25)
    )

    # Clamp to 0-100
    final_risk_score = max(0.0, min(100.0, final_risk_score))

    # Determine risk level
    if final_risk_score <= 30:
        risk_level = RiskLevel.LOW
        recommended_decision = RiskDecision.APPROVE
    elif final_risk_score <= 70:
        risk_level = RiskLevel.MEDIUM
        recommended_decision = RiskDecision.REVIEW
    else:
        risk_level = RiskLevel.HIGH
        recommended_decision = RiskDecision.BLOCK

    # Generate human-readable reasons
    all_reasons = []

    # Add ML factors
    if ml_factors:
        all_reasons.extend(ml_factors)

    # Add rules factors
    if rules_factors:
        all_reasons.extend(rules_factors)

    # Add behavior factors
    if behavior_factors:
        all_reasons.extend(behavior_factors)

    # Ensure we have at least one reason
    if not all_reasons:
        all_reasons.append("No significant risk indicators detected.")

    # Generate summary
    summary = _generate_summary(
        final_risk_score,
        risk_level,
        len(all_reasons),
    )

    # Create or update explanation
    existing = db.query(RiskExplanation).filter(
        RiskExplanation.transaction_id == transaction.id
    ).first()

    if existing:
        explanation = existing
        explanation.ml_score = ml_score
        explanation.rules_score = rules_score
        explanation.behavior_score = behavior_score
        explanation.final_risk_score = final_risk_score
        explanation.risk_level = risk_level.value
        explanation.summary = summary
        explanation.reasons = json.dumps(all_reasons)
        explanation.ml_factors = json.dumps(ml_factors) if ml_factors else None
        explanation.rules_factors = json.dumps(rules_factors) if rules_factors else None
        explanation.behavior_factors = json.dumps(behavior_factors) if behavior_factors else None
        explanation.triggered_rule_ids = json.dumps(triggered_rule_ids) if triggered_rule_ids else None
        explanation.recommended_decision = recommended_decision.value
    else:
        explanation = RiskExplanation(
            transaction_id=transaction.id,
            ml_score=ml_score,
            rules_score=rules_score,
            behavior_score=behavior_score,
            final_risk_score=final_risk_score,
            risk_level=risk_level.value,
            summary=summary,
            reasons=json.dumps(all_reasons),
            ml_factors=json.dumps(ml_factors) if ml_factors else None,
            rules_factors=json.dumps(rules_factors) if rules_factors else None,
            behavior_factors=json.dumps(behavior_factors) if behavior_factors else None,
            triggered_rule_ids=json.dumps(triggered_rule_ids) if triggered_rule_ids else None,
            recommended_decision=recommended_decision.value,
        )
        db.add(explanation)

    db.commit()
    db.refresh(explanation)
    return explanation


def _generate_summary(
    risk_score: float,
    risk_level: RiskLevel,
    reason_count: int,
) -> str:
    """Generate a human-readable summary of the risk"""
    level_descriptions = {
        RiskLevel.LOW: "This transaction appears to be low risk",
        RiskLevel.MEDIUM: "This transaction requires review",
        RiskLevel.HIGH: "This transaction is flagged as high risk",
    }

    base_summary = level_descriptions.get(
        risk_level,
        "Unable to determine risk level"
    )

    if reason_count == 1:
        reason_text = "one risk factor"
    else:
        reason_text = f"{reason_count} risk factors"

    return f"{base_summary} based on {reason_text} (Risk Score: {risk_score:.1f}/100)"


def get_risk_explanation(
    db: Session,
    transaction_id: int,
) -> Optional[RiskExplanation]:
    """Get risk explanation for a transaction"""
    return db.query(RiskExplanation).filter(
        RiskExplanation.transaction_id == transaction_id
    ).first()


def get_explanation_for_display(
    explanation: RiskExplanation,
) -> dict:
    """
    Format explanation for API response - user-friendly format.
    
    Returns a dictionary with all explanation details formatted
    for business users.
    """
    reasons = json.loads(explanation.reasons) if explanation.reasons else []
    ml_factors = json.loads(explanation.ml_factors) if explanation.ml_factors else []
    rules_factors = json.loads(explanation.rules_factors) if explanation.rules_factors else []
    behavior_factors = json.loads(explanation.behavior_factors) if explanation.behavior_factors else []
    triggered_rule_ids = json.loads(explanation.triggered_rule_ids) if explanation.triggered_rule_ids else []

    return {
        "transaction_id": explanation.transaction_id,
        "risk_score": {
            "final": round(explanation.final_risk_score, 1),
            "level": explanation.risk_level,
            "breakdown": {
                "ml_model": round(explanation.ml_score, 1),
                "rules_engine": round(explanation.rules_score, 1),
                "customer_behavior": round(explanation.behavior_score, 1),
            },
        },
        "summary": explanation.summary,
        "reasons": reasons,
        "factors": {
            "ml_model": ml_factors,
            "rules_engine": rules_factors,
            "customer_behavior": behavior_factors,
        },
        "triggered_rules": triggered_rule_ids,
        "recommendation": explanation.recommended_decision,
        "generated_at": explanation.generated_at.isoformat() if explanation.generated_at else None,
    }


def format_explanation_for_report(
    explanation: RiskExplanation,
) -> dict:
    """Format explanation for audit/compliance reports"""
    reasons = json.loads(explanation.reasons) if explanation.reasons else []
    triggered_rule_ids = json.loads(explanation.triggered_rule_ids) if explanation.triggered_rule_ids else []

    return {
        "transaction_id": explanation.transaction_id,
        "risk_assessment": {
            "score": round(explanation.final_risk_score, 2),
            "level": explanation.risk_level,
            "decision": explanation.recommended_decision,
        },
        "score_components": {
            "ml_model_contribution": f"{round(explanation.ml_score * 0.40, 2)}% weight",
            "rules_engine_contribution": f"{round(explanation.rules_score * 0.35, 2)}% weight",
            "behavior_analysis_contribution": f"{round(explanation.behavior_score * 0.25, 2)}% weight",
        },
        "triggering_factors": reasons,
        "rule_ids_triggered": triggered_rule_ids,
        "assessment_timestamp": explanation.generated_at.isoformat() if explanation.generated_at else None,
        "assessment_notes": explanation.summary,
    }
