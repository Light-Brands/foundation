import { test, expect } from "@playwright/test";

test("the app manifest, icons, worker and offline page are public", async ({ request }) => {
  const m = await request.get("/manifest.webmanifest");
  expect(m.status()).toBe(200);
  const body = await m.json();
  expect(body.display).toBe("standalone");
  expect(body.start_url).toBe("/admin");
  expect(body.name).toBe("Harbor Studio");
  for (const icon of ["icon-192.png", "icon-512.png", "icon-maskable.png", "apple-touch-icon.png"]) {
    const r = await request.get(`/pwa/${icon}`);
    expect(r.status()).toBe(200);
    expect(r.headers()["content-type"]).toContain("image/png");
  }
  expect((await request.get("/sw.js")).status()).toBe(200);
  expect((await request.get("/offline")).status()).toBe(200);
  expect((await request.get("/pwa/other.png", { maxRedirects: 0 })).status()).not.toBe(200);
});

test("a phone sees the install hint and the worker never caches the admin", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/admin");
  await page.getByLabel("Your PIN").fill("246810");
  await page.getByRole("button", { name: "Open" }).click();
  await expect(page.locator("[data-install-hint]")).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  const cached = await page.evaluate(async () => {
    const keys = await caches.keys();
    const urls: string[] = [];
    for (const k of keys) for (const r of await (await caches.open(k)).keys()) urls.push(new URL(r.url).pathname);
    return urls;
  });
  expect(cached.filter((u) => u.startsWith("/admin"))).toEqual([]);
  expect(cached).toContain("/offline");

  // With the worker in control, a phone that loses its connection meets the offline page, not a browser error.
  await page.reload();
  await page.context().setOffline(true);
  await page.goto("/admin").catch(() => {});
  await expect(page.getByRole("heading", { name: "You are offline" })).toBeVisible();
  await page.context().setOffline(false);
});

test("a signed-out phone with the worker installed still meets the chamber", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto("/admin");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.goto("/admin");
  await expect(page.getByLabel("Your PIN")).toBeVisible();
  await expect(page.locator("[data-today]")).toHaveCount(0);
  await context.close();
});
