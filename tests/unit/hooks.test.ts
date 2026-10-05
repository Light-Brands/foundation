import { describe, it, expect, beforeEach } from "vitest";
import { cpSync, mkdtempSync, readFileSync, writeFileSync, symlinkSync, mkdirSync } from "node:fs";
import { createHmac } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";
import { coreDb, KEY_EXT } from "../support/db";
import { receiveWebhook, HOOK_BODY_MAX } from "@/lib/hooks/receive";
import { pruneWebhookEvents, PRUNE_MIN_DAYS } from "@/lib/hooks/events";
import { checkKeyFolder } from "@/lib/key/formats";
import { isPublicPath } from "@/lib/auth/gate";

const NOW = new Date("2026-10-05T16:00:00Z");
const SECRET = "whsec-test";
const ENV = { DEMO_PAY_WEBHOOK_SECRET: SECRET };
const g = globalThis as { __demoPayEvents?: unknown[]; __demoPayFail?: boolean };

function signed(body: string, secret = SECRET, url = "http://localhost/api/hooks/demo-pay"): Request {
  return new Request(url, { method: "POST", body, headers: { "x-demo-signature": createHmac("sha256", secret).update(body).digest("hex") } });
}
const EVENT = JSON.stringify({ id: "evt_1", type: "payment.succeeded", amount: 1200 });

function copyFixture(): string {
  const root = mkdtempSync(path.join(tmpdir(), "hooks-"));
  cpSync(KEY_EXT, root, { recursive: true });
  return root;
}
const yamlFile = (root: string) => path.join(root, "key/connections/demo-pay.yaml");

beforeEach(() => { g.__demoPayEvents = []; g.__demoPayFail = false; });

describe("inbound webhooks", () => {
  it("records the first delivery, runs handle once, and ignores a replay", async () => {
    const db = await coreDb();
    const deps = { db, root: KEY_EXT, env: ENV };
    expect((await receiveWebhook(deps, { connection: "demo-pay", req: signed(EVENT) }, NOW)).status).toBe(200);
    expect((await receiveWebhook(deps, { connection: "demo-pay", req: signed(EVENT) }, NOW)).status).toBe(200);
    expect(await db.query("select connection, event_id from webhook_events")).toEqual([{ connection: "demo-pay", event_id: "evt_1" }]);
    expect(g.__demoPayEvents).toEqual([JSON.parse(EVENT)]);
    await db.close();
  });
  it("an undeclared connection is refused and writes nothing", async () => {
    const db = await coreDb();
    for (const c of ["nope", "../demo-pay", "Demo-Pay", "demo-pay/x", ""]) {
      expect((await receiveWebhook({ db, root: KEY_EXT, env: ENV }, { connection: c, req: signed(EVENT) }, NOW)).status, c).toBe(404);
    }
    expect(await db.query("select id from webhook_events")).toEqual([]);
    await db.close();
  });
  it("a bad signature writes nothing and never reaches handle", async () => {
    const db = await coreDb();
    const deps = { db, root: KEY_EXT, env: ENV };
    expect((await receiveWebhook(deps, { connection: "demo-pay", req: signed(EVENT, "wrong") }, NOW)).status).toBe(401);
    const unsigned = new Request("http://localhost/api/hooks/demo-pay", { method: "POST", body: EVENT });
    expect((await receiveWebhook(deps, { connection: "demo-pay", req: unsigned }, NOW)).status).toBe(401);
    const tampered = signed(EVENT);
    const forged = new Request(tampered.url, { method: "POST", body: EVENT.replace("1200", "1"), headers: tampered.headers });
    expect((await receiveWebhook(deps, { connection: "demo-pay", req: forged }, NOW)).status).toBe(401);
    expect(await db.query("select id from webhook_events")).toEqual([]);
    expect(g.__demoPayEvents).toEqual([]);
    await db.close();
  });
  it("refuses when the secret setting is empty, without a database, or past the body cap, and writes nothing", async () => {
    const db = await coreDb();
    expect((await receiveWebhook({ db, root: KEY_EXT, env: {} }, { connection: "demo-pay", req: signed(EVENT, "") }, NOW)).status).toBe(503);
    expect((await receiveWebhook({ db: null, root: KEY_EXT, env: ENV }, { connection: "demo-pay", req: signed(EVENT) }, NOW)).status).toBe(503);
    const big = JSON.stringify({ id: "evt_big", pad: "x".repeat(HOOK_BODY_MAX) });
    expect((await receiveWebhook({ db, root: KEY_EXT, env: ENV }, { connection: "demo-pay", req: signed(big) }, NOW)).status).toBe(413);
    expect(await db.query("select id from webhook_events")).toEqual([]);
    await db.close();
  });
  it("a missing or escaping verifier is not found", async () => {
    const db = await coreDb();
    const root = copyFixture();
    const deps = { db, root, env: ENV };
    const base = readFileSync(yamlFile(root), "utf8");
    for (const v of ["gone.ts", "../demo-pay.yaml", "../../apps/leads-demo/definition.yaml", "/etc/passwd", "sub/../../x.ts"]) {
      writeFileSync(yamlFile(root), base.replace("verifier: verify.ts", `verifier: "${v}"`));
      expect((await receiveWebhook(deps, { connection: "demo-pay", req: signed(EVENT) }, NOW)).status, v).toBe(404);
    }
    mkdirSync(path.join(root, "outside"), { recursive: true });
    writeFileSync(path.join(root, "outside/evil.ts"), "export const verify = () => true;\n");
    symlinkSync(path.join(root, "outside/evil.ts"), path.join(root, "key/connections/demo-pay/linked.ts"));
    writeFileSync(yamlFile(root), base.replace("verifier: verify.ts", "verifier: linked.ts"));
    expect((await receiveWebhook(deps, { connection: "demo-pay", req: signed(EVENT) }, NOW)).status, "symlink").toBe(404);
    writeFileSync(yamlFile(root), "connection: demo-pay\nname: Demo payments\n");
    expect((await receiveWebhook(deps, { connection: "demo-pay", req: signed(EVENT) }, NOW)).status, "no webhook").toBe(404);
    expect(await db.query("select id from webhook_events")).toEqual([]);
    await db.close();
  });
  it("lets a failed handle be delivered again", async () => {
    const db = await coreDb();
    const deps = { db, root: KEY_EXT, env: ENV };
    g.__demoPayFail = true;
    expect((await receiveWebhook(deps, { connection: "demo-pay", req: signed(EVENT) }, NOW)).status).toBe(500);
    expect(await db.query("select id from webhook_events")).toEqual([]);
    g.__demoPayFail = false;
    expect((await receiveWebhook(deps, { connection: "demo-pay", req: signed(EVENT) }, NOW)).status).toBe(200);
    expect(g.__demoPayEvents).toHaveLength(1);
    await db.close();
  });
  it("takes the event id from the body, or a hash of the body when it has none", async () => {
    const db = await coreDb();
    const deps = { db, root: KEY_EXT, env: ENV };
    await receiveWebhook(deps, { connection: "demo-pay", req: signed("plain text") }, NOW);
    await receiveWebhook(deps, { connection: "demo-pay", req: signed("plain text") }, NOW);
    const rows = await db.query<{ event_id: string }>("select event_id from webhook_events");
    expect(rows).toHaveLength(1);
    expect(rows[0].event_id).toMatch(/^sha256:[0-9a-f]{64}$/);
    await db.close();
  });
});

