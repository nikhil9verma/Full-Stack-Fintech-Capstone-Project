# FinSight AI — Fintech Intelligence Platform

FinSight AI is a comprehensive, production-ready platform designed for automated decision-making and risk analysis across multiple financial domains.

## Features
- **Credit Assessment:** Evaluates loan applications, predicts approval probability, calculates SHAP feature importance, and checks RBI compliance.
- **Churn Prediction:** Predicts customer churn risk with an automated retention strategy.
- **Lead Scoring:** Ranks loan applicants individually or via bulk CSV upload with a dynamic probability bar chart.
- **Compliance Q&A:** RAG-powered chat assistant utilizing RBI Master Circulars and LLaMA 3.3 70B for answering compliance questions.

## Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Recharts, Lucide Icons.
- **Backend:** FastAPI, Python 3.11.
- **AI/ML:** XGBoost, SHAP, scikit-learn, Sentence-Transformers, ChromaDB.
- **LLM:** Groq LLaMA 3.3 70B (for dynamic risk reports and compliance Q&A).

---

## Local Development Setup

### 1. Backend Setup
1. Open a terminal in the `backend` directory.
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Set your Groq API Key:
   - Rename `.env.example` to `.env`.
   - Update `GROQ_API_KEY` with your actual key from [Groq Console](https://console.groq.com/keys).
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

### 2. Frontend Setup
1. Open a terminal in the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Access the platform at `http://localhost:5173`.

---

## Deployment Guide

### Backend Deployment (Railway)
1. Commit your code to a GitHub repository.
2. Log in to [Railway.app](https://railway.app/).
3. Click **New Project** → **Deploy from GitHub repo**.
4. Select your repository. If the platform asks for the root directory, point it to `/backend`.
5. Under the service settings on Railway, navigate to the **Variables** tab and add your Groq key:
   - `GROQ_API_KEY=your_actual_key`
6. Railway will automatically use the `nixpacks.toml` and `Procfile` to build and deploy the FastAPI service.
7. Once deployed, copy your generated Railway URL (e.g., `https://finsight-backend.up.railway.app`).

### Frontend Deployment (Vercel)
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** → **Project**.
3. Import your GitHub repository.
4. Set the **Framework Preset** to `Vite`.
5. Set the **Root Directory** to `frontend`.
6. Under **Environment Variables**, add the Railway backend URL:
   - Name: `VITE_API_URL`
   - Value: `https://finsight-backend.up.railway.app` *(use your actual backend URL with no trailing slash)*
7. Click **Deploy**. Vercel will handle the routing natively using the `vercel.json` provided in the codebase.

---

## Architecture Notes
- The models (`lead_scoring_model.pkl`, `churn_model.pkl`, etc.) and the RBI document (`RBI-2024-25-13_842024172034341.pdf`) must be present in the `backend/artifacts` folder.
- Upon FastAPI startup, the application dynamically reads the PDF to construct the ChromaDB index for RAG queries.
- SHAP feature analysis is run in real-time, explaining the most important factors for the XGBoost model outputs.
