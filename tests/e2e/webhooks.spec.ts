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
    'import { createHmac } from "node:crypto";',
    "export function verify(req: Request, rawBody: string, secret: string): boolean {",
    '  return req.headers.get("x-e2e-signature") === createHmac("sha256", secret).update(rawBody).digest("hex");',
    "}",
    "",
  ].join("\n"));
});

const sign = (body: string, secret = "e2e-hook-secret") => createHmac("sha256", secret).update(body).digest("hex");

test("an inbound webhook is verified, recorded once, and refused when unsigned or undeclared", async ({ request }) => {
  const body = JSON.stringify({ id: `evt_${Date.now()}`, type: "paid" });
  const first = await request.post("/api/hooks/e2e-pay", { data: body, headers: { "content-type": "application/json", "x-e2e-signature": sign(body) } });
  expect(first.status()).toBe(200);
  expect(await first.text()).toBe("Received");
  const again = await request.post("/api/hooks/e2e-pay", { data: body, headers: { "content-type": "application/json", "x-e2e-signature": sign(body) } });
  expect(await again.text()).toBe("Already received");
  const forged = await request.post("/api/hooks/e2e-pay", { data: body, headers: { "content-type": "application/json", "x-e2e-signature": sign(body, "wrong") } });
  expect(forged.status()).toBe(401);
  const unknown = await request.post("/api/hooks/not-declared", { data: body, maxRedirects: 0 });
  expect(unknown.status()).toBe(404);
});
