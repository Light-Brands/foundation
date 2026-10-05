import { describe, it, expect } from "vitest";
import { coreDb } from "../support/db";
import { emailHash, normalizeEmail, normalizedEmailSql } from "@/lib/email";

const SAMPLES: [string, string][] = [
  ["Jo@Harbor.Example", "jo@harbor.example"],
  ["  jo+news@harbor.example ", "jo@harbor.example"],
  ["jo+a+b@harbor.example", "jo@harbor.example"],
  ["+tag@harbor.example", "+tag@harbor.example"],
  ["first.last@harbor.example", "first.last@harbor.example"],
];

describe("normalizeEmail", () => {
  it("trims, lowercases and drops a plus tag, and keeps dots", () => {
    for (const [raw, want] of SAMPLES) expect(normalizeEmail(raw), raw).toBe(want);
  });
  it("hashes every spelling of one address the same, and no other", () => {
    expect(emailHash("Jo+News@Harbor.Example")).toBe(emailHash("jo@harbor.example"));
    expect(emailHash("jo@harbor.example")).not.toBe(emailHash("jo2@harbor.example"));
    expect(emailHash("jo@harbor.example")).toMatch(/^[0-9a-f]{64}$/);
  });
  it("agrees with the SQL form of the rule", async () => {
    const db = await coreDb();
    for (const [raw] of SAMPLES) {
      const [row] = await db.query<{ n: string }>(`select ${normalizedEmailSql("x")} as n from (select $1::text as x) as t`, [raw]);
      expect(row.n, raw).toBe(normalizeEmail(raw));
    }
    await db.close();
  });
  it("refuses a column name that is not a plain identifier", () => {
    expect(() => normalizedEmailSql("x); drop table contacts; --")).toThrow(TypeError);
  });
});
