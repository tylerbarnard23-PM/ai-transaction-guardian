import { useState } from "react";

type Transaction = {
  amount: string;
  merchant: string;
};

export default function App() {
  const [transaction, setTransaction] = useState<Transaction>({
    amount: "",
    merchant: "",
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function scoreTransaction() {
    setLoading(true);
    setResult(null);

    const response = await fetch(
      "https://transaction-guardian-worker-production.tylerbarnard23.workers.dev",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transaction }),
      }
    );

    const data = await response.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "0 auto",
        padding: "20px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <h2 style={{ marginBottom: "16px", textAlign: "center" }}>
        AI Transaction Guardian
      </h2>

      {/* Input Fields */}
      <input
        placeholder="Transaction Amount"
        type="number"
        value={transaction.amount}
        onChange={(e) =>
          setTransaction({ ...transaction, amount: e.target.value })
        }
        style={{
          width: "100%",
          padding: "14px",
          fontSize: "16px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "12px",
          boxSizing: "border-box",
        }}
      />

      <input
        placeholder="Merchant Name"
        value={transaction.merchant}
        onChange={(e) =>
          setTransaction({ ...transaction, merchant: e.target.value })
        }
        style={{
          width: "100%",
          padding: "14px",
          fontSize: "16px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "16px",
          boxSizing: "border-box",
        }}
      />

      {/* Button */}
      <button
        onClick={scoreTransaction}
        disabled={loading}
        style={{
          width: "100%",
          padding: "16px",
          backgroundColor: loading ? "#999" : "#007bff",
          color: "white",
          fontSize: "16px",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          marginBottom: "20px",
        }}
      >
        {loading ? "Scoring..." : "Score Transaction"}
      </button>

      {/* Results */}
      {result && (
        <div
          style={{
            background: "#f1f1f1",
            padding: "16px",
            borderRadius: "10px",
            marginTop: "10px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Result</h3>

          <p>
            <strong>Risk Score:</strong> {result.score}
          </p>

          <p>
            <strong>Verdict:</strong>{" "}
            <span
              style={{
                color:
                  result.score >= 75
                    ? "red"
                    : result.score >= 40
                    ? "#cc8800"
                    : "green",
                fontWeight: "bold",
              }}
            >
              {result.verdict}
            </span>
          </p>

          <p style={{ marginTop: "12px", whiteSpace: "pre-wrap" }}>
            {result.explanation}
          </p>
        </div>
      )}

      {/* Loading State Card */}
      {loading && (
        <div
          style={{
            background: "#fafafa",
            padding: "12px",
            borderRadius: "10px",
            textAlign: "center",
            marginTop: "10px",
            fontSize: "14px",
          }}
        >
          Evaluating transaction...
        </div>
      )}
    </div>
  );
}
