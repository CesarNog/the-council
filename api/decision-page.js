const esc = (s = "") => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const DECISIONS = {
  "quit-job-start-business": {
    question: "Should I quit my job and start something of my own?",
    description: "Nine versions of you debate one of life's biggest leaps — leaving stability to build something of your own. Founder, shadow, monk and six more voices weigh in.",
  },
  "end-relationship": {
    question: "Should I end this relationship?",
    description: "Nine alternate selves argue both sides of the hardest personal decision. The romantic, the shadow, the monk — they all have something to say about your relationship.",
  },
  "move-to-new-city": {
    question: "Should I move to another city or country?",
    description: "The explorer urges you forward. The romantic fears what you'll lose. Nine versions of you debate whether to uproot your life and start over somewhere new.",
  },
  "go-back-to-school": {
    question: "Should I go back to school?",
    description: "The scientist sees the credential. The founder sees the opportunity cost. Hear nine versions of yourself debate whether returning to education is the right move.",
  },
  "have-children": {
    question: "Should I have children?",
    description: "One of the most consequential decisions a person can make. Nine alternate selves — from the romantic to the shadow — weigh in on whether to become a parent.",
  },
  "take-risky-path": {
    question: "Should I take the safer path or the riskier one?",
    description: "The billionaire bets on upside. The monk counsels patience. When you're at a fork between safe and bold, The Council debates both sides so you can decide.",
  },
};

export default async function handler(req, res) {
  const slug = req.query.slug;
  const decision = DECISIONS[slug];

  const proto = req.headers["x-forwarded-proto"] || "https";
  const origin = `${proto}://${req.headers.host}`;
  const pageUrl = `${origin}/decisions/${slug || ""}`;

  let html;
  try {
    const shell = await fetch(`${origin}/index.html`);
    html = await shell.text();
  } catch {
    return res.status(502).send("shell unreachable");
  }

  if (!decision) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  }

  const title = `"${decision.question}" — The Council`;
  const description = decision.description;

  html = html
    .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${pageUrl}" />`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${esc(description)}" />`)
    .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${esc(title)}" />`)
    .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${esc(description)}" />`)
    .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${pageUrl}" />`)
    .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${esc(title)}" />`)
    .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${esc(description)}" />`);

  // inject question into window so the SPA can auto-convene
  const injection = `<script>window.__COUNCIL_DECISION__=${JSON.stringify(decision.question)};</script>`;
  html = html.replace("</head>", `${injection}\n</head>`);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
  return res.status(200).send(html);
}
