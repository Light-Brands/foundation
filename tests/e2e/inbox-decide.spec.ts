import { test, expect } from "@playwright/test";

test("a message in the Inbox can be marked done", async ({ page, context }) => {
  const visitor = await context.browser()!.newContext();
  const contact = await visitor.newPage();
  await contact.goto("http://localhost:3100/contact");
  await contact.getByLabel("Your name").fill("Grace");
  await contact.getByLabel("Email").fill("grace@example.com");
  await contact.getByLabel("Message").fill("Do you have space next week?");
  await contact.getByRole("button", { name: "Send" }).click();
  await expect(contact.getByRole("status")).toContainText("Thank you");

  await page.goto("/gate?next=/command/inbox");
  await page.getByLabel("Your PIN").fill("246810");
  await page.getByRole("button", { name: "Open" }).click();
  const card = page.getByRole("listitem").filter({ hasText: "Grace sent a message" });
  await card.getByRole("button", { name: "Mark done" }).click();
  await expect(card.getByRole("status")).toHaveText("Marked done.");
  await page.reload();
  await expect(page.getByRole("listitem").filter({ hasText: "Grace sent a message" }).getByText("Done")).toBeVisible();
});
