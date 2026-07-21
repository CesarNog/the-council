// Pure WCAG contrast helpers. No React, no DOM.
//
// The light theme blends each persona's raw (dark-tuned) colour toward the ink
// so its hue survives while the text clears WCAG AA on the light canvas. These
// helpers mirror what the CSS `color-mix(in srgb, <pc> <pct>%, <ink>)` rule in
// styles.css does, so contrast.test.js can guard the palette against regressions
// (e.g. a 10th persona, or a change to the blend ratio).

const LIGHT_BG = "#F5F3EE";
const LIGHT_INK = "#1C1A28";
const LIGHT_BLEND = 0.45; // keep in sync with the 45% in styles.css :root.light rules

function toRgb(hex) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
}

// srgb (gamma-space) per-channel mix — matches CSS color-mix(in srgb, ...).
export function mixSrgb(hex, ink, pct) {
  const c = toRgb(hex), k = toRgb(ink);
  return "#" + c.map((v, i) => Math.round(v * pct + k[i] * (1 - pct))
    .toString(16).padStart(2, "0")).join("");
}

function relLuminance(hex) {
  const [r, g, b] = toRgb(hex).map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a, b) {
  const la = relLuminance(a), lb = relLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// The light-mode text colour a raw persona colour resolves to, and its contrast
// against the light canvas.
export function lightModePersonaColor(rawHex) {
  return mixSrgb(rawHex, LIGHT_INK, LIGHT_BLEND);
}

export function lightModeContrast(rawHex) {
  return contrastRatio(lightModePersonaColor(rawHex), LIGHT_BG);
}

export const AA_NORMAL = 4.5;
