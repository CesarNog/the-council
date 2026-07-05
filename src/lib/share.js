import { PERSONAS, byId } from "./personas.js";
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
  const outlier = debate.votes.length - Math.max(yes, no) === 1
    ? debate.votes.find(v => (yes > no ? v.v !== "yes" : v.v !== "no"))
    : null;
  if (outlier) return t(language, "only_x_disagreed", personaName(language, outlier.p));
  if (Math.abs(yes - no) <= 1 && dep >= 2) return t(language, "could_not_agree");
  return yes > no ? t(language, "leans_yes", yes, no) : no > yes ? t(language, "leans_no", no, yes) : t(language, "split_middle");
}

export function shareUrl(id, origin) {
  const base = origin || (typeof window !== "undefined" ? window.location.origin : "https://the-council-murex.vercel.app");
  return id ? `${base}/r/${id}` : base;
}

export async function copyLink(url) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(url);
    return true;
  }
  return false;
}

export function shareText(question, debate, { max, language = "en" } = {}) {
  const { yes, no, dep } = tally(debate);
  const headline = councilHeadline(debate, language);
  const lYes = t(language, "share_yes");
  const lNo = t(language, "share_no");
  const lDep = t(language, "share_depends");
  const tagline = t(language, "share_tagline");
  const tallyLine = `${lYes} ${yes} · ${lNo} ${no} · ${lDep} ${dep}`;
  // quote appears before tally so the punchy line grabs attention first
  const quoteLine = debate.quote ? `\n\n"${debate.quote}"` : "";
  const full = `⚖ ${headline.toUpperCase()}\n\n"${question}"${quoteLine}\n\n${tallyLine}\n\n${debate.verdict}\n\n${tagline}`;
  if (!max || full.length <= max) return full;
  const shortPrefix = `⚖ ${t(language, "share_ruled")}\n\n"${question}"\n\n${tallyLine}\n\n`;
  const room = max - shortPrefix.length;
  const shortVerdict = debate.verdict.length > room ? debate.verdict.slice(0, Math.max(room, 0)) + "…" : debate.verdict;
  return `${shortPrefix}${shortVerdict}`;
}

const VOTE_COLORS = { yes: "#C9A96E", no: "#8B3A3A", depends: "rgba(237,232,222,.35)" };

export function downloadShareCard(question, debate, language = "en") {
  const W = 1080, H = 1350;
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
  x.fillText("THE COUNCIL HAS RULED", W / 2, 440);
  x.letterSpacing = "0px";

  const headline = councilHeadline(debate, language);
  x.fillStyle = "#EDE8DE";
  const hFont = "500 40px 'Fraunces', Georgia, serif";
  let y = 500;
  wrap(headline, hFont, 820).forEach(l => { x.font = hFont; x.fillText(l, W / 2, y); y += 50; });

  y += 40;
  const qFont = "italic 300 46px 'Fraunces', Georgia, serif";
  wrap(`"${question}"`, qFont, 860).forEach(l => { x.font = qFont; x.fillText(l, W / 2, y); y += 60; });

  const { yes, no, dep } = tally(debate);
  y += 40;
  x.font = "500 30px 'JetBrains Mono', monospace"; x.fillStyle = "#D8C08A";
  x.fillText(`YES ${yes}   ·   NO ${no}   ·   DEPENDS ${dep}`, W / 2, y);

  y += 70;
  x.strokeStyle = "rgba(201,169,110,.4)"; x.beginPath(); x.moveTo(W / 2 - 60, y); x.lineTo(W / 2 + 60, y); x.stroke();

  // Verdict or quote — prefer quote for visual punch
  if (debate.quote) {
    y += 70;
    x.fillStyle = "rgba(201,169,110,.9)";
    const qqFont = "italic 400 36px 'Fraunces', Georgia, serif";
    wrap(`"${debate.quote}"`, qqFont, 820).forEach(l => { x.font = qqFont; x.fillText(l, W / 2, y); y += 54; });
  } else {
    y += 70;
    x.fillStyle = "rgba(237,232,222,.85)";
    const vFont = "300 34px 'Fraunces', Georgia, serif";
    wrap(debate.verdict, vFont, 820).forEach(l => { x.font = vFont; x.fillText(l, W / 2, y); y += 50; });
  }

  // Footer: tagline + share URL
  const url = shareUrl(debate.id);
  x.fillStyle = "rgba(237,232,222,.4)"; x.font = "400 22px 'JetBrains Mono', monospace";
  x.fillText("nine versions of me · one verdict", W / 2, H - 110);
  if (debate.id) {
    x.fillStyle = "rgba(201,169,110,.55)"; x.font = "400 20px 'JetBrains Mono', monospace";
    x.fillText(url.replace(/^https?:\/\//, ""), W / 2, H - 72);
  }

  const a = document.createElement("a");
  a.download = "council-verdict.png";
  a.href = c.toDataURL("image/png");
  a.click();
}
