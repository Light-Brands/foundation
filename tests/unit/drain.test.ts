import { describe, it, expect, beforeEach, vi } from "vitest";
import { cpSync, mkdtempSync, writeFileSync, symlinkSync, renameSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { coreDb, KEY_EXT } from "../support/db";
import { drainOutbox } from "@/lib/outbox/drain";
import { draftEmail, markCopied, optOut } from "@/lib/data/outbox";
import { upsertConnection, type ConnectionStatus } from "@/lib/data/connections";
import { setPause } from "@/lib/data/pause";
import type { Db } from "@/lib/db/types";
import { checkKeyFolder } from "@/lib/key/formats";
import { rmSync, readFileSync } from "node:fs";

const T0 = new Date("2026-10-05T16:00:00Z");
const API_KEY = "fixture-mail-api-key-value-0001";
const SECRET = "drain-test-secret-of-at-least-32-characters";
const ENV = { DEMO_MAIL_API_KEY: API_KEY, FOUNDATION_SECRET: SECRET };
type Mail = { sent: Array<{ id: string; to: string; secretSeen: boolean }>; lookups: string[]; events: Array<Array<{ eventId: string }>>; bounces: Array<{ email: string; kind: "bounce" | "complaint" }>; failWith?: string };
const g = globalThis as { __fixtureMail?: Mail };
const mail = () => g.__fixtureMail!;

beforeEach(() => { g.__fixtureMail = { sent: [], lookups: [], events: [], bounces: [] }; });

async function connect(db: Db, status: ConnectionStatus = "connected") {
  await upsertConnection(db, { service: "email-sending", door: "own", status, scopes: ["send"], key_setting: "DEMO_MAIL_API_KEY", tested_on: null, owner: "Owner" }, T0);
}
async function approve(db: Db, to = "jo@harbor.example", sendKey = "bookings/b1/confirm"): Promise<string> {
  const d = await draftEmail(db, { to, subject: "Your booking", body: "See you Tuesday.", sendKey }, SECRET);
  if (d.status !== "drafted") throw new Error("not drafted");
  await db.query("update outbox set status = 'approved', approved_at = $2 where id = $1", [d.id, T0]);
  return d.id;
}
const statuses = (db: Db) => db.query<{ status: string }>("select status from outbox order by created_at");
function copyFixture(): string {
  const root = mkdtempSync(path.join(tmpdir(), "drain-"));
  cpSync(KEY_EXT, root, { recursive: true });
  return root;
}
function quietLog() { return vi.spyOn(console, "error").mockImplementation(() => {}); }

describe("drainOutbox", () => {
  it("drains approved rows once", async () => {
    const db = await coreDb();
    await connect(db);
    await approve(db);
    const first = await drainOutbox(db, ENV, T0, { root: KEY_EXT });
    expect(first).toMatchObject({ status: "ran", sent: 1 });
    expect(await drainOutbox(db, ENV, T0, { root: KEY_EXT })).toMatchObject({ status: "ran", sent: 0 });
    expect(mail().sent).toHaveLength(1);
    expect(mail().sent[0]).toMatchObject({ to: "jo@harbor.example", secretSeen: true });
    expect(await statuses(db)).toEqual([{ status: "sent" }]);
    await db.close();
  });
  it("is skipped while paused", async () => {
    const db = await coreDb();
    await connect(db);
    await approve(db);
    await setPause(db, { paused: true, reason: "", by: "owner" }, T0);
    expect(await drainOutbox(db, ENV, T0, { root: KEY_EXT })).toMatchObject({ status: "paused", sent: 0 });
    expect(mail().sent).toEqual([]);
    expect(await statuses(db)).toEqual([{ status: "approved" }]);
    await db.close();
  });
  it("is skipped while email sending is not connected", async () => {
    const db = await coreDb();
    await approve(db);
    expect(await drainOutbox(db, ENV, T0, { root: KEY_EXT })).toMatchObject({ status: "not_connected" });
    for (const s of ["planned", "failing", "disconnected"] as const) {
      await connect(db, s);
      expect(await drainOutbox(db, ENV, T0, { root: KEY_EXT }), s).toMatchObject({ status: "not_connected" });
    }
    expect(mail().sent).toEqual([]);
    expect(await statuses(db)).toEqual([{ status: "approved" }]);
    expect(await drainOutbox(null, ENV, T0, { root: KEY_EXT })).toMatchObject({ status: "no_database" });
    await db.close();
  });
  it("refuses a sender outside the connection's folder", async () => {
    const db = await coreDb();
    await connect(db);
    await approve(db);
    const root = copyFixture();
    const outside = mkdtempSync(path.join(tmpdir(), "drain-outside-"));
    renameSync(path.join(root, "key/connections/email-sending/send.ts"), path.join(outside, "send.ts"));
    symlinkSync(path.join(outside, "send.ts"), path.join(root, "key/connections/email-sending/send.ts"));
    const err = quietLog();
    try {
      expect(await drainOutbox(db, ENV, T0, { root })).toMatchObject({ status: "no_sender", sent: 0 });
      expect(err).toHaveBeenCalledTimes(1);
    } finally { err.mockRestore(); }
    // A connection folder whose real path leaves the Key is refused too.
    const root2 = copyFixture();
    const outside2 = mkdtempSync(path.join(tmpdir(), "drain-outside-"));
    renameSync(path.join(root2, "key/connections/email-sending"), path.join(outside2, "email-sending"));
    symlinkSync(path.join(outside2, "email-sending"), path.join(root2, "key/connections/email-sending"));
    const err2 = quietLog();
    try {
      expect(await drainOutbox(db, ENV, T0, { root: root2 })).toMatchObject({ status: "no_sender", sent: 0 });
    } finally { err2.mockRestore(); }
    expect(mail().sent).toEqual([]);
    expect(await statuses(db)).toEqual([{ status: "approved" }]);
    await db.close();
  });
  it("logs one plain line and sends nothing when the sender fails to import", async () => {
    const db = await coreDb();
    await connect(db);
    await approve(db);
    const root = copyFixture();
    writeFileSync(path.join(root, "key/connections/email-sending/send.ts"), "throw new Error('broken at import\\nsecond line');\nexport const send = async () => ({ providerRef: 'x' });\n");
    const err = quietLog();
    try {
      expect(await drainOutbox(db, ENV, T0, { root })).toMatchObject({ status: "no_sender", sent: 0 });
      expect(err).toHaveBeenCalledTimes(1);
      expect(err.mock.calls[0]).toHaveLength(1);
      expect(String(err.mock.calls[0][0])).not.toContain("\n");
      expect(String(err.mock.calls[0][0])).toMatch(/broken at import/);
    } finally { err.mockRestore(); }
    expect(await statuses(db)).toEqual([{ status: "approved" }]);
    await db.close();
  });
  it("names a missing provider setting and never logs its value", async () => {
    const db = await coreDb();
    await connect(db);
    await approve(db);
    const err = quietLog();
    try {
      expect(await drainOutbox(db, { FOUNDATION_SECRET: SECRET }, T0, { root: KEY_EXT })).toMatchObject({ status: "no_setting", sent: 0 });
      expect(String(err.mock.calls[0][0])).toContain("DEMO_MAIL_API_KEY");
      err.mockClear();
      mail().failWith = `provider refused key ${API_KEY}`;
      expect(await drainOutbox(db, ENV, T0, { root: KEY_EXT })).toMatchObject({ status: "ran", failed: 1 });
      const logged = err.mock.calls.map((c) => c.map(String).join(" ")).join("\n");
      expect(logged).not.toContain(API_KEY);
      const [row] = await db.query<{ last_error: string }>("select last_error from outbox");
      expect(row.last_error).not.toContain(API_KEY);
      expect(row.last_error).toContain("provider refused key");
    } finally { err.mockRestore(); }
    await db.close();
  });
  it("runs recovery with the sender's lookup before sending", async () => {
    const db = await coreDb();
    await connect(db);
    const id = await approve(db);
    await db.query("update outbox set status = 'sending', claimed_at = $2 where id = $1", [id, new Date(T0.getTime() - 3_600_000)]);
    expect(await drainOutbox(db, ENV, T0, { root: KEY_EXT })).toMatchObject({ status: "ran", recovered: { sent: 0, failed: 1 } });
    expect(mail().lookups).toEqual(["bookings/b1/confirm"]);
    expect(mail().sent).toEqual([]);
    await db.close();
  });
  it("records bounces and complaints as opt-outs, marks the kept events handled, and refuses the address on the next send", async () => {
    const db = await coreDb();
    await connect(db);
    await db.query("insert into webhook_events (connection, event_id, received_at) values ('email-sending', 'evt_b1', $1), ('email-sending', 'evt_b2', $1), ('demo-pay', 'evt_p1', $1)", [T0]);
    mail().bounces = [{ email: "Jo@Harbor.example", kind: "bounce" }, { email: "sam@harbor.example", kind: "complaint" }];
    await approve(db, "jo@harbor.example", "k1");
    await approve(db, "ali@harbor.example", "k2");
    expect(await drainOutbox(db, ENV, T0, { root: KEY_EXT })).toMatchObject({ status: "ran", sent: 1, refused: 1, bounced: 2 });
    expect(mail().events.map((e) => e.map((x) => x.eventId).sort())).toEqual([["evt_b1", "evt_b2"]]);
    expect(mail().sent.map((s) => s.to)).toEqual(["ali@harbor.example"]);
    expect(await db.query("select source, scope from opt_outs order by source")).toEqual([{ source: "bounce", scope: "all" }, { source: "complaint", scope: "all" }]);
    expect(await db.query("select event_id, handled_at is not null as handled from webhook_events order by event_id")).toEqual([
      { event_id: "evt_b1", handled: true }, { event_id: "evt_b2", handled: true }, { event_id: "evt_p1", handled: false },
    ]);
    mail().bounces = [];
    await drainOutbox(db, ENV, T0, { root: KEY_EXT });
    expect(mail().events[1]).toEqual([]);
    await db.close();
  });
  it("sends nothing and keeps the events when a bounce cannot be recorded", async () => {
    const db = await coreDb();
    await connect(db);
    await db.query("insert into webhook_events (connection, event_id, received_at) values ('email-sending', 'evt_b1', $1)", [T0]);
    mail().bounces = [{ email: "jo@harbor.example", kind: "bounce" }];
    await approve(db);
    const err = quietLog();
    try {
      // Without FOUNDATION_SECRET no opt-out can be recorded, so the pass stops before bounces and sends nothing.
      expect(await drainOutbox(db, { DEMO_MAIL_API_KEY: API_KEY }, T0, { root: KEY_EXT })).toMatchObject({ status: "no_secret", sent: 0 });
    } finally { err.mockRestore(); }
    expect(mail().sent).toEqual([]);
    expect(await db.query("select handled_at from webhook_events")).toEqual([{ handled_at: null }]);
    await db.close();
  });
  it("never throws, even when the database is gone", async () => {
    const db = await coreDb();
    await db.close();
    const err = quietLog();
    try {
      await expect(drainOutbox(db, ENV, T0, { root: KEY_EXT })).resolves.toMatchObject({ status: "error" });
    } finally { err.mockRestore(); }
  });
  it("leaves an earlier opt-out in force", async () => {
    const db = await coreDb();
    await connect(db);
    await optOut(db, { email: "jo@harbor.example", source: "owner", scope: "all" }, T0, SECRET);
    await db.query("insert into outbox (to_email, subject, body, send_key, status, approved_at) values ('jo@harbor.example', 's', 'b', 'k9', 'approved', $1)", [T0]);
    expect(await drainOutbox(db, ENV, T0, { root: KEY_EXT })).toMatchObject({ status: "ran", sent: 0, refused: 1 });
    expect(mail().sent).toEqual([]);
    await db.close();
  });
});

describe("the Key checker and the sender seat", () => {
  it("the fixture's email sender passes", async () => expect(await checkKeyFolder(KEY_EXT)).toEqual([]));
  it("reports a core or public setting, a sender on another connection, and a missing send.ts", async () => {
    const root = copyFixture();
    const yaml = path.join(root, "key/connections/email-sending.yaml");
    const base = readFileSync(yaml, "utf8");
    for (const bad of ["FOUNDATION_SECRET", "NEXT_PUBLIC_KEY", "lower", "DATABASE_URL", "POSTGRES_URL", "POSTGRES_URL_NON_POOLING", "PGPASSWORD", "PGHOST", "NEON_PROJECT_ID"]) {
      writeFileSync(yaml, base.replace("DEMO_MAIL_API_KEY", bad));
      expect((await checkKeyFolder(root)).join("\n"), bad).toMatch(/sender secret_setting must be a setting name/);
    }
    writeFileSync(yaml, base);
    writeFileSync(path.join(root, "key/connections/demo-pay.yaml"), readFileSync(path.join(root, "key/connections/demo-pay.yaml"), "utf8") + "sender:\n  secret_setting: DEMO_MAIL_API_KEY\n");
    expect((await checkKeyFolder(root)).join("\n")).toMatch(/demo-pay\.yaml: only key\/connections\/email-sending\.yaml declares a sender/);
    rmSync(path.join(root, "key/connections/email-sending/send.ts"));
    expect((await checkKeyFolder(root)).join("\n")).toMatch(/email-sending\.yaml: sender send\.ts is not in key\/connections\/email-sending\//);
  });
});

describe("drainOutbox fails closed at every step", () => {
  // A database that answers everything except statements matching the pattern, which error.
  const failing = (db: Db, pattern: RegExp): Db => ({
    ...db,
    query: (async (sql: string, params?: unknown[]) => {
      if (pattern.test(sql)) throw new Error("connection reset");
      return db.query(sql, params);
    }) as Db["query"],
    transaction: db.transaction.bind(db),
    exec: db.exec.bind(db),
    close: db.close.bind(db),
  });
  async function ready(): Promise<Db> {
    const db = await coreDb();
    await connect(db);
    await approve(db);
    return db;
  }
  async function nothingSent(db: Db) {
    expect(mail().sent).toEqual([]);
    expect(await statuses(db)).toEqual([{ status: "approved" }]);
  }
  it("sends nothing when the pause switch cannot be read", async () => {
    const db = await ready();
    expect((await drainOutbox(failing(db, /from pause/), ENV, T0, { root: KEY_EXT })).sent).toBe(0);
    await nothingSent(db);
    await db.close();
  });
  it("sends nothing when the email-sending status cannot be read", async () => {
    const db = await ready();
    const err = quietLog();
    try {
      expect(await drainOutbox(failing(db, /from connections/), ENV, T0, { root: KEY_EXT })).toMatchObject({ status: "error", sent: 0 });
    } finally { err.mockRestore(); }
    await nothingSent(db);
    await db.close();
  });
  it("sends nothing when bounces() throws, and keeps the events", async () => {
    const db = await ready();
    await db.query("insert into webhook_events (connection, event_id, received_at) values ('email-sending', 'evt_b1', $1)", [T0]);
    (globalThis as { __fixtureMailBouncesThrow?: boolean }).__fixtureMailBouncesThrow = true;
    const err = quietLog();
    try {
      expect(await drainOutbox(db, ENV, T0, { root: KEY_EXT })).toMatchObject({ status: "bounces_unrecorded", sent: 0 });
    } finally { err.mockRestore(); (globalThis as { __fixtureMailBouncesThrow?: boolean }).__fixtureMailBouncesThrow = false; }
    await nothingSent(db);
    expect(await db.query("select handled_at from webhook_events")).toEqual([{ handled_at: null }]);
    await db.close();
  });
  it("sends nothing past a bounce whose opt-out could not be written", async () => {
    const db = await ready();
    mail().bounces = [{ email: "jo@harbor.example", kind: "bounce" }];
    const err = quietLog();
    try {
      expect(await drainOutbox(failing(db, /^\s*insert into opt_outs/), ENV, T0, { root: KEY_EXT })).toMatchObject({ status: "bounces_unrecorded", sent: 0 });
    } finally { err.mockRestore(); }
    await nothingSent(db);
    await db.close();
  });
  it("leaves a row approved and unsent when its opt-out check errors", async () => {
    const db = await ready();
    expect(await drainOutbox(failing(db, /from opt_outs/), ENV, T0, { root: KEY_EXT })).toMatchObject({ status: "ran", sent: 0, refused: 1 });
    await nothingSent(db);
    await db.close();
  });
  it("sends nothing without FOUNDATION_SECRET, and the log line names no value", async () => {
    const db = await ready();
    const err = quietLog();
    try {
      expect(await drainOutbox(db, { DEMO_MAIL_API_KEY: API_KEY }, T0, { root: KEY_EXT })).toMatchObject({ status: "no_secret", sent: 0 });
      expect(err).toHaveBeenCalledTimes(1);
      expect(String(err.mock.calls[0][0])).not.toContain(API_KEY);
    } finally { err.mockRestore(); }
    expect(mail().events).toEqual([]);
    await nothingSent(db);
    await db.close();
  });
  it("sends nothing when the sender's settings file cannot be read", async () => {
    const db = await ready();
    const root = copyFixture();
    writeFileSync(path.join(root, "key/connections/email-sending.yaml"), "sender: [unclosed\n");
    const err = quietLog();
    try {
      expect(await drainOutbox(db, ENV, T0, { root })).toMatchObject({ status: "no_sender", sent: 0 });
      expect(String(err.mock.calls[0][0])).not.toContain(API_KEY);
    } finally { err.mockRestore(); }
    await nothingSent(db);
    await db.close();
  });
  it("does not send when recovery throws", async () => {
    const db = await ready();
    const err = quietLog();
    try {
      expect(await drainOutbox(failing(db, /where status = 'sending' and claimed_at </), ENV, T0, { root: KEY_EXT })).toMatchObject({ status: "error", sent: 0 });
    } finally { err.mockRestore(); }
    await nothingSent(db);
    await db.close();
  });
  const failingWith = (db: Db, pattern: RegExp, err: () => Error): Db => ({
    ...db,
    query: (async (sql: string, params?: unknown[]) => {
      if (pattern.test(sql)) throw err();
      return db.query(sql, params);
    }) as Db["query"],
    transaction: db.transaction.bind(db),
    exec: db.exec.bind(db),
    close: db.close.bind(db),
  });
  it("sends nothing and keeps the events when bounces() returns something that is not a list", async () => {
    const db = await ready();
    await db.query("insert into webhook_events (connection, event_id, received_at) values ('email-sending', 'evt_b2', $1)", [T0]);
    mail().bounces = { email: "jo@harbor.example", kind: "bounce" } as never;
    const err = quietLog();
    try {
      expect(await drainOutbox(db, ENV, T0, { root: KEY_EXT })).toMatchObject({ status: "bounces_unrecorded", sent: 0 });
    } finally { err.mockRestore(); }
    await nothingSent(db);
    expect(await db.query("select handled_at from webhook_events")).toEqual([{ handled_at: null }]);
    expect(await db.query("select count(*)::int as n from opt_outs")).toEqual([{ n: 0 }]);
    await db.close();
  });
  it("skips a bounce that is not one plain address, but fails closed on any other error, a TypeError among them", async () => {
    const db = await ready();
    mail().bounces = [{ email: "not an address", kind: "bounce" }];
    expect(await drainOutbox(db, ENV, T0, { root: KEY_EXT })).toMatchObject({ status: "ran", sent: 1, bounced: 0 });
    await db.close();
    const db2 = await ready();
    g.__fixtureMail = { sent: [], lookups: [], events: [], bounces: [{ email: "jo@harbor.example", kind: "bounce" }] };
    const err = quietLog();
    try {
      expect(await drainOutbox(failingWith(db2, /^\s*(insert into|update) opt_outs/, () => new TypeError("a driver bug")), ENV, T0, { root: KEY_EXT })).toMatchObject({ status: "bounces_unrecorded", sent: 0 });
    } finally { err.mockRestore(); }
    await nothingSent(db2);
    await db2.close();
  });
  it("never logs the provider key from a bounce that could not be recorded or a sender that failed to import", async () => {
    const db = await ready();
    mail().bounces = [{ email: "jo@harbor.example", kind: "bounce" }];
    const err = quietLog();
    try {
      expect(await drainOutbox(failingWith(db, /^\s*insert into opt_outs/, () => new Error(`refused for ${API_KEY}`)), ENV, T0, { root: KEY_EXT })).toMatchObject({ status: "bounces_unrecorded" });
      const root = copyFixture();
      writeFileSync(path.join(root, "key/connections/email-sending/send.ts"), `throw new Error('broken with ${API_KEY}');\nexport const send = async () => ({ providerRef: 'x' });\n`);
      expect(await drainOutbox(db, ENV, T0, { root })).toMatchObject({ status: "no_sender" });
      const logged = err.mock.calls.map((c) => c.map(String).join(" ")).join("\n");
      expect(logged).toMatch(/refused for/);
      expect(logged).toMatch(/broken with/);
      expect(logged).not.toContain(API_KEY);
    } finally { err.mockRestore(); }
    await nothingSent(db);
    await db.close();
  });
});

describe("a copied email and a connection that turns active later", () => {
  it("is never sent by the drain", async () => {
    const db = await coreDb();
    const id = await approve(db);
    expect(await markCopied(db, id, T0)).toBe(true);
    await connect(db);
    expect(await drainOutbox(db, ENV, T0, { root: KEY_EXT })).toMatchObject({ status: "ran", sent: 0 });
    expect(mail().sent).toEqual([]);
    expect(await statuses(db)).toEqual([{ status: "approved" }]);
    await db.close();
  });
});
