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

// Regression: feedRef.focus() and the onboarding/ask inputs' autoFocus used
// to call .focus() with no options, which native-scrolls the element into
// view even when it's already on screen — on mobile this silently shoved
// the page down and left the chamber title half-hidden behind the sticky
// header the moment the first turn arrived. preventScroll fixed it.
test("the chamber never auto-scrolls the page when the first turn arrives or the ask box gets focus", async ({ page }) => {
  // 360px, not just 375/390 — narrow enough that the header's language
  // selector wraps to two rows, which is what originally exposed this bug:
  // any auto-scroll away from y=0 pushed the chamber title under it.
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/?preview=eclipse", { waitUntil: "domcontentloaded" });

  await page.locator(".turn").first().waitFor({ state: "visible", timeout: 15000 });
  // give the feed-focus and follow-scroll effects a moment to fire and, if
  // either were going to scroll, to actually do it
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);

  // The chamber title must be fully visible, not clipped under the sticky
  // header, right when the debate is underway.
  const header = await page.locator(".site-header").boundingBox();
  const title = await page.locator(".chamber-head .title").boundingBox();
  expect(title.y).toBeGreaterThanOrEqual(header.y + header.height);
});

test("a persistent mobile CTA stays reachable once the landing hero scrolls out of view", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator(".landing-sticky-cta")).toHaveCount(0);

  await page.locator(".landing-hero-examples").scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 900);
  await expect(page.locator(".landing-sticky-cta")).toBeVisible();
  await expect(page.locator(".landing-sticky-cta button")).toHaveText(/consult|consultar/i);
});

test("Reveal all skips the staged ceremony straight to the verdict", async ({ page }) => {
  await page.goto("/?preview=eclipse");

  await expect(page.locator(".reveal-all-btn")).toBeVisible({ timeout: 10000 });
  const clickedAt = Date.now();
  await page.locator(".reveal-all-btn").click();

  await expect(page.locator(".vx.serif.reveal")).toContainText("[QA preview]", { timeout: 15000 });
  // The full natural ceremony for this fixture (9 turns + eclipse reflect/vote
  // pauses) runs well past 20s — reaching the verdict this fast proves the
  // click actually skipped the wait rather than the reveal just being quick.
  expect(Date.now() - clickedAt).toBeLessThan(15000);
});

test("public share requires an explicit preview/confirmation step, and redaction excludes the original question", async ({ page }) => {
  await page.goto("/?preview=eclipse");
  await page.locator(".reveal-all-btn").click();
  await expect(page.locator(".vx.serif.reveal")).toContainText("[QA preview]", { timeout: 15000 });

  // Clicking Copy Link must not copy anything yet — it opens a preview first.
  await page.getByRole("button", { name: /copy link/i }).click();
  const modal = page.locator(".share-preview-modal");
  await expect(modal).toBeVisible();
  await expect(modal).toContainText(/anyone with this link can see/i);
  await expect(modal.locator(".share-preview-text")).toContainText("[QA preview] Should I take the leap?");

  // Cancel must not perform the share action.
  await page.getByRole("button", { name: /^cancel$/i }).click();
  await expect(modal).not.toBeVisible();

  // Re-open and turn on redaction — the preview text must drop the original
  // question in favor of the generic placeholder.
  await page.getByRole("button", { name: /copy link/i }).click();
  await expect(modal).toBeVisible();
  await page.getByRole("checkbox", { name: /redact personal details/i }).check();
  await expect(modal.locator(".share-preview-text")).not.toContainText("[QA preview] Should I take the leap?");
  await expect(modal.locator(".share-preview-text")).toContainText("A personal decision");
  await expect(modal).toContainText(/only changes this shared text\/image/i);

  // Confirming actually performs the (redacted) copy-link action.
  await page.getByRole("button", { name: /^continue$/i }).click();
  await expect(modal).not.toBeVisible();
  await expect(page.getByRole("button", { name: /copied/i })).toBeVisible();
});
