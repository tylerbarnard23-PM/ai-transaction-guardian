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
      {/* Top gradient / chrome */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-gradient-to-b from-sky-500/20 via-slate-100 to-transparent" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/80 px-3 py-1 text-xs font-medium text-sky-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live risk scoring · Demo
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Transaction Guardian
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              A lightweight AI risk engine that evaluates card and ACH
              transactions in real time. Built to showcase product thinking,
              safety controls, and risk modeling.
            </p>
          </div>

          {/* Desktop only: brand badge */}
          <div className="hidden flex-col items-end text-right text-xs text-slate-400 lg:flex">
            <span className="font-medium text-slate-500">
              Portfolio prototype
            </span>
            <span>Built with React · Vite · Tailwind</span>
          </div>
        </header>

        {/* Main layout:
            - Mobile: stacked
            - Desktop: 2-column (inputs left, results right)
        */}
        <main className="flex flex-1 flex-col gap-6 lg:flex-row">
          {/* Left column – transaction form + helper copy */}
          <section className="lg:w-[46%]">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-slate-500">
                Transaction details
              </h2>
              <span className="text-xs text-slate-400 lg:hidden">
                Optimized for mobile · desktop
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur">
              <div className="border-b border-slate-100 px-4 py-3 sm:px-6">
                <p className="text-xs font-medium text-slate-500">
                  Simulate a transaction
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Try both normal purchases and suspicious merchants to see how
                  the model reacts.
                </p>
              </div>

              <form
                onSubmit={scoreTransaction}
                className="space-y-4 px-4 py-4 sm:px-6 sm:py-5"
              >
                {/* Amount */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="amount"
                    className="block text-xs font-medium text-slate-600"
                  >
                    Amount
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 shadow-inner">
                    <span className="mr-2 text-sm text-slate-400">$</span>
                    <input
                      id="amount"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      required
                      value={transaction.amount}
                      onChange={(e) =>
                        setTransaction((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-0"
                      placeholder="125.00"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Larger, unusual amounts generally increase risk.
                  </p>
                </div>

                {/* Merchant */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="merchant"
                    className="block text-xs font-medium text-slate-600"
                  >
                    Merchant / Counterparty
                  </label>
                  <input
                    id="merchant"
                    type="text"
                    required
                    value={transaction.merchant}
                    onChange={(e) =>
                      setTransaction((prev) => ({
                        ...prev,
                        merchant: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 shadow-inner focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-200"
                    placeholder='e.g. "Amazon Marketplace" or "Crypto Exchange XYZ"'
                  />
                  <p className="text-[11px] text-slate-400">
                    The model inspects merchant patterns and language to detect
                    possible scams.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 shadow-sm shadow-slate-400/40 transition hover:bg-slate-800 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {loading && (
                      <span className="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-[2px] border-slate-200 border-t-slate-900" />
                    )}
                    {loading ? "Scoring transaction..." : "Score transaction"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTransaction({ amount: "", merchant: "" });
                      setResult(null);
                      setError(null);
                    }}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Reset
                  </button>
                </div>

                {/* Helper scenarios */}
                <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-400 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      setTransaction({
                        amount: "24.99",
                        merchant: "Streaming Service Subscription",
                      })
                    }
                    className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-left transition hover:border-sky-100 hover:bg-sky-50"
                  >
                    <p className="font-medium text-slate-600">Low-risk demo</p>
                    <p>Everyday subscription-style purchase.</p>
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
                    className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-left transition hover:border-rose-50 hover:border-rose-100"
                  >
                    <p className="font-medium text-slate-600">
                      High-risk demo
                    </p>
                    <p>Language and amount suggest potential scam.</p>
                  </button>
                </div>
              </form>
            </div>

            {/* Mobile-only footer note */}
            <p className="mt-4 text-[11px] text-slate-400 lg:hidden">
              On larger screens, the risk panel moves into a dedicated analytics
              column to better mirror internal risk tooling.
            </p>
          </section>

          {/* Right column – risk analytics */}
          <section className="lg:w-[54%]">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-slate-500">
                Risk analytics
              </h2>
              <span className="hidden text-xs text-slate-400 lg:inline">
                Desktop view: dedicated analytics column
              </span>
            </div>

            <div className="flex h-full flex-col gap-4">
              {/* Main risk card */}
              <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-300/40">
                <div className="border-b border-slate-100 px-4 py-3 sm:px-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Model verdict
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Output from LLM-based risk engine running on a
                        serverless worker.
                      </p>
                    </div>
                    {result && (
                      <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-slate-50">
                        {result.verdict}
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-4 py-4 sm:px-6 sm:py-5">
                  {/* Loading state */}
                  {loading && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
                        <div className="h-6 w-40 animate-pulse rounded-full bg-slate-200" />
                      </div>
                      <div className="h-2 w-full animate-pulse rounded-full bg-slate-200" />
                      <div className="grid gap-2 sm:grid-cols-3">
                        <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                        <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                        <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                      </div>
                    </div>
                  )}

                  {/* Error state */}
                  {!loading && error && (
                    <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-3 text-xs text-rose-700">
                      {error}
                    </div>
                  )}

                  {/* Empty state */}
                  {!loading && !error && !result && (
                    <div className="space-y-3 text-sm text-slate-500">
                      <p className="font-medium text-slate-600">
                        No transaction scored yet.
                      </p>
                      <p className="text-sm text-slate-500">
                        Start by entering an amount and merchant on the left.
                        The engine will return a risk score, verdict, and
                        reasoning that you can extend with portfolio-specific
                        rules or CFPB-aligned policies later.
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-slate-500">
                        <li>Test both safe and suspicious scenarios.</li>
                        <li>
                          Use scam-like language (e.g. “urgent wire”, “crypto
                          recovery”) to see how the explanation changes.
                        </li>
                        <li>
                          This UI is intentionally structured like an internal
                          risk console a bank might use.
                        </li>
                      </ul>
                    </div>
                  )}

                  {/* Result state */}
                  {!loading && !error && result && (
                    <div className="space-y-5 text-sm">
                      {/* Score + bar */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                              Risk score
                            </p>
                            <p className="mt-1 text-2xl font-semibold text-slate-900">
                              {result.risk_score}
                              <span className="ml-1 text-sm font-normal text-slate-400">
                                / 100
                              </span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-slate-500">
                              {riskLabel(result.risk_score)}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {result.verdict}
                            </p>
                          </div>
                        </div>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
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

                        <p className="text-[11px] text-slate-400">
                          0–30: low risk, 30–70: monitor, 70–100: block or step
                          up authentication.
                        </p>
                      </div>

                      {/* Reasoning */}
                      <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                        <p className="text-xs font-medium text-slate-600">
                          Explanation
                        </p>
                        <p className="text-sm text-slate-600">
                          {result.explanation || result.reason}
                        </p>
                      </div>

                      {/* Signals */}
                      {result.signals && result.signals.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-slate-600">
                            Signals considered
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {result.signals.map((signal) => (
                              <span
                                key={signal}
                                className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200"
                              >
                                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-slate-300" />
                                {signal.replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Meta */}
                      <div className="grid gap-3 border-t border-slate-100 pt-3 text-[11px] text-slate-400 sm:grid-cols-3">
                        <div>
                          <p className="font-medium text-slate-500">
                            Model / backend
                          </p>
                          <p>
                            {result.model} on {result.backend}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-slate-500">
                            Evaluated at
                          </p>
                          <p>
                            {new Date(result.timestamp).toLocaleString(undefined,
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-slate-500">
                            Portfolio notes
                          </p>
                          <p>
                            Rules & CFPB alignment can be layered on top of this
                            scoring engine.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop-only: tiny footer */}
              <div className="hidden text-[11px] text-slate-400 lg:block">
                Designed to feel like internal risk tooling used by banks and
                payment processors. Layout intentionally diverges between mobile
                (stacked decisioning) and desktop (dual-column console).
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
