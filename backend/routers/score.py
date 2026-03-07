from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.connection import get_db
from models.models import User, Score
from models.schemas import UserCreate, WhatIfRequest
from services.scoring import calculate_eligibility_score

router = APIRouter()

@router.post("/calculate-score")
def calculate_score(user_data: UserCreate, db: Session = Depends(get_db)):
    """Calculate eligibility score from user financial data"""
    
    user = db.query(User).filter(User.full_name == user_data.full_name).first()
    if not user:
        user = User(
            full_name=user_data.full_name,
            gig_platform=user_data.gig_platform,
            monthly_earnings=user_data.monthly_earnings,
            monthly_expenses=user_data.monthly_expenses,
            existing_emi=user_data.existing_emi,
            monthly_savings=user_data.monthly_savings,
            digital_payment_level=user_data.digital_payment_level,
            bank_account_hash=user_data.bank_account_hash
        )
        db.add(user)
    else:
        user.gig_platform = user_data.gig_platform
        user.monthly_earnings = user_data.monthly_earnings
        user.monthly_expenses = user_data.monthly_expenses
        user.existing_emi = user_data.existing_emi
        user.monthly_savings = user_data.monthly_savings
        user.digital_payment_level = user_data.digital_payment_level
    
    db.commit()
    db.refresh(user)
    
    score_data = calculate_eligibility_score(
        monthly_earnings=user_data.monthly_earnings,
        monthly_expenses=user_data.monthly_expenses,
        existing_emi=user_data.existing_emi,
        monthly_savings=user_data.monthly_savings,
        digital_payment_level=user_data.digital_payment_level
    )
    
    score = Score(
        user_id=user.id,
        total_score=score_data["total_score"],
        income_stability_score=score_data["income_stability_score"],
        expense_ratio_score=score_data["expense_ratio_score"],
        emi_burden_score=score_data["emi_burden_score"],
        digital_payment_score=score_data["digital_payment_score"],
        savings_score=score_data["savings_score"],
        factors_helped=score_data["factors_helped"],
        factors_hurt=score_data["factors_hurt"],
        improvement_suggestions=score_data["improvement_suggestions"]
    )
    db.add(score)
    db.commit()
    
    return {
        "user_id": user.id,
        "user_name": user.full_name,
        "gig_platform": user.gig_platform,
        "monthly_earnings": user.monthly_earnings,
        "score": score_data,
        "score_id": score.id
    }

@router.post("/whatif-simulate")
def whatif_simulate(request: WhatIfRequest):
    """What-if simulator for instant score recalculation"""
    
    score_data = calculate_eligibility_score(
        monthly_earnings=request.monthly_earnings,
        monthly_expenses=request.monthly_expenses,
        existing_emi=request.existing_emi,
        monthly_savings=request.monthly_savings,
        digital_payment_level=request.digital_payment_level
    )
    
    return {"score": score_data}

@router.get("/score-history/{user_id}")
def get_score_history(user_id: int, db: Session = Depends(get_db)):
    """Get user's score history"""
    scores = db.query(Score).filter(
        Score.user_id == user_id
    ).order_by(Score.calculated_at.desc()).limit(30).all()
    
    return [
        {
            "id": s.id,
            "total_score": s.total_score,
            "income_stability_score": s.income_stability_score,
            "expense_ratio_score": s.expense_ratio_score,
            "emi_burden_score": s.emi_burden_score,
            "digital_payment_score": s.digital_payment_score,
            "savings_score": s.savings_score,
            "calculated_at": s.calculated_at.isoformat() if s.calculated_at else None
        }
        for s in scores
    ]
