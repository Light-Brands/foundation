import { test, expect } from "@playwright/test";

test("the chamber shows the brand and opens with the PIN", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin$/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(page.locator("[data-chamber]")).toContainText("Harbor Studio");
  await page.getByLabel("Your PIN").fill("246810");
  await page.getByRole("button", { name: "Open" }).click();
  await expect(page).toHaveURL(/\/admin$/);
});

test("the chamber fits a phone", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/admin/login");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
  await expect(page.getByLabel("Your PIN")).toBeVisible();
});

test("the delete key takes back one digit", async ({ page }) => {
  await page.goto("/admin/login");
  const pin = page.getByLabel("Your PIN");
  await expect(pin).toHaveAttribute("placeholder", "••••••");
  for (const d of ["2", "4", "6"]) await page.getByRole("button", { name: d, exact: true }).click();
  await page.getByRole("button", { name: "Delete last digit" }).click();
  await expect(pin).toHaveValue("24");
});
