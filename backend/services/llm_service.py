"""Shared LLM client — Groq LLaMA 3.3 70B"""
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
_client = None

def get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))
    return _client

def generate_report(prompt: str, max_tokens: int = 600) -> str:
    """Generate an LLM report using Groq. Falls back gracefully on error."""
    try:
        client = get_client()
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": (
                    "You are a senior fintech risk analyst at an Indian bank. "
                    "Write concise, professional assessment reports. "
                    "Use RBI terminology where applicable. Be factual and actionable."
                )},
                {"role": "user", "content": prompt},
            ],
            max_tokens=max_tokens,
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"[LLM report unavailable — {type(e).__name__}: {e}]"
