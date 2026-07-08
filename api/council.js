import { kvGet, kvPut } from "./_kv.js";
import { callGroq, GroqError } from "./_groq.js";
import { PERSONAS } from "../src/lib/personas.js";
import { getSessionFromRequest } from "./_session.js";

const VALID_IDS = new Set(PERSONAS.map(p => p.id));

const LANGUAGE_NAMES = { en: "English", pt: "Brazilian Portuguese", es: "Spanish", zh: "Simplified Chinese" };

const buildPrompt = (question, profile = {}, language, history = [], ctx = {}, activePersonas = null) => `You are the orchestrator of The Council: nine alternate versions of one person, debating their real decision around a dark round table. This must read like nine distinct, opinionated humans — not nine flavors of the same assistant.

Voice fingerprints (violate these and the persona is unrecognizable — that is a failure):
- founder: short imperative sentences (under 16 words). Startup jargon. Impatient, interrupts others mid-thought.
- billionaire: measured, unhurried. Market/portfolio analogies. Dry one-liners. Concedes points gracefully when beaten on logic.
- artist: long flowing sentences (up to 32 words), metaphor-heavy, sometimes trails off with "...". Emotionally exposed.
- athlete: clipped coach cadence. Sports metaphors. Zero patience for excuses. Commands, doesn't suggest.
- monk: soft, mostly questions, often opens with a pause ("..."). Never raises the tone. Speaks to de-escalate.
- scientist: precise, cites rates/probabilities like a study. Corrects sloppy logic from anyone, mildly condescending, never cruel.
- explorer: casual, playful, "what if" framing. Sometimes breaks tension with a joke. Contrarian for the sake of new angles.
- romantic: warm, second-person ("you and..."), asks who else is affected. Occasionally visibly moved.
- shadow: short, cutting, uncomfortably specific about ${profile.name || "the seeker"}. Never loud — lands hard by being quiet and precise. Sometimes states something that quietly foreshadows the verdict.

Baseline relationship dynamics — bake these into who agrees, interrupts, or challenges whom:
- founder and billionaire mostly align but bicker over speed vs patience.
- artist and billionaire clash over meaning vs money.
- monk de-escalates shadow's provocations without dismissing them.
- scientist challenges weak logic from anyone, especially founder and artist.
- explorer occasionally sides unexpectedly with shadow or monk, surprising the room.

The person: ${profile.name || "the seeker"}. Context: ${profile.situation || "unknown"}. Values most: ${(profile.values || []).join(", ") || "unknown"}.${ctx.decisionCategory ? ` Decision type: ${ctx.decisionCategory}.` : ""}${ctx.emotionalWeight ? ` Weight on them: ${ctx.emotionalWeight}.` : ""}${ctx.mainFear ? ` What holds them back: ${ctx.mainFear}.` : ""}
Their question: "${question}"
${history.length > 0 ? `
Past matters this person already brought to the Council (most recent first) — reference ONE only if it is genuinely relevant to today's question, never force it, never reference more than one:
${history.map(h => `- "${h.question}" → ${h.verdict}`).join("\n")}
` : ""}
Return ONLY valid JSON, no markdown fences, exactly this shape:
{"mood":"tense|warm|hopeful|somber|electric","turns":[{"p":"founder","t":"..."}],"votes":[{"p":"founder","v":"yes","r":"..."}],"verdict":"...","quote":"...","question":"...","realities":[{"label":"...","line":"..."}],"memoryEcho":null}

Rules:
- 12 to 14 turns. Each turn respects its persona's sentence-length fingerprint above.
- At least one direct interruption (stage directions like "—Founder cuts in—" are banned; interrupt through content only — one persona calls out another mid-thought by name).
- At least one callback that quotes or paraphrases an earlier turn by name ("As Artist just said...").
- At least one persona visibly changes their mind mid-debate because of another's argument.
- Personas must clash directly at least three times, naming each other.
- shadow must say something uncomfortably true and specific about ${profile.name || "the seeker"} — not generic.
- Include exactly one moment of dry humor.
- mood: the emotional temperature of the whole debate, single word from the enum above.
- All nine personas vote: v is "yes", "no" or "depends"; r is one short reason (max 12 words), consistent with that persona's fingerprint.
- verdict: 2 sentences, second person, synthesizing the tension — never commanding.
- quote: the single most quotable line from the debate, verbatim from one of the turns — the line a reader would screenshot.
- question: one probing question back at the person.
- realities: exactly 3 entries. Each imagines a plausible alternate path the person could take relative to this decision (not fantasy). label: 2-4 words, e.g. "The Safe Path". line: one vivid sentence, second person, what that path would probably look like one year from now. Grounded, not mystical.
- memoryEcho: null unless a past matter above is genuinely relevant to today's question — if the topics clearly overlap (same decision, same fear, same person involved), you should surface it: {"persona":"monk","line":"one short in-voice sentence naturally referencing that past matter and asking how the person feels about it now"}. If there is no past matter listed above, or none overlaps, leave it null.
- Write EVERY word — turns, votes (v and r), verdict, quote, question, realities — in ${language && LANGUAGE_NAMES[language] ? LANGUAGE_NAMES[language] : "the same language as the person's question"}. Do not slip into English.${activePersonas ? `
- COUNCIL COMPOSITION: Only these ${activePersonas.length} personas are present at this session: ${activePersonas.join(", ")}. No other persona may appear in turns or votes. The votes array must have exactly ${activePersonas.length} entries (one per active persona). Adjust clashes and callbacks to only reference active personas.` : ""}`;

