import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { parse } from "yaml";
import { contextBlockFromProfile, slugify } from "@/lib/key/context-block";
import { writeContextBlock } from "@/lib/key/write";
import { PROFILE_FIELDS, type Profile } from "@/lib/validate";

const profile = Object.fromEntries(PROFILE_FIELDS.map((k) => [k, `v-${k}`])) as Profile;

describe("contextBlockFromProfile", () => {
  it("nests the owner fields and copies the rest by name", () => {
    const b = contextBlockFromProfile(profile, "Ann Lee", "2026-10-05");
    expect(b.owner).toEqual({ name: "v-owner_name", first: "v-owner_first", role: "v-owner_role" });
    for (const k of PROFILE_FIELDS) {
      if (k.startsWith("owner_")) continue;
      expect((b as unknown as Record<string, unknown>)[k]).toBe(`v-${k}`);
    }
    expect(b.stated_by).toBe("Ann Lee");
    expect(b.recorded).toBe("2026-10-05");
  });
});

describe("writeContextBlock", () => {
  it("writes key/knowledge/context-block.yaml that parses back, business first", async () => {
    const root = mkdtempSync(path.join(tmpdir(), "cb-"));
    const block = contextBlockFromProfile(profile, "Ann", "2026-10-05");
    await writeContextBlock(root, block);
    const text = readFileSync(path.join(root, "key/knowledge/context-block.yaml"), "utf8");
    expect(parse(text)).toEqual(block);
    expect(Object.keys(parse(text))[0]).toBe("business");
    expect(text.startsWith("business:")).toBe(true);
  });
});

describe("slugify", () => {
  it("makes a lowercase hyphenated slug", () => {
    expect(slugify("Harbor Studio & Co.")).toBe("harbor-studio-co");
  });
});

describe("keyRoot", () => {
  it("uses FOUNDATION_KEY_ROOT when set, else the working directory", async () => {
    const { keyRoot } = await import("@/lib/key/write");
    const prev = process.env.FOUNDATION_KEY_ROOT;
    try {
      process.env.FOUNDATION_KEY_ROOT = "  /somewhere ";
      expect(keyRoot()).toBe("/somewhere");
      process.env.FOUNDATION_KEY_ROOT = "  ";
      expect(keyRoot()).toBe(process.cwd());
      delete process.env.FOUNDATION_KEY_ROOT;
      expect(keyRoot()).toBe(process.cwd());
    } finally {
      if (prev === undefined) delete process.env.FOUNDATION_KEY_ROOT;
      else process.env.FOUNDATION_KEY_ROOT = prev;
    }
  });
});
