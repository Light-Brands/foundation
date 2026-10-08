import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { parse } from "yaml";

const ROOT = path.join(__dirname, "../..");

describe("npm run chief", () => {
  it("is an npm script", () => {
    expect(JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8")).scripts.chief).toBe("tsx --conditions=react-server scripts/chief.ts");
  });
  it("names the chief of staff in the profile and the context block, refuses a bad name, and clears back to Claude", () => {
    const tmp = mkdtempSync(path.join(tmpdir(), "chief-"));
    const keyRoot = path.join(tmp, "key-root");
    mkdirSync(path.join(keyRoot, "key"), { recursive: true });
    writeFileSync(path.join(keyRoot, "key/key.yaml"), "client: harbor\nname: Harbor\n");
    const env = { ...process.env, FOUNDATION_DATA_DIR: path.join(tmp, "pglite"), FOUNDATION_KEY_ROOT: keyRoot, FOUNDATION_BUSINESS_NAME: "Harbor" };
    const run = (...args: string[]) => spawnSync("npm", ["run", "-s", "chief", "--", ...args], { cwd: ROOT, encoding: "utf8", env });
    const set = run("Sage");
    expect(set.stdout).toContain("Your chief of staff is now Sage.");
    expect(set.status).toBe(0);
    const block = parse(readFileSync(path.join(keyRoot, "key/knowledge/context-block.yaml"), "utf8"));
    expect(block.chief_name).toBe("Sage");
    expect(run().stdout).toContain("Your chief of staff is Sage.");
    const bad = run("R2D2");
    expect(bad.stdout).toContain("Use letters, spaces, apostrophes and hyphens");
    expect(bad.status).toBe(1);
    expect(run("--clear").stdout).toContain("Your chief of staff is now Claude.");
  }, 180_000);
});
