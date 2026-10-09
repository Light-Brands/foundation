import { test, expect, type Page } from "@playwright/test";

async function signIn(page: Page, path = "/admin") {
  await page.goto(path);
  await page.getByLabel("Your PIN").fill("246810");
  await page.getByRole("button", { name: "Open" }).click();
  await expect(page).toHaveURL(new RegExp(`${path.replace(/[/?]/g, (c) => `\\${c}`)}$`));
}

test("the default target is remembered across a reload", async ({ page }) => {
  await signIn(page);
  await page.goto("/admin/context/story");
  const install = page.locator('[data-door="install"]');
  const main = install.getByRole("link", { name: /Open in Claude Desktop/ });
  await expect(main).toHaveAttribute("href", /^claude:\/\/code\/new\?q=/);
  await install.getByRole("button", { name: "Choose where to open" }).click();
  await page.getByRole("menuitemradio", { name: /Terminal/ }).click();
  await expect(page.getByRole("menu")).toBeHidden();
  await page.reload();
  await expect(page.locator('[data-door="install"]').getByRole("link", { name: /Open in Terminal/ })).toHaveAttribute("href", /^claude-cli:\/\/open\?q=.*cwd=/);
});

test("Escape closes the menu and returns focus, and ArrowDown moves between rows", async ({ page }) => {
  await signIn(page);
  await page.goto("/admin/agentic/voice-and-writing");
  const chevron = page.locator('[data-door="install"]').getByRole("button", { name: "Choose where to open" });
  await chevron.click();
  const rows = page.getByRole("menuitemradio");
  await expect(rows.first()).toBeVisible();
  const checked = page.locator('[role="menuitemradio"][aria-checked="true"]');
  await expect(checked).toBeFocused();
  const before = await page.evaluate(() => document.activeElement?.textContent ?? "");
  await page.keyboard.press("ArrowDown");
  const after = await page.evaluate(() => document.activeElement?.textContent ?? "");
  expect(after).not.toBe(before);
  expect(await page.evaluate(() => document.activeElement?.getAttribute("role"))).toBe("menuitemradio");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();
  await expect(chevron).toBeFocused();
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("the Claude menu stays inside a 375px screen", async ({ page }) => {
    await signIn(page);
    // The Claude icon is a link on a local server; the chevron beside it opens the menu.
    const icon = page.getByRole("banner").getByRole("link", { name: "Open Claude" });
    await expect(icon).toBeVisible();
    const chevron = icon.locator("xpath=following-sibling::button[@aria-label='Choose where to open']");
    const menu = page.getByRole("menu");
    // A press that lands before the page has hydrated does nothing, so press again until the menu says it is open.
    await expect(async () => {
      if ((await chevron.getAttribute("aria-expanded")) !== "true") await chevron.click();
      await expect(menu).toBeVisible({ timeout: 1000 });
    }).toPass();
    // Measure the popup surface around the list, which carries the padding.
    const box = await menu.locator("xpath=..").boundingBox();
    expect(box).not.toBeNull();
    // A bottom sheet with the page's 16px gutter on both sides, clear of the tab bar.
    expect(box!.x).toBeGreaterThanOrEqual(16);
    expect(box!.x + box!.width).toBeLessThanOrEqual(375 - 16);
    const tabs = await page.getByRole("navigation", { name: "Tabs" }).boundingBox();
    expect(box!.y + box!.height).toBeLessThanOrEqual(tabs!.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    // A light scrim sits behind the sheet; a tap on it closes the sheet and lands nowhere else.
    await page.mouse.click(187, 120);
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/\/admin$/);
  });
});

test("Tab closes the menu and moves on, and the open menu stays on screen", async ({ page }) => {
  await signIn(page);
  await page.goto("/admin/context/story");
  const install = page.locator('[data-door="install"]');
  const chevron = install.getByRole("button", { name: "Choose where to open" });
  await chevron.click();
  const surface = page.getByRole("menu").locator("xpath=..");
  const box = await surface.boundingBox();
  const vh = page.viewportSize()!.height;
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(vh);
  await expect(page.locator('[role="menuitemradio"][aria-checked="true"]')).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("menu")).toBeHidden();
  await expect(chevron).toHaveAttribute("aria-expanded", "false");
  // Focus moved on to the next stop after the button, Copy prompt.
  await expect(install.getByRole("button", { name: "Copy prompt" })).toBeFocused();
});

test("an old Brand address lands on its Context page", async ({ page }) => {
  await signIn(page);
  const res = await page.goto("/admin/brand/story?from=bookmark");
  expect(page.url()).toMatch(/\/admin\/context\/story\?from=bookmark$/);
  expect(res?.ok()).toBe(true);
});

test("Context, Agentic and job pages share the prompt page", async ({ page }) => {
  await signIn(page);
  for (const path of ["/admin/context/story", "/admin/agentic/research", "/admin/sell/leads"]) {
    await page.goto(path);
    for (const d of ["connect", "install", "custom"]) await expect(page.locator(`[data-door="${d}"]`)).toBeVisible();
    await expect(page.locator("[data-prompt]")).toBeVisible();
  }
});

test("every sidebar group has a label", async ({ page }) => {
  await signIn(page);
  await page.goto("/admin");
  const nav = page.getByRole("navigation", { name: "Command center" });
  const sections = ["Command center", "Context", "Agentic", "Grow", "Serve", "Run"];
  for (const label of sections) {
    const toggle = nav.getByRole("button", { name: label });
    // Open only sections that are closed, so an already open one is read as it stands.
    if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
    const unlabeled = await page.evaluate((name) => {
      const navEl = document.querySelector('nav[aria-label="Command center"]')!;
      const btn = Array.from(navEl.querySelectorAll("button")).find((b) => b.textContent?.trim().startsWith(name));
      const panel = document.getElementById(btn!.getAttribute("aria-controls")!)!;
      const lists = Array.from(panel.querySelectorAll("ul"));
      const bad = lists.filter((ul) => !(ul.parentElement?.querySelector(":scope > [data-group]")?.getAttribute("data-group") ?? "").trim());
      return { lists: lists.length, bad: bad.length };
    }, label);
    expect(unlabeled.lists, `${label} has no lists to check`).toBeGreaterThan(0);
    expect(unlabeled.bad, `${label} has an unlabeled group`).toBe(0);
  }
});
