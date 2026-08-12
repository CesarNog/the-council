import { z } from "zod";

export const LANGUAGES = ["en", "pt", "es", "zh"];
export const RESULT_ID = /^[a-z0-9]{6,16}$/i;

const profileSchema = z.object({
  name: z.string().max(80).optional(),
  situation: z.string().max(200).optional(),
  values: z.array(z.string().max(40)).max(3).optional(),
}).optional();

const decisionContextSchema = z.object({
  decisionCategory: z.string().max(60).optional().default(""),
  emotionalWeight: z.string().max(60).optional().default(""),
  mainFear: z.string().max(200).optional().default(""),
  // Deep Council (optional structured intake) — all omitted on the Quick path
  options: z.array(z.string().max(80)).max(2).optional().default([]),
  constraints: z.string().max(200).optional().default(""),
  deadline: z.string().max(30).optional().default(""),
  reversible: z.string().max(30).optional().default(""),
  costOfWaiting: z.string().max(30).optional().default(""),
  successPicture: z.string().max(300).optional().default(""),
  known: z.string().max(300).optional().default(""),
  unknown: z.string().max(300).optional().default(""),
}).optional();

export const councilBodySchema = z.object({
  question: z.string().trim().min(1).max(500),
  profile: profileSchema,
  language: z.enum(LANGUAGES).optional(),
  decisionContext: decisionContextSchema,
});

export const authBodySchema = z.object({
  credential: z.string().min(20),
});

export const ttsBodySchema = z.object({
  text: z.string().trim().min(1).max(2000),
  persona: z.enum([
    "founder", "billionaire", "artist", "athlete", "monk",
    "scientist", "explorer", "romantic", "shadow",
  ]).optional(),
});

export const profilePatchSchema = z.object({
  situation: z.string().max(200).optional(),
  values: z.array(z.string().max(40)).max(3).optional(),
  picture: z.union([z.string().startsWith("data:image/").max(300_000), z.null()]).optional(),
  dismissLifeMode: z.boolean().optional(),
  recordDebate: z.object({
    id: z.string().max(20),
    question: z.string().max(300),
    verdict: z.string().max(500).optional(),
    mood: z.string().max(40).optional(),
    unanimousVote: z.enum(["yes", "no"]).optional(),
  }).optional(),
}).strict();

