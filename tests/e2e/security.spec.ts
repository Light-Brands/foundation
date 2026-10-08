import { test, expect } from "@playwright/test";

test("every page carries the security headers and runs with nothing blocked by its policy", async ({ page }) => {
  const blocked: string[] = [];
  page.on("console", (m) => {
    if (/Content Security Policy|Refused to (load|execute|apply)/i.test(m.text())) blocked.push(`${page.url()}: ${m.text()}`);
  });
  page.on("pageerror", (e) => blocked.push(`${page.url()}: ${e.message}`));

  for (const path of ["/", "/contact", "/admin/login"]) {
    const res = await page.goto(path);
    const h = res!.headers();
    expect(h["content-security-policy"], path).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
    expect(h["content-security-policy"], path).toContain("frame-ancestors 'none'");
    expect(h["x-content-type-options"], path).toBe("nosniff");
    expect(h["x-frame-options"], path).toBe("DENY");
    expect(h["referrer-policy"], path).toBe("strict-origin-when-cross-origin");
    expect(h["permissions-policy"], path).toContain("camera=()");
    // The brand style tag carries the nonce the policy names, so the brand still paints.
    const nonce = /'nonce-([^']+)'/.exec(h["content-security-policy"])![1];
    expect(await page.locator("style#brand").evaluate((el) => (el as HTMLStyleElement).nonce)).toBe(nonce);
  }

  await page.getByLabel("Your PIN").fill("246810");
  await page.getByRole("button", { name: "Open" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/command/inbox");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // The home screen icon, drawn by next/og, still renders under the policy.
  const icon = await page.request.get("/pwa/icon-192.png");
  expect(icon.status()).toBe(200);
  expect(blocked).toEqual([]);
});

test("the unsubscribe page's own styles apply under the production policy", async ({ page }) => {
  const blocked: string[] = [];
  page.on("console", (m) => {
    if (/Content Security Policy|Refused to (load|execute|apply)/i.test(m.text())) blocked.push(m.text());
  });
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) => console.error(`Content Security Policy violation: ${e.violatedDirective}`));
  });
  // A token in the public shape that no row signed: the page says the link does not work, styled.
  const res = await page.goto(`/u/00000000-0000-4000-8000-000000000000.${"A".repeat(43)}`);
  expect(res!.status()).toBe(404);
  expect(res!.headers()["content-security-policy"]).toMatch(/style-src-elem 'self' 'nonce-[^']+'/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This link does not work");
  expect(await page.evaluate(() => getComputedStyle(document.body).maxWidth)).toBe("512px");
  expect(blocked).toEqual([]);
});
