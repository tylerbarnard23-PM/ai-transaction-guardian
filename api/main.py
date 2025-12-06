from fastapi import FastAPI
from pydantic import BaseModel
import json
import httpx
import os

app = FastAPI(title="AI Fraud Analyzer", version="1.0")

# Pydantic model
class Transaction(BaseModel):
    transaction_id: str
    amount: float
    merchant: dict
    cardholder_profile: dict
    velocity_metrics: dict
    device_fingerprint: dict

# LLM Client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL_NAME = "gpt-4.1"

async def call_model(prompt: str):
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            json={
                "model": MODEL_NAME,
                "messages": [
                    {"role": "system", "content": "You are a fraud risk scoring engine."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0
            }
        )
        return response.json()["choices"][0]["message"]["content"]

@app.post("/score")
async def score_transaction(txn: Transaction):
    with open("api/model_prompt.txt") as f:
        base_prompt = f.read()
    final_prompt = base_prompt + "\n\nTRANSACTION:\n" + json.dumps(txn.dict(), indent=2)
    result = await call_model(final_prompt)
    return {
        "transaction_id": txn.transaction_id,
        "model_output": result
    }

