"""Lead Scoring router — POST /leads/score  POST /leads/bulk"""
import joblib, io, numpy as np, pandas as pd
from pathlib import Path
from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
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

class LeadRequest(BaseModel):
    cibil_score: float = 700
    annual_income: float = 650000
    loan_amount: float = 400000
    loan_term: int = 24
    no_of_dependents: int = 1
    education: str = "Graduate"
    self_employed: str = "No"
    residential_assets_value: float = 1200000
    commercial_assets_value: float = 0
    luxury_assets_value: float = 150000
    bank_asset_value: float = 100000

def prep_row(r) -> dict:
    return {
        "no_of_dependents":          int(r.get("no_of_dependents", 1)),
        "education":                 1 if str(r.get("education","Graduate")) == "Graduate" else 0,
        "self_employed":             1 if str(r.get("self_employed","No")) == "Yes" else 0,
        "annual_income":             float(r.get("annual_income", 650000)),
        "loan_amount":               float(r.get("loan_amount", 400000)),
        "loan_term":                 int(r.get("loan_term", 24)),
        "cibil_score":               float(r.get("cibil_score", 700)),
        "residential_assets_value":  float(r.get("residential_assets_value", 0)),
        "commercial_assets_value":   float(r.get("commercial_assets_value", 0)),
        "luxury_assets_value":       float(r.get("luxury_assets_value", 0)),
        "bank_asset_value":          float(r.get("bank_asset_value", 0)),
    }

def get_decision(prob: float) -> str:
    if prob >= 0.75: return "AUTO APPROVE"
    if prob >= 0.50: return "REVIEW"
    if prob >= 0.30: return "CONDITIONAL"
    return "REJECT"

@router.post("/leads/score")
async def score_single(req: LeadRequest):
    model = load_model()
    row = prep_row(req.model_dump())
    df = pd.DataFrame([row])
    prob = float(model.predict_proba(df)[0][1])
    shap_factors = get_top_factors(model, df, FEATURE_COLS)
    return {
        "approval_probability": round(prob * 100, 1),
        "decision": get_decision(prob),
        "shap_factors": shap_factors,
        "cibil": req.cibil_score,
        "income": req.annual_income,
        "loan": req.loan_amount,
    }

@router.post("/leads/bulk")
async def score_bulk(file: UploadFile = File(...)):
    model = load_model()
    contents = await file.read()
    df_input = pd.read_csv(io.BytesIO(contents))
    results = []
    for i, row in df_input.iterrows():
        r = prep_row(row.to_dict())
        df_row = pd.DataFrame([r])
        prob = float(model.predict_proba(df_row)[0][1])
        results.append({
            "name": f"Applicant {i+1}",
            "approval_probability": round(prob * 100, 1),
            "decision": get_decision(prob),
            "cibil": row.get("cibil_score", 0),
            "income": row.get("annual_income", 0),
            "loan": row.get("loan_amount", 0),
        })
    results.sort(key=lambda x: x["approval_probability"], reverse=True)
    return results
