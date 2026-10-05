import { test, expect } from "@playwright/test";

test("the first win: in with the PIN, profile saved, a real message in the Inbox", async ({ page, context }) => {
  await page.goto("/system/settings");
  await expect(page).toHaveURL(/\/gate\?next=%2Fsystem%2Fsettings/);

  await page.getByLabel("Your PIN").fill("000000");
  await page.getByRole("button", { name: "Open" }).click();
  await expect(page.getByRole("status")).toHaveText("That PIN did not match. Try again.");

  await page.getByLabel("Your PIN").fill("246810");
  await page.getByRole("button", { name: "Open" }).click();
  await expect(page).toHaveURL(/\/system\/settings$/);

  await page.getByLabel("What you do, in one line").fill("Calm, careful design work");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status")).toHaveText("Saved.");

  const visitor = await context.browser()!.newContext();
  const contact = await visitor.newPage();
  await contact.goto("http://localhost:3100/contact");
  await expect(contact.getByRole("heading", { level: 1 })).toHaveText("Harbor Studio");
  await contact.getByLabel("Your name").fill("Ada");
  await contact.getByLabel("Email").fill("ada@example.com");
  await contact.getByLabel("Message").fill("<script>alert(1)</script> Hello");
  await contact.getByRole("button", { name: "Send" }).click();
  await expect(contact.getByRole("status")).toContainText("Thank you");

  await page.goto("/command/inbox");
  await expect(page.getByText("Ada sent a message")).toBeVisible();
  await expect(page.getByText("<script>alert(1)</script> Hello")).toBeVisible();

  await page.goto("/system/modules");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("What you have built");
  await expect(page.getByText("Nothing is built yet.")).toBeVisible();

  await page.goto("/deliver/booking");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Book appointments");
  await expect(page.getByText("Have Light Brands build it")).toBeVisible();

  await page.goto("/deliver/not-a-thing");
  await expect(page.getByText("That page is not part of your command center.")).toBeVisible();
});

test("a deep link outside the site never escapes the gate", async ({ page }) => {
  await page.goto("/gate?next=//evil.example");
  await page.getByLabel("Your PIN").fill("246810");
  await page.getByRole("button", { name: "Open" }).click();
  await expect(page).toHaveURL("http://localhost:3100/");
});

test("pages never scroll sideways on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/gate");
  await page.getByLabel("Your PIN").fill("246810");
  await page.getByRole("button", { name: "Open" }).click();
  await expect(page).toHaveURL("http://localhost:3100/");
  for (const path of ["/", "/system/setup", "/deliver/booking"]) {
    await page.goto(path);
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width, path).toBeLessThanOrEqual(375);
  }
});
