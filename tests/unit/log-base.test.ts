import { describe, it, expect } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { parse } from "yaml";
import { setKeyBase } from "@/lib/key/write";

// A member's repository whose Key has no base yet: a Foundation set up before setup recorded one.
const keyText = [
  "key: 1",
  "client: harbor-studio",
  "name: Harbor Studio",
  "stage: seed",
  "home: repo",
  "roster: []",
  "installed: []",
  "provenance:",
  "  stated_by: Jo Harbor",
  "  recorded: 2026-10-05",
  "  guide: foundation",
  "",
].join("\n");

function repo(text = keyText) {
  const dir = mkdtempSync(path.join(tmpdir(), "logbase-"));
  const git = (...a: string[]) => execFileSync("git", a, { cwd: dir, encoding: "utf8", stdio: "pipe" });
  git("init", "-q"); git("config", "user.email", "t@example.org"); git("config", "user.name", "t");
  mkdirSync(path.join(dir, "key"), { recursive: true });
  writeFileSync(path.join(dir, "key/key.yaml"), text);
  git("add", "."); git("commit", "-qm", "chore: set up Harbor Studio");
  return { dir, head: git("rev-parse", "HEAD").trim() };
}

const run = (dir: string, ...args: string[]) =>
  spawnSync("npx", ["tsx", path.resolve("scripts/log-base.ts"), "--root", dir, ...args], { encoding: "utf8" });

const A = "a".repeat(40);
const B = "b".repeat(40);

describe("setKeyBase", () => {
  it("adds provenance.base and changes nothing else, byte for byte", async () => {
    const { dir } = repo();
    expect(await setKeyBase(dir, A)).toEqual({ status: "set", base: A });
    const after = readFileSync(path.join(dir, "key/key.yaml"), "utf8");
    expect(after).toBe(keyText + `  base: ${A}\n`);
    expect(readdirSync(path.join(dir, "key"))).toEqual(["key.yaml"]);
  });
  it("keeps an existing base unless forced", async () => {
    const { dir } = repo(keyText + `  base: ${A}\n`);
    expect(await setKeyBase(dir, B)).toEqual({ status: "kept", base: A });
    expect(readFileSync(path.join(dir, "key/key.yaml"), "utf8")).toContain(`base: ${A}`);
    expect(await setKeyBase(dir, A)).toEqual({ status: "same", base: A });
    expect(await setKeyBase(dir, B, { force: true })).toEqual({ status: "moved", base: B, was: A });
    expect(readFileSync(path.join(dir, "key/key.yaml"), "utf8")).toBe(keyText + `  base: ${B}\n`);
  });
  it("adds a provenance block when the Key has none", async () => {
    const { dir } = repo("key: 1\nclient: harbor-studio\n");
    await setKeyBase(dir, A);
    expect(parse(readFileSync(path.join(dir, "key/key.yaml"), "utf8"))).toEqual({ key: 1, client: "harbor-studio", provenance: { base: A } });
  });
});

describe("npm run log:base", () => {
  it("sets the base to HEAD when it is missing and says so", () => {
    const { dir, head } = repo();
    const r = run(dir);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain(`log:base set provenance.base in key/key.yaml to ${head}`);
    expect(parse(readFileSync(path.join(dir, "key/key.yaml"), "utf8")).provenance.base).toBe(head);
  }, 60000);

  it("refuses to move an existing base without --force, and moves it with it", () => {
    const { dir, head } = repo(keyText + `  base: ${A}\n`);
    const kept = run(dir);
    expect(kept.status).toBe(1);
    expect(kept.stdout + kept.stderr).toContain(`provenance.base is already ${A}`);
    expect(readFileSync(path.join(dir, "key/key.yaml"), "utf8")).toBe(keyText + `  base: ${A}\n`);
    const moved = run(dir, "--force");
    expect(moved.status).toBe(0);
    expect(moved.stdout).toContain(`log:base moved provenance.base in key/key.yaml from ${A} to ${head}`);
    expect(readFileSync(path.join(dir, "key/key.yaml"), "utf8")).toBe(keyText + `  base: ${head}\n`);
  }, 60000);

  it("says so and writes nothing when there is no git history", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "logbase-empty-"));
    execFileSync("git", ["init", "-q"], { cwd: dir });
    mkdirSync(path.join(dir, "key"));
    writeFileSync(path.join(dir, "key/key.yaml"), keyText);
    const r = run(dir);
    expect(r.status).toBe(1);
    expect(r.stdout + r.stderr).toContain("No git history yet");
    expect(readFileSync(path.join(dir, "key/key.yaml"), "utf8")).toBe(keyText);
  }, 60000);
});
