"""Fraud Detection router — POST /fraud/detect"""
import joblib, numpy as np, pandas as pd
from pathlib import Path
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.llm_service import generate_report
from services.shap_service import get_top_factors

router = APIRouter()
ARTIFACTS = Path(__file__).parent.parent / "artifacts"
_model = None

def load_model():
    global _model
    if _model is None:
        _model = joblib.load(ARTIFACTS / "fraud_model.pkl")
    return _model

FEATURE_COLS = ["Amount", "Hour"] + [f"V{i}" for i in range(1, 11)]

class FraudRequest(BaseModel):
    amount: float = 120.5
    hour: int = 14
    v1: float = 1.2; v2: float = -0.3; v3: float = 0.8
    v4: float = 0.1; v5: float = 0.4; v6: float = -0.1
    v7: float = 0.2; v8: float = -0.05; v9: float = 0.3; v10: float = 0.1

def get_decision(prob: float) -> str:
    if prob >= 0.80: return "BLOCK"
    if prob >= 0.60: return "REVIEW"
    if prob >= 0.35: return "MONITOR"
    return "ALLOW"

@router.post("/fraud/detect")
async def detect_fraud(req: FraudRequest):
    model = load_model()
    row = {
        "Amount": req.amount, "Hour": req.hour,
        "V1": req.v1, "V2": req.v2, "V3": req.v3, "V4": req.v4, "V5": req.v5,
        "V6": req.v6, "V7": req.v7, "V8": req.v8, "V9": req.v9, "V10": req.v10,
    }
    df = pd.DataFrame([row])
    prob = float(model.predict_proba(df)[0][1])
    decision = get_decision(prob)
    shap_factors = get_top_factors(model, df, FEATURE_COLS)

    action_map = {
        "BLOCK": "Block transaction immediately. Notify fraud team. Freeze account pending investigation.",
        "REVIEW": "Flag for manual review. Request additional authentication before processing.",
        "MONITOR": "Allow with enhanced monitoring. Log for pattern analysis.",
        "ALLOW": "Allow transaction. No suspicious indicators detected.",
    }

    prompt = (
        f"Write a concise fraud investigation report: "
        f"Amount=${req.amount:.2f}, Hour={req.hour}:00, "
        f"Fraud probability={prob*100:.1f}%, Decision={decision}. "
        f"Top indicators: {[f['feature'] for f in shap_factors[:3]]}. "
        f"Recommended action: {action_map[decision]}. Keep under 150 words."
    )
    report = generate_report(prompt, max_tokens=400)

    return {
        "fraud_probability": round(prob * 100, 1),
        "decision": decision,
        "shap_factors": shap_factors,
        "recommended_action": action_map[decision],
        "report": report,
    }
