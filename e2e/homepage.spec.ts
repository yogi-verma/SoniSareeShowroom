import { expect, test } from "@playwright/test";

test("home page renders the showroom navigation and featured content", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Soni Saree Showroom home" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
