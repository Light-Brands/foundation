import { describe, it, expect } from "vitest";
import { coreDb } from "../support/db";
import { cleanReason, getPause, isPaused, NOT_PAUSED, setPause } from "@/lib/data/pause";
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
