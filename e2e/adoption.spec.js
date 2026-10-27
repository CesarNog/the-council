import { test, expect } from "@playwright/test";

async function stubCouncil(page) {
  const seen = { body: null };
  await page.route("**/api/council", async route => {
    seen.body = JSON.parse(route.request().postData() || "{}");
    await route.fulfill({ status: 502, contentType: "application/json", body: '{"error":"gateway_error"}' });
  });
  return seen;
}

test("a question typed on the landing reaches the council in one step", async ({ page }) => {
  const seen = await stubCouncil(page);
  await page.goto("/");
  await page.getByLabel(/what are you trying to decide/i).fill("Should I take the job in Porto?");
  await page.keyboard.press("Enter");
  await expect.poll(() => seen.body, { timeout: 15000 }).not.toBeNull();
  expect(seen.body.question).toBe("Should I take the job in Porto?");
});

test("guided path convenes from the question screen without the context steps", async ({ page }) => {
  const seen = await stubCouncil(page);
  await page.goto("/");
  await page.locator(".landing-cta-primary").click();
  await page.getByRole("button", { name: /^continue$/i }).click();
  await page.locator("main textarea:visible").fill("Should I move abroad?");
  await page.getByRole("button", { name: /convene the council/i }).click();
  await expect.poll(() => seen.body, { timeout: 15000 }).not.toBeNull();
  expect(seen.body.question).toBe("Should I move abroad?");
});

test("phone header fits on one row with a language select", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/");
  const select = page.getByRole("combobox", { name: /language/i });
  await expect(select).toBeVisible();
  await select.selectOption("pt");
  await expect(page.locator("h1")).toContainText(/Nove versões/);
  const header = await page.locator(".site-header").boundingBox();
  expect(header.height).toBeLessThan(72);
});
