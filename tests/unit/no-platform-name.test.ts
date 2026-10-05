import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const NAME = ["k", "y", "l", "o", "n"].join("");
const ROOT = path.resolve(__dirname, "../..");

describe("the repository", () => {
  it("never names the workspace platform", () => {
    const files = execSync("git ls-files", { encoding: "utf8", cwd: ROOT }).split("\n").filter(Boolean)
      .filter((f) => !f.endsWith("package-lock.json"));
    const hits = files.filter((f) => {
      if (f.toLowerCase().includes(NAME)) return true;
      const full = path.join(ROOT, f);
      if (!existsSync(full)) return false;
      const buf = readFileSync(full);
      if (buf.includes(0)) return false;
      return buf.toString("utf8").toLowerCase().includes(NAME);
    });
    expect(hits).toEqual([]);
  });
});
