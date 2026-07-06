function parseGoogleJwt(credential) {
  try {
    const b64 = credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const p = JSON.parse(atob(b64));
    return { name: p.name, email: p.email, googlePicture: p.picture, sub: p.sub, situation: "", values: [], debateHistory: [], _local: true };
  } catch { return null; }
}

const LOCAL_KEY = "council:localSession";

export async function signInWithGoogle(credential) {
  let res;
  try {
    res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
  } catch {
    const err = new Error("network_error");
    err.kind = "network_error";
    throw err;
  }
  if (res.status === 503) {
    // Backend not configured — extract identity from the Google JWT client-side
    const user = parseGoogleJwt(credential);
    if (user) {
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(user)); } catch {}
      return user;
    }
    const err = new Error("unconfigured");
    err.kind = "unconfigured";
    throw err;
  }
  if (!res.ok) {
    const err = new Error("auth_failed");
    err.kind = "generic";
    throw err;
  }
  try { localStorage.removeItem(LOCAL_KEY); } catch {}
  return res.json();
}

export async function signOut() {
  await fetch("/api/auth", { method: "DELETE" }).catch(() => {});
  try { localStorage.removeItem(LOCAL_KEY); } catch {}
}

export async function getProfile() {
  const res = await fetch("/api/profile");
  if (res.status === 401) {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }
  if (!res.ok) throw new Error("profile fetch failed");
  try { localStorage.removeItem(LOCAL_KEY); } catch {}
  return res.json();
}

export async function updateProfile(patch) {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      const updated = { ...JSON.parse(raw), ...patch };
      localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
      return updated;
    }
  } catch {}
  const res = await fetch("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("profile update failed");
  return res.json();
}

// resize client-side antes de mandar pro backend — evita payload gigante, MAX_PICTURE_BYTES do backend e so o teto duro
export function resizeImageToDataUrl(file, { size = 256, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext("2d");
      const scale = Math.max(size / img.width, size / img.height);
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("invalid image")); };
    img.src = url;
  });
}
