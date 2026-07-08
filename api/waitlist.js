import { kvGet, kvPut } from "./_kv.js";
import { badRequest, methodNotAllowed, safeError } from "./_http.js";
import { enforceRateLimit, clientIp } from "./_rateLimit.js";
import { getResend } from "./_email.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function sendWaitlistConfirmation({ to, language }) {
  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL;
  if (!resend || !from) return;

  const subjects = {
    pt: "Você está na lista — The Council Premium",
    es: "Estás en la lista — The Council Premium",
    zh: "您已加入候补名单 — The Council Premium",
    en: "You're on the list — The Council Premium",
  };
  const bodies = {
    pt: `<p style="font-size:16px;line-height:1.7;">Recebemos seu interesse. Quando o Premium for lançado, você será um dos primeiros a saber.</p><p style="opacity:.6;font-size:13px;">O Conselho aguarda.</p>`,
    es: `<p style="font-size:16px;line-height:1.7;">Recibimos tu interés. Cuando se lance Premium, serás de los primeros en saberlo.</p><p style="opacity:.6;font-size:13px;">El Consejo espera.</p>`,
    zh: `<p style="font-size:16px;line-height:1.7;">我们已收到您的意向。Premium上线时，您将是最先知道的人之一。</p><p style="opacity:.6;font-size:13px;">议会在等待。</p>`,
    en: `<p style="font-size:16px;line-height:1.7;">We received your interest. When Premium launches, you'll be among the first to know.</p><p style="opacity:.6;font-size:13px;">The Council awaits.</p>`,
  };
  const lang = ["pt","es","zh","en"].includes(language) ? language : "en";

  try {
    await resend.emails.send({
      from,
      to,
      subject: subjects[lang],
      html: `<div style="font-family:Georgia,serif;background:#0B0A12;color:#EDE8DE;padding:40px 24px;max-width:560px;">
        <p style="letter-spacing:.3em;text-transform:uppercase;font-size:11px;color:#C9A96E;margin-bottom:32px;">The Council · Premium</p>
        ${bodies[lang]}
        <p style="margin-top:40px;opacity:.35;font-size:11px;letter-spacing:.05em;">— The Council</p>
      </div>`,
    });
  } catch (e) {
    console.error("waitlist: confirmation email failed", e.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, "POST");

  const ok = await enforceRateLimit(req, res, "rl:waitlist", {
    limit: 3, windowMs: 60_000, ttlSec: 120,
  });
  if (!ok) return;

  const { email, language } = req.body || {};
  if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return badRequest(res, "invalid_email");
  }
  const canonical = email.trim().toLowerCase();

  let alreadyIn = false;
  try {
    const existing = await kvGet(`waitlist:${canonical}`);
    alreadyIn = !!existing;
  } catch { /* kv miss — treat as new */ }

  if (!alreadyIn) {
    try {
      await kvPut(`waitlist:${canonical}`, JSON.stringify({ joinedAt: Date.now(), language: language || "en" }));
    } catch (e) {
      console.error("waitlist: kv put failed", e.message);
      return safeError(res, 503, "storage_unavailable");
    }
    sendWaitlistConfirmation({ to: canonical, language }).catch(() => {});
  }

  return res.status(200).json({ ok: true, alreadyIn });
}
