from pydantic import BaseModel
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Micro Loan Eligibility Scoring Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScoreRequest(BaseModel):
    earnings_history: List[float]
    monthly_expenses: float
    emi: float
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
    fraud_flag: bool
    fraud_warning: Optional[str] = None

def calculate_income_stability(earnings_history: List[float]) -> tuple:
    if not earnings_history:
        return 0, "No income data provided"
    
    avg_income = sum(earnings_history) / len(earnings_history)
    variance = sum((x - avg_income) ** 2 for x in earnings_history) / len(earnings_history)
    std_dev = variance ** 0.5
    cv = (std_dev / avg_income) * 100 if avg_income > 0 else 100
    
    if cv < 10:
        return 40, "Very stable income - excellent"
    elif cv < 20:
        return 35, "Stable income - good"
    elif cv < 30:
        return 28, "Moderate income variation"
    elif cv < 50:
        return 20, "High income variation - concern"
    else:
        return 10, "Very unstable income - risky"

def calculate_expense_ratio(monthly_expenses: float, avg_income: float) -> tuple:
    if avg_income <= 0:
        return 0, "No income data"
    
    ratio = (monthly_expenses / avg_income) * 100
    
    if ratio < 30:
        return 25, "Excellent expense management"
    elif ratio < 40:
        return 22, "Good expense management"
    elif ratio < 50:
        return 18, "Moderate expenses"
    elif ratio < 60:
        return 12, "High expense ratio"
    else:
        return 5, "Very high expense ratio - risky"

def calculate_emi_factor(emi: float, avg_income: float) -> tuple:
    if avg_income <= 0:
        return 0, "No income data"
    
    emi_ratio = (emi / avg_income) * 100
    
    if emi_ratio < 10:
        return 20, "No existing EMI - excellent"
    elif emi_ratio < 20:
        return 16, "Low EMI burden"
    elif emi_ratio < 30:
        return 12, "Moderate EMI"
    elif emi_ratio < 40:
        return 8, "High EMI burden"
    else:
        return 3, "Very high EMI - risky"

def calculate_digital_factor(digital_ratio: float) -> tuple:
    if digital_ratio >= 80:
        return 15, "Excellent digital payment usage"
    elif digital_ratio >= 60:
        return 12, "Good digital payment usage"
    elif digital_ratio >= 40:
        return 9, "Moderate digital usage"
    elif digital_ratio >= 20:
        return 5, "Low digital payment usage"
    else:
        return 2, "Very low digital payments - concern"

def check_fraud(earnings_history: List[float], monthly_expenses: float, avg_income: float) -> tuple:
    if avg_income <= 0:
        return False, None
    
    savings_ratio = ((avg_income - monthly_expenses) / avg_income) * 100
    
    if avg_income > 100000 and savings_ratio > 70:
        return True, f"Unusually high savings rate ({savings_ratio:.1f}%) with high income - requires verification"
    
    if monthly_expenses < avg_income * 0.1 and avg_income > 50000:
        return True, f"Extremely low expenses ({savings_ratio:.1f}% savings) with moderate income - unusual pattern"
    
    if earnings_history and max(earnings_history) > avg_income * 3:
        return True, "Sudden income spike detected - requires verification"
    
    return False, None

def generate_suggestions(income_score: int, expense_score: int, emi_score: int, digital_score: int, 
                        avg_income: float, monthly_expenses: float, emi: float, 
                        digital_ratio: float, job_history: float) -> List[str]:
    suggestions = []
    
    if income_score < 30:
        suggestions.append("Consider increasing income sources or maintaining stable earnings for 6+ months")
    
    if expense_score < 15:
        suggestions.append("Reduce monthly expenses to improve savings ratio above 50%")
    
    if emi_score < 10:
        suggestions.append("Pay off existing EMIs to reduce debt burden below 20% of income")
    
    if digital_score < 10:
        suggestions.append("Increase digital payment usage to above 60% for better credit visibility")
    
    if job_history < 2:
        suggestions.append("Build job stability of 2+ years for better eligibility")
    
    if not suggestions:
        suggestions.append("Great! Maintain current financial habits for continued eligibility")
    
    return suggestions

@app.post("/calculate-score", response_model=ScoreResponse)
async def calculate_score(request: ScoreRequest):
    try:
        earnings_history = request.earnings_history
        monthly_expenses = request.monthly_expenses
        emi = request.emi
        digital_payment_ratio = request.digital_payment_ratio
        job_history = request.job_history
        
        if not earnings_history or len(earnings_history) == 0:
            raise HTTPException(status_code=400, detail="Earnings history is required")
        
        avg_income = sum(earnings_history) / len(earnings_history)
        
        income_score, income_msg = calculate_income_stability(earnings_history)
        expense_score, expense_msg = calculate_expense_ratio(monthly_expenses, avg_income)
        emi_score, emi_msg = calculate_emi_factor(emi, avg_income)
        digital_score, digital_msg = calculate_digital_factor(digital_payment_ratio)
        
        job_history_factor = min(job_history * 2, 10)
        total_score = income_score + expense_score + emi_score + digital_score + int(job_history_factor)
        total_score = min(total_score, 100)
        
        helped_factors = []
        hurt_factors = []
        
        if income_score >= 35:
            helped_factors.append(f"Income Stability: {income_msg}")
        elif income_score < 25:
            hurt_factors.append(f"Income Stability: {income_msg}")
        
        if expense_score >= 20:
            helped_factors.append(f"Expense Management: {expense_msg}")
        elif expense_score < 15:
            hurt_factors.append(f"Expense Management: {expense_msg}")
        
        if emi_score >= 15:
            helped_factors.append(f"EMI Burden: {emi_msg}")
        elif emi_score < 10:
            hurt_factors.append(f"EMI Burden: {emi_msg}")
        
        if digital_score >= 12:
            helped_factors.append(f"Digital Payments: {digital_msg}")
        elif digital_score < 8:
            hurt_factors.append(f"Digital Payments: {digital_msg}")
        
        if job_history >= 2:
            helped_factors.append(f"Job Stability: {job_history:.1f} years of experience")
        elif job_history < 1:
            hurt_factors.append(f"Job Stability: Only {job_history:.1f} years - needs 2+ years")
        
        fraud_flag, fraud_warning = check_fraud(earnings_history, monthly_expenses, avg_income)
        
        suggestions = generate_suggestions(
            income_score, expense_score, emi_score, digital_score,
            avg_income, monthly_expenses, emi, digital_payment_ratio, job_history
        )
        
        return ScoreResponse(
            score=total_score,
            income_factor=income_score,
            expense_factor=expense_score,
            emi_factor=emi_score,
            digital_factor=digital_score,
            helped_factors=helped_factors,
            hurt_factors=hurt_factors,
            suggestions=suggestions,
            fraud_flag=fraud_flag,
            fraud_warning=fraud_warning
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Micro Loan Eligibility Scoring Engine API", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
