import { createHmac, timingSafeEqual } from "node:crypto";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET env var is required for session security");
}

const COOKIE_NAME = "council_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 dias

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", process.env.SESSION_SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySessionToken(token) {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = createHmac("sha256", process.env.SESSION_SECRET).update(body).digest("base64url");
  const a = Buffer.from(sig || "");
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function makeSessionCookie(sub) {
  const token = sign({ sub, exp: Date.now() + MAX_AGE_SECONDS * 1000 });
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function getSessionFromRequest(req) {
  const raw = req.headers.cookie || "";
  const match = raw.split("; ").find(c => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  return verifySessionToken(match.slice(COOKIE_NAME.length + 1));
}