// User-supplied dilemma text is embedded in the council prompt as DATA inside a
// fenced <<<SEEKER>>> block. Neutralize anything that could break out of that
// fence or smuggle control characters, so a dilemma can't be turned into
// orchestration instructions (prompt injection). Conservative: it only strips
// structural attack surface, not ordinary prose or punctuation.
// eslint-disable-next-line no-control-regex -- matching control chars is the point: strip them from untrusted input
const CONTROL_CHARS = new RegExp("[\\u0000-\\u001F\\u007F]+", "g");
const FENCE_MARKERS = /<<<\s*\/?\s*(?:SEEKER|END\s+SEEKER)\s*>>>/gi;
export function sanitizeSeekerText(s) {
  return String(s ?? "")
    .replace(CONTROL_CHARS, " ")
    .replace(FENCE_MARKERS, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const DEBATE_MOODS = ["tense", "warm", "hopeful", "somber", "electric"];
const VOTE_VALUES = ["yes", "no", "depends"];
const CONFIDENCE_LEVELS = ["low", "medium", "high"];

// AI Response Contract V2 adds votes[].condition, synthesis{}, and protocol{}
// on top of the V1 shape (which had a single top-level `verdict` string and no
// condition field). Stored/shared V1 results are re-served verbatim from KV
// (see api/result.js) and never re-enter this function, so no migration step
// is needed there — this adapter only has to accept EITHER shape from a fresh
// model response and always normalize to the same superset: `verdict` stays a
// top-level string either way (so every existing consumer that reads
// debate.verdict keeps working unchanged), and `synthesis`/`protocol` are only
// present when the source data actually had them.
function normalizeSynthesis(raw, verdictFallback) {
  const str = (v) => (typeof v === "string" ? v.trim() : "");
  const strList = (v, max) => (Array.isArray(v) ? v.map(str).filter(Boolean).slice(0, max) : []);
  if (!raw || typeof raw !== "object") return null;
  const verdict = str(raw.verdict) || verdictFallback;
  if (!verdict) return null;
  return {
    verdict,
    assumptions: strList(raw.assumptions, 3),
    unknowns: strList(raw.unknowns, 3),
    dissent: str(raw.dissent) || null,
    confidence: CONFIDENCE_LEVELS.includes(raw.confidence) ? raw.confidence : "medium",
  };
}

function normalizeProtocol(raw) {
  const str = (v) => (typeof v === "string" ? v.trim() : "");
  if (!raw || typeof raw !== "object") return null;
  const next48Hours = str(raw.next48Hours);
  const experiment = str(raw.experiment);
  const checkpoint = str(raw.checkpoint);
  const stopCondition = str(raw.stopCondition);
  // partial protocol is worse than none — a half-filled "next steps" panel
  // reads as broken UI, so require all four fields or omit the block entirely
  if (!next48Hours || !experiment || !checkpoint || !stopCondition) return null;
  return { next48Hours, experiment, checkpoint, stopCondition };
}

// Validate and gracefully repair a raw model debate before it is persisted or
// rendered. gpt-oss-120b at reasoning_effort:low is non-deterministic and
// occasionally emits malformed turns/votes, an out-of-enum mood, a missing
// quote, or a duplicated/invented persona (see api/council.js). Rather than
// trust or render that, drop what is malformed and keep what is sound.
// Returns null when the result can't meet a minimum viable shape (the caller
// then surfaces a recoverable error instead of a broken debate).
export function normalizeDebate(raw, allowedIds) {
  if (!raw || typeof raw !== "object") return null;
  const allowed = allowedIds instanceof Set ? allowedIds : new Set(allowedIds || []);
  const isId = (p) => typeof p === "string" && allowed.has(p);
  const str = (v) => (typeof v === "string" ? v.trim() : "");

  const turns = Array.isArray(raw.turns)
    ? raw.turns.filter(t => t && isId(t.p) && str(t.t)).map(t => ({ p: t.p, t: t.t.trim() }))
    : [];

  const seen = new Set();
  const votes = Array.isArray(raw.votes)
    ? raw.votes
        .filter(v => v && isId(v.p) && VOTE_VALUES.includes(v.v) && !seen.has(v.p) && (seen.add(v.p), true))
        .map(v => {
          const r = str(v.r);
          // a "depends" vote without a named condition is not actionable —
          // repair with the vote's own reason rather than drop the vote
          const condition = v.v === "depends" ? (str(v.condition) || r || "needs more context") : null;
          return { p: v.p, v: v.v, r, condition };
        })
    : [];

  // V2: model returns synthesis.verdict. V1 (and any legacy stored shape):
  // top-level verdict string. Either way this normalizes to the same
  // top-level `verdict` field so downstream consumers never have to branch.
  const synthesis = normalizeSynthesis(raw.synthesis, str(raw.verdict));
  const verdict = synthesis?.verdict || str(raw.verdict);

  // minimum viable debate: it has to read as a debate with a conclusion
  if (turns.length < 2 || votes.length < 1 || !verdict) return null;

  const protocol = normalizeProtocol(raw.protocol);

  const realities = Array.isArray(raw.realities)
    ? raw.realities.filter(r => r && str(r.label) && str(r.line)).slice(0, 3)
        .map(r => ({ label: r.label.trim(), line: r.line.trim() }))
    : [];

  const memoryEcho = raw.memoryEcho && isId(raw.memoryEcho.persona) && str(raw.memoryEcho.line)
    ? { persona: raw.memoryEcho.persona, line: raw.memoryEcho.line.trim() }
    : null;

  return {
    mood: DEBATE_MOODS.includes(raw.mood) ? raw.mood : "tense",
    turns,
    votes,
    verdict,
    ...(synthesis ? { synthesis } : {}),
    ...(protocol ? { protocol } : {}),
    // quote must be a real line the reader can screenshot — fall back to the
    // longest turn rather than shipping an empty or fabricated one
    quote: str(raw.quote) || turns.reduce((a, b) => (b.t.length > a.length ? b.t : a), ""),
    question: str(raw.question),
    realities,
    memoryEcho,
  };
}

export function parseBody(schema, body) {
  const result = schema.safeParse(body ?? {});
  if (!result.success) {
    const detail = result.error.issues.map(i => i.path.join(".") || "body").join(", ");
    return { ok: false, detail: `validation failed: ${detail}` };
  }
  return { ok: true, data: result.data };
}

export function parseResultId(raw) {
  const id = String(raw || "").replace(/[^a-z0-9]/gi, "");
  if (!id || !RESULT_ID.test(id)) return null;
  return id;
}
