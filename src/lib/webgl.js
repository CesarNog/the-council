/** Returns true if WebGL2 or WebGL is available. */
export function supportsWebGL() {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

/** Heuristic for low-end / mobile devices — prefer CSS fallback. */
export function preferLandingFallback() {
  if (typeof window === "undefined") return true;
  if (window.matchMedia?.("(max-width: 767px)").matches) return true;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) return true;
  return false;
}
