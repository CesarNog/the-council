/** Clerk helpers — optional; app runs without env vars. */

export const CLERK_PUBLISHABLE_KEY = typeof import.meta !== "undefined"
  ? import.meta.env?.VITE_CLERK_PUBLISHABLE_KEY
  : undefined;

export function isClerkEnabled() {
  return !!CLERK_PUBLISHABLE_KEY;
}

/** Prefer firstName → fullName → email prefix for Council display. */
export function clerkDisplayName(user) {
  if (!user) return "";
  if (user.firstName) return user.firstName;
  if (user.fullName) return user.fullName;
  const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;
  if (email) return email.split("@")[0];
  return "";
}

export async function syncClerkSession(getToken) {
  const token = await getToken();
  if (!token) return null;
  const res = await fetch("/api/clerk-auth", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 503) return null;
  if (!res.ok) {
    const err = new Error("clerk_sync_failed");
    err.kind = "generic";
    throw err;
  }
  try { localStorage.removeItem("council:localSession"); } catch {}
  return res.json();
}

export async function signOutClerkSession() {
  await fetch("/api/clerk-auth", { method: "DELETE" }).catch(() => {});
}
