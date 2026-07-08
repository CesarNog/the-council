import { Resend } from "resend";

let _resend = null;

export function getResend() {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}

export function isResendConfigured() {
  return !!process.env.RESEND_API_KEY && !!process.env.RESEND_FROM_EMAIL;
}

export async function sendWelcomeEmail({ to, name }) {
  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL;
  if (!resend || !from || !to) return { ok: false, skipped: true };

  const display = name || "Seeker";
  try {
    await resend.emails.send({
      from,
      to,
      subject: "Welcome to The Council",
      html: `<div style="font-family:Georgia,serif;background:#0B0A12;color:#EDE8DE;padding:40px 24px;">
        <p style="letter-spacing:.3em;text-transform:uppercase;font-size:11px;color:#C9A96E;">The Council</p>
        <h1 style="font-weight:300;font-size:28px;">${display}, your chamber awaits.</h1>
        <p style="opacity:.8;line-height:1.7;">Nine alternate versions of you are ready to debate the decisions that matter. Bring one question. Listen to every voice. Receive one verdict.</p>
        <p style="margin-top:32px;opacity:.5;font-size:12px;">— The Council</p>
      </div>`,
    });
    return { ok: true };
  } catch (e) {
    console.error("email: welcome failed", e.message);
    return { ok: false, error: e.message };
  }
}
