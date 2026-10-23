import { describe, it, expect, vi, beforeEach } from "vitest";
import { coreDb } from "../support/db";
import type { Db } from "@/lib/db/types";
import { readEnv } from "@/lib/env";
import { signSession, verifySession } from "@/lib/auth/pin-token";
import {
  DEFAULT_PIN,
  DEFAULT_PIN_DAYS,
  cachedPinState,
  checkPinHash,
  choosePin,
  hashPin,
  pinAccepts,
  readPinState,
  type PinState,
} from "@/lib/auth/owner-pin";

const shared: { db: Db | null } = { db: null };
vi.mock("@/lib/db", () => ({ getDb: async () => shared.db }));

const NO_PIN = readEnv({}, "buildsecret");
const HOSTING = readEnv({ FOUNDATION_PIN: "246810" }, "buildsecret");
const DAY = 24 * 3600_000;

async function defaultFrom(db: Db): Promise<Date> {
  const [row] = await db.query<{ value: string }>("select value from core_settings where key = 'pin_default_from'");
  return new Date(row.value);
}

describe("the owner's PIN state", () => {
  beforeEach(() => {
    shared.db = null;
  });

  it("a fresh database is in default with expiry seven days after pin_default_from", async () => {
    const db = await coreDb();
    const from = await defaultFrom(db);
    expect(Number.isNaN(from.getTime())).toBe(false);
    const state = await readPinState(db, NO_PIN, new Date(from.getTime() + 1000));
    expect(DEFAULT_PIN).toBe("1234");
    expect(DEFAULT_PIN_DAYS).toBe(7);
    expect(state).toEqual({ kind: "default", credential: "default", expiresAt: new Date(from.getTime() + 7 * DAY) });
    await db.close();
  });

  it("default turns expired after seven days", async () => {
    const db = await coreDb();
    await db.query("update core_settings set value = $1 where key = 'pin_default_from'", ["2026-10-01T00:00:00.000Z"]);
    const end = new Date("2026-10-08T00:00:00.000Z");
    expect((await readPinState(db, NO_PIN, new Date(end.getTime() - 1))).kind).toBe("default");
    expect(await readPinState(db, NO_PIN, end)).toEqual({ kind: "expired" });
    // A start the code cannot read fails closed, as expired.
    await db.query("update core_settings set value = 'soon' where key = 'pin_default_from'");
    expect(await readPinState(db, NO_PIN, new Date("2026-10-02T00:00:00.000Z"))).toEqual({ kind: "expired" });
    await db.query("delete from core_settings where key = 'pin_default_from'");
    expect(await readPinState(db, NO_PIN, new Date("2026-10-02T00:00:00.000Z"))).toEqual({ kind: "expired" });
    await db.close();
  });

  it("a hosting PIN wins and reports whether a PIN was chosen", async () => {
    const db = await coreDb();
    expect(await readPinState(db, HOSTING)).toEqual({ kind: "hosting", credential: "hosting:246810", chosen: false });
    expect(await readPinState(null, HOSTING)).toEqual({ kind: "hosting", credential: "hosting:246810", chosen: false });
    expect(await choosePin(db, "13572468", "owner@harbor.example")).toBe("ok");
    expect(await readPinState(db, HOSTING)).toEqual({ kind: "hosting", credential: "hosting:246810", chosen: true });
    await db.close();
  });

  it("no database and no hosting PIN is none", async () => {
    expect(await readPinState(null, NO_PIN)).toEqual({ kind: "none" });
  });

  it("choosePin stores a hash, never the PIN, and a second choosePin is taken", async () => {
    const db = await coreDb();
    const now = new Date("2026-10-23T12:00:00.000Z");
    expect(await choosePin(db, "13572468", " owner@harbor.example ", now)).toBe("ok");
    const rows = await db.query<{ key: string; value: string }>("select key, value from core_settings where key like 'pin_%' order by key");
    const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    expect(JSON.stringify(rows)).not.toContain("13572468");
    expect(checkPinHash("13572468", byKey.pin_hash)).toBe(true);
    expect(byKey.pin_email).toBe("owner@harbor.example");
    expect(byKey.pin_set_at).toBe(now.toISOString());
    expect(await readPinState(db, NO_PIN)).toEqual({ kind: "chosen", credential: `chosen:${byKey.pin_hash}`, email: "owner@harbor.example" });
    expect(await choosePin(db, "24681357", "other@harbor.example")).toBe("taken");
    const [{ value }] = await db.query<{ value: string }>("select value from core_settings where key = 'pin_hash'");
    expect(value).toBe(byKey.pin_hash);
    const [{ value: email }] = await db.query<{ value: string }>("select value from core_settings where key = 'pin_email'");
    expect(email).toBe("owner@harbor.example");
    // Only a 6 to 12 digit PIN is ever stored.
    const fresh = await coreDb();
    await expect(choosePin(fresh, "1234", "owner@harbor.example")).rejects.toThrow();
    await expect(choosePin(fresh, "12345a", "owner@harbor.example")).rejects.toThrow();
    expect(await fresh.query("select 1 from core_settings where key = 'pin_hash'")).toEqual([]);
    await fresh.close();
    await db.close();
  });

  it("hashes with a random salt and checks in constant time", () => {
    const a = hashPin("13572468");
    const b = hashPin("13572468");
    expect(a).not.toBe(b);
    expect(a).not.toContain("13572468");
    expect(checkPinHash("13572468", a)).toBe(true);
    expect(checkPinHash("13572469", a)).toBe(false);
    expect(checkPinHash("13572468", "not a hash")).toBe(false);
    expect(checkPinHash("13572468", "")).toBe(false);
  });

  it("pinAccepts takes 1234 only in default", async () => {
    const expiresAt = new Date("2026-10-30T00:00:00.000Z");
    const hash = hashPin("13572468");
    const states: PinState[] = [
      { kind: "default", credential: "default", expiresAt },
      { kind: "expired" },
      { kind: "none" },
      { kind: "chosen", credential: `chosen:${hash}`, email: "owner@harbor.example" },
      { kind: "hosting", credential: "hosting:246810", chosen: false },
      { kind: "hosting", credential: "hosting:246810", chosen: true },
    ];
    const took = await Promise.all(states.map((s) => pinAccepts(s, "1234")));
    expect(took).toEqual(["default", null, null, null, null, null]);
    expect(await pinAccepts(states[0], "12345")).toBeNull();
    expect(await pinAccepts(states[3], "13572468")).toBe(`chosen:${hash}`);
    expect(await pinAccepts(states[3], "13572469")).toBeNull();
    expect(await pinAccepts(states[4], "246810")).toBe("hosting:246810");
    expect(await pinAccepts(states[4], "246811")).toBeNull();
    expect(await pinAccepts(states[1], "")).toBeNull();
  });

  it("a database error throws", async () => {
    const broken = { query: async () => { throw new Error("down"); } } as unknown as Db;
    await expect(readPinState(broken, NO_PIN)).rejects.toThrow("down");
    await expect(readPinState(broken, HOSTING)).rejects.toThrow("down");
  });

  it("changing the PIN changes the credential so an old session no longer verifies", async () => {
    const db = await coreDb();
    const before = await readPinState(db, NO_PIN);
    expect(before.kind).toBe("default");
    const credential = (before as { credential: string }).credential;
    const token = await signSession(credential, "s".repeat(32));
    expect(await verifySession(token, credential, "s".repeat(32))).toBe(true);
    await choosePin(db, "13572468", "owner@harbor.example");
    const after = await readPinState(db, NO_PIN);
    expect(after.kind).toBe("chosen");
    const next = (after as { credential: string }).credential;
    expect(next).not.toBe(credential);
    expect(await verifySession(token, next, "s".repeat(32))).toBe(false);
    // A reset that stores a new hash changes the credential again.
    await db.query("delete from core_settings where key = 'pin_hash'");
    await choosePin(db, "13572468", "owner@harbor.example");
    const again = (await readPinState(db, NO_PIN)) as { credential: string };
    expect(again.credential).not.toBe(next);
    expect(await verifySession(await signSession(next, "s".repeat(32)), again.credential, "s".repeat(32))).toBe(false);
    await db.close();
  });

  it("cachedPinState holds a read for five seconds, and choosePin clears it", async () => {
    const db = await coreDb();
    shared.db = db;
    const t0 = new Date("2026-10-23T12:00:00.000Z");
    await db.query("update core_settings set value = $1 where key = 'pin_default_from'", [t0.toISOString()]);
    expect((await cachedPinState(NO_PIN, t0)).kind).toBe("default");
    // A change behind the cache's back is not seen inside five seconds, and is seen after.
    await db.query("insert into core_settings (key, value) values ('pin_hash', $1)", [hashPin("13572468")]);
    expect((await cachedPinState(NO_PIN, new Date(t0.getTime() + 4999))).kind).toBe("default");
    expect((await cachedPinState(NO_PIN, new Date(t0.getTime() + 5000))).kind).toBe("chosen");
    // choosePin in this process clears it at once.
    await db.query("delete from core_settings where key = 'pin_hash'");
    const t1 = new Date(t0.getTime() + 10_000);
    expect((await cachedPinState(NO_PIN, t1)).kind).toBe("default");
    await choosePin(db, "13572468", "owner@harbor.example", t1);
    expect((await cachedPinState(NO_PIN, new Date(t1.getTime() + 1))).kind).toBe("chosen");
    // A different hosting PIN is never served from another one's read.
    expect((await cachedPinState(HOSTING, new Date(t1.getTime() + 2))).kind).toBe("hosting");
    // A cached default is never served past its expiry.
    await db.query("delete from core_settings where key = 'pin_hash'");
    const end = new Date(t0.getTime() + 7 * DAY);
    expect((await cachedPinState(NO_PIN, new Date(end.getTime() - 1))).kind).toBe("default");
    expect((await cachedPinState(NO_PIN, end)).kind).toBe("expired");
    await db.close();
  });
});
