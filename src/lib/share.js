import { PERSONAS, byId } from "./personas.js";

export function tally(debate) {
  const yes = debate.votes.filter(v => v.v === "yes").length;
  const no = debate.votes.filter(v => v.v === "no").length;
  const dep = debate.votes.length - yes - no;
  return { yes, no, dep };
}

export function councilHeadline(debate) {
  const { yes, no, dep } = tally(debate);
  const total = debate.votes.length;
  if (yes === total) return "Every Council member agreed. Go.";
  if (no === total) return "Every Council member agreed. Don't.";
  const outlier = debate.votes.length - Math.max(yes, no) === 1
    ? debate.votes.find(v => (yes > no ? v.v !== "yes" : v.v !== "no"))
    : null;
  if (outlier) return `Only ${byId[outlier.p].name} disagreed.`;
  if (Math.abs(yes - no) <= 1 && dep >= 2) return "The Council could not agree.";
  return yes > no ? `The Council leans yes, ${yes}–${no}.` : no > yes ? `The Council leans no, ${no}–${yes}.` : "The Council is split down the middle.";
}

export function shareText(question, debate, { max } = {}) {
  const { yes, no, dep } = tally(debate);
  const headline = councilHeadline(debate);
  const quoteLine = debate.quote ? `\n\n"${debate.quote}"\n` : "";
  const full = `⚖ ${headline.toUpperCase()}\n\n"${question}"\n\nYES ${yes} · NO ${no} · DEPENDS ${dep}${quoteLine}\n${debate.verdict}\n\n— nine versions of me, one verdict`;
  if (!max || full.length <= max) return full;
  const room = max - (question.length + 40); // reserva espaco pro cabecalho/rodape
  const shortVerdict = debate.verdict.length > room ? debate.verdict.slice(0, Math.max(room, 0)) + "…" : debate.verdict;
  return `⚖ THE COUNCIL HAS RULED\n\n"${question}"\n\nYES ${yes} · NO ${no} · DEPENDS ${dep}\n\n${shortVerdict}`;
}

export function downloadShareCard(question, debate) {
  const W = 1080, H = 1350;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d");

  x.fillStyle = "#0B0A12"; x.fillRect(0, 0, W, H);
  const g = x.createRadialGradient(W / 2, 0, 80, W / 2, 0, 900);
  g.addColorStop(0, "rgba(201,169,110,.14)"); g.addColorStop(1, "rgba(201,169,110,0)");
  x.fillStyle = g; x.fillRect(0, 0, W, H);

  x.strokeStyle = "rgba(201,169,110,.5)"; x.lineWidth = 2;
  x.beginPath(); x.arc(W / 2, 240, 120, Math.PI * 0.75, Math.PI * 2.25); x.stroke();
  PERSONAS.forEach((p, i) => {
    const a = -Math.PI / 2 + (i / 9) * Math.PI * 2;
    x.fillStyle = p.color;
    x.beginPath(); x.arc(W / 2 + Math.cos(a) * 120, 240 + Math.sin(a) * 120, 7, 0, Math.PI * 2); x.fill();
  });

  const wrap = (text, font, maxW) => {
    x.font = font;
    const words = text.split(" "); const lines = []; let cur = "";
    for (const w of words) {
      const t = cur ? cur + " " + w : w;
      if (x.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
    }
    if (cur) lines.push(cur);
    return lines;
  };

  x.fillStyle = "#C9A96E"; x.font = "500 22px 'JetBrains Mono', monospace";
  x.textAlign = "center"; x.letterSpacing = "10px";
  x.fillText("THE COUNCIL HAS RULED", W / 2, 440);
  x.letterSpacing = "0px";

  const headline = councilHeadline(debate);
  x.fillStyle = "#EDE8DE";
  const hFont = "500 40px 'Fraunces', Georgia, serif";
  let y = 500;
  wrap(headline, hFont, 820).forEach(l => { x.font = hFont; x.fillText(l, W / 2, y); y += 50; });

  y += 40;
  const qFont = "italic 300 46px 'Fraunces', Georgia, serif";
  wrap(`“${question}”`, qFont, 860).forEach(l => { x.font = qFont; x.fillText(l, W / 2, y); y += 60; });

  const { yes, no, dep } = tally(debate);
  y += 40;
  x.font = "500 30px 'JetBrains Mono', monospace"; x.fillStyle = "#D8C08A";
  x.fillText(`YES ${yes}   ·   NO ${no}   ·   DEPENDS ${dep}`, W / 2, y);

  y += 70;
  x.strokeStyle = "rgba(201,169,110,.4)"; x.beginPath(); x.moveTo(W / 2 - 60, y); x.lineTo(W / 2 + 60, y); x.stroke();

  y += 70;
  x.fillStyle = "rgba(237,232,222,.85)";
  const vFont = "300 34px 'Fraunces', Georgia, serif";
  wrap(debate.verdict, vFont, 820).forEach(l => { x.font = vFont; x.fillText(l, W / 2, y); y += 50; });

  x.fillStyle = "rgba(237,232,222,.4)"; x.font = "400 22px 'JetBrains Mono', monospace";
  x.fillText("nine versions of me · one verdict", W / 2, H - 80);

  const a = document.createElement("a");
  a.download = "council-verdict.png";
  a.href = c.toDataURL("image/png");
  a.click();
}
