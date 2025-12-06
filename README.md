# AI Fraud Analyzer — LLM-Powered Transaction Risk Scoring

An end-to-end AI product demonstration project showcasing my ability to deliver **AI-driven product strategy**, **LLM architecture**, and **technical execution workflows** as a Product Manager.

This project implements a real-world banking use case:  
**Using structured transaction data + LLM reasoning to detect anomalous or fraudulent payment behavior.**

---

## 🚀 Product Overview

Modern fraud detection relies on a mix of rules engines, machine learning, velocity checks, and human review. These systems are often:

- Rigid  
- Hard to maintain  
- Unable to explain *why* a transaction looks suspicious  

This prototype solves that by using:

### ✔ A structured JSON schema (my own design)  
### ✔ An LLM that reasons over the schema  
### ✔ Deterministic, explainable outputs  
### ✔ A risk-scoring API  
### ✔ A simple analyst-facing interface  

This project demonstrates how I would lead the development of a **real AI feature** from concept → architecture → working technical artifacts.

---

## 🧩 Core Components

### 1. Transaction Schema (`/schemas`)  
A normalized JSON structure representing a single card transaction.  
This schema covers:  
- Merchant risk profile  
- Cardholder behavioral baseline  
- Velocity metrics  
- Device fingerprinting  

This provides a deterministic contract for LLM inputs — a critical requirement in production AI.

---

### 2. Code-Generated Types (`/generated`)  
Using **quicktype**, I generated strongly typed models (TS / Python / C#):  
- Ensures consistency  
- Catches errors  
- Makes downstream API development easier  

This mirrors real-world AI team workflows where PMs define drafts → engineers auto-generate models.

---

### 3. LLM Scoring API (`/api`) *(coming next)*  
A lightweight backend service that:  
1. Accepts the JSON schema  
2. Prompts an LLM with structured instructions  
3. Outputs a normalized risk score (0–1)  
4. Provides an explanation + recommended action  

This is a common pattern in AI integrations.

---

### 4. Analyst Notebook (`/notebooks`) *(coming next)*  
A short demo notebook that:  
- Loads example transactions  
- Calls the scoring API  
- Visualizes fraud risk outputs  

This gives a visual demo for business impact.

---

### 5. UI Mock (`/ui`) *(coming next)*  
A simple interface concept for fraud analysts showing:  
- Incoming transaction  
- Risk score  
- Model explanation  
- Suggested action  

Shows PM-level user experience thinking.

---

## 🧱 System Architecture (High-Level)

**Flow:**  
Raw Transaction → Schema Validation → LLM Risk Engine → Score + Explanation → Downstream Action

**Key Layers:**  
- **Input normalization**  
- **LLM prompt + schema**  
- **Evaluation + scoring logic**  
- **Observability & output logging**  
- **Future ML model integration**  

(See diagrams in `/architecture` or project wiki.)

---

## 🔍 Why This Matters for AI Product Management

This project demonstrates the PM skills essential for real AI delivery:

### ✔ Data schema design  
### ✔ LLM prompt design + output structure  
### ✔ API definition  
### ✔ Evaluation frameworks  
### ✔ Risk + safety considerations  
### ✔ Cross-functional technical workflows  
### ✔ Roadmapping and future extensions  

---

## 🛣️ Roadmap

**v1 Complete:**  
- Schema  
- Code generation  
- Initial architecture  
- Repository structure  

**v2 (Next Up):**  
- Risk scoring API  
- Demo notebook  
- Example transactions  

**v3:**  
- UI mock  
- Logging + analytics  
- Weighted hybrid scoring (LLM + rules + ML)  

**v4:**  
- Deployment to a simple cloud environment  
