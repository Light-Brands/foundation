import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { coreDb, ROOT } from "../support/db";
import type { Db } from "@/lib/db/types";
import { cleanReason, getPause, isPaused, NOT_PAUSED, PAUSE_UNREADABLE, setPause } from "@/lib/data/pause";
import { submitContact } from "@/lib/data/inbox";

const NOW = new Date("2026-10-05T16:00:00Z");

describe("the pause switch", () => {
  it("is off with no database and on a fresh database", async () => {
    expect(await getPause(null)).toEqual(NOT_PAUSED);
    const db = await coreDb();
    expect(await isPaused(db)).toBe(false);
    await db.close();
  });
  it("sets and clears the one row", async () => {
    const db = await coreDb();
    const on = await setPause(db, { paused: true, reason: "On holiday", by: "pin:owner" }, NOW);
    expect(on).toMatchObject({ paused: true, reason: "On holiday", paused_by: "pin:owner" });
    expect(on.paused_at).not.toBeNull();
    const off = await setPause(db, { paused: false, reason: "ignored", by: "pin:owner" }, NOW);
    expect(off).toEqual(NOT_PAUSED);
    const [{ n }] = await db.query<{ n: number }>("select count(*)::int as n from pause");
    expect(n).toBe(1);
    await db.close();
  });
  it("caps the reason", () => {
    expect(cleanReason("  Closed for the move ")).toEqual({ ok: true, value: "Closed for the move" });
    expect(cleanReason("x".repeat(201)).ok).toBe(false);
  });
  it("a public form still saves while routines are paused", async () => {
    const db = await coreDb();
    await setPause(db, { paused: true, reason: "", by: "pin:owner" }, NOW);
    await submitContact(db, { name: "Ada", email: "ada@example.com", phone: "", message: "Hi" });
    const [{ n }] = await db.query<{ n: number }>("select count(*)::int as n from inbox_items");
    expect(n).toBe(1);
    await db.close();
  });
});

describe("the pause details", () => {
  it("cleans the reason", () => {
    expect(cleanReason("a\tb\nc\u0000d\u200Be  f")).toEqual({ ok: true, value: "a b cde f" });
    expect(cleanReason("\u2060\uFEFF  ")).toEqual({ ok: true, value: "" });
    expect(cleanReason("😀".repeat(200)).ok).toBe(true);
    expect(cleanReason("😀".repeat(201)).ok).toBe(false);
  });
  it("fails closed when the row is missing", async () => {
    const db = await coreDb();
    await db.query("delete from pause");
    expect(await getPause(db)).toEqual(PAUSE_UNREADABLE);
    expect(PAUSE_UNREADABLE).toMatchObject({ paused: true, reason: "The pause setting could not be read." });
    expect(await isPaused(db)).toBe(true);
    await db.close();
  });
  it("fails closed when the read throws", async () => {
    const db = { query: async () => { throw new Error("down"); } } as unknown as Db;
    expect(await getPause(db)).toEqual(PAUSE_UNREADABLE);
    expect(await isPaused(db)).toBe(true);
  });
  it("keeps the original time and person when paused again", async () => {
    const db = await coreDb();
    const first = await setPause(db, { paused: true, reason: "One", by: "pin:owner" }, NOW);
    const again = await setPause(db, { paused: true, reason: "Two", by: "someone:else" }, new Date("2026-10-06T00:00:00Z"));
    expect(again).toEqual({ ...first, reason: "Two" });
    await db.close();
  });
  it("returns the time as an ISO 8601 string", async () => {
    const db = await coreDb();
    const on = await setPause(db, { paused: true, reason: "", by: "pin:owner" }, NOW);
    expect(on.paused_at).toBe("2026-10-05T16:00:00.000Z");
    expect((await getPause(db)).paused_at).toBe("2026-10-05T16:00:00.000Z");
    await db.close();
  });
  it("is written only from src/lib/data/pause.ts", () => {
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) walk(full);
        else if (/\.(ts|tsx|js|mjs|sql)$/.test(e.name) && full !== path.join(ROOT, "src/lib/data/pause.ts")) {
          if (/insert\s+into\s+pause\b|update\s+pause\b/i.test(fs.readFileSync(full, "utf8"))) hits.push(full);
        }
      }
    };
    walk(path.join(ROOT, "src"));
    expect(hits).toEqual([]);
  });
});
