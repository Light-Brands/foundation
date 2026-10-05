import { describe, it, expect } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { coreDb, CORE_MIGRATIONS } from "../support/db";
import { openPglite } from "@/lib/db/pglite";
import { migrate } from "@/lib/db/migrate";
import { clientHash, takeFormSlot, FORM_LIMITS } from "@/lib/forms/limit";

const T0 = new Date("2026-10-05T16:00:00Z");
const at = (ms: number) => new Date(T0.getTime() + ms);

describe("the public form limiter", () => {
  it("hashes the client with the secret and never stores the address", async () => {
    const a = await clientHash("lead-form", "203.0.113.9", "s1");
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toBe(await clientHash("lead-form", "203.0.113.9", "s2"));
    expect(a).not.toBe(await clientHash("other-form", "203.0.113.9", "s1"));
  });
  it("refuses past its count from one client, then lets them in after the window", async () => {
    const db = await coreDb();
    const key = { form: "lead-form", keyHash: "h1" };
    for (let i = 0; i < FORM_LIMITS.perClient; i++) expect(await takeFormSlot(db, key, at(i * 1000))).toBe(true);
    expect(await takeFormSlot(db, key, at(10_000))).toBe(false);
    expect(await takeFormSlot(db, { form: "lead-form", keyHash: "h2" }, at(10_000))).toBe(true);
    expect(await takeFormSlot(db, key, at(FORM_LIMITS.perClientWindowMs + 5_000))).toBe(true);
    await db.close();
  });
  it("caps one form across every client", async () => {
    const db = await coreDb();
    const limits = { ...FORM_LIMITS, perForm: 3 };
    for (let i = 0; i < 3; i++) expect(await takeFormSlot(db, { form: "f", keyHash: `c${i}` }, at(i), limits)).toBe(true);
    expect(await takeFormSlot(db, { form: "f", keyHash: "c9" }, at(10), limits)).toBe(false);
    await db.close();
  });
  it("lets exactly the limit through when saves arrive at once", async () => {
    const db = await coreDb();
    const n = 4;
    const limits = { ...FORM_LIMITS, perClient: n };
    const results = await Promise.all(Array.from({ length: n + 5 }, () => takeFormSlot(db, { form: "f", keyHash: "same" }, T0, limits)));
    expect(results.filter(Boolean)).toHaveLength(n);
    const formLimits = { ...FORM_LIMITS, perForm: n };
    const spread = await Promise.all(Array.from({ length: n + 5 }, (_, i) => takeFormSlot(db, { form: "g", keyHash: `c${i}` }, T0, formLimits)));
    expect(spread.filter(Boolean)).toHaveLength(n);
    await db.close();
  });
  it("the limit survives a restart", async () => {
    const dir = path.join(mkdtempSync(path.join(tmpdir(), "hits-")), "pglite");
    const first = await openPglite(dir);
    await migrate(first, CORE_MIGRATIONS, "core");
    const key = { form: "lead-form", keyHash: "h1" };
    for (let i = 0; i < FORM_LIMITS.perClient; i++) await takeFormSlot(first, key, at(i));
    await first.close();
    const again = await openPglite(dir);
    expect(await takeFormSlot(again, key, at(60_000))).toBe(false);
    await again.close();
  }, 60_000);
  it("forgets hits older than a day", async () => {
    const db = await coreDb();
    await takeFormSlot(db, { form: "f", keyHash: "old" }, T0);
    await takeFormSlot(db, { form: "f", keyHash: "new" }, at(FORM_LIMITS.keepMs + 1));
    const rows = await db.query<{ key_hash: string }>("select key_hash from form_hits order by at");
    expect(rows.map((r) => r.key_hash)).toEqual(["new"]);
    await db.close();
  });
});
