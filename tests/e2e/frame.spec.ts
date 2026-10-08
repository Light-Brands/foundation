import { test, expect, type Page } from "@playwright/test";

async function signIn(page: Page, path = "/admin") {
  await page.goto(path);
  await page.getByLabel("Your PIN").fill("246810");
  await page.getByRole("button", { name: "Open" }).click();
  await expect(page).toHaveURL(new RegExp(`${path.replace(/[/?]/g, (c) => `\\${c}`)}$`));
}

test.describe("desktop", () => {
  test("the sidebar shows six sections and opens the one in use", async ({ page }) => {
    await signIn(page);
    const nav = page.getByRole("navigation", { name: "Command center" });
    for (const label of ["Command center", "Brand", "Agentic", "Grow", "Serve", "Run"]) {
      await expect(nav.getByRole("button", { name: label })).toBeVisible();
    }
    await nav.getByRole("button", { name: "Grow" }).click();
    await expect(nav.getByText("Marketing")).toBeVisible();
    await expect(nav.getByRole("link", { name: "Capture leads" })).toBeVisible();
    await nav.getByRole("button", { name: "Agentic" }).click();
    await expect(nav.getByRole("link", { name: /Recipes/ })).toContainText("Soon");
    await expect(nav.getByRole("link", { name: /Routines/ })).toContainText("Soon");
  });

  test("the gear opens Settings and Security", async ({ page }) => {
    await signIn(page);
    await page.getByRole("link", { name: "Settings", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/settings$/);
    await expect(page.getByRole("heading", { name: "Security" })).toBeVisible();
  });

  test("the top bar says where you are and holds the shared actions", async ({ page }) => {
    await signIn(page, "/admin/keep/reviews");
    const bar = page.locator("[data-top-bar]");
    await expect(bar).toContainText("Serve");
    await expect(bar).toContainText("Collect reviews");
    await expect(bar.getByRole("button", { name: "Check my system" })).toBeVisible();
    await expect(bar.getByRole("link", { name: "View my site" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Command center" }).getByRole("link", { name: /Collect reviews/ })).toHaveAttribute("aria-current", "page");
  });

  test("the sidebar collapses and remembers it", async ({ page }) => {
    await signIn(page);
    await page.getByRole("button", { name: "Collapse the menu" }).click();
    await page.reload();
    await expect(page.getByRole("button", { name: "Expand the menu" })).toBeVisible();
    await page.getByRole("button", { name: "Expand the menu" }).click();
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("the tab bar is always there, with no sidebar and no sideways scroll", async ({ page }) => {
    await signIn(page);
    const tabs = page.getByRole("navigation", { name: "Tabs" });
    for (const label of ["Today", "Brand", "Business", "Agentic", "More"]) {
      await expect(tabs.getByRole("link", { name: label })).toBeVisible();
    }
    await expect(page.getByRole("navigation", { name: "Command center" })).toBeHidden();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
  });

  test("any job is two taps away, and back returns to its tab", async ({ page }) => {
    await signIn(page);
    const tabs = page.getByRole("navigation", { name: "Tabs" });
    await tabs.getByRole("link", { name: "Business" }).click();
    await expect(page).toHaveURL(/\/admin\/business/);
    await page.getByRole("navigation", { name: "Stage" }).getByRole("link", { name: "Serve" }).click();
    await page.getByRole("link", { name: /Collect reviews/ }).click();
    await expect(page).toHaveURL(/\/admin\/keep\/reviews$/);
    await expect(page.getByRole("banner").getByText("Collect reviews")).toBeVisible();
    await page.getByRole("link", { name: "Back" }).click();
    await expect(page).toHaveURL(/\/admin\/business\?stage=serve$/);
    await expect(page.getByRole("navigation", { name: "Stage" }).getByRole("link", { name: "Serve" })).toHaveAttribute("aria-current", "page");
  });

  test("More holds Settings and Security", async ({ page }) => {
    await signIn(page);
    await page.getByRole("navigation", { name: "Tabs" }).getByRole("link", { name: "More" }).click();
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Security" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Set up/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Lock" })).toBeVisible();
  });

  test("Today opens on the business, then what needs you", async ({ page }) => {
    await signIn(page);
    const first = page.locator("[data-today] > *").first();
    await expect(first.getByRole("heading", { level: 1 })).toHaveText("Harbor Studio");
    await expect(page.locator("[data-today-grid] > *").first()).toHaveAttribute("data-needs-you", "");
  });

  test("every tab and stage is a full-size tap target", async ({ page }) => {
    await signIn(page, "/admin/business");
    const targets = [
      ...(await page.getByRole("navigation", { name: "Tabs" }).getByRole("link").all()),
      ...(await page.getByRole("navigation", { name: "Stage" }).getByRole("link").all()),
    ];
    expect(targets.length).toBe(8);
    for (const t of targets) expect((await t.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  });
});
