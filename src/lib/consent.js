const STORAGE_KEY = "council:consent";

export const CATEGORIES = Object.freeze({ necessary: true, analytics: false, advertising: false });

function safeRead() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    return parsed;
  } catch {
    return null;
  }
}

function safeWrite(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function getConsent() {
  const stored = safeRead();
  // Always merge with defaults so new categories degrade to false
  return { ...CATEGORIES, ...(stored || {}) };
}

export function hasConsentDecision() {
  return safeRead() !== null;
}

export function setConsent(categories) {
  const next = { ...CATEGORIES, ...categories, necessary: true };
  safeWrite(next);
  return next;
}

export function acceptAll() {
  return setConsent({ necessary: true, analytics: true, advertising: true });
}

export function rejectOptional() {
  return setConsent({ necessary: true, analytics: false, advertising: false });
}

export function isAnalyticsEnabled() {
  return getConsent().analytics === true;
}

export function isAdvertisingEnabled() {
  return getConsent().advertising === true;
}
