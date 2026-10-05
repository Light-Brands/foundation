import { describe, it, expect } from "vitest";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { hasInstallEntry } from "@/lib/ninja";

describe("hasInstallEntry", () => {
  it("is true only when ninja/modules/<category>/<job>.md exists", () => {
    const root = mkdtempSync(path.join(tmpdir(), "ninja-entry-"));
    expect(hasInstallEntry("deliver", "booking", root)).toBe(false);
    mkdirSync(path.join(root, "ninja/modules/deliver"), { recursive: true });
    writeFileSync(path.join(root, "ninja/modules/deliver/booking.md"), "---\nname: Book appointments\n---\n");
    expect(hasInstallEntry("deliver", "booking", root)).toBe(true);
    expect(hasInstallEntry("deliver", "other", root)).toBe(false);
    expect(hasInstallEntry("sell", "booking", root)).toBe(false);
  });
  it("never looks outside ninja/modules for an id that is not a slug", () => {
    const root = mkdtempSync(path.join(tmpdir(), "ninja-entry-"));
    mkdirSync(path.join(root, "ninja/modules/deliver"), { recursive: true });
    writeFileSync(path.join(root, "ninja/x.md"), "");
    expect(hasInstallEntry("deliver", "../../x", root)).toBe(false);
    expect(hasInstallEntry("..", "x", root)).toBe(false);
  });
  it("ships the dictionary with the deployed app, so the check works on Vercel", () => {
    expect(readFileSync("next.config.ts", "utf8")).toMatch(/"\.\/ninja\/\*\*\/\*"/);
  });
});
