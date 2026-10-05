import { describe, it, expect } from "vitest";
import { coreDb } from "../support/db";
import { connectionStatuses, keySettingState, listConnections, looksLikeSecret, upsertConnection, validateConnection } from "@/lib/data/connections";
import { CHECK_CORE_TABLES, checkChecks } from "@/lib/key/declarations";

const NOW = new Date("2026-10-05T16:00:00Z");
const fake = (...parts: string[]) => parts.join("");
const KEYISH = [
  fake("sk", "_live_", "x".repeat(24)),
  fake("sb", "_secret_", "abc123DEF456ghi789"),
  fake("re", "_", "AbCdEf123456"),
  fake("wh", "sec_", "x".repeat(20)),
  fake("eyJ", "hbGciOiJIUzI1NiJ9", ".", "eyJzdWIiOiIxIn0"),
  fake("-----BEGIN ", "PRIVATE KEY-----"),
  fake("postgres://", "user:", "hunter2", "@db.example:6543/postgres"),
  fake("Qx7", "pLm2", "Zr9", "tYw4", "Kv8", "nBc3", "Hd6s"),
];
const GOOD = { service: "email-sending", door: "own", status: "connected", scopes: ["send"], key_setting: "RESEND_API_KEY", tested_on: "2026-10-05", owner: "Owner" };

describe("looksLikeSecret", () => {
  it("catches keys, tokens, private keys and passwords in addresses", () => {
    for (const k of KEYISH) expect(looksLikeSecret(k), k.slice(0, 12)).toBe(true);
  });
  it("leaves setting names and scopes alone", () => {
    for (const v of ["RESEND_API_KEY", "FOUNDATION_SUPABASE_SECRET_KEY", "events:read", "Owner", "calendar.readonly"]) expect(looksLikeSecret(v), v).toBe(false);
  });
});

describe("looksLikeKey, the key-shape test app saves call", () => {
  it("is exported from its own module, and is the test the connections registry uses", async () => {
    const { looksLikeKey } = await import("@/lib/key-shape");
    for (const k of KEYISH) expect(looksLikeKey(k), k.slice(0, 12)).toBe(true);
    for (const v of ["RESEND_API_KEY", "events:read", "Owner", "Jo from Harbor Studio", "https://harbor.example/book", ""]) expect(looksLikeKey(v), v).toBe(false);
    expect(validateConnection({ ...GOOD, owner: KEYISH[0] }).ok).toBe(false);
  });
  it("finds a key inside a sentence an app saves", async () => {
    const { looksLikeKey } = await import("@/lib/key-shape");
    expect(looksLikeKey(`our key is ${KEYISH[0]} for now`)).toBe(true);
    expect(looksLikeKey(`notes:\n${KEYISH[3]}`)).toBe(true);
  });
});

describe("validateConnection", () => {
  it("accepts a complete row", () => {
    expect(validateConnection(GOOD)).toEqual({ ok: true, value: { ...GOOD, door: "own", status: "connected" } });
  });
  it("refuses anything that looks like a key", () => {
    for (const k of KEYISH) {
      const r = validateConnection({ ...GOOD, key_setting: k });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errors.key_setting).toBe("That looks like a key. Save the name of the setting that holds it, such as RESEND_API_KEY, never the key itself.");
    }
    expect(validateConnection({ ...GOOD, scopes: [KEYISH[0]] }).ok).toBe(false);
    expect(validateConnection({ ...GOOD, owner: KEYISH[1] }).ok).toBe(false);
  });
  it("refuses a setting a browser could read", () => {
    const r = validateConnection({ ...GOOD, key_setting: "NEXT_PUBLIC_RESEND_KEY" });
    expect(!r.ok && r.errors.key_setting).toBe("A key setting must never start with NEXT_PUBLIC_, because the browser can read those.");
  });
  it("refuses an unknown door, status, service or date", () => {
    const r = validateConnection({ ...GOOD, door: "both", status: "maybe", service: "Email Sending", tested_on: "yesterday" });
    expect(!r.ok && Object.keys(r.errors).sort()).toEqual(["door", "service", "status", "tested_on"]);
  });
  it("checks tested_on as a real calendar date", () => {
    const r = validateConnection({ ...GOOD, tested_on: "2026-02-30" });
    expect(!r.ok && Object.keys(r.errors)).toEqual(["tested_on"]);
    expect(validateConnection({ ...GOOD, tested_on: "2026-13-01" }).ok).toBe(false);
    expect(validateConnection({ ...GOOD, tested_on: "2028-02-29" }).ok).toBe(true);
    expect(validateConnection({ ...GOOD, tested_on: "2027-02-29" }).ok).toBe(false);
  });
});

describe("the connections table", () => {
  it("keeps one row per service and lists them", async () => {
    const db = await coreDb();
    const v = validateConnection(GOOD);
    if (!v.ok) throw new Error("invalid");
    await upsertConnection(db, { ...v.value, status: "planned" }, NOW);
    await upsertConnection(db, v.value, NOW);
    expect((await listConnections(db)).map((r) => [r.service, r.status, r.key_setting])).toEqual([["email-sending", "connected", "RESEND_API_KEY"]]);
    expect(await connectionStatuses(db)).toEqual({ "email-sending": "connected" });
    expect(await connectionStatuses(null)).toEqual({});
    await db.close();
  });
  it("refuses a key-shaped value even from server code", async () => {
    const db = await coreDb();
    await expect(upsertConnection(db, { ...GOOD, door: "own", status: "connected", key_setting: KEYISH[0] }, NOW)).rejects.toThrow(/looks like a key/);
    expect(await listConnections(db)).toEqual([]);
    await db.close();
  });
});

describe("checks and connections", () => {
  it("lets a check read the connections table, and still never the outbox", () => {
    expect(CHECK_CORE_TABLES).toContain("connections");
    expect(CHECK_CORE_TABLES).not.toContain("outbox");
    const src = { file: "r.md", slug: "health-check", type: "routine" as const, app: "backups", uses: [] as string[] };
    const check = { key: "failing", name: "Failing connections", period: "day", card_kind: "x-kind", reads: ["connections"], sql: "select count(*) > 0 as raise, 'x' as title, '' as body from connections where status = 'failing'" };
    expect(checkChecks(src, [check], { kindNames: new Set(["x-kind"]), tablesByApp: { backups: [] } }).problems).toEqual([]);
  });
});

describe("keySettingState", () => {
  it("says only whether the named setting is set, never its value", () => {
    const value = fake("re", "_", "AbCdEf123456");
    expect(keySettingState("RESEND_API_KEY", { RESEND_API_KEY: value })).toBe("set");
    expect(keySettingState("RESEND_API_KEY", { RESEND_API_KEY: "  " })).toBe("unset");
    expect(keySettingState("RESEND_API_KEY", {})).toBe("unset");
    expect(keySettingState("", { "": value })).toBe(null);
    expect(keySettingState("NEXT_PUBLIC_RESEND_KEY", { NEXT_PUBLIC_RESEND_KEY: value })).toBe(null);
  });
});
