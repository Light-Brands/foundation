import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.join(__dirname, "../..");
const SECRET_FILE = path.join(ROOT, "src/generated/build-secret.ts");

describe("gen-build-secret during unit tests", () => {
  it("keeps the build secret, so a script one test starts never changes it under another", () => {
    const before = readFileSync(SECRET_FILE, "utf8");
    const r = spawnSync("node", ["scripts/gen-build-secret.mjs"], { cwd: ROOT, encoding: "utf8" });
    expect(r.status).toBe(0);
    expect(readFileSync(SECRET_FILE, "utf8")).toBe(before);
  });
});
