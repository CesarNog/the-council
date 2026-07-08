import { kvGet, kvPut } from "./_kv.js";
import { callGroq, GroqError } from "./_groq.js";
import { PERSONAS } from "../src/lib/personas.js";
import { getSessionFromRequest } from "./_session.js";
import { enforceCouncilLimit } from "./_rateLimit.js";
import { badRequest, bodyTooLarge, methodNotAllowed, safeError } from "./_http.js";
import { councilBodySchema, parseBody } from "./_validate.js";
import { isSupabaseConfigured, persistDecisionBundle, upsertProfileFromUser } from "./_supabase.js";

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


export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, "POST");
  if (bodyTooLarge(req, res)) return;

  const parsed = parseBody(councilBodySchema, req.body);
  if (!parsed.ok) return badRequest(res, parsed.detail);

  const { question: q, profile = {}, language, decisionContext: rawCtx = {} } = parsed.data;
  const decisionContext = {
    decisionCategory: rawCtx.decisionCategory || "",
    emotionalWeight: rawCtx.emotionalWeight || "",
    mainFear: rawCtx.mainFear || "",
  };

  // validate optional persona selection (premium feature — reduces token usage; not in schema, extracted manually)
  const rawPersonaIds = req.body?.personaIds;
  const selectedIds = Array.isArray(rawPersonaIds)
    ? rawPersonaIds.filter(id => VALID_IDS.has(id))
    : null;
  const activePersonas = selectedIds?.length >= 3 ? selectedIds : null;

  let history = [];
  let sessionUser = null;
  const session = getSessionFromRequest(req);
  if (session) {
    const raw = await kvGet(`user:${session.sub}`).catch(() => null);
    sessionUser = raw ? JSON.parse(raw) : null;
    history = (sessionUser?.debateHistory || []).slice(0, 3);
  }

  if (!(await enforceCouncilLimit(req, res, session, sessionUser))) return;

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
      return safeError(res, statusByKind[e.kind] || 502, e.kind, e.detail);
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

  if (isSupabaseConfigured()) {
    const profileRow = sessionUser
      ? await upsertProfileFromUser({ sub: session.sub, ...sessionUser }).catch(() => null)
      : null;
    persistDecisionBundle({
      userId: profileRow?.id || null,
      question: q,
      language,
      decisionContext,
      debate: json,
      publicSlug: id,
    }).catch(e => console.error("council: supabase persist failed", e.message));
  }

  return res.status(200).json({ id, ...json });
}
