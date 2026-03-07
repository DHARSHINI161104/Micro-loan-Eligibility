from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from database.connection import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    gig_platform = Column(String(50))
    monthly_earnings = Column(Float, default=0)
    monthly_expenses = Column(Float, default=0)
    existing_emi = Column(Float, default=0)
    monthly_savings = Column(Float, default=0)
    digital_payment_level = Column(String(20))
    bank_account_hash = Column(String(255))
    document_path = Column(String(500))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Score(Base):
    __tablename__ = "scores"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_score = Column(Integer)
    income_stability_score = Column(Integer)
    expense_ratio_score = Column(Integer)
    emi_burden_score = Column(Integer)
    digital_payment_score = Column(Integer)
    savings_score = Column(Integer)
    factors_helped = Column(JSON)
    factors_hurt = Column(JSON)
    improvement_suggestions = Column(JSON)
    ai_explanation = Column(Text)
    calculated_at = Column(DateTime, server_default=func.now())

class FraudFlag(Base):
    __tablename__ = "fraud_flags"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    flag_type = Column(String(100))
    flag_message = Column(Text)
    severity = Column(String(20))
    created_at = Column(DateTime, server_default=func.now())

class LoanMatch(Base):
    __tablename__ = "loan_matches"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_name = Column(String(100))
    eligibility_status = Column(String(20))
    score_required = Column(Integer)
    matched_at = Column(DateTime, server_default=func.now())
