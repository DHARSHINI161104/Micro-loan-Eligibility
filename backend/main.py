from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.connection import settings, engine, Base
from routers import score, fraud, ai, loan

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Gig Worker Loan Eligibility API",
    description="API for calculating loan eligibility for gig workers",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(score.router, prefix="/api", tags=["Score"])
app.include_router(fraud.router, prefix="/api", tags=["Fraud"])
app.include_router(ai.router, prefix="/api", tags=["AI"])
app.include_router(loan.router, prefix="/api", tags=["Loan"])

@app.get("/")
def root():
    return {
        "message": "Gig Worker Loan Eligibility API",
        "version": "1.0.0",
        "endpoints": {
            "calculate_score": "POST /api/calculate-score",
            "fraud_check": "POST /api/fraud-check",
            "ai_explanation": "POST /api/ai-explanation",
            "loan_match": "POST /api/loan-match",
            "whatif_simulate": "POST /api/whatif-simulate",
            "score_history": "GET /api/score-history/{user_id}",
            "document_checklist": "GET /api/document-checklist"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
