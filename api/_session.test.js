import { describe, it, expect, beforeAll } from "vitest";
import { makeSessionCookie, verifySessionToken, clearSessionCookie } from "./_session.js";

beforeAll(() => {
  process.env.SESSION_SECRET = "test-secret-only-for-vitest";
});

function extractToken(cookieHeader) {
  return cookieHeader.split(";")[0].split("=")[1];
}

describe("session", () => {
  it("cookie valido round-trips pro sub correto", () => {
    const cookie = makeSessionCookie("google-sub-123");
    const token = extractToken(cookie);
    const payload = verifySessionToken(token);
    expect(payload.sub).toBe("google-sub-123");
  });

  it("cookie tem HttpOnly, Secure, SameSite=Lax", () => {
    const cookie = makeSessionCookie("x");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=Lax");
  });

  it("rejeita token com assinatura adulterada", () => {
    const cookie = makeSessionCookie("google-sub-123");
    const token = extractToken(cookie);
    const [body] = token.split(".");
    const tampered = `${body}.assinaturaFalsa`;
    expect(verifySessionToken(tampered)).toBeNull();
  });

  it("rejeita token com payload adulterado (sub trocado sem re-assinar)", () => {
    const cookie = makeSessionCookie("google-sub-123");
    const token = extractToken(cookie);
    const [, sig] = token.split(".");
    const fakeBody = Buffer.from(JSON.stringify({ sub: "attacker", exp: Date.now() + 999999 })).toString("base64url");
    expect(verifySessionToken(`${fakeBody}.${sig}`)).toBeNull();
  });

  it("rejeita token expirado", () => {
    const expiredBody = Buffer.from(JSON.stringify({ sub: "x", exp: Date.now() - 1000 })).toString("base64url");
    const { createHmac } = require("node:crypto");
    const sig = createHmac("sha256", process.env.SESSION_SECRET).update(expiredBody).digest("base64url");
    expect(verifySessionToken(`${expiredBody}.${sig}`)).toBeNull();
  });

  it("rejeita input malformado sem quebrar", () => {
    expect(verifySessionToken(null)).toBeNull();
    expect(verifySessionToken("")).toBeNull();
    expect(verifySessionToken("sem-ponto")).toBeNull();
  });

  it("clearSessionCookie zera Max-Age", () => {
    expect(clearSessionCookie()).toContain("Max-Age=0");
  });
});
