import { describe, it, expect } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, existsSync, statSync, chmodSync, cpSync } from "node:fs";
import { parse } from "yaml";
import { tmpdir } from "node:os";
import path from "node:path";
import { loadEnvConfig } from "@next/env";

const SCRIPT = path.join(__dirname, "../../scripts/setup.mjs");
// The Key as it ships, before setup names it. The live key/ is named once setup runs, so tests copy this instead.
const SEED_KEY = path.join(__dirname, "../fixtures/key-seed");
const run = (cwd: string, args: string[]) =>
  execFileSync("node", [SCRIPT, ...args], { cwd, encoding: "utf8", stdio: "pipe" });

// Setup changes client, name, provenance.recorded and provenance.base. The repository ships the Key
// untouched, so the fixture must match it whole, or tests run against a seed members never get.
describe("the seed fixture", () => {
  const ROOT = path.join(__dirname, "../..");
  const shipped = parse(readFileSync(path.join(ROOT, "key/key.yaml"), "utf8"));
  it("is the shipped seed: key/key.yaml is still unnamed in this repository", () => {
    expect(shipped.client).toBe("your-business");
    expect(shipped.provenance?.base).toBeUndefined();
  });
  it("matches the shipped key/key.yaml and context block whole", () => {
    expect(parse(readFileSync(path.join(SEED_KEY, "key.yaml"), "utf8"))).toEqual(shipped);
    expect(parse(readFileSync(path.join(SEED_KEY, "knowledge/context-block.yaml"), "utf8")))
      .toEqual(parse(readFileSync(path.join(ROOT, "key/knowledge/context-block.yaml"), "utf8")));
  });
  it("matches the shipped seed in every field setup leaves alone", () => {
    const untouched = (k: Record<string, unknown>) => {
      const out: Record<string, unknown> = structuredClone(k);
      const prov = (out.provenance ?? {}) as Record<string, unknown>;
      for (const f of ["client", "name"]) delete out[f];
      for (const f of ["recorded", "base"]) delete prov[f];
      return out;
    };
    expect(untouched(parse(readFileSync(path.join(SEED_KEY, "key.yaml"), "utf8")))).toEqual(untouched(shipped));
  });
});

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
  it("tests against the unnamed seed Key, never the live key/ folder setup has named", () => {
    expect(parse(readFileSync(path.join(SEED_KEY, "key.yaml"), "utf8")).client).toBe("your-business");
  });
  it("names the Key after the business and starts its context block", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "fc-"));
    cpSync(SEED_KEY, path.join(dir, "key"), { recursive: true });
    run(dir, ["--name", "Harbor Studio & Co.", "--pin", "246810"]);
    const key = parse(readFileSync(path.join(dir, "key/key.yaml"), "utf8"));
    expect(key.client).toBe("harbor-studio-co");
    expect(key.name).toBe("Harbor Studio & Co.");
    expect(key.provenance.recorded).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const block = parse(readFileSync(path.join(dir, "key/knowledge/context-block.yaml"), "utf8"));
    expect(block.business).toBe("Harbor Studio & Co.");
  });
  it("records the commit setup ran on as provenance.base, keeping the other provenance fields", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "fc-"));
    const git = (...a: string[]) => execFileSync("git", a, { cwd: dir, encoding: "utf8", stdio: "pipe" });
    git("init", "-q"); git("config", "user.email", "t@example.org"); git("config", "user.name", "t");
    cpSync(SEED_KEY, path.join(dir, "key"), { recursive: true });
    git("add", "."); git("commit", "-qm", "template");
    const head = git("rev-parse", "HEAD").trim();
    run(dir, ["--name", "Harbor Studio", "--pin", "246810"]);
    const key = parse(readFileSync(path.join(dir, "key/key.yaml"), "utf8"));
    expect(key.provenance.base).toBe(head);
    expect(key.provenance.base).toMatch(/^[0-9a-f]{40}$/);
    expect(key.provenance.guide).toBe("foundation");
    expect(key.provenance.stated_by).toBe("");
  });
  it("records no base outside a git repository", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "fc-"));
    cpSync(SEED_KEY, path.join(dir, "key"), { recursive: true });
    run(dir, ["--name", "Harbor Studio", "--pin", "246810"]);
    expect(parse(readFileSync(path.join(dir, "key/key.yaml"), "utf8")).provenance).not.toHaveProperty("base");
  });
  it("leaves an already named Key alone", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "fc-"));
    cpSync(SEED_KEY, path.join(dir, "key"), { recursive: true });
    run(dir, ["--name", "Harbor Studio", "--pin", "246810"]);
    run(dir, ["--name", "Other Name", "--pin", "246810", "--force"]);
    expect(parse(readFileSync(path.join(dir, "key/key.yaml"), "utf8")).client).toBe("harbor-studio");
  });
  it("runs npm run key:sync at the end so the inventory exists", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "fc-"));
    cpSync(SEED_KEY, path.join(dir, "key"), { recursive: true });
    writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({ name: "stub", scripts: { "key:sync": "node -e \"require('fs').writeFileSync('synced.txt', 'yes')\"" } }),
    );
    run(dir, ["--name", "Harbor Studio", "--pin", "246810"]);
    expect(readFileSync(path.join(dir, "synced.txt"), "utf8")).toBe("yes");
  }, 60000);
  it("still finishes setup when key:sync cannot run", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "fc-"));
    cpSync(SEED_KEY, path.join(dir, "key"), { recursive: true });
    const out = run(dir, ["--name", "Harbor Studio", "--pin", "246810"]);
    expect(out).toContain("npm run key:sync");
    expect(existsSync(path.join(dir, ".env.local"))).toBe(true);
  }, 60000);
});
