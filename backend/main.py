"""FinSight AI — FastAPI Backend Entry Point"""
import sys
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add backend root to path so services/ models/ resolve correctly
sys.path.insert(0, str(Path(__file__).parent))

from models.credit    import router as credit_router
from models.fraud     import router as fraud_router
from models.churn     import router as churn_router
from models.lead      import router as lead_router
from services.rag_service import router as compliance_router, build_collection


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: load models + build RAG index."""
    print("🚀 FinSight AI starting…")
    # Eagerly load all models
    try:
        from models.credit import load_model as load_credit
        from models.fraud  import load_model as load_fraud
        from models.churn  import load_model as load_churn
        from models.lead   import load_model as load_lead
        load_credit(); print("✅ Credit model loaded")
        load_fraud();  print("✅ Fraud model loaded")
        load_churn();  print("✅ Churn model loaded")
        load_lead();   print("✅ Lead scoring model loaded")
    except Exception as e:
        print(f"⚠️  Model load error: {e}")

    # Build ChromaDB from RBI PDF
    build_collection()
    print("✅ Startup complete — all systems online")
    yield
    print("👋 Shutting down…")


app = FastAPI(
    title="FinSight AI Platform",
    description="Credit Risk · Fraud Detection · Churn Prediction · Lead Scoring · RBI Compliance RAG",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow Vercel frontend + local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────
app.include_router(credit_router,     tags=["Credit"])
app.include_router(fraud_router,      tags=["Fraud"])
app.include_router(churn_router,      tags=["Churn"])
app.include_router(lead_router,       tags=["Leads"])
app.include_router(compliance_router, tags=["Compliance"])


@app.get("/health")
async def health():
    return {"status": "online", "service": "FinSight AI Platform"}


@app.get("/dashboard/stats")
async def dashboard_stats():
    """Mock real-time stats — replace with DB queries in production."""
    import random
    return {
        "total_assessments": random.randint(240, 280),
        "fraud_alerts":      random.randint(18, 30),
        "high_risk_loans":   random.randint(30, 50),
        "churn_risks":       random.randint(35, 55),
    }
