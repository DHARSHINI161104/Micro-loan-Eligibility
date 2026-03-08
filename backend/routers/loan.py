from fastapi import APIRouter
from models.schemas import LoanMatchRequest

router = APIRouter()

LOAN_PRODUCTS = [
    {"name": "MUDRA Loan", "min_score": 60, "max_loan": 100000, "interest_rate": "12-16%", "description": "Government-backed micro finance loan"},
    {"name": "KreditBee", "min_score": 70, "max_loan": 50000, "interest_rate": "18-24%", "description": "Quick personal loans for gig workers"},
    {"name": "MoneyTap", "min_score": 65, "max_loan": 300000, "interest_rate": "14-24%", "description": "Flexible credit line for professionals"},
    {"name": "InstaMoney", "min_score": 55, "max_loan": 25000, "interest_rate": "20-30%", "description": "Instant small loans"},
    {"name": "Paytm Postpaid", "min_score": 50, "max_loan": 20000, "interest_rate": "Free (limited)", "description": "Buy now, pay later service"}
]

@router.post("/loan-match")
def loan_match(request: LoanMatchRequest):
    """Match user to eligible loan products based on score"""
    
    matches = []
    for product in LOAN_PRODUCTS:
        if request.total_score >= product["min_score"]:
            matches.append({
                "product_name": product["name"],
                "eligibility_status": "Eligible",
                "score_required": product["min_score"],
                "max_loan_amount": product["max_loan"],
                "interest_rate": product["interest_rate"],
                "description": product["description"]
            })
        else:
            matches.append({
                "product_name": product["name"],
                "eligibility_status": "Not Eligible",
                "score_required": product["min_score"],
                "max_loan_amount": product["max_loan"],
                "interest_rate": product["interest_rate"],
                "description": product["description"]
            })
    
    matches.sort(key=lambda x: 0 if x["eligibility_status"] == "Eligible" else 1)
    
    return matches

@router.get("/document-checklist")
def document_checklist(gig_platform: str = "other"):
    """Get required documents checklist based on user profile"""
    
    docs = {
        "required": [
            {"name": "Aadhaar Card", "required": True, "description": "Identity proof"},
            {"name": "PAN Card", "required": True, "description": "Tax identification"},
            {"name": "Bank Account", "required": True, "description": "For loan disbursement"},
            {"name": "Platform Payout Screenshot", "required": True, "description": "3-6 months earnings proof"},
            {"name": "Bank Statements", "required": True, "description": "Last 6 months"}
        ],
        "optional": [
            {"name": "UPI Transaction History", "required": False, "description": "Digital payment proof"},
            {"name": "Rental Agreement", "required": False, "description": "Address proof if not matching Aadhaar"}
        ]
    }
    
    return docs
