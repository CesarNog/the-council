export async function signInWithGoogle(credential) {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });
  if (!res.ok) throw new Error("auth failed");
  return res.json();
}

export async function signOut() {
  await fetch("/api/auth", { method: "DELETE" }).catch(() => {});
}

export async function getProfile() {
  const res = await fetch("/api/profile");
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("profile fetch failed");
  return res.json();
}

export async function updateProfile(patch) {
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
