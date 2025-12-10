import { useState } from "react";

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

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError("Something went wrong scoring this transaction. Try again.");
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <div className="min-h-screen bg-slate-100">
      {/* subtle gradient top */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-40 bg-gradient-to-b from-sky-300/20 via-slate-100 to-transparent" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-3 pb-10 pt-4 sm:px-6 lg:px-8 lg:pt-10">

        {/* HEADER */}
        <header className="mb-4 flex items-start justify-between lg:mb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/80 px-2.5 py-0.5 text-[11px] font-medium text-sky-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live risk scoring
            </div>

            <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
              Transaction Guardian
            </h1>

            <p className="mt-1 max-w-lg text-[13px] text-slate-500 sm:text-sm lg:text-base">
              A lightweight AI risk engine that evaluates card and ACH
              transactions in real time.
            </p>
          </div>

          {/* desktop badge */}
          <div className="hidden text-xs text-slate-400 lg:flex lg:flex-col lg:text-right">
            <span className="font-medium text-slate-500">Portfolio prototype</span>
            <span>React · Vite · Tailwind</span>
          </div>
        </header>

        {/* MAIN LAYOUT */}
        <main className="flex flex-1 flex-col gap-4 lg:flex-row lg:gap-6">

          {/* LEFT COLUMN — TRANSACTION FORM */}
          <section className="lg:w-[46%]">
            <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500 lg:mb-3">
              Transaction details
            </h2>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur">
              <div className="border-b border-slate-100 px-3 py-2.5 sm:px-5 sm:py-3">
                <p className="text-[11px] font-medium text-slate-600 sm:text-xs">
                  Simulate a transaction
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400 sm:text-xs">
                  Try both normal and suspicious merchants.
                </p>
              </div>

              <form
                onSubmit={scoreTransaction}
                className="space-y-3 px-3 py-3 sm:px-5 sm:py-4"
              >
                {/* AMOUNT */}
                <div className="space-y-1">
                  <label className="block text-[12px] font-medium text-slate-600">
                    Amount
                  </label>

                  <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 shadow-inner">
                    <span className="mr-1.5 text-sm text-slate-400">$</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={transaction.amount}
                      onChange={(e) =>
                        setTransaction((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none"
                      placeholder="125.00"
                    />
                  </div>
                </div>

                {/* MERCHANT */}
                <div className="space-y-1">
                  <label className="block text-[12px] font-medium text-slate-600">
                    Merchant / Counterparty
                  </label>
                  <input
                    type="text"
                    required
                    value={transaction.merchant}
                    onChange={(e) =>
                      setTransaction((prev) => ({
                        ...prev,
                        merchant: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 shadow-inner focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-200"
                    placeholder='e.g. “Amazon Marketplace”'
                  />
                </div>

                {/* BUTTONS */}
                <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 shadow-sm transition hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    {loading && (
                      <span className="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-[2px] border-slate-200 border-t-slate-900" />
                    )}
                    {loading ? "Scoring..." : "Score transaction"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTransaction({ amount: "", merchant: "" });
                      setResult(null);
                      setError(null);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm hover:bg-slate-50"
                  >
                    Reset
                  </button>
                </div>

                {/* DEMO BUTTONS */}
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      setTransaction({
                        amount: "24.99",
                        merchant: "Streaming Service Subscription",
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-[12px] text-slate-600 hover:border-sky-200 hover:bg-sky-50"
                  >
                    Low-risk demo
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setTransaction({
                        amount: "950.00",
                        merchant:
                          "Urgent wire to unknown international crypto broker",
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-[12px] text-slate-600 hover:border-rose-200 hover:bg-rose-50"
                  >
                    High-risk demo
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* RIGHT COLUMN — RISK ANALYTICS */}
          <section className="lg:w-[54%]">
            <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500 lg:mb-3">
              Risk analytics
            </h2>

            <div className="flex flex-col gap-3 lg:gap-4">

              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-3 py-2.5 sm:px-5 sm:py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-slate-600 sm:text-xs">
                        Model verdict
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Output from LLM risk engine.
                      </p>
                    </div>
                    {result && (
                      <span className="rounded-full bg-slate-900 px-3 py-0.5 text-[11px] font-medium text-slate-50">
                        {result.verdict}
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-3 py-3 sm:px-5 sm:py-4">
                  {/* LOADING */}
                  {loading && (
                    <div className="space-y-3">
                      <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
                      <div className="h-2 w-full animate-pulse rounded-full bg-slate-200" />
                    </div>
                  )}

                  {/* ERROR */}
                  {!loading && error && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                      {error}
                    </div>
                  )}

                  {/* EMPTY */}
                  {!loading && !error && !result && (
                    <div className="space-y-2 text-[13px] text-slate-600">
                      <p className="font-medium text-slate-700">
                        No transaction scored.
                      </p>
                      <ul className="list-disc space-y-1 pl-5 text-[12px] text-slate-500">
                        <li>Enter amount & merchant to score risk.</li>
                        <li>Try scam-like phrases for high-risk results.</li>
                      </ul>
                    </div>
                  )}

                  {/* RESULT */}
                  {!loading && !error && result && (
                    <div className="space-y-4">
                      {/* SCORE HEADER */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                            Risk score
                          </p>
                          <p className="mt-1 text-xl font-semibold text-slate-900">
                            {result.risk_score}
                            <span className="ml-1 text-sm font-normal text-slate-400">
                              /100
                            </span>
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[12px] font-medium text-slate-600">
                            {riskLabel(result.risk_score)}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {result.verdict}
                          </p>
                        </div>
                      </div>

                      {/* RISK BAR */}
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${riskColor(
                            result.risk_score
                          )} transition-all duration-700`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(0, result.risk_score)
                            )}%`,
                          }}
                        />
                      </div>

                      {/* EXPLANATION */}
                      <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                        <p className="text-[12px] font-medium text-slate-600">
                          Explanation
                        </p>
                        <p className="mt-1 text-[13px] text-slate-700">
                          {result.explanation || result.reason}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
