import { test, expect } from "@playwright/test";

// ?preview=split|eclipse renders a synthetic debate with zero Groq usage.
test.beforeEach(async ({ page }) => {
  // the daily greeting would otherwise sit above the chamber on first entry
  await page.addInitScript(() => {
    const d = new Date();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    localStorage.setItem("council:last_greet", key);
  });
});

test("mood param drives the chamber atmosphere", async ({ page }) => {
  await page.goto("/?preview=split&mood=somber");
  await expect(page.locator(".chamber-atmo")).toHaveAttribute("data-mood", "somber");
  await expect(page.locator(".atmo-rain span").first()).toBeAttached();
  await page.goto("/?preview=split&mood=hopeful");
  await expect(page.locator(".chamber-atmo")).toHaveAttribute("data-mood", "hopeful");
  await expect(page.locator(".atmo-stars span").first()).toBeAttached();
  await page.goto("/?preview=split&mood=bogus");
  await expect(page.locator(".chamber-atmo")).toHaveAttribute("data-mood", "neutral");
});

test("arrow key advances turns, End reveals everything", async ({ page }) => {
  await page.goto("/?preview=split");
  await expect(page.locator(".feed .turn").first()).toBeVisible();
  const before = await page.locator(".feed .turn").count();
  await page.locator("body").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => page.locator(".feed .turn").count()).toBeGreaterThan(before);
  await page.keyboard.press("End");
  await expect(page.locator(".verdict .headline")).toBeVisible();
  await expect(page.locator(".feed .turn")).toHaveCount(9);
});

test("live consensus meter appears while votes land", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?preview=split");
  await expect(page.locator(".consensus-meter")).toBeVisible({ timeout: 60000 });
  await expect(page.locator(".cm-count")).toContainText("/9");
});

test("ring member card shows revealed stats on hover", async ({ page }) => {
  // nodes breathe forever, so Playwright's hover never sees a stable element;
  // reduced motion stops the breathing and also covers that path
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?preview=split");
  await page.locator("body").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("End");
  const founder = page.locator(".ring-wrap .node.has-card").first();
  await founder.hover();
  const card = founder.locator(".member-card");
  await expect(card).toHaveCSS("opacity", "1");
  await expect(card).toContainText("1");
  await expect(founder).toHaveAttribute("aria-label", /Founder/);
});

test("copy quote writes the attributed quote to the clipboard", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/?preview=split");
  await page.locator("body").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("End");
  const btn = page.locator(".copy-quote");
  await expect(btn).toBeVisible({ timeout: 15000 });
  await btn.click();
  await expect(btn).toHaveClass(/done/);
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip).toContain("[QA preview quote]");
  expect(clip).toContain("The Council");
});
