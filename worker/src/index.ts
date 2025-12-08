export interface Env {
  GROQ_API_KEY: string;
  MODEL_NAME: string;
}

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
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
      return new Response(JSON.stringify({ error: "Use POST only" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const transaction = body.transaction;
    if (!transaction || typeof transaction !== "object") {
      return new Response(JSON.stringify({ error: "Missing 'transaction' object" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const prompt = `
You are an AI financial fraud detection engine. Analyze the following transaction and respond ONLY with valid JSON.

Transaction:
${JSON.stringify(transaction, null, 2)}

Respond with exactly:
{
  "risk_score": <0-100>,
  "reason": "<short explanation>",
  "signals": ["signal1", "signal2"]
}
`;

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.MODEL_NAME,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
        }),
      }
    );

    if (!groqRes.ok) {
      const text = await groqRes.text();
      return new Response(JSON.stringify({ error: "Groq error", details: text }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const data = await groqRes.json();
    const content = data?.choices?.[0]?.message?.content ?? "";

    const cleaned = content
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        risk_score: 50,
        reason: "Model returned invalid JSON.",
        signals: [],
        raw: cleaned,
      };
    }

    const responsePayload = {
      ...parsed,
      model: env.MODEL_NAME,
      backend: "groq",
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  },
};
