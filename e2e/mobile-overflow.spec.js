import { test, expect } from "@playwright/test";

// Codifies the release criteria: no horizontal overflow and no clipped footer
// at every target viewport, on both the landing page and a live chamber
// session (?preview=eclipse renders a full synthetic debate without Groq).
const VIEWPORTS = [320, 360, 390, 414, 430, 768];

for (const width of VIEWPORTS) {
  test(`no horizontal overflow at ${width}px — landing`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    const m = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
    }));
    expect(m.scrollW, "documentElement.scrollWidth must not exceed viewport").toBeLessThanOrEqual(m.innerW);
  });

  test(`no horizontal overflow at ${width}px — chamber + footer intact`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/?preview=eclipse", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3500); // let turn reveal begin
    const m = await page.evaluate(() => {
      const f = document.querySelector(".site-footer");
      const fr = f ? f.getBoundingClientRect() : null;
      return {
        scrollW: document.documentElement.scrollWidth,
        innerW: window.innerWidth,
        footerRight: fr ? fr.right : null,
      };
    });
    expect(m.scrollW).toBeLessThanOrEqual(m.innerW);
    if (m.footerRight !== null) {
      expect(m.footerRight, "footer must not be clipped past the viewport").toBeLessThanOrEqual(m.innerW + 1);
    }
  });
}
