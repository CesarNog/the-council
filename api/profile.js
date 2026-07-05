import { kvGet, kvPut } from "./_kv.js";
import { requireUser } from "./auth.js";
import { callGroq, GroqError } from "./_groq.js";

const MAX_PICTURE_BYTES = 300_000; // client-side resize deveria manter bem abaixo disso; isto e o teto duro
const LIFE_MODE_GAP_MS = 12 * 60 * 60 * 1000; // 12h — Council "percebe" que voce sumiu

const buildLifeModePrompt = (user) => `One member of The Council (nine alternate selves: founder, billionaire, artist, athlete, monk, scientist, explorer, romantic, shadow) spontaneously starts a short exchange with ${user.name}, who they haven't spoken to in a while. Context: ${user.situation || "unknown"}. Values: ${(user.values || []).join(", ") || "unknown"}.

Pick ONE persona whose voice fits what might be on their mind. Return ONLY JSON:
{"persona":"artist","teaser":"...","turns":[{"p":"artist","t":"..."}]}

Rules:
- teaser: one short line, second person, intriguing, under 14 words.
- turns: 2 to 4 short lines continuing the thought, in-voice per persona fingerprint. May include a second persona jumping in.
- Do not resolve anything or ask a big life question — this is a passing thought, not a debate.
- Same language ${user.situation ? "as the context above" : "as English"}.`;

async function maybeGenerateLifeMode(user) {
  const now = Date.now();
  const gap = now - (user.lastVisit || 0);
  const stale = user.lastVisit && gap > LIFE_MODE_GAP_MS;
  const updated = { ...user, lastVisit: now };

  if (!stale) return updated;

  try {
    const moment = await callGroq(buildLifeModePrompt(user), { maxTokens: 500, timeoutMs: 6000 });
    if (moment?.teaser && Array.isArray(moment.turns)) {
      updated.lifeMode = { ...moment, generatedAt: now };
    }
  } catch (e) {
    console.error("profile: life mode generation failed", e instanceof GroqError ? e.kind : e.message);
    // sem life mode nesta visita nao e erro fatal — perfil normal continua funcionando
  }
  return updated;
}

export default async function handler(req, res) {
  const auth = await requireUser(req, res);
  if (!auth) return; // requireUser ja escreveu a resposta 401

  if (req.method === "GET") {
    const updated = await maybeGenerateLifeMode(auth.user);
    kvPut(`user:${auth.sub}`, JSON.stringify(updated)).catch(e => console.error("profile: kv put failed", e.message));
    return res.status(200).json(updated);
  }

  if (req.method === "PATCH") {
    const { situation, values, picture, dismissLifeMode, recordDebate } = req.body ?? {};
    const next = { ...auth.user };

    if (situation !== undefined) {
      if (typeof situation !== "string" || situation.length > 200) return res.status(400).json({ error: "invalid situation" });
      next.situation = situation.trim();
    }
    if (values !== undefined) {
      if (!Array.isArray(values) || values.length > 3 || values.some(v => typeof v !== "string")) {
        return res.status(400).json({ error: "invalid values" });
      }
      next.values = values;
    }
    if (picture !== undefined) {
      if (picture !== null) {
        if (typeof picture !== "string" || !picture.startsWith("data:image/") || picture.length > MAX_PICTURE_BYTES) {
          return res.status(400).json({ error: "invalid picture" });
        }
      }
      next.customPicture = picture;
    }
    if (dismissLifeMode) next.lifeMode = null;

    if (recordDebate?.id && recordDebate?.question) {
      const entry = {
        id: recordDebate.id,
        question: String(recordDebate.question).slice(0, 300),
        verdict: String(recordDebate.verdict || "").slice(0, 500),
        mood: recordDebate.mood || null,
        unanimousVote: recordDebate.unanimousVote === "yes" || recordDebate.unanimousVote === "no" ? recordDebate.unanimousVote : null,
        at: Date.now(),
      };
      next.debateHistory = [entry, ...(next.debateHistory || [])].slice(0, 10);
      if (entry.unanimousVote) {
        next.eclipses = [entry, ...(next.eclipses || [])].slice(0, 50);
      }
    }

    await kvPut(`user:${auth.sub}`, JSON.stringify(next));
    return res.status(200).json(next);
  }

  return res.status(405).json({ error: "method not allowed" });
}
