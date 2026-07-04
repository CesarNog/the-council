import { kvGet } from "./_kv.js";

const esc = (s = "") => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function headline(debate) {
  const yes = debate.votes.filter(v => v.v === "yes").length;
  const no = debate.votes.filter(v => v.v === "no").length;
  if (yes === debate.votes.length) return "Every Council member agreed. Go.";
  if (no === debate.votes.length) return "Every Council member agreed. Don't.";
  return `The Council ruled ${yes}-${no}, ${debate.votes.length - yes - no} undecided.`;
}

export default async function handler(req, res) {
  const id = req.query.id;
  const proto = req.headers["x-forwarded-proto"] || "https";
  const origin = `${proto}://${req.headers.host}`;

  let html;
  try {
    const shell = await fetch(`${origin}/index.html`);
    html = await shell.text();
  } catch {
    return res.status(502).send("shell unreachable");
  }

  const raw = id ? await kvGet(`result:${id}`).catch(() => null) : null;
  const debate = raw ? JSON.parse(raw) : null;
  if (!debate) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html); // id invalido/expirado — SPA mostra "verdict already adjourned"
  }

  const title = `"${debate.asked}" — ${headline(debate)}`;
  const description = debate.quote || debate.verdict || "Nine versions of you. One verdict.";
  const appUrl = `${origin}/r/${id}`;

  html = html
    .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${esc(description)}" />`)
    .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${esc(title)}" />`)
    .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${esc(description)}" />`)
    .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${appUrl}" />`)
    .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${esc(title)}" />`)
    .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${esc(description)}" />`);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600"); // debates sao imutaveis apos gerados
  return res.status(200).send(html);
}
