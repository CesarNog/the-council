export class GroqError extends Error {
  constructor(kind, detail) {
    super(kind);
    this.kind = kind; // "timeout" | "network_error" | "rate_limited" | "gateway_error" | "truncated_response" | "unparseable_response"
    this.detail = detail;
  }
}

export async function callGroq(prompt, { maxTokens = 1700, timeoutMs = 9000, systemMessage } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs); // plano hobby corta funcao em 10s

  const messages = [
    ...(systemMessage ? [{ role: "system", content: systemMessage }] : []),
    { role: "user", content: prompt },
  ];

  let r;
  try {
    r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b", // free tier; llama-3.3-70b-versatile esta sendo depreciado pela Groq
        max_tokens: maxTokens,
        reasoning_effort: "low", // reasoning tokens consomem max_tokens antes do content
        response_format: { type: "json_object" },
        messages,
      }),
    });
  } catch (e) {
    throw new GroqError(e.name === "AbortError" ? "timeout" : "network_error", e.message);
  } finally {
    clearTimeout(timeout);
  }

  if (!r.ok) {
    const detail = await r.text();
    throw new GroqError(r.status === 429 ? "rate_limited" : "gateway_error", detail.slice(0, 300));
  }

  const data = await r.json();
  const choice = data.choices?.[0];
  const text = choice?.message?.content ?? "";
  if (choice?.finish_reason === "length") {
    throw new GroqError("truncated_response", `response cut short at ${text.length} chars — increase max_tokens or shorten prompt`);
  }
  try {
    const raw = text.replace(/```json|```/g, "").trim();
    return JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
  } catch (e) {
    throw new GroqError("unparseable_response", text.slice(0, 300));
  }
}
