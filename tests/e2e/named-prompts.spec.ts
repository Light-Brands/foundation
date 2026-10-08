import { test, expect, type Page } from "@playwright/test";

// Every copied prompt opens with the name the owner gave their chief of staff, and every numbered page says its number.

async function signIn(page: Page, path: string) {
  await page.goto(path);
  await page.getByLabel("Your PIN").fill("246810");
  await page.getByRole("button", { name: "Open" }).click();
  await expect(page).toHaveURL(new RegExp(`${path.replace(/[/?]/g, (c) => `\\${c}`)}$`));
}

// Keep each copy in the page, so the test reads exactly what the button put on the clipboard.
async function recordCopies(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __copied: string[] };
    w.__copied = [];
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async (t: string) => { w.__copied.push(t); } },
    });
  });
}
const lastCopy = (page: Page) => page.evaluate(() => (window as unknown as { __copied: string[] }).__copied.at(-1) ?? "");

async function nameChief(page: Page, name: string) {
  await page.goto("/admin/agentic/agents");
  const card = page.locator("[data-chief]");
  await card.getByLabel("Change the name").fill(name);
  await card.getByRole("button", { name: "Save" }).click();
  await expect(card.locator("[data-chief-name]")).toHaveText(name || "Claude");
}

test.describe.configure({ mode: "serial" });

test.describe("named prompts", () => {
  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    await signIn(page, "/admin/agentic/agents");
    await nameChief(page, "");
    await page.close();
  });

  test("a job page shows its number, and its copied prompt opens with the name", async ({ page }) => {
    await recordCopies(page);
    await signIn(page, "/admin/agentic/agents");
    await nameChief(page, "Sage");
    await page.goto("/admin/sell/leads");
    await expect(page.locator("header [data-dictionary-number]")).toHaveText(/4\.2\.1/);
    await expect(page.locator("header [data-state]")).toHaveText("Ready to set up");
    await page.locator('[data-door="install"]').getByRole("button", { name: "Copy prompt" }).click();
    expect(await lastCopy(page)).toMatch(/^Sage, follow 4\.2\.1 Capture leads from the Ninja dictionary\./);
    await page.locator('[data-door="connect"]').getByRole("button", { name: "Copy prompt" }).click();
    expect(await lastCopy(page)).toMatch(/^Sage, .* Start by mapping how a tool I already use for this could connect\.$/);
  });

  test("after the name changes on the Agents page, the next copied prompt uses the new name", async ({ page }) => {
    await recordCopies(page);
    await signIn(page, "/admin/agentic/agents");
    await nameChief(page, "Juniper");
    await page.goto("/admin/brand/story");
    await expect(page.locator("header [data-dictionary-number]")).toHaveText(/2\.3/);
    await page.getByRole("button", { name: "Copy prompt" }).click();
    expect(await lastCopy(page)).toMatch(/^Juniper, follow 2\.3 Story and voice from the Ninja dictionary\./);
    await page.locator("[data-top-bar]").getByRole("button", { name: "Check my system" }).click();
    expect(await lastCopy(page)).toBe("Juniper, check my system with the Ninja framework runner.");
  });

  test("a name that is not a name is refused, and the saved one stays", async ({ page }) => {
    await signIn(page, "/admin/agentic/agents");
    const card = page.locator("[data-chief]");
    await card.getByLabel("Change the name").fill("R2D2");
    await card.getByRole("button", { name: "Save" }).click();
    await expect(card.getByText("Use letters, spaces, apostrophes and hyphens, up to 40 characters.")).toBeVisible();
    await expect(card.locator("[data-chief-name]")).not.toHaveText("R2D2");
  });
});
