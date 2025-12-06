# main.py
from fastapi import FastAPI
from pydantic import BaseModel
import json
import os
import httpx

app = FastAPI(title="AI Transaction Guardian", version="1.0")

# ---------------------
# Pydantic model
# ---------------------
class Transaction(BaseModel):
    transaction_id: str
    amount: float
    merchant: dict
    cardholder_profile: dict
    velocity_metrics: dict
    device_fingerprint: dict

# ---------------------
# LLM Client
# ---------------------
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

# ---------------------
# Scoring Endpoint
# ---------------------
@app.post("/score")
async def score_transaction(txn: Transaction):
    try:
        # Make sure model_prompt.txt is in the same folder as main.py
        with open("model_prompt.txt") as f:
            base_prompt = f.read()

        # Combine the base prompt with the transaction JSON
        final_prompt = base_prompt + "\n\nTRANSACTION:\n" + json.dumps(txn.dict(), indent=2)

        # Call the LLM (replace with dummy response if testing)
        result = await call_model(final_prompt)

        # Return the response
        return {
            "transaction_id": txn.transaction_id,
            "model_output": result
        }

    except Exception as e:
        # Return the actual error instead of a generic 500
        return {"error": str(e)}

