from fastapi import APIRouter
from models.schemas import AIExplanationRequest
from services.gemini_ai import generate_ai_explanation, translate_explanation

router = APIRouter()

@router.post("/ai-explanation")
def ai_explanation(request: AIExplanationRequest):
    """Generate AI explanation for the eligibility score"""
    
    explanation = generate_ai_explanation(
        total_score=request.total_score,
        income_stability_score=request.income_stability_score,
        expense_ratio_score=request.expense_ratio_score,
        emi_burden_score=request.emi_burden_score,
        digital_payment_score=request.digital_payment_score,
        savings_score=request.savings_score,
        factors_helped=request.factors_helped,
        factors_hurt=request.factors_hurt,
        language=request.language
    )
    
    return {
        "explanation": explanation,
        "language": request.language
    }

@router.post("/translate")
def translate(text: str, target_language: str):
    """Translate explanation to target language"""
    
    translated = translate_explanation(text, target_language)
    
    return {
        "original_text": text,
        "translated_text": translated,
        "target_language": target_language
    }
