from typing import List
from models.schemas import FraudFlagResponse

def check_fraud_flags(
    monthly_earnings: float,
    monthly_expenses: float,
    existing_emi: float,
    monthly_savings: float
) -> List[FraudFlagResponse]:
    """Detect inconsistent financial data and return warnings"""
    flags = []
    
    if monthly_expenses > monthly_earnings and monthly_earnings > 0:
        flags.append(FraudFlagResponse(
            flag_type="expenses_exceed_income",
            flag_message="Expenses exceed income - please verify your financial inputs",
            severity="high"
        ))
    
    if monthly_savings > monthly_earnings and monthly_earnings > 0:
        flags.append(FraudFlagResponse(
            flag_type="savings_exceed_income",
            flag_message="Savings cannot exceed monthly income - please check your savings amount",
            severity="high"
        ))
    
    if monthly_expenses == 0 and monthly_earnings > 0:
        flags.append(FraudFlagResponse(
            flag_type="zero_expenses",
            flag_message="Please enter valid expenses - everyone has some monthly expenses",
            severity="medium"
        ))
    
    if monthly_earnings == 0:
        flags.append(FraudFlagResponse(
            flag_type="zero_income",
            flag_message="Please enter your monthly earnings",
            severity="high"
        ))
    
    if monthly_earnings > 50000 and monthly_expenses == 0:
        flags.append(FraudFlagResponse(
            flag_type="unrealistic_data",
            flag_message="Data inconsistency detected: High income with zero expenses - please verify",
            severity="high"
        ))
    
    if existing_emi > monthly_earnings and monthly_earnings > 0:
        flags.append(FraudFlagResponse(
            flag_type="emi_exceed_income",
            flag_message="EMI cannot exceed monthly income - please verify EMI amount",
            severity="high"
        ))
    
    if monthly_earnings > 0 and monthly_expenses > 0:
        expense_ratio = monthly_expenses / monthly_earnings
        if expense_ratio < 0.1:
            flags.append(FraudFlagResponse(
                flag_type="suspicious_low_expenses",
                flag_message="Expenses seem unusually low - please verify your monthly expenses",
                severity="medium"
            ))
    
    return flags