describe("webhook declarations in the Key checker", () => {
  it("the fixture's connection passes", async () => expect(await checkKeyFolder(KEY_EXT)).toEqual([]));
  it("refuses an escaping verifier and a public or malformed secret setting", async () => {
    const root = copyFixture();
    const base = readFileSync(yamlFile(root), "utf8");
    writeFileSync(yamlFile(root), base.replace("verifier: verify.ts", "verifier: ../evil.ts"));
    expect((await checkKeyFolder(root)).join("\n")).toMatch(/verifier must be a \.ts file inside key\/connections\/demo-pay\//);
    writeFileSync(yamlFile(root), base.replace("DEMO_PAY_WEBHOOK_SECRET", "NEXT_PUBLIC_PAY"));
    expect((await checkKeyFolder(root)).join("\n")).toMatch(/secret_setting must be a setting name/);
    writeFileSync(yamlFile(root), base.replace("DEMO_PAY_WEBHOOK_SECRET", "FOUNDATION_SECRET"));
    expect((await checkKeyFolder(root)).join("\n")).toMatch(/secret_setting must be a setting name/);
  });
});

describe("pruneWebhookEvents", () => {
  it("keeps at least 30 days and forgets older entries", async () => {
    const db = await coreDb();
    await db.query("insert into webhook_events (connection, event_id, received_at) values ('demo-pay', 'old', $1), ('demo-pay', 'new', $2)", [
      new Date(NOW.getTime() - 40 * 86400_000), new Date(NOW.getTime() - 10 * 86400_000),
    ]);
    await expect(pruneWebhookEvents(db, PRUNE_MIN_DAYS - 1, NOW)).rejects.toBeInstanceOf(RangeError);
    await expect(pruneWebhookEvents(db, 30.5, NOW)).rejects.toBeInstanceOf(RangeError);
    expect(await pruneWebhookEvents(db, 30, NOW)).toBe(1);
    expect(await db.query("select event_id from webhook_events")).toEqual([{ event_id: "new" }]);
    await db.close();
  });
});

describe("the webhook route", () => {
  it("is public only at /api/hooks/<connection>", () => {
    expect(isPublicPath("/api/hooks/demo-pay")).toBe(true);
    for (const p of ["/api/hooks", "/api/hooks/", "/api/hooks/Demo", "/api/hooks/a/b", "/api/hooks/a_b"]) expect(isPublicPath(p), p).toBe(false);
  });
});
