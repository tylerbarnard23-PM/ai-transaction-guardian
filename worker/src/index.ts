export interface Env {
  GROQ_API_KEY: string;
  MODEL_NAME?: string;
}

const FALLBACK_MODEL = "openai/gpt-oss-20b";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(
  payload: unknown,
  status: number,
  origin: string | null
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

async function requestGroq(
  apiKey: string,
  model: string,
  prompt: string
): Promise<Response> {
  return fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_completion_tokens: 500,
      response_format: { type: "json_object" },
    }),
  });
}

function shouldRetryWithFallback(status: number, details: string): boolean {
  if ([400, 404, 410].includes(status)) return true;

  const normalized = details.toLowerCase();
  return (
    normalized.includes("model") &&
    (normalized.includes("deprecated") ||
      normalized.includes("decommission") ||
      normalized.includes("not found") ||
      normalized.includes("does not exist"))
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Use POST only" }, 405, origin);
    }

    if (!env.GROQ_API_KEY) {
      return jsonResponse(
        { error: "Worker configuration error", details: "Missing GROQ_API_KEY secret." },
        500,
        origin
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, 400, origin);
    }

    const transaction = body?.transaction;
    if (!transaction || typeof transaction !== "object") {
      return jsonResponse(
        { error: "Missing 'transaction' object" },
        400,
        origin
      );
    }

    const prompt = `
You are an AI financial fraud detection engine. Analyze the following transaction and respond ONLY with valid JSON.

Transaction:
${JSON.stringify(transaction, null, 2)}

Respond with exactly:
{
  "risk_score": <integer from 0-100>,
  "reason": "<short plain-English explanation>",
  "signals": ["signal1", "signal2"]
}
`;

    const configuredModel = env.MODEL_NAME?.trim() || FALLBACK_MODEL;
    let modelUsed = configuredModel;
    let groqRes: Response;

    try {
      groqRes = await requestGroq(env.GROQ_API_KEY, configuredModel, prompt);

      if (!groqRes.ok && configuredModel !== FALLBACK_MODEL) {
        const firstError = await groqRes.clone().text();

        if (shouldRetryWithFallback(groqRes.status, firstError)) {
          modelUsed = FALLBACK_MODEL;
          groqRes = await requestGroq(env.GROQ_API_KEY, FALLBACK_MODEL, prompt);
        }
      }
    } catch (error) {
      return jsonResponse(
        {
          error: "Groq request failed",
          details: error instanceof Error ? error.message : "Unknown network error",
        },
        502,
        origin
      );
    }

    if (!groqRes.ok) {
      const details = await groqRes.text();
      return jsonResponse(
        {
          error: "Groq error",
          status: groqRes.status,
          model: modelUsed,
          details,
        },
        502,
        origin
      );
    }

    const data: any = await groqRes.json();
    const content = data?.choices?.[0]?.message?.content ?? "";

    const cleaned = content
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        risk_score: 50,
        reason: "The model response could not be parsed, so this transaction needs manual review.",
        signals: [],
      };
    }

    const numericScore = Number(parsed?.risk_score);
    const riskScore = Number.isFinite(numericScore)
      ? Math.max(0, Math.min(100, Math.round(numericScore)))
      : 50;

    const verdict =
      riskScore < 30
        ? "Approve"
        : riskScore < 70
          ? "Review"
          : "Decline / investigate";

    const reason =
      typeof parsed?.reason === "string" && parsed.reason.trim()
        ? parsed.reason.trim()
        : "No model explanation was returned.";

    const responsePayload = {
      ...parsed,
      risk_score: riskScore,
      reason,
      explanation: reason,
      verdict,
      signals: Array.isArray(parsed?.signals) ? parsed.signals : [],
      model: modelUsed,
      backend: "groq",
      timestamp: new Date().toISOString(),
    };

    return jsonResponse(responsePayload, 200, origin);
  },
};
