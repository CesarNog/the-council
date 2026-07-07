import { verifyToken } from "@clerk/backend";
import { kvGet, kvPut } from "./_kv.js";
import { makeSessionCookie, clearSessionCookie } from "./_session.js";
import { enforceRateLimit } from "./_rateLimit.js";
import { methodNotAllowed } from "./_http.js";
import { upsertProfileFromUser } from "./_supabase.js";

const AUTH_RATE = { limit: 10, windowMs: 60_000 };

function displayNameFromClerk(payload) {
  if (payload.given_name) return payload.given_name;
  if (payload.name) return payload.name;
  const email = payload.email;
  if (email) return email.split("@")[0];
  return "Seeker";
}

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", clearSessionCookie());
    return res.status(204).end();
  }

  if (req.method !== "POST") return methodNotAllowed(res, "POST, DELETE");

  const secret = process.env.CLERK_SECRET_KEY;
  if (!secret) return res.status(503).json({ error: "clerk_not_configured" });

  if (!(await enforceRateLimit(req, res, "rl:clerk", AUTH_RATE))) return;

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: "missing_token" });

  let payload;
  try {
    payload = await verifyToken(token, { secretKey: secret });
  } catch (e) {
    console.error("clerk-auth: verify failed", e.message);
    return res.status(401).json({ error: "invalid_token" });
  }

  const sub = `clerk:${payload.sub}`;
  const key = `user:${sub}`;
  const existingRaw = await kvGet(key).catch(() => null);
  const existing = existingRaw ? JSON.parse(existingRaw) : null;

  const user = {
    sub,
    clerkId: payload.sub,
    email: payload.email || existing?.email || "",
    name: existing?.name ?? displayNameFromClerk(payload),
    googlePicture: existing?.googlePicture ?? payload.picture ?? null,
    customPicture: existing?.customPicture ?? null,
    situation: existing?.situation ?? "",
    values: existing?.values ?? [],
    lastVisit: existing?.lastVisit ?? null,
    lifeMode: existing?.lifeMode ?? null,
    debateHistory: existing?.debateHistory ?? [],
    eclipses: existing?.eclipses ?? [],
    createdAt: existing?.createdAt ?? Date.now(),
    authProvider: "clerk",
  };

  await kvPut(key, JSON.stringify(user));
  upsertProfileFromUser(user).catch(e => console.error("clerk-auth: supabase sync failed", e.message));
  res.setHeader("Set-Cookie", makeSessionCookie(sub));
  return res.status(200).json(user);
}
