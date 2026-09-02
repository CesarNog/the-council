import { test, expect } from "@playwright/test";

test("language selector switches language and persists across hard reloads", async ({ page }) => {
  await page.goto("/");

  // Verify default language is English
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Nine versions of you.");

  // Locate the language selector chips
  const langSelector = page.locator(".lang-selector");
  await expect(langSelector).toBeVisible();

  // Click on "Português"
  const ptChip = langSelector.getByRole("button", { name: "Português" });
  await ptChip.click();

  // Verify lang attribute and UI elements switched to Portuguese
  await expect(page.locator("html")).toHaveAttribute("lang", "pt");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Nove versões de você.");

  // Hard reload the page and verify that Portuguese language persists
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "pt");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Nove versões de você.");

  // Click on "Español"
  const esChip = langSelector.getByRole("button", { name: "Español" });
  await esChip.click();

  // Verify lang attribute and UI elements switched to Spanish
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Nueve versiones de ti.");

  // Hard reload the page and verify that Spanish language persists
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Nueve versiones de ti.");

  // Click on "中文"
  const zhChip = langSelector.getByRole("button", { name: "中文" });
  await zhChip.click();

  // Verify lang attribute and UI elements switched to Chinese
  await expect(page.locator("html")).toHaveAttribute("lang", "zh");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("九个版本的你。");

  // Hard reload the page and verify that Chinese language persists
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("九个版本的你。");

  // Set local storage to an unsupported/malformed language (e.g. 'fr')
  // normalizeLanguage should safely fallback to 'en' (or browser detected) and keep the app functional
  await page.evaluate(() => {
    localStorage.setItem("council:lang", "fr");
  });

  await page.reload();
  // Since 'fr' is unsupported, it should fallback to English 'en'
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Nine versions of you.");
});
