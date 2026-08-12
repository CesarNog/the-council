import { PERSONAS } from "./personas.js";
import { t, personaName } from "./i18n.js";

export function tally(debate) {
  const yes = debate.votes.filter(v => v.v === "yes").length;
  const no = debate.votes.filter(v => v.v === "no").length;
  const dep = debate.votes.length - yes - no;
  return { yes, no, dep };
}

export function councilHeadline(debate, language = "en") {
  const { yes, no, dep } = tally(debate);
  const total = debate.votes.length;
  if (yes === total) return t(language, "every_agreed_go");
  if (no === total) return t(language, "every_agreed_dont");
  const outlier = total - Math.max(yes, no) === 1
    ? debate.votes.find(v => (yes > no ? v.v !== "yes" : v.v !== "no"))
    : null;
  if (outlier) return t(language, "only_x_disagreed", personaName(language, outlier.p));

  // No depends votes in play: a clean two-way score is accurate on its own.
  if (dep === 0) {
    if (Math.abs(yes - no) <= 1) return t(language, "split_middle");
    return yes > no ? t(language, "leans_yes", yes, no) : t(language, "leans_no", no, yes);
  }

  // Depends votes are numerically significant here (e.g. 4 yes / 3 depends /
  // 2 no) — a two-number "leans yes, 4–2" score is mathematically incomplete
  // and erases a third of the room. Always name all three counts and call the
  // result divided rather than a decisive win.
  if (yes === no) return t(language, "divided_tied", yes, no, dep);
  const top = Math.max(yes, no, dep);
  if (top === dep) return t(language, "divided_depends_lead", dep, yes, no);
  return yes > no
    ? t(language, "divided_leans_yes", yes, dep, no)
    : t(language, "divided_leans_no", no, dep, yes);
}

export function siteUrl(origin) {
  const env = typeof import.meta !== "undefined" ? import.meta.env?.VITE_SITE_URL : undefined;
  return origin || env || (typeof window !== "undefined" ? window.location.origin : "https://the-council-murex.vercel.app");
}

export function shareUrl(id, origin) {
  const base = siteUrl(origin);
  return id ? `${base}/r/${id}` : base;
}

export async function copyLink(url) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(url);
    return true;
  }
  return false;
}

// redact: true swaps the seeker's verbatim question and personalized verdict
// for a generic placeholder, keeping only the headline + tally — the part
// that's genuinely shareable without exposing what was actually asked. This
// only changes the text/card being generated here; it does NOT change what
// the linked /r/:id page itself shows (see the share preview UI in
// components.jsx, which is explicit about that distinction).
export function shareText(question, debate, { max, language = "en", redact = false } = {}) {
  const { yes, no, dep } = tally(debate);
  const headline = councilHeadline(debate, language);
  const lYes = t(language, "share_yes");
  const lNo = t(language, "share_no");
  const lDep = t(language, "share_depends");
  const tagline = t(language, "share_tagline");
  const tallyLine = `${lYes} ${yes} · ${lNo} ${no} · ${lDep} ${dep}`;
  const displayQuestion = redact ? t(language, "share_redacted_question") : question;
  if (redact) {
    return `⚖️ ${headline.toUpperCase()}\n\n"${displayQuestion}"\n\n${tallyLine}\n\n${tagline}`;
  }
  // quote appears before tally so the punchy line grabs attention first
  const quoteLine = debate.quote ? `\n\n"${debate.quote}"` : "";
  const full = `⚖️ ${headline.toUpperCase()}\n\n"${displayQuestion}"${quoteLine}\n\n${tallyLine}\n\n${debate.verdict}\n\n${tagline}`;
  if (!max || full.length <= max) return full;
  const shortPrefix = `⚖️ ${t(language, "share_ruled")}\n\n"${displayQuestion}"\n\n${tallyLine}\n\n`;
  const room = max - shortPrefix.length;
  const shortVerdict = debate.verdict.length > room ? debate.verdict.slice(0, Math.max(room, 0)) + "…" : debate.verdict;
  return `${shortPrefix}${shortVerdict}`;
}

const VOTE_COLORS = { yes: "#C9A96E", no: "#8B3A3A", depends: "rgba(237,232,222,.35)" };

export const CARD_FORMATS = {
  square: { width: 1080, height: 1080, label: "Square" },
  story: { width: 1080, height: 1920, label: "Story" },
  landscape: { width: 1200, height: 630, label: "Landscape" },
};