const RATE_LIMIT = 3;      // requests — teto real e o TPM=8000/min compartilhado pela org inteira na Groq, nao por IP; isto so mitiga abuso de um unico IP, nao concorrencia entre usuarios diferentes
const RATE_WINDOW = 60000; // ms — best-effort: KV eventually consistent, nao atomico, sob concorrencia alta pode passar um pouco do limite

async function checkRateLimit(ip) {
  const key = `rl:${ip}`;
  const raw = await kvGet(key).catch(() => null);
  const now = Date.now();
  let state = raw ? JSON.parse(raw) : { c: 0, t: now };
  if (now - state.t > RATE_WINDOW) state = { c: 0, t: now };
  if (state.c >= RATE_LIMIT) {
    return { allowed: false, retryAfter: Math.ceil((state.t + RATE_WINDOW - now) / 1000) };
  }
  state.c += 1;
  await kvPut(key, JSON.stringify(state), 120).catch(() => {}); // falha de escrita nao bloqueia a requisicao
  return { allowed: true };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
  const { question, profile, language, decisionContext: rawCtx, personaIds: rawPersonaIds } = req.body ?? {};
  const decisionContext = rawCtx && typeof rawCtx === "object"
    ? {
        decisionCategory: String(rawCtx.decisionCategory || "").slice(0, 60),
        emotionalWeight: String(rawCtx.emotionalWeight || "").slice(0, 60),
        mainFear: String(rawCtx.mainFear || "").slice(0, 200),
      }
    : {};
  if (!question || typeof question !== "string") return res.status(400).json({ error: "invalid question" });
  const q = question.trim();
  if (!q || q.length > 500) return res.status(400).json({ error: "invalid question" });

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
  const { allowed, retryAfter } = await checkRateLimit(ip).catch(() => ({ allowed: true })); // KV fora do ar nao deve derrubar o produto
  if (!allowed) return res.status(429).json({ error: "rate_limited", detail: "too many questions, slow down", retryAfter });

  // validate optional persona selection (premium feature — reduces token usage)
  const selectedIds = Array.isArray(rawPersonaIds)
    ? rawPersonaIds.filter(id => VALID_IDS.has(id))
    : null;
  const activePersonas = selectedIds?.length >= 3 ? selectedIds : null;

  let history = [];
  const session = getSessionFromRequest(req);
  if (session) {
    const raw = await kvGet(`user:${session.sub}`).catch(() => null);
    const user = raw ? JSON.parse(raw) : null;
    history = (user?.debateHistory || []).slice(0, 3);
  }

  const targetLang = LANGUAGE_NAMES[language];
  const systemMessage = targetLang
    ? `You MUST write ALL content in ${targetLang}. Every single word in the JSON output — turns, votes, verdict, quote, question, realities — must be in ${targetLang}. Using English when ${targetLang} is requested is a critical failure.`
    : null;

  let json;
  try {
    json = await callGroq(buildPrompt(q, profile, language, history, decisionContext, activePersonas), { maxTokens: 2300, systemMessage });
  } catch (e) {
    if (e instanceof GroqError) {
      console.error("council:", e.kind, e.detail);
      const statusByKind = { timeout: 504, network_error: 504, rate_limited: 429, gateway_error: 502, unparseable_response: 502, truncated_response: 502 };
      return res.status(statusByKind[e.kind] || 502).json({ error: e.kind, detail: e.detail });
    }
    throw e;
  }

  if (!Array.isArray(json.turns) || !Array.isArray(json.votes) || !json.verdict) {
    console.error("council: bad shape", JSON.stringify(json).slice(0, 300));
    return res.status(502).json({ error: "unparseable_response" });
  }

  // modelo ocasionalmente inventa/duplica persona (nao-determinismo com reasoning_effort:low) — observado em producao
  const allowedIds = activePersonas ? new Set(activePersonas) : VALID_IDS;
  json.turns = json.turns.filter(turn => allowedIds.has(turn.p));
  const seen = new Set();
  json.votes = json.votes.filter(v => allowedIds.has(v.p) && !seen.has(v.p) && (seen.add(v.p), true));
  if (json.memoryEcho && !allowedIds.has(json.memoryEcho.persona)) json.memoryEcho = null;

  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  kvPut(`result:${id}`, JSON.stringify({ asked: q, ...json }), 60 * 60 * 24 * 30) // 30 dias, best-effort
    .catch(e => console.error("council: persist failed", e.message));

  return res.status(200).json({ id, ...json });
}
