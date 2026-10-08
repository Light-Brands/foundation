import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = path.join(__dirname, "../..");
const run = (env: Record<string, string>) =>
  spawnSync("npm", ["run", "-s", "auth:unlock"], { cwd: ROOT, encoding: "utf8", env: { ...process.env, FOUNDATION_DATABASE_URL: "", ...env } });

describe("npm run auth:unlock", () => {
  it("is an npm script", () => {
    expect(JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8")).scripts["auth:unlock"]).toBe("tsx --conditions=react-server scripts/auth-unlock.ts");
  });
  it("clears a local database's sign-in waits", () => {
    const r = run({ FOUNDATION_DATA_DIR: path.join(mkdtempSync(path.join(tmpdir(), "unlock-")), "pglite") });
    expect(r.stdout).toMatch(/Sign-in was not waiting|Sign-in is open again/);
    expect(r.status).toBe(0);
  }, 120_000);
});
