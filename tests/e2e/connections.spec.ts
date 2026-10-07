import { test, expect } from "@playwright/test";

test("Connect your tools lists what is connected", async ({ page }) => {
  await page.goto("/admin/login?next=/admin/system/connections");
  await page.getByLabel("Your PIN").fill("246810");
  await page.getByRole("button", { name: "Open" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Connect your tools");
  await expect(page.getByText("Nothing is connected yet.", { exact: false })).toBeVisible();
});
