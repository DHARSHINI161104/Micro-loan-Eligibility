import google.generativeai as genai
from database.connection import settings

if settings.GOOGLE_GEMINI_API_KEY:
    genai.configure(api_key=settings.GOOGLE_GEMINI_API_KEY)

def generate_ai_explanation(
    total_score: int,
    income_stability_score: int,
    expense_ratio_score: int,
    emi_burden_score: int,
    digital_payment_score: int,
    savings_score: int,
    factors_helped: list,
    factors_hurt: list,
    language: str = "en"
) -> str:
    
    score_descriptions = []
    if income_stability_score >= 24:
        score_descriptions.append("income is stable")
    elif income_stability_score < 15:
        score_descriptions.append("income needs improvement")
    
    if expense_ratio_score >= 20:
        score_descriptions.append("expenses are well managed")
    elif expense_ratio_score < 15:
        score_descriptions.append("expenses are too high")
    
    if emi_burden_score >= 15:
        score_descriptions.append("EMI burden is manageable")
    elif emi_burden_score < 10:
        score_descriptions.append("EMI burden is too high")
    
    if savings_score >= 6:
        score_descriptions.append("savings are good")
    elif savings_score < 4:
        score_descriptions.append("savings need improvement")
    
    context = ", ".join(score_descriptions) if score_descriptions else "mixed financial situation"
    
    lang_instruction = {
        "en": "Explain in English",
        "hi": "Explain in Hindi (हिंदी में समझाएं)",
        "ta": "Explain in Tamil (தமிழில் விளக்கவும்)"
    }.get(language, "Explain in English")
    
    prompt = f"""{lang_instruction}.

You are a friendly loan advisor helping gig workers understand their loan eligibility.
Your explanation should be at Class 8 reading level - simple, clear, and easy to understand.

Score: {total_score}/100
Financial situation: {context}

Write a brief, encouraging explanation (2-3 sentences) that:
1. Tells them if they're likely to get a loan
2. Mentions one key thing they should work on
3. Ends with a positive note

Keep it very simple - use basic words. Avoid financial jargon.
"""
    
    try:
        if not settings.GOOGLE_GEMINI_API_KEY:
            return get_fallback_explanation(total_score, language)
        
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API error: {e}")
        return get_fallback_explanation(total_score, language)

def translate_explanation(text: str, target_language: str) -> str:
    lang_names = {
        "en": "English",
        "hi": "Hindi",
        "ta": "Tamil"
    }
    
    prompt = f"Translate the following text to {lang_names.get(target_language, 'English')}. Keep the meaning and tone the same:\n\n{text}"
    
    try:
        if not settings.GOOGLE_GEMINI_API_KEY:
            return text
        
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Translation error: {e}")
        return text

def get_fallback_explanation(score: int, language: str = "en") -> str:
    explanations = {
        "en": {
            "high": f"Your score is {score} out of 100 - great job! You have a good chance of getting approved for a micro-loan. Keep up the good financial habits!",
            "medium": f"Your score is {score} out of 100 - you're on the right track! Work on reducing expenses or increasing savings to improve your eligibility.",
            "low": f"Your score is {score} out of 100 - needs improvement. Focus on reducing your EMI burden and increasing monthly savings to become eligible."
        },
        "hi": {
            "high": f"आपका स्कोर {score} में से 100 है - बहुत बढ़िया! आपको माइक्रो-लोन मिलने की अच्छी संभावना है। अपनी अच्छी वित्तीय आदतें बनाए रखें!",
            "medium": f"आपका स्कोर {score} में से 100 है - आप सही रास्ते पर हैं! पात्रता बेहतर करने के लिए खर्चे कम करें या बचत बढ़ाएं।",
            "low": f"आपका स्कोर {score} में से 100 है - सुधार की जरूरत है। पात्र बनने के लिए EMI कम करें और मासिक बचत बढ़ाएं।"
        },
        "ta": {
            "high": f"உங்கள் மதிப்பெண் {score}/100 - சிறப்பு! உங்களுக்கு மைக்ரோ-லோன் கிடைக்க வாய்ப்பு உள்ளது. உங்கள் நிதி நடவடிக்கைகளைத் தொடர்ந்து கடைபிடியுங்கள்!",
            "medium": f"உங்கள் மதிப்பெண் {score}/100 - சரியான பாதையில் இருக்கிறீர்கள்! தகுதியை மேம்படுத்த செலவைக் குறைக்கவோ சேமிப்பை அதிகரிக்கவோ முயற்சி செய்யுங்கள்.",
            "low": f"உங்கள் மதிப்பெண் {score}/100 - மேம்பட வேண்டியுள்ளது. தகுதியைப் பெற EMIஐக் குறைக்கவும் மாதந்திர சேமிப்பை அதிகரிக்கவும் முயற்சி செய்யுங்கள்."
        }
    }
    
    if score >= 70:
        category = "high"
    elif score >= 50:
        category = "medium"
    else:
        category = "low"
    
    return explanations.get(language, explanations["en"]).get(category, explanations["en"][category])
