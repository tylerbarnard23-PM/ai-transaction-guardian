import { useState } from "react";
import MobileNav from "./components/MobileNav";
import SlideUpPanel from "./components/SlideUpPanel";

interface Transaction {
  amount: string;
  merchant: string;
}

interface RiskResult {
  risk_score: number;
  reason: string;
  explanation: string;
  verdict: string;
  signals: string[];
  model: string;
  backend: string;
  timestamp: string;
}

export default function App() {
  const [transaction, setTransaction] = useState<Transaction>({
    amount: "",
    merchant: "",
  });

  const [result, setResult] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // MOBILE APP-LIKE NAVIGATION
  const [active, setActive] = useState<"home" | "results">("home");

  // SLIDE-UP PANEL
  const [panelOpen, setPanelOpen] = useState(false);

  async function scoreTransaction(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(
        "https://transaction-guardian-worker-production.tylerbarnard23.workers.dev",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transaction }),
        }
      );

      if (!response.ok) throw new Error("API error");

      const data = await response.json();
      setResult(data);

      // MOBILE: Open slide-up panel automatically
      setPanelOpen(true);
      setActive("results");
    } catch (err: any) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // Risk color utilities
  const riskColor = (score: number) => {
    if (score < 30) return "bg-emerald-500";
    if (score < 70) return "bg-amber-500";
    return "bg-rose-500";
  };

  const riskLabel = (score: number) => {
    if (score < 30) return "Low Risk";
    if (score < 70) return "Medium Risk";
    return "High Risk";
  };

  // -------------------------------
  // UI START
  // -------------------------------

  return (
    <div className="min-h-screen bg-slate-100 pb-20 lg:pb-0">
      {/* HEADER */}
      <header className="px-4 pt-4 lg:px-8 lg:pt-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/80 px-2.5 py-0.5 text-[11px] font-medium text-sky-700 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live risk scoring
        </div>

        <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
          Transaction Guardian
        </h1>

        <p className="mt-1 max-w-lg text-[13px] text-slate-500">
          A lightweight AI risk engine evaluating card & ACH transactions.
        </p>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <main className="mx-auto mt-4 max-w-6xl px-3 lg:flex lg:gap-6">
        {/* -------------------------------
            LEFT PANEL — TRANSACTION FORM 
        ------------------------------- */}
        <section className="lg:w-[46%]">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Transaction details
          </h2>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <form onSubmit={scoreTransaction} className="p-4 space-y-4">
              {/* AMOUNT */}
              <div>
                <label className="text-[12px] font-medium text-slate-600">
                  Amount
                </label>
                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 mt-1">
                  <span className="text-slate-400 mr-2">$</span>
                  <input
                    type="number"
                    required
                    className="w-full bg-transparent outline-none text-sm"
                    placeholder="125.00"
                    value={transaction.amount}
                    onChange={(e) =>
                      setTransaction({ ...transaction, amount: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* MERCHANT */}
              <div>
                <label className="text-[12px] font-medium text-slate-600">
                  Merchant / Counterparty
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 mt-1 text-sm outline-none"
                  placeholder='e.g. "Amazon Marketplace"'
                  required
                  value={transaction.merchant}
                  onChange={(e) =>
                    setTransaction({
                      ...transaction,
                      merchant: e.target.value,
                    })
                  }
                />
              </div>

              {/* BUTTONS */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white shadow hover:bg-slate-800 disabled:bg-slate-400"
                >
                  {loading ? "Scoring..." : "Score transaction"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTransaction({ amount: "", merchant: "" });
                    setResult(null);
                    setError(null);
                  }}
                  className="px-4 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-600"
                >
                  Reset
                </button>
              </div>

              {/* DEMO BUTTONS */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-slate-50 py-2 text-[12px]"
                  onClick={() =>
                    setTransaction({
                      amount: "24.99",
                      merchant: "Streaming Service Subscription",
                    })
                  }
                >
                  Low-risk demo
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-slate-50 py-2 text-[12px]"
                  onClick={() =>
                    setTransaction({
                      amount: "950.00",
                      merchant: "Urgent wire to unknown crypto broker",
                    })
                  }
                >
                  High-risk demo
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* -------------------------------
            RIGHT PANEL (DESKTOP ONLY)
        ------------------------------- */}
        <section className="hidden lg:block lg:w-[54%]">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Risk analytics
          </h2>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            {!result && (
              <p className="text-sm text-slate-500">
                No transaction scored yet.
              </p>
            )}

            {result && (
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  {result.risk_score} / 100
                </div>
                <div className="h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full ${riskColor(
                      result.risk_score
                    )} rounded-full`}
                    style={{ width: `${result.risk_score}%` }}
                  />
                </div>

                <p className="mt-3 text-sm text-slate-700">
                  {result.explanation}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* -------------------------------
          SLIDE-UP PANEL (MOBILE ONLY)
      ------------------------------- */}
      <SlideUpPanel open={panelOpen} onClose={() => setPanelOpen(false)}>
        {result ? (
          <>
            <h2 className="text-lg font-semibold text-slate-900">
              Risk result
            </h2>

            <p className="text-sm text-slate-600 mt-1">
              {result.risk_score} / 100 — {riskLabel(result.risk_score)}
            </p>

            <div className="h-2 bg-slate-200 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full ${riskColor(result.risk_score)} rounded-full`}
                style={{ width: `${result.risk_score}%` }}
              />
            </div>

            <p className="mt-4 text-[13px] text-slate-700">
              {result.explanation}
            </p>

            <button
              className="mt-5 w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white"
              onClick={() => setPanelOpen(false)}
            >
              Close
            </button>
          </>
        ) : (
          <p className="text-sm text-slate-500">No result available.</p>
        )}
      </SlideUpPanel>

      {/* -------------------------------
          MOBILE NAV BAR
      ------------------------------- */}
      <MobileNav active={active} setActive={setActive} />
    </div>
  );
}
