import { useState } from "react";
import type React from "react";
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

  // SLIDE-UP PANEL (MOBILE ONLY)
  const [panelOpen, setPanelOpen] = useState(false);

  async function scoreTransaction(e?: React.FormEvent<HTMLFormElement>) {
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

      // MOBILE: open slide-up panel and switch nav tab
      setPanelOpen(true);
      setActive("results");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
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
    <div className="min-h-screen bg-slate-100 pb-20 lg:pb-0">
      <div className="mx-auto flex min-h-screen max-w-6xl lg:px-8">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden w-56 flex-col border-r border-slate-200 bg-white/95 px-5 py-6 shadow-sm lg:flex">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live risk scoring
            </div>
            <h1 className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
              Transaction Guardian
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Internal risk console for evaluating card & ACH transactions.
            </p>
          </div>

          <div className="mt-2 space-y-3 text-xs">
            <div>
              <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                Environment
              </p>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                Sandbox · Demo
              </div>
            </div>

            <div>
              <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                Model
              </p>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                LLM risk engine
                <span className="ml-1 text-[11px] text-slate-400">
                  (serverless)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 text-[11px] text-slate-400">
            <p>Built as a product demo for fraud & risk PM roles.</p>
          </div>
        </aside>

        {/* MAIN COLUMN (MOBILE + DESKTOP) */}
        <div className="flex flex-1 flex-col">
          {/* HEADER (MOBILE / TABLET) */}
          <header className="px-4 pt-4 lg:hidden">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live risk scoring
            </div>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
              Transaction Guardian
            </h1>
            <p className="mt-1 max-w-lg text-[13px] text-slate-500">
              Evaluate card & ACH transactions with an LLM-based risk engine.
            </p>
          </header>

          {/* MAIN CONTENT */}
          <main className="mt-4 flex-1 px-3 pb-6 lg:mt-8 lg:pl-8 lg:pr-0 lg:pb-10">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-6">
              {/* TRANSACTION FORM */}
              <section>
                <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                  Transaction details
                </h2>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <form
                    onSubmit={scoreTransaction}
                    className="space-y-4 p-4 sm:p-5"
                  >
                    {/* Amount */}
                    <div>
                      <label className="text-[12px] font-medium text-slate-600">
                        Amount
                      </label>
                      <div className="mt-1 flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <span className="mr-2 text-sm text-slate-400">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-300 outline-none"
                          placeholder="125.00"
                          value={transaction.amount}
                          onChange={(e) =>
                            setTransaction((prev) => ({
                              ...prev,
                              amount: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    {/* Merchant */}
                    <div>
                      <label className="text-[12px] font-medium text-slate-600">
                        Merchant / Counterparty
                      </label>
                      <input
                        required
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 outline-none"
                        placeholder='e.g. "Amazon Marketplace"'
                        value={transaction.merchant}
                        onChange={(e) =>
                          setTransaction((prev) => ({
                            ...prev,
                            merchant: e.target.value,
                          }))
                        }
                      />
                    </div>

                    {/* Primary actions */}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-slate-50 shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                      >
                        {loading ? "Scoring..." : "Score transaction"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTransaction({ amount: "", merchant: "" });
                          setResult(null);
                          setError(null);
                          setPanelOpen(false);
                        }}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Reset
                      </button>
                    </div>

                    {/* Demo buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setTransaction({
                            amount: "24.99",
                            merchant: "Streaming Service Subscription",
                          })
                        }
                        className="rounded-lg border border-slate-200 bg-slate-50 py-2 text-[12px] text-slate-700 hover:border-emerald-200 hover:bg-emerald-50"
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
                        className="rounded-lg border border-slate-200 bg-slate-50 py-2 text-[12px] text-slate-700 hover:border-rose-200 hover:bg-rose-50"
                      >
                        High-risk demo
                      </button>
                    </div>

                    {error && (
                      <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-700">
                        {error}
                      </div>
                    )}
                  </form>
                </div>
              </section>

              {/* RISK ANALYTICS (DESKTOP CARD) */}
              <section className="hidden lg:block">
                <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                  Risk analytics
                </h2>

                <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  {!result && !loading && !error && (
                    <div className="text-sm text-slate-500">
                      No transaction scored yet.
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-slate-500">
                        <li>Enter amount and merchant to score risk.</li>
                        <li>Try scam-like language to simulate fraud cases.</li>
                      </ul>
                    </div>
                  )}

                  {loading && (
                    <div className="space-y-3">
                      <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
                      <div className="h-2 w-full animate-pulse rounded-full bg-slate-200" />
                      <div className="h-2 w-3/4 animate-pulse rounded-full bg-slate-200" />
                    </div>
                  )}

                  {!loading && result && (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                            Risk score
                          </p>
                          <p className="mt-1 text-2xl font-semibold text-slate-900">
                            {result.risk_score}
                            <span className="ml-1 text-sm font-normal text-slate-400">
                              /100
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-700">
                            {riskLabel(result.risk_score)}
                          </p>
                          <p className="text-xs text-slate-400">
                            {result.verdict}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${riskColor(
                            result.risk_score
                          )}`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(0, result.risk_score)
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                        <p className="text-[12px] font-medium text-slate-600">
                          Explanation
                        </p>
                        <p className="mt-1 text-[13px] text-slate-700">
                          {result.explanation || result.reason}
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                        <div>
                          <p className="font-medium text-slate-600">
                            Model backend
                          </p>
                          <p className="mt-0.5">
                            {result.model} on {result.backend}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-slate-600">
                            Timestamp
                          </p>
                          <p className="mt-0.5">
                            {new Date(result.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {!loading && error && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      {error}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>

      {/* SLIDE-UP PANEL (MOBILE RESULTS) */}
      <SlideUpPanel open={panelOpen} onClose={() => setPanelOpen(false)}>
        {result ? (
          <>
            <h2 className="text-lg font-semibold text-slate-900">
              Risk result
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {result.risk_score} / 100 · {riskLabel(result.risk_score)}
            </p>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${riskColor(
                  result.risk_score
                )}`}
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, result.risk_score)
                  )}%`,
                }}
              />
            </div>

            <p className="mt-4 text-[13px] text-slate-700">
              {result.explanation || result.reason}
            </p>

            <button
              onClick={() => setPanelOpen(false)}
              className="mt-5 w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-slate-50"
            >
              Close
            </button>
          </>
        ) : (
          <p className="text-sm text-slate-500">No result available yet.</p>
        )}
      </SlideUpPanel>

      {/* MOBILE NAV BAR */}
      <MobileNav active={active} setActive={setActive} />
    </div>
  );
}
