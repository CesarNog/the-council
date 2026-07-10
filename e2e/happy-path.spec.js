import { test, expect } from "@playwright/test";

// `vite preview` serves the static build only — there is no /api/council backend
// behind it, so summonCouncil() network-fails and the app falls back to the
// offline demo debate. That's a real, user-facing code path (no Groq key, or
// Groq down), so this test doubles as coverage for the offline fallback and
// the share-link-unavailable gating it drives.
test("landing → example question → offline debate renders with a verdict", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const exampleChip = page.locator(".landing-hero-example-chip").first();
  await expect(exampleChip).toBeVisible();
  await exampleChip.click();

  // Chamber has taken over; the offline banner confirms the fallback path fired.
  await expect(page.locator(".chapter-eyebrow")).toContainText(/demo/i, { timeout: 15000 });

  // The offline fallback debate has 12 turns of real prose (each turn's reveal
  // delay is capped at 3.4s), plus reflection/voting/verdict beats — full
  // reveal can take ~45-50s nominally, more under CI/parallel-worker CPU
  // contention. Give it real room rather than chasing a flake.
  const verdict = page.locator(".vx.serif.reveal");
  await expect(verdict).toBeVisible({ timeout: 70000 });
  await expect(verdict).not.toBeEmpty();

  // Focus moves to the verdict announcement so screen readers pick it up
  // immediately instead of leaving focus stranded on a now-gone control.
  await expect.poll(() => page.evaluate(() => document.activeElement?.className)).toContain("chapter-eyebrow");

  // Offline debates have no persisted id, so share links must be gated off —
  // this is the bug fixed in PR #61 (broken WhatsApp/X/LinkedIn/Facebook links).
  await expect(page.locator(".share-link-note")).toBeVisible();
  await expect(page.locator("a", { hasText: "WhatsApp" })).toHaveCount(0);
});

test("eclipse QA preview renders a full synthetic debate deterministically", async ({ page }) => {
  await page.goto("/?preview=eclipse");

  await expect(page.locator(".vx.serif.reveal")).toContainText("[QA preview]", { timeout: 40000 });
});
