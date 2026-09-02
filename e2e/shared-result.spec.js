import { test, expect } from "@playwright/test";

test("opening a shared /r/:id URL intercepts the API and renders the Chamber", async ({ page }) => {
  // Intercept the API call to mock the stored debate result
  await page.route("**/api/result?id=abc123", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "abc123",
        asked: "Should I quit my job?",
        mood: "electric",
        turns: [
          { p: "founder", t: "Take the risk. You are built for more than a corporate cage." },
          { p: "monk", t: "Look inward. Is it freedom you seek, or are you just running away?" }
        ],
        votes: [
          { p: "founder", v: "yes", r: "Go build." },
          { p: "monk", v: "depends", r: "Only if you have peace." }
        ],
        verdict: "The Council leans forward. Prepare for transition, but verify your foundations first.",
        quote: "Take the risk.",
        realities: [],
        language: "en"
      }),
    });
  });

  // Go to the shared debate URL
  await page.goto("/r/abc123");

  // Verify that the Chamber renders the shared debate result
  // Click 'Reveal all' to skip straight to the verdict
  const revealAllBtn = page.locator(".reveal-all-btn");
  await expect(revealAllBtn).toBeVisible({ timeout: 15000 });
  await revealAllBtn.click();

  // Verify the verdict is displayed correctly
  const verdict = page.locator(".verdict");
  await expect(verdict).toBeVisible({ timeout: 15000 });
  await expect(verdict).toContainText("The Council leans forward");

  // Verify the SharedConversionBanner is visible and has the correct CTA
  const conversionBanner = page.locator(".shared-conversion-banner");
  await expect(conversionBanner).toBeVisible();
  await expect(conversionBanner.locator("button")).toContainText(/bring your own|traga sua própria/i);
});

test("opening a missing shared /r/:id URL shows the shared_gone error screen", async ({ page }) => {
  // Intercept the API call to return a 404
  await page.route("**/api/result?id=missing404", async (route) => {
    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ error: "not_found" }),
    });
  });

  await page.goto("/r/missing404");

  // Verify that the "shared_gone" screen is rendered
  await expect(page.locator("h1")).toContainText(/adjourned/i); // "This decision has been adjourned" or similar
  await expect(page.locator(".eyebrow")).toContainText(/verdict/i);
});
