import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { coreDb } from "../support/db";
import { listConnections, parseConnectionSetArgs, setConnectionStatus, upsertConnection } from "@/lib/data/connections";

const NOW = new Date("2026-10-05T16:00:00Z");
const ROOT = path.join(__dirname, "../..");
const fake = (...parts: string[]) => parts.join("");

describe("parseConnectionSetArgs", () => {
  it("reads a service, a status and an optional note", () => {
    expect(parseConnectionSetArgs(["email-sending", "connected"])).toEqual({ ok: true, value: { service: "email-sending", status: "connected", note: "" } });
    expect(parseConnectionSetArgs(["email-sending", "failing", "--note", "The provider refused the key."])).toEqual({ ok: true, value: { service: "email-sending", status: "failing", note: "The provider refused the key." } });
  });
  it("refuses a missing status, an unknown flag or a note with no text", () => {
    for (const argv of [[], ["email-sending"], ["email-sending", "connected", "--note"], ["email-sending", "connected", "--x", "y"], ["email-sending", "connected", "extra"]]) {
      expect(parseConnectionSetArgs(argv).ok, argv.join(" ")).toBe(false);
    }
  });
});

describe("setConnectionStatus", () => {
  it("creates a row for a new service and updates only status and note on an existing one", async () => {
    const db = await coreDb();
    await setConnectionStatus(db, { service: "email-sending", status: "connected", note: "" }, NOW);
    expect((await listConnections(db)).map((r) => [r.service, r.door, r.status, r.note])).toEqual([["email-sending", "own", "connected", ""]]);
    await upsertConnection(db, { service: "email-sending", door: "custom", status: "connected", scopes: ["send"], key_setting: "RESEND_API_KEY", tested_on: "2026-10-01", owner: "Owner" }, NOW);
    await setConnectionStatus(db, { service: "email-sending", status: "failing", note: "The provider refused the key." }, NOW);
    const [row] = await listConnections(db);
    expect(row).toMatchObject({ door: "custom", status: "failing", scopes: ["send"], key_setting: "RESEND_API_KEY", tested_on: "2026-10-01", owner: "Owner", note: "The provider refused the key." });
    await db.close();
  });
  it("writes through the same validator, so a bad status, slug or a key in the note is refused", async () => {
    const db = await coreDb();
    await expect(setConnectionStatus(db, { service: "email-sending", status: "maybe" as never, note: "" }, NOW)).rejects.toThrow(/planned, connected, failing or disconnected/);
    await expect(setConnectionStatus(db, { service: "Email Sending", status: "connected", note: "" }, NOW)).rejects.toThrow(/slug/);
    await expect(setConnectionStatus(db, { service: "email-sending", status: "connected", note: fake("sk", "_live_", "x".repeat(24)) }, NOW)).rejects.toThrow(/note/);
    await expect(setConnectionStatus(db, { service: "email-sending", status: "connected", note: "x".repeat(201) }, NOW)).rejects.toThrow(/note/);
    expect(await listConnections(db)).toEqual([]);
    await db.close();
  });
});

describe("npm run connection:set", () => {
  const run = (args: string[], env: Record<string, string> = {}) =>
    spawnSync("npm", ["run", "-s", "connection:set", "--", ...args], { cwd: ROOT, encoding: "utf8", env: { ...process.env, ...env } });
  it("is an npm script", () => {
    expect(JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8")).scripts["connection:set"]).toBe("tsx --conditions=react-server scripts/connection-set.ts");
  });
  it("says how to use it, and writes a valid row", () => {
    const dir = path.join(mkdtempSync(path.join(tmpdir(), "conn-set-")), "pglite");
    const bad = run(["email-sending"], { FOUNDATION_DATA_DIR: dir });
    expect(bad.status).toBe(1);
    expect(bad.stdout + bad.stderr).toMatch(/npm run connection:set -- <service> <status>/);
    const good = run(["email-sending", "connected", "--note", "Tested a send."], { FOUNDATION_DATA_DIR: dir });
    expect(good.stdout).toMatch(/email-sending is now connected\./);
    expect(good.status).toBe(0);
  }, 120_000);
});
