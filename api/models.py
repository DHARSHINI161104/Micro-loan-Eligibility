from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class UserCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    is_indian_citizen: bool = False
    id_proof_type: str = "none"
    id_proof_number: Optional[str] = None
    bank_details: Optional[Dict[str, str]] = None
    bank_contact: Optional[str] = None


class UserResponse(BaseModel):
    user_id: str
    name: str
    phone: str
    message: Optional[str] = None


class FinancialDataCreate(BaseModel):
    user_id: str
    earnings_history: List[float]
    monthly_expenses: float
    emi: float = 0
    digital_payment_ratio: float
    job_history: float


class ScoreResponse(BaseModel):
    score: int
    income_factor: int
    expense_factor: int
    emi_factor: int
    digital_factor: int
    helped_factors: List[str]
    hurt_factors: List[str]
    suggestions: List[str]
    fraud_flag: bool = False
    fraud_warning: Optional[str] = None
    input_data: Optional[Dict[str, Any]] = None


class LoanMatcherRequest(BaseModel):
    score: int
    job_history: float = 1
    monthly_expenses: float = 10000
    emi: float = 0


class LoanProduct(BaseModel):
    name: str
    provider: str
    min_score: int
    max_loan: int
    interest_rate: str
    eligibility: List[str]
    application_link: str
    description: str
    eligible: bool = True
    eligibility_reason: List[str] = []


class ChatbotRequest(BaseModel):
    message: str
    language: str = "en"


class ChatbotResponse(BaseModel):
    response: str
    language: str


class ScoreHistoryItem(BaseModel):
    score: int
    income_factor: int
    expense_factor: int
    emi_factor: int
    digital_factor: int
    created_at: str
