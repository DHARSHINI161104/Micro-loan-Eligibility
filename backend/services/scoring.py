from typing import List, Tuple

def calculate_income_score(monthly_earnings: float) -> int:
    """Income Stability Score (0-30 points)"""
    if monthly_earnings >= 30000:
        return 30
    elif monthly_earnings >= 25000:
        return 27
    elif monthly_earnings >= 20000:
        return 24
    elif monthly_earnings >= 15000:
        return 20
    elif monthly_earnings >= 10000:
        return 15
    else:
        return 10

def calculate_expense_ratio_score(monthly_earnings: float, monthly_expenses: float) -> int:
    """Expense Ratio Score (0-25 points) - lower is better"""
    if monthly_earnings == 0:
        return 0
    
    expense_ratio = (monthly_expenses / monthly_earnings) * 100
    
    if expense_ratio <= 50:
        return 25
    elif expense_ratio <= 60:
        return 20
    elif expense_ratio <= 70:
        return 15
    elif expense_ratio <= 80:
        return 10
    else:
        return 5

def calculate_emi_burden_score(monthly_earnings: float, existing_emi: float) -> int:
    """EMI Burden Score (0-20 points) - lower EMI is better"""
    if monthly_earnings == 0:
        return 0
    
    emi_ratio = (existing_emi / monthly_earnings) * 100
    
    if emi_ratio <= 10:
        return 20
    elif emi_ratio <= 20:
        return 15
    elif emi_ratio <= 30:
        return 10
    elif emi_ratio <= 40:
        return 5
    else:
        return 0

def calculate_digital_payment_score(digital_payment_level: str) -> int:
    """Digital Payment Score (0-15 points)"""
    level = digital_payment_level.lower()
    if level == "high":
        return 15
    elif level == "medium":
        return 10
    else:
        return 5

def calculate_savings_score(monthly_earnings: float, monthly_savings: float) -> int:
    """Savings Score (0-10 points) - higher savings is better"""
    if monthly_earnings == 0:
        return 0
    
    savings_ratio = (monthly_savings / monthly_earnings) * 100
    
    if savings_ratio >= 20:
        return 10
    elif savings_ratio >= 15:
        return 8
    elif savings_ratio >= 10:
        return 6
    elif savings_ratio >= 5:
        return 4
    else:
        return 2

def analyze_factors(
    monthly_earnings: float,
    monthly_expenses: float,
    existing_emi: float,
    monthly_savings: float,
    digital_payment_level: str,
    income_score: int,
    expense_score: int,
    emi_score: int,
    digital_score: int,
    savings_score: int
) -> Tuple[List[str], List[str]]:
    """Analyze which factors helped and hurt the score"""
    helped = []
    hurt = []
    
    if income_score >= 24:
        helped.append("Strong monthly earnings")
    elif income_score < 15:
        hurt.append("Low monthly earnings")
    
    if expense_score >= 20:
        helped.append("Good expense management")
    elif expense_score < 15:
        hurt.append("High expense-to-income ratio")
    
    if emi_score >= 15:
        helped.append("Low existing EMI burden")
    elif emi_score < 10:
        hurt.append("High EMI burden affecting eligibility")
    
    if digital_score >= 10:
        helped.append("Good digital payment usage")
    else:
        hurt.append("Low digital payment activity")
    
    if savings_score >= 6:
        helped.append("Healthy savings buffer")
    elif savings_score < 4:
        hurt.append("Low savings rate")
    
    return helped, hurt

def generate_improvement_suggestions(
    monthly_earnings: float,
    monthly_expenses: float,
    existing_emi: float,
    monthly_savings: float,
    digital_payment_level: str,
    income_score: int,
    expense_score: int,
    emi_score: int,
    savings_score: int
) -> List[str]:
    """Generate actionable improvement suggestions"""
    suggestions = []
    
    if expense_score < 20:
        target_expenses = monthly_earnings * 0.5
        reduce_amount = monthly_expenses - target_expenses
        if reduce_amount > 0:
            suggestions.append(f"Reduce monthly expenses by ₹{int(reduce_amount)} to achieve 50% expense ratio")
    
    if emi_score < 15 and existing_emi > 0:
        suggestions.append(f"Reduce EMI burden by ₹{int(existing_emi * 0.2)} to improve eligibility")
    
    if savings_score < 8:
        target_savings = monthly_earnings * 0.15
        increase_amount = target_savings - monthly_savings
        if increase_amount > 0:
            suggestions.append(f"Increase monthly savings by ₹{int(increase_amount)} to reach 15% savings rate")
    
    if digital_payment_level.lower() == "low":
        suggestions.append("Increase digital payment usage to build better financial footprint")
    
    if income_score < 24:
        suggestions.append("Maintain stable gig income for 3+ months to improve stability score")
    
    if not suggestions:
        suggestions.append("Great job! Continue maintaining your financial discipline")
    
    suggestions.append("Re-check eligibility after 30 days of consistent financial behavior")
    
    return suggestions[:5]

def calculate_eligibility_score(
    monthly_earnings: float,
    monthly_expenses: float,
    existing_emi: float,
    monthly_savings: float,
    digital_payment_level: str
) -> dict:
    """Calculate complete eligibility score breakdown"""
    
    income_score = calculate_income_score(monthly_earnings)
    expense_score = calculate_expense_ratio_score(monthly_earnings, monthly_expenses)
    emi_score = calculate_emi_burden_score(monthly_earnings, existing_emi)
    digital_score = calculate_digital_payment_score(digital_payment_level)
    savings_score = calculate_savings_score(monthly_earnings, monthly_savings)
    
    total_score = income_score + expense_score + emi_score + digital_score + savings_score
    
    factors_helped, factors_hurt = analyze_factors(
        monthly_earnings, monthly_expenses, existing_emi, monthly_savings,
        digital_payment_level, income_score, expense_score, emi_score,
        digital_score, savings_score
    )
    
    suggestions = generate_improvement_suggestions(
        monthly_earnings, monthly_expenses, existing_emi, monthly_savings,
        digital_payment_level, income_score, expense_score, emi_score, savings_score
    )
    
    return {
        "total_score": total_score,
        "income_stability_score": income_score,
        "expense_ratio_score": expense_score,
        "emi_burden_score": emi_score,
        "digital_payment_score": digital_score,
        "savings_score": savings_score,
        "factors_helped": factors_helped,
        "factors_hurt": factors_hurt,
        "improvement_suggestions": suggestions,
        "max_possible_score": 100
    }
