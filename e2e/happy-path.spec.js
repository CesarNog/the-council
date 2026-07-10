import { test, expect } from "@playwright/test";

// `vite preview` serves the static build only — there is no /api/council backend
// behind it, so summonCouncil() network-fails. That failure used to silently
// substitute an unrelated canned "offline demo" debate as if it answered the
// real question — confusing and, worse, looked like a genuine verdict. It now
// surfaces the honest "could not reach the Council, try again" error state
// instead, so this test doubles as coverage for that failure path.
test("landing → example question → unreachable API shows the honest retry state, never a fake verdict", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const exampleChip = page.locator(".landing-hero-example-chip").first();
  await expect(exampleChip).toBeVisible();
  await exampleChip.click();

  await expect(page.locator(".err")).toContainText(/chamber doors are stuck/i, { timeout: 15000 });
  await expect(page.getByRole("button", { name: /knock again/i })).toBeVisible();

  // No fabricated content is ever shown standing in for a real answer.
  await expect(page.locator(".vx.serif.reveal")).toHaveCount(0);
});

test("eclipse QA preview renders a full synthetic debate deterministically", async ({ page }) => {
  await page.goto("/?preview=eclipse");

  await expect(page.locator(".vx.serif.reveal")).toContainText("[QA preview]", { timeout: 40000 });

  // Focus moves to the verdict announcement so screen readers pick it up
  // immediately instead of leaving focus stranded on a now-gone control.
  await expect.poll(() => page.evaluate(() => document.activeElement?.className)).toContain("chapter-eyebrow");
});
