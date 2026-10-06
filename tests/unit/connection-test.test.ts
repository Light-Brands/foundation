import { describe, it, expect, beforeEach } from "vitest";
import { cpSync, mkdirSync, mkdtempSync, renameSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { coreDb, KEY_EXT } from "../support/db";
import { listConnections, upsertConnection } from "@/lib/data/connections";
import { hasTester, runConnectionTest, TEST_TIMEOUT_MS } from "@/lib/connections/tester";
import { checkKeyFolder } from "@/lib/key/formats";
import type { Db } from "@/lib/db/types";

// The connection test seat: key/connections/<service>/test.ts, loaded like the email sender, run by the owner,
// and its answer written through the registry's own validator as status, tested_on and note.

const LATE_SUNDAY = new Date("2026-10-06T03:00:00Z"); // still Sunday the 5th in Portland
const TZ = "America/Los_Angeles";
const API_KEY = "fixture-pay-api-key-value-0001";
const ENV = { DEMO_PAY_API_KEY: API_KEY };
type Plan = { answer?: unknown; throwWith?: string; hang?: boolean; seen?: string[]; signals?: AbortSignal[] };
const g = globalThis as { __fixtureConnectionTest?: Plan };

beforeEach(() => { g.__fixtureConnectionTest = {}; });

async function withRow(status: "planned" | "connected" | "failing" = "planned", keySetting = "DEMO_PAY_API_KEY"): Promise<Db> {
  const db = await coreDb();
  await upsertConnection(db, { service: "demo-pay", door: "own", status, scopes: ["events:read"], key_setting: keySetting, tested_on: null, owner: "Owner", note: "Set up by hand." }, LATE_SUNDAY);
  return db;
}
const row = async (db: Db) => (await listConnections(db)).find((r) => r.service === "demo-pay")!;
const run = (db: Db, extra: Partial<Parameters<typeof runConnectionTest>[1]> = {}) =>
  runConnectionTest(db, { service: "demo-pay", root: KEY_EXT, env: ENV, now: LATE_SUNDAY, timezone: TZ, ...extra });
function copyFixture(): string {
  const root = mkdtempSync(path.join(tmpdir(), "conn-test-"));
  cpSync(KEY_EXT, root, { recursive: true });
  return root;
}

describe("the connection test seat", () => {
  it("the fixture Key with a test.ts still passes the Key checker", async () => {
    expect(await checkKeyFolder(KEY_EXT)).toEqual([]);
    expect(await hasTester(KEY_EXT, "demo-pay")).toBe(true);
    expect(await hasTester(KEY_EXT, "email-sending")).toBe(false);
    expect(await hasTester(KEY_EXT, "../demo-pay")).toBe(false);
  });
  it("a pass marks the connection connected, tested today in the business's zone, with the test's note", async () => {
    const db = await withRow();
    expect(await run(db)).toEqual({ status: "tested", ok: true, note: "Signed in and read one event." });
    expect(await row(db)).toMatchObject({ status: "connected", tested_on: "2026-10-05", note: "Signed in and read one event.", key_setting: "DEMO_PAY_API_KEY", scopes: ["events:read"], owner: "Owner" });
    expect(g.__fixtureConnectionTest?.seen).toEqual([API_KEY]);
    await db.close();
  });
  it("a failure marks it failing, with the reason", async () => {
    const db = await withRow("connected");
    g.__fixtureConnectionTest = { answer: { ok: false, note: "The key was refused." } };
    expect(await run(db)).toEqual({ status: "tested", ok: false, note: "The key was refused." });
    expect(await row(db)).toMatchObject({ status: "failing", tested_on: "2026-10-05", note: "The key was refused." });
    await db.close();
  });
  it("a test that throws, hangs or answers oddly is a failure, and its message never holds the key", async () => {
    const db = await withRow("connected");
    g.__fixtureConnectionTest = { throwWith: `refused ${API_KEY}\nsecond line` };
    const thrown = await run(db);
    expect(thrown).toMatchObject({ status: "tested", ok: false });
    expect(JSON.stringify(await row(db))).not.toContain(API_KEY);
    expect((await row(db)).note).toBe("The test could not finish: refused [hidden]");
    g.__fixtureConnectionTest = { answer: { ok: "yes" } };
    expect(await run(db)).toEqual({ status: "tested", ok: false, note: "The test gave no clear answer." });
    g.__fixtureConnectionTest = { answer: { ok: true, note: `token ${"Qx7pLm2Zr9tYw4Kv8nBc3Hd6s"}` } };
    expect(await run(db)).toEqual({ status: "tested", ok: true, note: "The test passed." });
    g.__fixtureConnectionTest = { hang: true };
    expect(await run(db, { timeoutMs: 50 })).toEqual({ status: "tested", ok: false, note: "The test took too long, so it was stopped." });
    expect(TEST_TIMEOUT_MS).toBeLessThanOrEqual(60_000);
    expect((await row(db)).status).toBe("failing");
    await db.close();
  });
  it("hands the test an AbortSignal, aborts it when the time is up, and leaves it alone when the test answers", async () => {
    const db = await withRow("connected");
    expect(await run(db)).toMatchObject({ ok: true });
    const answered = g.__fixtureConnectionTest!.signals![0];
    expect(answered.aborted).toBe(false);
    g.__fixtureConnectionTest = { hang: true };
    await run(db, { timeoutMs: 30 });
    const hung = g.__fixtureConnectionTest!.signals![0];
    expect(hung).toBeInstanceOf(AbortSignal);
    expect(hung.aborted).toBe(true);
    await db.close();
  });
  it("writes nothing when there is no test, no row, or no key in its setting", async () => {
    const db = await withRow("connected");
    await upsertConnection(db, { service: "email-sending", door: "own", status: "connected", scopes: [], key_setting: "", tested_on: null, owner: "Owner" }, LATE_SUNDAY);
    const before = await row(db);
    expect(await run(db, { service: "email-sending" })).toMatchObject({ status: "no_test" });
    expect(await run(db, { env: {} })).toEqual({ status: "no_setting", message: "Set DEMO_PAY_API_KEY first, then test again." });
    expect(await run(db, { service: "Demo Pay" })).toMatchObject({ status: "invalid" });
    const empty = await coreDb();
    expect(await runConnectionTest(empty, { service: "demo-pay", root: KEY_EXT, env: ENV, now: LATE_SUNDAY, timezone: TZ })).toMatchObject({ status: "no_connection" });
    await empty.close();
    expect(await row(db)).toEqual(before);
    expect(g.__fixtureConnectionTest?.seen).toBeUndefined();
    await db.close();
  });
  it("never hands a core setting to a Key's code", async () => {
    const db = await coreDb();
    await db.query("insert into connections (service, door, status, key_setting) values ('demo-pay', 'own', 'planned', 'FOUNDATION_SECRET')");
    expect(await run(db, { env: { FOUNDATION_SECRET: "x".repeat(40) } })).toMatchObject({ status: "no_setting" });
    expect(g.__fixtureConnectionTest?.seen).toBeUndefined();
    await db.close();
  });
  it("refuses a test.ts, or a connection folder, whose real path leaves the Key", async () => {
    const db = await withRow();
    const root = copyFixture();
    const outside = mkdtempSync(path.join(tmpdir(), "conn-test-outside-"));
    renameSync(path.join(root, "key/connections/demo-pay/test.ts"), path.join(outside, "test.ts"));
    symlinkSync(path.join(outside, "test.ts"), path.join(root, "key/connections/demo-pay/test.ts"));
    expect(await run(db, { root })).toMatchObject({ status: "no_test" });
    const root2 = copyFixture();
    const outside2 = mkdtempSync(path.join(tmpdir(), "conn-test-outside-"));
    renameSync(path.join(root2, "key/connections/demo-pay"), path.join(outside2, "demo-pay"));
    symlinkSync(path.join(outside2, "demo-pay"), path.join(root2, "key/connections/demo-pay"));
    expect(await run(db, { root: root2 })).toMatchObject({ status: "no_test" });
    const root3 = copyFixture();
    rmSync(path.join(root3, "key/connections/demo-pay/test.ts"));
    expect(await run(db, { root: root3 })).toMatchObject({ status: "no_test" });
    const root4 = copyFixture();
    mkdirSync(path.join(root4, "key/elsewhere"));
    renameSync(path.join(root4, "key/connections/demo-pay"), path.join(root4, "key/elsewhere/demo-pay"));
    symlinkSync(path.join(root4, "key/elsewhere/demo-pay"), path.join(root4, "key/connections/demo-pay"));
    expect(await run(db, { root: root4 })).toMatchObject({ status: "no_test" });
    expect(g.__fixtureConnectionTest?.seen).toBeUndefined();
    expect((await row(db)).status).toBe("planned");
    await db.close();
  });
});
