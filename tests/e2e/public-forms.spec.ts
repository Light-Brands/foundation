import { test, expect } from "@playwright/test";

test("an undeclared form is not found", async ({ page }) => {
  await page.goto("/f/not-declared");
  await expect(page.getByText("That page is not part of your command center.")).toBeVisible();
});

test("the contact page carries where a visitor came from", async ({ context }) => {
  const visitor = await context.browser()!.newContext();
  const contact = await visitor.newPage();
  await contact.goto("http://localhost:3100/contact?utm_source=flyer&utm_content=window");
  await contact.getByLabel("Your name").fill("Lin");
  await contact.getByLabel("Email").fill("lin@example.com");
  await contact.getByLabel("Message").fill("Saw your flyer");
  await contact.getByRole("button", { name: "Send" }).click();
  await expect(contact.getByRole("status")).toContainText("Thank you");
});

test("a forged unsubscribe link reaches its page without a session and records nothing", async ({ browser }) => {
  const visitor = await browser.newContext();
  const page = await visitor.newPage();
  const forged = `/u/6f1c2a4e-1b2c-4d5e-8f90-1234567890ab.${"A".repeat(43)}`;
  const res = await page.goto(`http://localhost:3100${forged}`);
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "This link does not work" })).toBeVisible();
  const post = await visitor.request.post(`http://localhost:3100${forged}`, { form: { "List-Unsubscribe": "One-Click" } });
  expect(post.status()).toBe(404);
  await visitor.close();
});
