import { PERSONAS } from "./personas.js";

export const MOODS = ["tense", "warm", "hopeful", "somber", "electric"];

export function normalizeMood(mood) {
  return MOODS.includes(mood) ? mood : "neutral";
}

// Tally of only the votes revealed so far, so the meter moves as each vote lands.
export function runningTally(votes = [], revealed = 0) {
  const seen = votes.slice(0, Math.max(0, revealed));
  const out = { yes: 0, no: 0, dep: 0, total: seen.length };
  for (const v of seen) {
    if (v.v === "yes") out.yes++;
    else if (v.v === "no") out.no++;
    else out.dep++;
  }
  return out;
}

// "yes" | "no" | "depends" when one side holds a strict plurality, else null.
export function leadingSide({ yes, no, dep }) {
  const max = Math.max(yes, no, dep);
  if (max === 0) return null;
  const leaders = [yes === max, no === max, dep === max].filter(Boolean).length;
  if (leaders > 1) return null;
  return yes === max ? "yes" : no === max ? "no" : "depends";
}

export function memberStats(debate, id, shown = 0, votesShown = 0) {
  const turns = (debate?.turns || []).slice(0, shown).filter(turn => turn.p === id);
  const vote = (debate?.votes || []).slice(0, votesShown).find(v => v.p === id) || null;
  return {
    turns: turns.length,
    lastLine: turns.length ? turns[turns.length - 1].t : null,
    vote: vote ? vote.v : null,
  };
}

export function localDayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function shouldGreetToday(lastKey, now = new Date()) {
  return lastKey !== localDayKey(now);
}

// rand injected so the pick is deterministic under test.
export function pickDelight(rand = Math.random, exclude = []) {
  const pool = PERSONAS.map(p => p.id).filter(id => !exclude.includes(id));
  if (!pool.length) return null;
  return pool[Math.floor(rand() * pool.length) % pool.length];
}

export function delightDelayMs(rand = Math.random) {
  return 9000 + Math.floor(rand() * 7000);
}

export function formatQuote(quote, attribution) {
  const q = (quote || "").trim().replace(/^["“]|["”]$/g, "");
  return q ? `“${q}”\n${attribution}` : "";
}
