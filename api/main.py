from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional
import os
import uuid
from datetime import datetime

from models import (
    UserCreate, UserResponse, FinancialDataCreate, ScoreResponse,
    LoanMatcherRequest, LoanProduct, ChatbotRequest, ChatbotResponse
)
from scoring import calculate_score

app = FastAPI(title="Micro Loan Eligibility API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URI)
db = client.microloan

users_collection = db.users
financial_data_collection = db.financial_data
score_history_collection = db.score_history


@app.get("/")
async def root():
    return {"message": "Micro Loan Eligibility API", "version": "2.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


@app.post("/user/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    try:
        existing_user = await users_collection.find_one({"phone": user.phone})
        if existing_user:
            return UserResponse(
                user_id=str(existing_user["_id"]),
                name=existing_user["name"],
                phone=existing_user["phone"],
                message="User already exists"
            )
        
        user_data = {
            "name": user.name,
            "phone": user.phone,
            "email": user.email,
            "is_indian_citizen": user.is_indian_citizen,
            "id_proof_type": user.id_proof_type,
            "id_proof_number": user.id_proof_number,
            "bank_details": user.bank_details,
            "bank_contact": user.bank_contact,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await users_collection.insert_one(user_data)
        
        return UserResponse(
            user_id=str(result.inserted_id),
            name=user.name,
            phone=user.phone,
            message="User registered successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/user/financial-data")
async def save_financial_data(data: FinancialDataCreate):
    try:
        financial_record = {
            "user_id": data.user_id,
            "earnings_history": data.earnings_history,
            "monthly_expenses": data.monthly_expenses,
            "emi": data.emi,
            "digital_payment_ratio": data.digital_payment_ratio,
            "job_history": data.job_history,
            "created_at": datetime.utcnow()
        }
        
        existing = await financial_data_collection.find_one({"user_id": data.user_id})
        if existing:
            await financial_data_collection.update_one(
                {"user_id": data.user_id},
                {"$set": financial_record}
            )
        else:
            await financial_data_collection.insert_one(financial_record)
        
        score_result = calculate_score(
            data.earnings_history,
            data.monthly_expenses,
            data.emi,
            data.digital_payment_ratio,
            data.job_history
        )
        
        score_record = {
            "user_id": data.user_id,
            "score": score_result["score"],
            "income_factor": score_result["income_factor"],
            "expense_factor": score_result["expense_factor"],
            "emi_factor": score_result["emi_factor"],
            "digital_factor": score_result["digital_factor"],
            "helped_factors": score_result["helped_factors"],
            "hurt_factors": score_result["hurt_factors"],
            "suggestions": score_result["suggestions"],
            "fraud_flag": score_result["fraud_flag"],
            "fraud_warning": score_result.get("fraud_warning"),
            "input_data": score_result["input_data"],
            "created_at": datetime.utcnow()
        }
        
        await score_history_collection.insert_one(score_record)
        
        return {
            "message": "Financial data saved and score calculated",
            "score": score_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/user/score-history")
async def get_score_history(user_id: str):
    try:
        cursor = score_history_collection.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(20)
        
        scores = await cursor.to_list(length=20)
        
        result = []
        for score in scores:
            result.append({
                "score": score["score"],
                "income_factor": score.get("income_factor", 0),
                "expense_factor": score.get("expense_factor", 0),
                "emi_factor": score.get("emi_factor", 0),
                "digital_factor": score.get("digital_factor", 0),
                "created_at": score["created_at"].isoformat() if score.get("created_at") else ""
            })
        
        return {"scores": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/user/profile")
async def get_profile(user_id: str):
    try:
        user = await users_collection.find_one({"_id": uuid.UUID(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user.pop("_id", None)
        return {"user": user}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/calculate-score", response_model=ScoreResponse)
async def calculate_eligibility_score(data: FinancialDataCreate):
    try:
        result = calculate_score(
            data.earnings_history,
            data.monthly_expenses,
            data.emi,
            data.digital_payment_ratio,
            data.job_history
        )
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return ScoreResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/loan-matcher")
async def match_loans(request: LoanMatcherRequest):
    try:
        loan_products = [
            {
                "name": "MUDRA Loan",
                "provider": "Pradhan Mantri MUDRA Yojana",
                "min_score": 50,
                "max_loan": 1000000,
                "interest_rate": "10-15%",
                "eligibility": [
                    "Indian citizen",
                    "No collateral required",
                    "Business plan required"
                ],
                "application_link": "https://mudra.org.in",
                "description": "Government-backed loan for small businesses"
            },
            {
                "name": "KreditBee",
                "provider": "KreditBee",
                "min_score": 55,
                "max_loan": 500000,
                "interest_rate": "18-36%",
                "eligibility": [
                    "Salary above ₹15,000",
                    "Age 21-45 years",
                    "6+ months employment"
                ],
                "application_link": "https://kreditbee.in",
                "description": "Instant personal loan for salaried professionals"
            },
            {
                "name": "MoneyTap",
                "provider": "MoneyTap",
                "min_score": 60,
                "max_loan": 500000,
                "interest_rate": "13-24%",
                "eligibility": [
                    "Salary above ₹20,000",
                    "Age 23-50 years",
                    "Good credit history"
                ],
                "application_link": "https://moneytap.com",
                "description": "Flexible credit line with pay-as-you-use interest"
            }
        ]
        
        matched = []
        not_matched = []
        
        for product in loan_products:
            product_data = product.copy()
            
            if request.score >= product["min_score"]:
                product_data["eligible"] = True
                reasons = [f"Your score of {request.score} meets minimum {product['min_score']}"]
                if request.job_history >= 1:
                    reasons.append("You have sufficient job stability")
                if request.emi == 0 or request.emi < request.monthly_expenses * 0.3:
                    reasons.append("Your EMI burden is manageable")
                product_data["eligibility_reason"] = reasons
                matched.append(product_data)
            else:
                product_data["eligible"] = False
                product_data["eligibility_reason"] = [f"Score {request.score} is below minimum {product['min_score']}"]
                not_matched.append(product_data)
        
        return {
            "matched_loans": matched,
            "other_options": not_matched
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chatbot", response_model=ChatbotResponse)
async def chatbot(request: ChatbotRequest):
    try:
        message = request.message.lower()
        language = request.language
        
        responses = {
            "en": {
                "eligibility": "Your eligibility depends on income stability, expense ratio, existing EMIs, and digital payment behavior. We calculate a score out of 100 based on these factors.",
                "score": "Your eligibility score is calculated using: Income Stability (40%), Expense Ratio (25%), Existing EMI (20%), and Digital Payment Behavior (15%).",
                "documents": "You need: Aadhaar card, PAN card, Bank statement (last 3 months), and proof of income. These help verify your identity and financial status.",
                "loan": "We recommend MUDRA Loan for businesses, KreditBee for salaried professionals, and MoneyTap for flexible credit lines. Your eligibility depends on your score.",
                "improve": "To improve your score: 1) Maintain stable income for 6+ months, 2) Reduce expenses below 50% of income, 3) Pay off existing EMIs, 4) Use digital payments regularly.",
                "fraud": "We flag suspicious patterns like unusually high savings or income spikes. This protects you and the lending institution from fraudulent activities.",
                "default": "I can help with questions about eligibility, scores, documents, loans, and how to improve your chances. What would you like to know?"
            },
            "hi": {
                "eligibility": "आपकी पात्रता आय स्थिरता, खर्च अनुपात, मौजूदा ईएमआई और डिजिटल भुगतान व्यवहार पर निर्भर करती है।",
                "score": "आपकी पात्रता स्कोर गणना: आय स्थिरता (40%), खर्च अनुपात (25%), मौजूदा ईएमआई (20%), डिजिटल भुगतान (15%)।",
                "documents": "आपको चाहिए: आधार कार्ड, पैन कार्ड, बैंक स्टेटमेंट (पिछले 3 महीने), आय प्रमाण।",
                "loan": "हम MUDRA Loan व्यवसायों के लिए, KreditBee वेतनभोगी पेशेवरों के लिए, और MoneyTap लचीले क्रेडिट के लिए अनुशंसा करते हैं।",
                "improve": "स्कोर सुधारने के लिए: 6+ महीने स्थिर आय, खर्च 50% से कम, मौजूदा ईएमआई चुकाएं, नियमित डिजिटल भुगतान।",
                "fraud": "हम unusual patterns को flag करते हैं। यह आपको और lending institution को fraud से बचाता है।",
                "default": "मैं पात्रता, स्कोर, दस्तावेज़, ऋण और अपनी संभावनाएं सुधारने के बारे में मदद कर सकता हूं। आप क्या जानना चाहेंगे?"
            },
            "ta": {
                "eligibility": "உங்கள் தகுதி வருமான நிலைத்தன்மை, செலவு விகிதம், உள்ள EMI மற்றும் டிஜிட்டல் பேமெண்ட் ஆகியவற்றைப் பொறுத்தது.",
                "score": "உங்கள் தகுதி மதிப்பெண்: வருமான நிலைத்தன்மை (40%), செலவு விகிதம் (25%), உள்ள EMI (20%), டிஜிட்டல் பேமெண்ட் (15%).",
                "documents": "தேவை: ஆதார், PAN, வங்கி அறிக்கை (மூன்று மாதங்கள்), வருமான ஆதாரம்.",
                "loan": "MUDRA Loan வணிகங்களுக்கு, KreditBee ஊழியர்களுக்கு, MoneyTap மாறும் கடன் வரம்புக்கு பரிந்துரைக்கிறோம்.",
                "improve": "மதிப்பெண் மேம்பட: 6+ மாதம் நிலையான வருமானம், 50%க்கு குறைவான செலவு, EMI செலுத்துதல், டிஜிட்டல் பேமெண்ட்.",
                "fraud": "நாங்கள் unusual patternsஐ flag செய்கிறோம். இது உங்களையும் lending institutionஐயும் fraudலிருந்து பாதுக்கக்கிறது.",
                "default": "தகுதி, மதிப்பெண், ஆவணங்கள், கடன் மற்றும் உங்கள் வாய்ப்புகளை மேம்படுத்துவதற்கு உதவ முடியும். நீங்கள் எதை பற்றி அறிய விரும்புகிறீர்கள்?"
            }
        }
        
        lang_responses = responses.get(language, responses["en"])
        response = lang_responses["default"]
        
        for key, value in lang_responses.items():
            if key in message:
                response = value
                break
        
        return ChatbotResponse(response=response, language=language)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
