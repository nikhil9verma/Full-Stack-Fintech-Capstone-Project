"""Churn Prediction router — POST /churn/predict"""
import joblib, numpy as np, pandas as pd
from pathlib import Path
from fastapi import APIRouter
from pydantic import BaseModel
from services.llm_service import generate_report
from services.shap_service import get_top_factors

router = APIRouter()
ARTIFACTS = Path(__file__).parent.parent / "artifacts"
_model = None

def load_model():
    global _model
    if _model is None:
        _model = joblib.load(ARTIFACTS / "churn_model.pkl")
    return _model

FEATURE_COLS = [
    "CreditScore", "Age", "Tenure", "Balance",
    "NumOfProducts", "HasCrCard", "IsActiveMember",
    "EstimatedSalary", "Geography_Germany", "Geography_Spain",
]

class ChurnRequest(BaseModel):
    credit_score: float = 650
    age: int = 38
    tenure: int = 4
    balance: float = 75000
    num_of_products: int = 2
    has_cr_card: bool = True
    is_active_member: bool = True
    estimated_salary: float = 850000
    geography: str = "France"

def get_tier(prob: float) -> str:
    if prob >= 0.70: return "CRITICAL"
    if prob >= 0.50: return "HIGH"
    if prob >= 0.30: return "MEDIUM"
    return "LOW"

def get_retention(tier: str) -> str:
    return {
        "CRITICAL": "Immediate personal outreach by relationship manager. Offer premium loyalty benefits and fee waiver.",
        "HIGH":     "Send targeted retention campaign with personalized offer within 48 hours.",
        "MEDIUM":   "Enroll in loyalty program. Schedule quarterly review call.",
        "LOW":      "Standard engagement. No immediate intervention required.",
    }[tier]

@router.post("/churn/predict")
async def predict_churn(req: ChurnRequest):
    model = load_model()
    row = {
        "CreditScore":       req.credit_score,
        "Age":               req.age,
        "Tenure":            req.tenure,
        "Balance":           req.balance,
        "NumOfProducts":     req.num_of_products,
        "HasCrCard":         int(req.has_cr_card),
        "IsActiveMember":    int(req.is_active_member),
        "EstimatedSalary":   req.estimated_salary,
        "Geography_Germany": int(req.geography == "Germany"),
        "Geography_Spain":   int(req.geography == "Spain"),
    }
    df = pd.DataFrame([row])
    prob = float(model.predict_proba(df)[0][1])
    tier = get_tier(prob)
    retention = get_retention(tier)
    shap_factors = get_top_factors(model, df, FEATURE_COLS)

    prompt = (
        f"Write a concise customer churn risk report: "
        f"Age={req.age}, Geography={req.geography}, Tenure={req.tenure}yr, "
        f"Products={req.num_of_products}, Active={req.is_active_member}, "
        f"Churn probability={prob*100:.1f}%, Priority={tier}. "
        f"Top churn drivers: {[f['feature'] for f in shap_factors[:3]]}. "
        f"Retention action: {retention}. Keep under 150 words."
    )
    report = generate_report(prompt, max_tokens=400)

    return {
        "churn_probability": round(prob * 100, 1),
        "priority_tier": tier,
        "retention_action": retention,
        "shap_factors": shap_factors,
        "report": report,
    }
