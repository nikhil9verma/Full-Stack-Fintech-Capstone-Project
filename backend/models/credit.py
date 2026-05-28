"""Credit Assessment router — POST /credit/assess"""
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
        _model = joblib.load(ARTIFACTS / "lead_scoring_model.pkl")
    return _model

FEATURE_COLS = [
    "no_of_dependents", "education", "self_employed",
    "annual_income", "loan_amount", "loan_term",
    "cibil_score", "residential_assets_value",
    "commercial_assets_value", "luxury_assets_value", "bank_asset_value",
]

class CreditRequest(BaseModel):
    cibil_score: float = 720
    annual_income: float = 800000
    loan_amount: float = 500000
    loan_term: int = 36
    no_of_dependents: int = 2
    education: str = "Graduate"
    self_employed: str = "No"
    residential_assets_value: float = 1500000
    commercial_assets_value: float = 0
    luxury_assets_value: float = 300000
    bank_asset_value: float = 200000

def engineer_features(req: CreditRequest) -> pd.DataFrame:
    row = {
        "no_of_dependents": req.no_of_dependents,
        "education": 1 if req.education == "Graduate" else 0,
        "self_employed": 1 if req.self_employed == "Yes" else 0,
        "annual_income": req.annual_income,
        "loan_amount": req.loan_amount,
        "loan_term": req.loan_term,
        "cibil_score": req.cibil_score,
        "residential_assets_value": req.residential_assets_value,
        "commercial_assets_value": req.commercial_assets_value,
        "luxury_assets_value": req.luxury_assets_value,
        "bank_asset_value": req.bank_asset_value,
    }
    return pd.DataFrame([row])

def get_risk_tier(prob: float) -> str:
    if prob >= 0.75: return "LOW"
    if prob >= 0.50: return "MEDIUM"
    if prob >= 0.30: return "HIGH"
    return "VERY HIGH"

def get_decision(prob: float) -> str:
    if prob >= 0.75: return "AUTO APPROVE"
    if prob >= 0.50: return "REVIEW"
    return "REJECT"

def check_rbi_compliance(req: CreditRequest) -> tuple[bool, str]:
    dti = req.loan_amount / max(req.annual_income, 1)
    if dti > 5:
        return False, "Master Direction – Prudential Framework, Sec 4.3 (DTI > 5x)"
    if req.cibil_score < 300:
        return False, "RBI Master Circular – IRAC Norms 2024, Sec 2.1"
    return True, "Master Circular – IRAC Norms 2024, Sec 2.1"

@router.post("/credit/assess")
async def assess_credit(req: CreditRequest):
    model = load_model()
    df = engineer_features(req)
    prob = float(model.predict_proba(df)[0][1])
    tier = get_risk_tier(prob)
    decision = get_decision(prob)
    shap_factors = get_top_factors(model, df, FEATURE_COLS)
    rbi_ok, rbi_section = check_rbi_compliance(req)

    prompt = (
        f"Write a concise credit assessment report for: "
        f"CIBIL={req.cibil_score}, Income=₹{req.annual_income:,.0f}, "
        f"LoanAmt=₹{req.loan_amount:,.0f}, Term={req.loan_term}mo, "
        f"Approval probability={prob*100:.1f}%, Risk tier={tier}, Decision={decision}. "
        f"RBI compliance: {'Yes' if rbi_ok else 'No'} ({rbi_section}). "
        f"Top risk factors: {[f['feature'] for f in shap_factors[:3]]}. "
        "Include recommendation and key observations. Keep under 200 words."
    )
    report = generate_report(prompt)

    return {
        "approval_probability": round(prob * 100, 1),
        "risk_tier": tier,
        "decision": decision,
        "shap_factors": shap_factors,
        "rbi_compliant": rbi_ok,
        "rbi_section": rbi_section,
        "report": report,
    }