export function downloadShareCard(question, debate, language = "en", format = "square", redact = false) {
  const displayQuestion = redact ? t(language, "share_redacted_question") : question;
  const dims = CARD_FORMATS[format] || CARD_FORMATS.square;
  const W = dims.width, H = dims.height;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d");

  x.fillStyle = "#0B0A12"; x.fillRect(0, 0, W, H);
  const g = x.createRadialGradient(W / 2, 0, 80, W / 2, 0, 900);
  g.addColorStop(0, "rgba(201,169,110,.14)"); g.addColorStop(1, "rgba(201,169,110,0)");
  x.fillStyle = g; x.fillRect(0, 0, W, H);

  // Persona ring — dots colored by vote outcome
  x.strokeStyle = "rgba(201,169,110,.35)"; x.lineWidth = 2;
  x.beginPath(); x.arc(W / 2, 240, 120, Math.PI * 0.75, Math.PI * 2.25); x.stroke();
  const voteMap = Object.fromEntries(debate.votes.map(v => [v.p, v.v]));
  PERSONAS.forEach((p, i) => {
    const a = -Math.PI / 2 + (i / 9) * Math.PI * 2;
    const vote = voteMap[p.id] || "depends";
    const dotColor = VOTE_COLORS[vote] || p.color;
    x.fillStyle = dotColor;
    x.beginPath(); x.arc(W / 2 + Math.cos(a) * 120, 240 + Math.sin(a) * 120, vote === "yes" ? 9 : 7, 0, Math.PI * 2); x.fill();
  });

  const wrap = (text, font, maxW) => {
    x.font = font;
    const words = text.split(" "); const lines = []; let cur = "";
    for (const w of words) {
      const candidate = cur ? cur + " " + w : w;
      if (x.measureText(candidate).width > maxW && cur) { lines.push(cur); cur = w; } else cur = candidate;
    }
    if (cur) lines.push(cur);
    return lines;
  };

  x.fillStyle = "#C9A96E"; x.font = "500 22px 'JetBrains Mono', monospace";
  x.textAlign = "center"; x.letterSpacing = "10px";
  x.fillText(t(language, "share_ruled"), W / 2, 440);
  x.letterSpacing = "0px";

  const headline = councilHeadline(debate, language);
  x.fillStyle = "#EDE8DE";
  const hFont = "500 40px 'Cormorant Garamond', Georgia, serif";
  let y = 500;
  wrap(headline, hFont, 820).forEach(l => { x.font = hFont; x.fillText(l, W / 2, y); y += 50; });

  y += 40;
  const qFont = "italic 300 46px 'Cormorant Garamond', Georgia, serif";
  wrap(`"${displayQuestion}"`, qFont, 860).forEach(l => { x.font = qFont; x.fillText(l, W / 2, y); y += 60; });

  const { yes, no, dep } = tally(debate);
  y += 40;
  x.font = "500 30px 'JetBrains Mono', monospace"; x.fillStyle = "#D8C08A";
  x.fillText(`${t(language, "share_yes")} ${yes}   ·   ${t(language, "share_no")} ${no}   ·   ${t(language, "share_depends")} ${dep}`, W / 2, y);

  y += 70;
  x.strokeStyle = "rgba(201,169,110,.4)"; x.beginPath(); x.moveTo(W / 2 - 60, y); x.lineTo(W / 2 + 60, y); x.stroke();

  // Verdict or quote — prefer quote for visual punch. Redacted cards skip
  // both: they're personalized text derived from the seeker's own words.
  if (redact) {
    // no-op — headline + tally already convey the shareable part
  } else if (debate.quote) {
    y += 70;
    x.fillStyle = "rgba(201,169,110,.9)";
    const qqFont = "italic 400 36px 'Cormorant Garamond', Georgia, serif";
    wrap(`"${debate.quote}"`, qqFont, 820).forEach(l => { x.font = qqFont; x.fillText(l, W / 2, y); y += 54; });
  } else {
    y += 70;
    x.fillStyle = "rgba(237,232,222,.85)";
    const vFont = "300 34px 'Cormorant Garamond', Georgia, serif";
    wrap(debate.verdict, vFont, 820).forEach(l => { x.font = vFont; x.fillText(l, W / 2, y); y += 50; });
  }

  // Footer: tagline + share URL
  const url = shareUrl(debate.id);
  x.fillStyle = "rgba(237,232,222,.4)"; x.font = "400 22px 'JetBrains Mono', monospace";
  x.fillText(t(language, "share_card_tagline"), W / 2, H - 110);
  if (debate.id) {
    x.fillStyle = "rgba(201,169,110,.55)"; x.font = "400 20px 'JetBrains Mono', monospace";
    x.fillText(url.replace(/^https?:\/\//, ""), W / 2, H - 72);
  }

  const a = document.createElement("a");
  a.download = "council-verdict.png";
  a.href = c.toDataURL("image/png");
  a.click();
}

// Full debate transcript as portable JSON — the only export format that
// preserves every turn and vote, not just the headline/verdict the PNG
// card and share text summarize.
export function debateToJson(question, debate, language = "en") {
  const { yes, no, dep } = tally(debate);
  return {
    question,
    askedOf: debate.question || null,
    headline: councilHeadline(debate, language),
    verdict: debate.verdict,
    quote: debate.quote || null,
    mood: debate.mood || null,
    tally: { yes, no, depends: dep },
    turns: debate.turns.map(turn => ({
      persona: turn.p,
      name: personaName(language, turn.p),
      text: turn.t,
    })),
    votes: debate.votes.map(v => ({
      persona: v.p,
      name: personaName(language, v.p),
      vote: v.v,
    })),
    realities: debate.realities || [],
    url: debate.id ? shareUrl(debate.id) : null,
    exportedAt: new Date().toISOString(),
  };
}

export function downloadDebateJson(question, debate, language = "en") {
  const blob = new Blob([JSON.stringify(debateToJson(question, debate, language), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.download = "council-verdict.json";
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
}
