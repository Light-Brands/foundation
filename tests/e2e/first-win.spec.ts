import { test, expect } from "@playwright/test";

test("the first win: in with the PIN, profile saved, a real message in the Inbox", async ({ page, context }) => {
  await page.goto("/admin/system/settings");
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fsystem%2Fsettings/);

  await page.getByLabel("Your PIN").fill("000000");
  await page.getByRole("button", { name: "Open" }).click();
  await expect(page.getByRole("status")).toHaveText("That PIN did not match. Try again.");

  await page.getByLabel("Your PIN").fill("246810");
  await page.getByRole("button", { name: "Open" }).click();
  await expect(page).toHaveURL(/\/admin\/system\/settings$/);

  await page.goto("/system/setup");
  await expect(page).toHaveURL(/\/admin\/system\/setup$/);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Harbor Studio");
  await page.goto("/admin/system/settings");

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

  await page.goto("/admin/command/inbox");
  await expect(page.getByText("Ada sent a message")).toBeVisible();
  // Times read the way a person says them, with the full date kept in the time element.
  const when = page.locator("li", { hasText: "Ada sent a message" }).locator("time").first();
  await expect(when).toHaveText(/^(Just now|\d+m ago)$/);
  await expect(when).toHaveAttribute("datetime", /^\d{4}-\d{2}-\d{2}T/);
  await expect(page.getByText("<script>alert(1)</script> Hello")).toBeVisible();

  await page.goto("/admin/system/modules");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("What you have built");
  await expect(page.getByText("Nothing is built yet.")).toBeVisible();

  await page.goto("/admin/deliver/booking");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Book appointments");
  await expect(page.getByText("Have Light Brands build it")).toBeVisible();
  // The shipped dictionary has no install entry for this job yet, so the doors say what comes next.
  await expect(page.getByText("Until the install ships, Claude plans what it will do", { exact: false })).toBeVisible();
  await expect(page.getByText("Have Claude map how the tool you already use for Book appointments would connect.", { exact: false })).toBeVisible();

  await page.goto("/admin/deliver/not-a-thing");
  await expect(page.getByText("That page is not part of your command center.")).toBeVisible();
});

test("a deep link outside the site never escapes the gate", async ({ page }) => {
  await page.goto("/admin/login?next=//evil.example");
  await page.getByLabel("Your PIN").fill("246810");
  await page.getByRole("button", { name: "Open" }).click();
  await expect(page).toHaveURL("http://localhost:3100/admin");
});

test("pages never scroll sideways on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/admin/login");
  await page.getByLabel("Your PIN").fill("246810");
  await page.getByRole("button", { name: "Open" }).click();
  await expect(page).toHaveURL("http://localhost:3100/admin");
  for (const path of ["/admin", "/admin/system/setup", "/admin/deliver/booking"]) {
    await page.goto(path);
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width, path).toBeLessThanOrEqual(375);
  }
});
