import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { createHmac } from "node:crypto";
import path from "node:path";

// The running app loads a connection's verifier from the Key, checks the signature on the raw body,
// and records each event once. This proves the verifier loads in the built server, not only in tests.
const KEY = path.join(process.cwd(), ".data/e2e-key/key/connections");

test.beforeAll(() => {
  mkdirSync(path.join(KEY, "e2e-pay"), { recursive: true });
  writeFileSync(path.join(KEY, "e2e-pay.yaml"), "connection: e2e-pay\nwebhook:\n  verifier: verify.ts\n  secret_setting: E2E_HOOK_SECRET\n");
  writeFileSync(path.join(KEY, "e2e-pay/verify.ts"), [
    'import { createHmac, timingSafeEqual } from "node:crypto";',
    "type VerifyContext = { bytes: Uint8Array; now: Date; toleranceMs: number };",
    "export function verify(req: Request, rawBody: string, secret: string, ctx: VerifyContext): boolean {",
    '  const ts = req.headers.get("x-e2e-timestamp") ?? "";',
    "  if (!/^\\d{1,12}$/.test(ts) || Math.abs(ctx.now.getTime() - Number(ts) * 1000) > ctx.toleranceMs) return false;",
    '  const sent = req.headers.get("x-e2e-signature") ?? "";',
    '  const want = createHmac("sha256", secret).update(`${ts}.`).update(ctx.bytes).digest("hex");',
    "  return sent.length === want.length && timingSafeEqual(Buffer.from(sent), Buffer.from(want));",
    "}",
    "",
  ].join("\n"));
});

const headers = (body: string, secret = "e2e-hook-secret", at = Date.now()) => {
  const ts = String(Math.floor(at / 1000));
  return { "content-type": "application/json", "x-e2e-timestamp": ts, "x-e2e-signature": createHmac("sha256", secret).update(`${ts}.${body}`).digest("hex") };
};

test("an inbound webhook is verified, recorded once, and refused when unsigned, stale or undeclared", async ({ request }) => {
  const body = JSON.stringify({ id: `evt_${Date.now()}`, type: "paid" });
  const first = await request.post("/api/hooks/e2e-pay", { data: body, headers: headers(body) });
  expect(first.status()).toBe(200);
  expect(await first.text()).toBe("Received");
  const again = await request.post("/api/hooks/e2e-pay", { data: body, headers: headers(body) });
  expect(await again.text()).toBe("Already received");
  const forged = await request.post("/api/hooks/e2e-pay", { data: body, headers: headers(body, "wrong") });
  expect(forged.status()).toBe(401);
  const stale = JSON.stringify({ id: `evt_stale_${Date.now()}`, type: "paid" });
  const old = await request.post("/api/hooks/e2e-pay", { data: stale, headers: headers(stale, "e2e-hook-secret", Date.now() - 10 * 60_000) });
  expect(old.status()).toBe(401);
  const unknown = await request.post("/api/hooks/not-declared", { data: body, maxRedirects: 0 });
  expect(unknown.status()).toBe(404);
});
