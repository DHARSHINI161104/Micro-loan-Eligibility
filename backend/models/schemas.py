from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    full_name: str
    gig_platform: Optional[str] = None
    monthly_earnings: float = 0
    monthly_expenses: float = 0
    existing_emi: float = 0
    monthly_savings: float = 0
    digital_payment_level: str = "Medium"
    bank_account_hash: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ScoreBase(BaseModel):
    user_id: int
    total_score: int
    income_stability_score: int
    expense_ratio_score: int
    emi_burden_score: int
    digital_payment_score: int
    savings_score: int
    factors_helped: List[str]
    factors_hurt: List[str]
    improvement_suggestions: List[str]
    ai_explanation: Optional[str] = None

class ScoreResponse(ScoreBase):
    id: int
    calculated_at: datetime
    
    class Config:
        from_attributes = True

class FraudCheckRequest(BaseModel):
    monthly_earnings: float
    monthly_expenses: float
    existing_emi: float
    monthly_savings: float

class FraudFlagResponse(BaseModel):
    flag_type: str
    flag_message: str
    severity: str

class LoanMatchRequest(BaseModel):
    total_score: int
    monthly_earnings: float

class LoanMatchResponse(BaseModel):
    product_name: str
    eligibility_status: str
    score_required: int
    max_loan_amount: Optional[float] = None
    interest_rate: Optional[str] = None

class AIExplanationRequest(BaseModel):
    total_score: int
    income_stability_score: int
    expense_ratio_score: int
    emi_burden_score: int
    digital_payment_score: int
    savings_score: int
    factors_helped: List[str]
    factors_hurt: List[str]
    language: str = "en"

class WhatIfRequest(BaseModel):
    monthly_earnings: float
    monthly_expenses: float
    existing_emi: float
    monthly_savings: float
    digital_payment_level: str
