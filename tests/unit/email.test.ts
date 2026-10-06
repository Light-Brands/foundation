import { describe, it, expect } from "vitest";
import { coreDb } from "../support/db";
import { emailHash, normalizeEmail, normalizedEmailSql, parseEmail, InvalidEmailError, MissingSecretError } from "@/lib/email";

const SECRET = "test-fixed-secret-of-at-least-32-chars";
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
  it("matches every case variant of one address", () => {
    for (const raw of ["JO@HARBOR.EXAMPLE", "jo@Harbor.example", "Jo+News@HARBOR.example"]) expect(normalizeEmail(raw), raw).toBe("jo@harbor.example");
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

describe("parseEmail", () => {
  it("keeps the local part as typed for sending and lowercases the domain", () => {
    expect(parseEmail(" Jo.Smith+News@Harbor.EXAMPLE ")).toEqual({ ok: true, send: "Jo.Smith+News@harbor.example", match: "jo.smith@harbor.example" });
  });
  it("accepts only one plain address and refuses everything else with a plain message", () => {
    const refused = [
      "jo@harbor.example.", // a trailing dot
      "Jo Smith <jo@harbor.example>", // a display name
      "<jo@harbor.example>",
      '"jo smith"@harbor.example', // a quoted local part
      '"jo"@harbor.example',
      "jo@harbor.example\r\nBcc: all@harbor.example", // a CRLF injection
      "jo@harbor.example\nx",
      "jo@other@harbor.example", // two @ signs
      "jo@harbor.example,ann@harbor.example",
      "jo(comment)@harbor.example", // a comment
      "jo smith@harbor.example",
      "jо@harbor.example", // a Cyrillic o, a Unicode lookalike
      "jo@hаrbor.example", // a Cyrillic a in the domain
      "jo@[127.0.0.1]",
      "jo..smith@harbor.example",
      ".jo@harbor.example",
      "jo.@harbor.example",
      "jo@harbor",
      "jo@-harbor.example",
      "jo@",
      "@harbor.example",
      "",
      `${"a".repeat(65)}@harbor.example`, // a local part over 64
      `jo@${"a".repeat(250)}.example`, // an address over 254
    ];
    for (const raw of refused) {
      const r = parseEmail(raw);
      expect(r.ok, JSON.stringify(raw)).toBe(false);
      if (!r.ok) expect(r.error).toBe("Use one plain email address, like name@example.com.");
      expect(() => normalizeEmail(raw), JSON.stringify(raw)).toThrow(InvalidEmailError);
    }
  });
  it("reads a composed and a decomposed accent the same, and refuses both as not plain ASCII", () => {
    expect(parseEmail("josé@harbor.example").ok).toBe(false);
    expect(parseEmail("josé@harbor.example").ok).toBe(false);
  });
});

describe("emailHash", () => {
  it("gives every spelling of one address the same token under one secret, and no other address", () => {
    expect(emailHash("Jo+News@Harbor.Example", SECRET)).toBe(emailHash("jo@harbor.example", SECRET));
    expect(emailHash("jo@harbor.example", SECRET)).not.toBe(emailHash("jo2@harbor.example", SECRET));
    expect(emailHash("jo@harbor.example", SECRET)).toMatch(/^[0-9a-f]{64}$/);
  });
  it("is keyed, so a different secret gives a different token and a plain hash of the address is no match", async () => {
    expect(emailHash("jo@harbor.example", SECRET)).not.toBe(emailHash("jo@harbor.example", "another-secret-of-at-least-32-characters"));
    const { createHash } = await import("node:crypto");
    expect(emailHash("jo@harbor.example", SECRET)).not.toBe(createHash("sha256").update("foundation:email:v1:jo@harbor.example").digest("hex"));
  });
  it("refuses without a secret and refuses an address it cannot read", () => {
    expect(() => emailHash("jo@harbor.example", "")).toThrow(MissingSecretError);
    expect(() => emailHash("jo@harbor.example", null)).toThrow(MissingSecretError);
    expect(() => emailHash("jo@harbor.example", "s".repeat(31))).toThrow(MissingSecretError);
    expect(() => emailHash("Jo <jo@harbor.example>", SECRET)).toThrow(InvalidEmailError);
  });
});
