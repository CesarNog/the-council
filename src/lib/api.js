import { byId } from "./personas.js";

export async function summonCouncil(question, profile, language, decisionContext, personaIds) {
  const res = await fetch("/api/council", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, profile, language, decisionContext, ...(personaIds?.length >= 3 ? { personaIds } : {}) }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || "council unreachable");
    err.kind = res.status === 429 ? "rate_limited" : (body.error || "unreachable");
    if (body.retryAfter) err.retryAfter = body.retryAfter;
    throw err;
  }
  const json = await res.json();
  if (!Array.isArray(json.turns) || !Array.isArray(json.votes) || !json.verdict) throw new Error("bad shape");
  json.turns = json.turns.filter(t => byId[t.p] && t.t);
  json.votes = json.votes.filter(v => byId[v.p]);
  return json;
}

