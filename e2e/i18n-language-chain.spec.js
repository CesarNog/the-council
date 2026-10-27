import { test, expect } from "@playwright/test";

// Locks the chain behind the old "pt-BR UI but English debate" report:
// browser locale -> detected language -> UI copy -> `language` field actually
// sent to /api/council. The API is stubbed, so this costs zero Groq tokens.
test.use({ locale: "pt-BR" });

test("pt-BR browser renders Portuguese UI and sends language=pt to /api/council", async ({ page }) => {
  let body = null;
  await page.route("**/api/council", async route => {
    body = JSON.parse(route.request().postData() || "{}");
    await route.fulfill({ status: 502, contentType: "application/json", body: '{"error":"gateway_error"}' });
  });

  await page.goto("/");
  await expect(page.locator("body")).toContainText(/Nove versões|veredito/i);

  await page.getByRole("button", { name: /consultar/i }).first().click();

  // Walk whatever onboarding steps exist (their order has changed more than
  // once) until the council request fires: fill empty fields, pick the first
  // option, press the primary forward button.
  for (let i = 0; i < 14 && !body; i++) {
    const name = page.locator("main input[type=text]:visible").first();
    if (await name.count() && !(await name.inputValue())) await name.fill("Cesar");
    const question = page.locator("main textarea:visible").first();
    if (await question.count() && !(await question.inputValue())) await question.fill("Devo mudar de carreira?");
    const quick = page.getByRole("button", { name: /Conselho Rápido/i });
    if (await quick.count()) { await quick.first().click(); await page.waitForTimeout(500); continue; }
    const option = page.locator(".onb-option:visible").first();
    if (await option.count()) await option.click();
    const forward = page.locator("main button.btn.primary:visible:enabled, main button:visible:enabled", { hasText: /^(Continuar|Convocar.*|Consultar.*)$/i }).last();
    if (!body && await forward.count()) await forward.click().catch(() => {});
    await page.waitForTimeout(500);
  }

  await expect.poll(() => body, { timeout: 15000 }).not.toBeNull();
  expect(body.language).toBe("pt");
  expect(body.question).toContain("Devo mudar de carreira");
});
