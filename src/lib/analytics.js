import { isAnalyticsEnabled } from "./consent.js";

// posthog-js is ~50 kB gzip and only ever runs after cookie consent — lazily
// imported inside initPostHog() so it stays out of the first-paint bundle.
// _posthogReady only flips true after the module has loaded AND init ran, so
// every capture/identify call below is already correctly gated.
let posthog = null;

const HOTJAR_ID = typeof import.meta !== "undefined" ? import.meta.env?.VITE_HOTJAR_ID : undefined;
const HOTJAR_VERSION = typeof import.meta !== "undefined" ? (import.meta.env?.VITE_HOTJAR_VERSION || "6") : "6";
const POSTHOG_KEY = typeof import.meta !== "undefined" ? import.meta.env?.VITE_POSTHOG_KEY : undefined;
const POSTHOG_HOST = typeof import.meta !== "undefined" ? (import.meta.env?.VITE_POSTHOG_HOST || "https://us.i.posthog.com") : undefined;

let _hotjarReady = false;
let _posthogReady = false;
let _analyticsReady = false;

export function isAnalyticsReady() {
  return _analyticsReady;
}

export function initHotjar() {
  if (typeof window === "undefined") return;
  if (!isAnalyticsEnabled()) return;
  if (!HOTJAR_ID) return;
  if (_hotjarReady) return;
  if (import.meta.env?.DEV) return;

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

export function initPostHog() {
  if (typeof window === "undefined") return;
  if (!isAnalyticsEnabled()) return;
  if (!POSTHOG_KEY) return;
  if (_posthogReady) return;
  if (import.meta.env?.DEV) return;

  return import("posthog-js")
    .then(mod => {
      posthog = mod.default;
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        person_profiles: "identified_only",
        capture_pageview: false,
        persistence: "localStorage+cookie",
      });
      _posthogReady = true;
    })
    .catch(e => console.error("posthog: failed to load", e));
}

export function initAnalytics() {
  if (_analyticsReady) return;
  if (!isAnalyticsEnabled()) return;
  initHotjar();
  initPostHog();
  _analyticsReady = true;
}

export function trackEvent(eventName, payload = {}) {
  if (!isAnalyticsEnabled()) return;
  if (typeof window === "undefined") return;
  const safe = sanitizePayload(payload);
  if (typeof window.hj === "function") window.hj("event", eventName);
  if (typeof window.gtag === "function") window.gtag("event", eventName, safe);
  if (_posthogReady) posthog.capture(eventName, safe);
}

export function trackPageView(routeName, metadata = {}) {
  trackEvent(`${routeName}_viewed`, metadata);
  if (_posthogReady) posthog.capture("$pageview", { route: routeName, ...sanitizePayload(metadata) });
}

export function identifyUser(user) {
  if (!isAnalyticsEnabled() || !_posthogReady || !user?.sub) return;
  posthog.identify(user.sub, {
    plan: user.plan || "free",
    language: user.preferred_language || undefined,
  });
}

function sanitizePayload(payload) {
  const safe = {};
  for (const [k, v] of Object.entries(payload)) {
    if (typeof v === "number" || typeof v === "boolean") safe[k] = v;
    else if (typeof v === "string" && v.length < 64) safe[k] = v;
  }
  return safe;
}

/** Product event helpers — never include raw question text */
export const Events = {
  landingCta: (meta) => trackEvent("landing_cta_clicked", meta),
  onboardingStarted: () => trackEvent("onboarding_started"),
  onboardingCompleted: (meta) => trackEvent("onboarding_completed", meta),
  questionSubmitted: (meta) => trackEvent("question_submitted", meta),
  debateStarted: (meta) => trackEvent("debate_started", meta),
  debateCompleted: (meta) => trackEvent("debate_completed", meta),
  verdictViewed: (meta) => trackEvent("verdict_viewed", meta),
  shareClicked: (meta) => trackEvent("share_clicked", meta),
  shareCardDownloaded: (meta) => trackEvent("share_card_downloaded", meta),
  rateLimitSeen: (meta) => trackEvent("rate_limit_seen", meta),
  apiErrorSeen: (meta) => trackEvent("api_error_seen", meta),
};
