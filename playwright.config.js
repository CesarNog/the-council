import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Some sandboxes pre-install a Chromium build under a fixed path that doesn't
// match the version this @playwright/test release expects to download. Use it
// when present instead of failing on a missing browser; CI (no such path)
// downloads its own via `npx playwright install`.
const sandboxChromium = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const executablePath = existsSync(sandboxChromium) ? sandboxChromium : undefined;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "line" : "html",
  timeout: 60000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    locale: "en-US",
    trace: "retain-on-failure",
    launchOptions: executablePath ? { executablePath } : undefined,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  // Build is a separate, dedicated step (see package.json's `pretest:e2e` and
  // ci.yml's `e2e` job) — bundling it into this command previously blew past
  // the webServer readiness timeout on a cold CI runner even though the build
  // itself was fast; `vite preview` alone starts near-instantly.
  webServer: {
    command: "npm run preview -- --port 4173 --strict-port",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
