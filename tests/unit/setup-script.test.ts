import { describe, it, expect } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync, statSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { loadEnvConfig } from "@next/env";

const SCRIPT = path.join(__dirname, "../../scripts/setup.mjs");
const run = (cwd: string, args: string[]) =>
  execFileSync("node", [SCRIPT, ...args], { cwd, encoding: "utf8", stdio: "pipe" });

describe("npm run setup", () => {
  it("writes .env.local from flags", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "fc-"));
    run(dir, ["--name", "Harbor Studio", "--pin", "246810"]);
    const env = readFileSync(path.join(dir, ".env.local"), "utf8");
    expect(env).toContain("FOUNDATION_PIN=246810");
    expect(env).toContain('FOUNDATION_BUSINESS_NAME="Harbor Studio"');
    expect(env).toMatch(/FOUNDATION_SECRET=[0-9a-f]{64}/);
  });
  it.each(["123", "12345a"])("refuses a bad PIN (%s) with a clear message and writes nothing", (pin) => {
    const dir = mkdtempSync(path.join(tmpdir(), "fc-"));
    const r = spawnSync("node", [SCRIPT, "--name", "X", "--pin", pin], { cwd: dir, encoding: "utf8" });
    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain("6 to 12 digits");
    expect(existsSync(path.join(dir, ".env.local"))).toBe(false);
  });
  it("fails instead of hanging when it needs a PIN and stdin is not a terminal", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "fc-"));
    const r = spawnSync("node", [SCRIPT, "--name", "X"], { cwd: dir, encoding: "utf8", stdio: "pipe", timeout: 10000 });
    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain("Run this in your own terminal window so you can type your PIN, or pass --pin.");
    expect(existsSync(path.join(dir, ".env.local"))).toBe(false);
  });
  it("fails clearly when the name is missing and stdin is not a terminal", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "fc-"));
    const r = spawnSync("node", [SCRIPT, "--pin", "246810"], { cwd: dir, encoding: "utf8", stdio: "pipe", timeout: 10000 });
    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain('Add --name "Your business".');
  });
  it.each(['Harbor "Studio" & Co', "Joe's Pizza", "A\\B"])("reads the name %s back exactly through Next's env loader", (name) => {
    const dir = mkdtempSync(path.join(tmpdir(), "fc-"));
    run(dir, ["--name", name, "--pin", "246810"]);
    // Next skips .env.local when NODE_ENV is "test", so load as it does under `next dev`.
    const nodeEnv = process.env.NODE_ENV;
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";
    try {
      const { combinedEnv } = loadEnvConfig(dir, true, { info() {}, error() {} }, true);
      expect(combinedEnv.FOUNDATION_BUSINESS_NAME).toBe(name);
    } finally {
      (process.env as Record<string, string | undefined>).NODE_ENV = nodeEnv;
    }
  });
  it("rejects a name with both kinds of quote and names with control characters", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "fc-"));
    const both = spawnSync("node", [SCRIPT, "--name", `Joe's "Pizza"`, "--pin", "246810"], { cwd: dir, encoding: "utf8" });
    expect(both.status).not.toBe(0);
    expect(both.stderr).toContain("cannot contain both kinds of quote marks");
    const nl = spawnSync("node", [SCRIPT, "--name", "A\nB", "--pin", "246810"], { cwd: dir, encoding: "utf8" });
    expect(nl.status).not.toBe(0);
    expect(nl.stderr).toContain("Use letters, numbers and punctuation in your business name.");
    expect(existsSync(path.join(dir, ".env.local"))).toBe(false);
  });
  it("writes .env.local with mode 0600, including when forced over a looser file", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "fc-"));
    run(dir, ["--name", "A", "--pin", "246810"]);
    expect(statSync(path.join(dir, ".env.local")).mode & 0o777).toBe(0o600);
    chmodSync(path.join(dir, ".env.local"), 0o644);
    run(dir, ["--pin", "135790", "--force"]);
    expect(statSync(path.join(dir, ".env.local")).mode & 0o777).toBe(0o600);
  });
  it("keeps an existing .env.local unless forced", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "fc-"));
    run(dir, ["--name", "A", "--pin", "246810"]);
    expect(() => run(dir, ["--name", "B", "--pin", "135790"])).toThrow();
    run(dir, ["--name", "B", "--pin", "135790", "--force"]);
    expect(readFileSync(path.join(dir, ".env.local"), "utf8")).toContain("FOUNDATION_PIN=135790");
  });
  it("reuses the business name from the existing .env.local when forced without --name", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "fc-"));
    run(dir, ["--name", 'Harbor "Studio" \\ Co', "--pin", "246810"]);
    run(dir, ["--pin", "135790", "--force"]);
    const env = readFileSync(path.join(dir, ".env.local"), "utf8");
    expect(env).toContain("FOUNDATION_PIN=135790");
    expect(env).toContain(`FOUNDATION_BUSINESS_NAME='Harbor "Studio" \\ Co'`);
  });
});
