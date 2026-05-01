🚀 Product Overview

Financial institutions evaluate transactions using a mix of rules, models, and human review. These systems often struggle with:

Limited explainability

High operational complexity

Slow iteration cycles

Poor analyst UX

Transaction Guardian explores how LLMs can augment traditional risk workflows by producing structured, explainable, deterministic outputs—while remaining easy to integrate and reason about.

This is not a startup pitch or a production system.
It is a hands-on demonstration of how an AI feature could be designed, implemented, and communicated in a real enterprise environment.

🧠 What the Demo Does

The application allows a user to submit a simulated transaction and receive:

A normalized risk score

A clear risk verdict (e.g., Low / Medium / High Risk)

A plain-English explanation

A list of risk signals

Model metadata (model + backend)

A timestamped decision record

All results are returned as structured JSON and rendered in a premium, analyst-style UI.

🧩 Core System Components
1. Frontend Experience (React)

Responsive web application with distinct desktop and mobile experiences

Fintech-style UI designed for clarity and trust

Real-time request/response flow

Structured rendering of model outputs (score, verdict, explanation, signals)

This demonstrates user-centric product thinking—not just API wiring.

2. LLM Risk Engine (Cloudflare Worker)

Lightweight serverless backend deployed on Cloudflare Workers

Accepts structured transaction inputs

Prompts an LLM with deterministic instructions

Returns a normalized, schema-safe response

Model details (live):

Model: llama-3.1-8b-instant

Backend: Groq

Inference: Stateless, on-demand, no fine-tuning

The focus is on integration quality, safety, and explainability, not model training.

3. End-to-End API Contract

The system enforces a clean contract between frontend and backend:

Explicit input structure

Predictable output schema

Defensive JSON parsing

Clear error handling

This mirrors how AI features are built inside regulated environments like fintech.

📈 Google Analytics

The frontend includes a small Google Analytics 4 integration that is disabled unless a measurement ID is provided.

1. Create a GA4 web data stream in Google Analytics.
2. Copy the Measurement ID. It should look like `G-XXXXXXXXXX`.
3. Add the ID to your frontend environment as:

```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

For local testing, create `frontend/.env.local` and add the value there. For GitHub Pages deployment, add `VITE_GA_MEASUREMENT_ID` as a GitHub Actions repository variable.

Tracked events:

- `score_transaction_started`
- `score_transaction_completed`
- `score_transaction_failed`
- `demo_transaction_selected`
- `transaction_form_reset`
- `risk_result_panel_closed`

🧱 High-Level Architecture

Flow:

Transaction Input
→ API Request
→ LLM Risk Evaluation
→ Structured Risk Decision
→ Analyst-Facing UI

Key Design Principles:

Deterministic outputs over free-form text

Explainability by default

Minimal surface area for failure

Production-style separation of concerns

🔍 Why This Project Matters

This demo showcases how I work as a Product Manager in AI-driven domains:

Translating ambiguous problems into concrete product flows

Designing structured inputs and outputs for LLMs

Making AI decisions understandable to humans

Balancing speed, safety, and clarity

Shipping polished demos that stakeholders can actually use

It reflects AI product leadership + hands-on execution, not theory.

🛣️ Potential Future Extensions (Optional)

If this were extended further, logical next steps could include:

Rules + heuristic overlays alongside LLM reasoning

Human-in-the-loop review workflows

Telemetry and decision analytics

Policy and compliance signal integration

Side-by-side model comparisons

These are intentionally not implemented to keep the demo focused and credible.

📌 Notes

This project is for demonstration and learning purposes only

No real transaction data is used

No production claims are implied
