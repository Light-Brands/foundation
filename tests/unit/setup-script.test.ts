import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

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
  it("refuses a bad PIN", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "fc-"));
    expect(() => run(dir, ["--name", "X", "--pin", "123"])).toThrow();
    expect(existsSync(path.join(dir, ".env.local"))).toBe(false);
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
    expect(env).toContain('FOUNDATION_BUSINESS_NAME="Harbor \\"Studio\\" \\\\ Co"');
  });
});
