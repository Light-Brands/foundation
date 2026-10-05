import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const NAME = ["k", "y", "l", "o", "n"].join("");

describe("the repository", () => {
  it("never names the workspace platform", () => {
    const files = execSync("git ls-files", { encoding: "utf8" }).split("\n").filter(Boolean)
      .filter((f) => !f.endsWith("package-lock.json"));
    const hits = files.filter((f) => f.toLowerCase().includes(NAME) || readFileSync(f, "utf8").toLowerCase().includes(NAME));
    expect(hits).toEqual([]);
  });
});
