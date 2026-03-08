from fastapi import APIRouter
from models.schemas import FraudCheckRequest
from services.fraud_detection import check_fraud_flags

router = APIRouter()

@router.post("/fraud-check")
def fraud_check(request: FraudCheckRequest):
    """Check for financial data inconsistencies and fraud flags"""
    
    flags = check_fraud_flags(
        monthly_earnings=request.monthly_earnings,
        monthly_expenses=request.monthly_expenses,
        existing_emi=request.existing_emi,
        monthly_savings=request.monthly_savings
    )
    
    return flags
