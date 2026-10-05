import { describe, it, expect, vi, beforeEach } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { parse } from "yaml";

const calls: { fn: string; args: unknown[] }[] = [];
let failRename = false;
vi.mock("node:fs/promises", async (orig) => {
  const actual = await orig<typeof import("node:fs/promises")>();
  return {
    ...actual,
    writeFile: (...a: Parameters<typeof actual.writeFile>) => { calls.push({ fn: "writeFile", args: a }); return actual.writeFile(...a); },
    rename: (...a: Parameters<typeof actual.rename>) => {
      calls.push({ fn: "rename", args: a });
      return failRename ? Promise.reject(new Error("disk")) : actual.rename(...a);
    },
  };
});

import { writeContextBlock, writeKeyName } from "@/lib/key/write";
import { contextBlockFromProfile } from "@/lib/key/context-block";
import { PROFILE_FIELDS, type Profile } from "@/lib/validate";

const profile = Object.fromEntries(PROFILE_FIELDS.map((k) => [k, `v-${k}`])) as Profile;
const keyYaml = "key: 1\nclient: harbor-studio\nname: Your business\nstage: seed\nhome: repo\nroster: []\n";

function root() {
  const r = mkdtempSync(path.join(tmpdir(), "kw-"));
  mkdirSync(path.join(r, "key/knowledge"), { recursive: true });
  writeFileSync(path.join(r, "key/key.yaml"), keyYaml);
  return r;
}

beforeEach(() => { calls.length = 0; failRename = false; });

describe("writeContextBlock is atomic", () => {
  it("writes a temp file in the same folder, then renames it into place", async () => {
    const r = root();
    await writeContextBlock(r, contextBlockFromProfile(profile, "Ann", "2026-10-05"));
    const final = path.join(r, "key/knowledge/context-block.yaml");
    const w = calls.find((c) => c.fn === "writeFile")!;
    const rn = calls.find((c) => c.fn === "rename")!;
    expect(w.args[0]).not.toBe(final);
    expect(path.dirname(w.args[0] as string)).toBe(path.dirname(final));
    expect(rn.args).toEqual([w.args[0], final]);
    expect(readdirSync(path.join(r, "key/knowledge"))).toEqual(["context-block.yaml"]);
  });
  it("leaves the old file whole and no temp file behind when the rename fails", async () => {
    const r = root();
    const final = path.join(r, "key/knowledge/context-block.yaml");
    writeFileSync(final, "business: Old\n");
    failRename = true;
    await expect(writeContextBlock(r, contextBlockFromProfile(profile, "Ann", "2026-10-05"))).rejects.toThrow("disk");
    expect(readFileSync(final, "utf8")).toBe("business: Old\n");
    expect(readdirSync(path.join(r, "key/knowledge"))).toEqual(["context-block.yaml"]);
  });
});

describe("writeContextBlock hours", () => {
  it("quotes work_start and work_end so no reader takes 09:00 for a number", async () => {
    const r = root();
    await writeContextBlock(r, contextBlockFromProfile({ ...profile, work_start: "09:00", work_end: "17:30" }, "Ann", "2026-10-05"));
    const text = readFileSync(path.join(r, "key/knowledge/context-block.yaml"), "utf8");
    expect(text).toMatch(/^work_start: ["']09:00["']$/m);
    expect(text).toMatch(/^work_end: ["']17:30["']$/m);
    const back = parse(text);
    expect(back.work_start).toBe("09:00");
    expect(back.work_end).toBe("17:30");
  });
});

describe("writeKeyName", () => {
  it("sets name, leaves client and the rest unchanged, atomically", async () => {
    const r = root();
    await writeKeyName(r, "Harbor Studio & Co.");
    const key = parse(readFileSync(path.join(r, "key/key.yaml"), "utf8"));
    expect(key.name).toBe("Harbor Studio & Co.");
    expect(key.client).toBe("harbor-studio");
    expect(key.stage).toBe("seed");
    const rn = calls.find((c) => c.fn === "rename")!;
    expect(rn.args[1]).toBe(path.join(r, "key/key.yaml"));
    expect(path.dirname((rn.args[0] as string))).toBe(path.join(r, "key"));
    expect(readdirSync(path.join(r, "key")).sort()).toEqual(["key.yaml", "knowledge"]);
  });
  it("does nothing when there is no key.yaml", async () => {
    const r = mkdtempSync(path.join(tmpdir(), "kw-"));
    await writeKeyName(r, "Harbor");
    expect(readdirSync(r)).toEqual([]);
  });
  it("keeps the old key.yaml whole when the rename fails", async () => {
    const r = root();
    failRename = true;
    await expect(writeKeyName(r, "Harbor")).rejects.toThrow("disk");
    expect(readFileSync(path.join(r, "key/key.yaml"), "utf8")).toBe(keyYaml);
    expect(readdirSync(path.join(r, "key")).sort()).toEqual(["key.yaml", "knowledge"]);
  });
});
