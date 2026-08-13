import "@testing-library/jest-dom/vitest";

// Set required env vars before any module is imported in tests
process.env.SESSION_SECRET = "vitest-test-secret-not-for-production";

// jsdom doesn't implement IntersectionObserver — components that use it
// (Chamber's compact-stage/active-speaker sync, Landing's sticky CTA) throw
// on mount without this. A no-op stub is enough; scroll-driven behavior
// itself is covered by the real-browser Playwright suite, not here.
if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
