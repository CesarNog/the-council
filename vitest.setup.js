// Set required env vars before any module is imported in tests
process.env.SESSION_SECRET = "vitest-test-secret-not-for-production";
