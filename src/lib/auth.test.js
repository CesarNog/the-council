import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const store = {};
const localStorageMock = {
  getItem: vi.fn((k) => store[k] ?? null),
  setItem: vi.fn((k, v) => { store[k] = String(v); }),
  removeItem: vi.fn((k) => { delete store[k]; }),
  clear: vi.fn(() => Object.keys(store).forEach(k => delete store[k])),
};

beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
  vi.stubGlobal("localStorage", localStorageMock);
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// Helper to create a dummy Google JWT credential with specific payload
function makeMockCredential(payload) {
  const jsonStr = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(jsonStr);
  const binary = Array.from(bytes, b => String.fromCharCode(b)).join("");
  const b64 = btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  return `header.${b64}.signature`;
}

async function getAuthModule() {
  vi.resetModules();
  return import("./auth.js");
}

describe("parseGoogleJwt UTF-8 decoding check (Client-side Fallback)", () => {
  it("decodes ASCII-only name correctly", async () => {
    const { signInWithGoogle } = await getAuthModule();
    global.fetch.mockResolvedValue({ status: 503, ok: false });

    const credential = makeMockCredential({ name: "Alex Smith", email: "alex@example.com", picture: "pic.png", sub: "123" });
    const user = await signInWithGoogle(credential);

    expect(user).toEqual({
      name: "Alex Smith",
      email: "alex@example.com",
      googlePicture: "pic.png",
      sub: "123",
      situation: "",
      values: [],
      debateHistory: [],
      _local: true,
    });
    expect(localStorageMock.setItem).toHaveBeenCalledWith("council:localSession", JSON.stringify(user));
  });

  it("decodes accented Portuguese/Spanish names completely correctly (UTF-8)", async () => {
    const { signInWithGoogle } = await getAuthModule();
    global.fetch.mockResolvedValue({ status: 503, ok: false });

    const credential = makeMockCredential({ name: "César Augusto", email: "cesar@example.com", picture: "pic.png", sub: "123" });
    const user = await signInWithGoogle(credential);

    expect(user.name).toBe("César Augusto");
    expect(user._local).toBe(true);
  });

  it("decodes Chinese characters completely correctly (UTF-8)", async () => {
    const { signInWithGoogle } = await getAuthModule();
    global.fetch.mockResolvedValue({ status: 503, ok: false });

    const credential = makeMockCredential({ name: "张三", email: "zhang@example.com", picture: "pic.png", sub: "123" });
    const user = await signInWithGoogle(credential);

    expect(user.name).toBe("张三");
    expect(user._local).toBe(true);
  });
});

describe("signInWithGoogle API routes", () => {
  it("successfully logs in with 200, clearing local session", async () => {
    const { signInWithGoogle } = await getAuthModule();
    const mockUser = { name: "Alex", sub: "123" };
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockUser,
    });

    store["council:localSession"] = "{}";
    const user = await signInWithGoogle("dummy.jwt.sig");

    expect(user).toEqual(mockUser);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("council:localSession");
  });

  it("throws network_error when fetch rejects", async () => {
    const { signInWithGoogle } = await getAuthModule();
    global.fetch.mockRejectedValue(new Error("DNS failure"));

    await expect(signInWithGoogle("dummy.jwt.sig")).rejects.toMatchObject({
      kind: "network_error",
    });
  });

  it("throws unconfigured when 503 fails to parse JWT", async () => {
    const { signInWithGoogle } = await getAuthModule();
    global.fetch.mockResolvedValue({ status: 503, ok: false });

    await expect(signInWithGoogle("invalid-jwt")).rejects.toMatchObject({
      kind: "unconfigured",
    });
  });

  it("throws generic error on other non-ok HTTP statuses", async () => {
    const { signInWithGoogle } = await getAuthModule();
    global.fetch.mockResolvedValue({ status: 400, ok: false });

    await expect(signInWithGoogle("dummy.jwt.sig")).rejects.toMatchObject({
      kind: "generic",
    });
  });
});

describe("signOut", () => {
  it("calls DELETE /api/auth and removes local session", async () => {
    const { signOut } = await getAuthModule();
    global.fetch.mockResolvedValue({ ok: true, status: 204 });
    store["council:localSession"] = "{}";

    await signOut();

    expect(global.fetch).toHaveBeenCalledWith("/api/auth", { method: "DELETE" });
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("council:localSession");
  });
});

describe("getProfile", () => {
  it("returns user profile from API and deletes local session on success", async () => {
    const { getProfile } = await getAuthModule();
    const mockUser = { name: "Bob" };
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockUser,
    });
    store["council:localSession"] = "{}";

    const profile = await getProfile();

    expect(profile).toEqual(mockUser);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("council:localSession");
  });

  it("falls back to local session when API returns 401", async () => {
    const { getProfile } = await getAuthModule();
    global.fetch.mockResolvedValue({ ok: false, status: 401 });
    const localUser = { name: "Offline Bob", _local: true };
    store["council:localSession"] = JSON.stringify(localUser);

    const profile = await getProfile();

    expect(profile).toEqual(localUser);
  });

  it("returns null when API returns 401 and there is no local session", async () => {
    const { getProfile } = await getAuthModule();
    global.fetch.mockResolvedValue({ ok: false, status: 401 });

    const profile = await getProfile();

    expect(profile).toBeNull();
  });

  it("throws when API returns other errors", async () => {
    const { getProfile } = await getAuthModule();
    global.fetch.mockResolvedValue({ ok: false, status: 500 });

    await expect(getProfile()).rejects.toThrow("profile fetch failed");
  });
});

describe("updateProfile", () => {
  it("updates local session in-place and returns updated object without calling fetch when local session exists", async () => {
    const { updateProfile } = await getAuthModule();
    const localUser = { name: "Offline Bob", situation: "original" };
    store["council:localSession"] = JSON.stringify(localUser);

    const result = await updateProfile({ situation: "updated" });

    expect(result).toEqual({ name: "Offline Bob", situation: "updated" });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "council:localSession",
      JSON.stringify({ name: "Offline Bob", situation: "updated" })
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("sends PATCH /api/profile when no local session exists", async () => {
    const { updateProfile } = await getAuthModule();
    const apiUser = { name: "Online Bob", situation: "updated" };
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => apiUser,
    });

    const result = await updateProfile({ situation: "updated" });

    expect(result).toEqual(apiUser);
    expect(global.fetch).toHaveBeenCalledWith("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ situation: "updated" }),
    });
  });

  it("throws when PATCH /api/profile fails", async () => {
    const { updateProfile } = await getAuthModule();
    global.fetch.mockResolvedValue({ ok: false, status: 500 });

    await expect(updateProfile({ situation: "updated" })).rejects.toThrow("profile update failed");
  });
});
