import { jwtVerify, createRemoteJWKSet } from "jose";
import { kvGet, kvPut } from "./_kv.js";
import { makeSessionCookie, clearSessionCookie, getSessionFromRequest } from "./_session.js";
import { enforceEndpointLimit } from "./_rateLimit.js";
import { badRequest, bodyTooLarge, methodNotAllowed } from "./_http.js";
import { authBodySchema, parseBody } from "./_validate.js";

const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", clearSessionCookie());
    return res.status(204).end();
  }

  if (req.method !== "POST") return methodNotAllowed(res, "POST, DELETE");
  if (bodyTooLarge(req, res)) return;
  if (!(await enforceEndpointLimit(req, res, "auth"))) return;

  const parsed = parseBody(authBodySchema, req.body);
  if (!parsed.ok) return badRequest(res, parsed.detail);
  const { credential } = parsed.data;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error("auth: GOOGLE_CLIENT_ID not configured");
    return res.status(503).json({ error: "auth_not_configured" });
  }

  let payload;
  try {
    ({ payload } = await jwtVerify(credential, GOOGLE_JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: clientId,
    }));
  } catch (e) {
    console.error("auth: token verification failed", e.message);
    return res.status(401).json({ error: "invalid_token" });
  }

  const sub = payload.sub;
  const key = `user:${sub}`;
  const existingRaw = await kvGet(key).catch(() => null);
  const existing = existingRaw ? JSON.parse(existingRaw) : null;

  const user = {
    sub,
    email: payload.email,
    name: existing?.name ?? payload.name,
    googlePicture: payload.picture,
    customPicture: existing?.customPicture ?? null,
    situation: existing?.situation ?? "",
    values: existing?.values ?? [],
    lastVisit: existing?.lastVisit ?? null,
    lifeMode: existing?.lifeMode ?? null,
    debateHistory: existing?.debateHistory ?? [],
    eclipses: existing?.eclipses ?? [],
    createdAt: existing?.createdAt ?? Date.now(),
  };

  await kvPut(key, JSON.stringify(user));
  res.setHeader("Set-Cookie", makeSessionCookie(sub));
  return res.status(200).json(user);
}

export async function requireUser(req, res) {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: "not_authenticated" });
    return null;
  }
  const raw = await kvGet(`user:${session.sub}`).catch(() => null);
  if (!raw) {
    res.status(401).json({ error: "not_authenticated" });
    return null;
  }
  return { sub: session.sub, user: JSON.parse(raw) };
}
