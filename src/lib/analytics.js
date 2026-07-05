import { isAnalyticsEnabled } from "./consent.js";

const HOTJAR_ID = typeof import.meta !== "undefined" ? import.meta.env?.VITE_HOTJAR_ID : undefined;
const HOTJAR_VERSION = typeof import.meta !== "undefined" ? (import.meta.env?.VITE_HOTJAR_VERSION || "6") : "6";

let _hotjarReady = false;
let _analyticsReady = false;

export function isAnalyticsReady() {
  return _analyticsReady;
}

export function initHotjar() {
  if (typeof window === "undefined") return;
  if (!isAnalyticsEnabled()) return;
  if (!HOTJAR_ID) return;
  if (_hotjarReady) return;
  if (import.meta.env?.DEV) return; // never load in dev

  (function(h, o, t, j, a, r) {
    h.hj = h.hj || function() { (h.hj.q = h.hj.q || []).push(arguments); };
    h._hjSettings = { hjid: Number(HOTJAR_ID), hjsv: Number(HOTJAR_VERSION) };
    a = o.getElementsByTagName("head")[0];
    r = o.createElement("script"); r.async = 1;
    r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
    a.appendChild(r);
  })(window, document, "https://static.hotjar.com/c/hotjar-", ".js?sv=");

  _hotjarReady = true;
}

export function initAnalytics() {
  if (_analyticsReady) return;
  if (!isAnalyticsEnabled()) return;
  initHotjar();
  _analyticsReady = true;
}

export function trackEvent(eventName, payload = {}) {
  if (!isAnalyticsEnabled()) return;
  if (typeof window === "undefined") return;
  // Hotjar custom event
  if (typeof window.hj === "function") {
    window.hj("event", eventName);
  }
  // GA4 placeholder — gated by consent, wired in when gtag is added
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, sanitizePayload(payload));
  }
}

export function trackPageView(routeName, metadata = {}) {
  trackEvent(`page_${routeName}`, metadata);
}

// Placeholder — call when the signed-in user is known
export function identifyUser(_user) {
  // Hotjar and GA4 user identity calls go here once analytics is expanded
}

// Strip raw question text; keep only safe numeric/categorical metadata
function sanitizePayload(payload) {
  const safe = {};
  for (const [k, v] of Object.entries(payload)) {
    if (typeof v === "number" || typeof v === "boolean") safe[k] = v;
    else if (typeof v === "string" && v.length < 64) safe[k] = v;
  }
  return safe;
}
