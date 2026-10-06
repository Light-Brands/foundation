import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = path.join(__dirname, "../..");
const run = (args: string[], env: Record<string, string> = {}) =>
  spawnSync("npm", ["run", "-s", "hooks:prune", "--", ...args], { cwd: ROOT, encoding: "utf8", env: { ...process.env, ...env } });

describe("npm run hooks:prune", () => {
  it("is an npm script", () => {
    expect(JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8")).scripts["hooks:prune"]).toBe("tsx scripts/hooks-prune.ts");
  });
  it("refuses fewer than 30 days and touches nothing", () => {
    for (const args of [["10"], ["29"], ["abc"], []]) {
      const r = run(args, { FOUNDATION_DATA_DIR: path.join(mkdtempSync(path.join(tmpdir(), "prune-")), "never") });
      expect(r.status, args.join(" ")).toBe(1);
      expect(r.stdout + r.stderr).toMatch(/at least 30 days/);
    }
  }, 120_000);
  it("prunes a local database", () => {
    const r = run(["30"], { FOUNDATION_DATA_DIR: path.join(mkdtempSync(path.join(tmpdir(), "prune-")), "pglite") });
    expect(r.stdout).toMatch(/Removed 0 webhook events older than 30 days\./);
    expect(r.status).toBe(0);
  }, 120_000);
});
