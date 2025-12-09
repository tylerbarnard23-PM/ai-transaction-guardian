from fastapi import FastAPI
from pydantic import BaseModel
import json
import os
import asyncio

app = FastAPI(title="AI Transaction Guardian")

# ----------------------
# Pydantic models
# ----------------------
class Merchant(BaseModel):
    chargeback_rate: float
    fraud_rate: float
    avg_ticket: float
    merchant_risk_level: str

class CardholderProfile(BaseModel):
    avg_spend: float
    home_zip: str
    distance_from_home: float
    recent_travel: bool
    account_age_days: int

class VelocityMetrics(BaseModel):
    txns_last_1hr: int
    txns_last_24hr: int
    txns_last_7d: int
    avg_amount_last_7d: float

class DeviceFingerprint(BaseModel):
    device_id: str
    ip: str
    user_agent: str
    geo: str

class Transaction(BaseModel):
    transaction_id: str
    amount: float
    merchant: Merchant
    cardholder_profile: CardholderProfile
    velocity_metrics: VelocityMetrics
    device_fingerprint: DeviceFingerprint

# ----------------------
# Dummy model call (replace with OpenAI later)
# ----------------------
async def call_model(prompt: str) -> str:
    # If you have OpenAI, you can call it here instead
    # Example: return openai.ChatCompletion.create(...)
    await asyncio.sleep(0.1)  # simulate async call
    return f"Predicted risk for transaction (length {len(prompt)}): LOW"

# ----------------------
# Score transaction endpoint
# ----------------------
@app.post("/score")
async def score_transaction(txn: Transaction):
    try:
        # Correct path: model_prompt.txt is in the same folder as main.py
        with open("model_prompt.txt") as f:
            base_prompt = f.read()

        # Combine prompt with transaction JSON
        final_prompt = base_prompt + "\n\nTRANSACTION:\n" + json.dumps(txn.dict(), indent=2)

        # Call model (dummy or real)
        result = await call_model(final_prompt)

        return {
            "transaction_id": txn.transaction_id,
            "model_output": result
        }

    except Exception as e:
        print("Error in /score endpoint:", e)
        return {"error": str(e)}

