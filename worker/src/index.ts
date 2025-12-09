export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "POST only" }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    try {
      const body = await request.json();

      if (!body || !body.transaction) {
        return new Response(JSON.stringify({ error: "Missing transaction payload" }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }

      const completion = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content: "You are a transaction risk scoring model. Return ONLY valid JSON: {\"risk_score\": number, \"reason\": string, \"signals\": []}"
            },
            {
              role: "user",
              content: "Score this transaction: " + JSON.stringify(body.transaction)
            }
          ]
        })
      });

      if (!completion.ok) {
        const detail = await completion.text();
        return new Response(
          JSON.stringify({
            error: "Groq API error",
            status: completion.status,
            detail
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }

      const groqResponse = await completion.json();

      return new Response(JSON.stringify(groqResponse), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          error: "Worker crashed",
          detail: err.message
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }
  }
};