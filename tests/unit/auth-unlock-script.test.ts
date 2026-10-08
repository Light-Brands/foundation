import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { openPglite } from "@/lib/db/pglite";
import { migrate } from "@/lib/db/migrate";

const ROOT = path.join(__dirname, "../..");
const CORE = path.join(ROOT, "core/db/migrations");
const SECRET_FILE = path.join(ROOT, "src/generated/build-secret.ts");
const run = (env: Record<string, string>) =>
  spawnSync("npm", ["run", "-s", "auth:unlock"], { cwd: ROOT, encoding: "utf8", env: { ...process.env, FOUNDATION_DATABASE_URL: "", ...env } });
const freshDir = () => path.join(mkdtempSync(path.join(tmpdir(), "unlock-")), "pglite");
const tables = async (dir: string) => {
  const db = await openPglite(dir);
  try {
    const [r] = await db.query<{ a: string | null; f: string | null }>("select to_regclass('gate_attempts')::text as a, to_regclass('gate_failures')::text as f");
    return r;
  } finally {
    await db.close();
  }
};

describe("npm run auth:unlock", () => {
  it("is an npm script, and its pre-hook makes the build secret only when there is none", () => {
    const scripts = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8")).scripts;
    expect(scripts["auth:unlock"]).toBe("tsx --conditions=react-server scripts/auth-unlock.ts");
    expect(scripts["preauth:unlock"]).toBe("node scripts/gen-build-secret.mjs --if-missing");
  });

  it("never migrates the database it clears", () => {
    const src = readFileSync(path.join(ROOT, "scripts/auth-unlock.ts"), "utf8");
    expect(src).not.toMatch(/migrate|openScriptDb/);
  });

  it("clears a local database's sign-in waits, and leaves the build secret as it was", async () => {
    const dir = freshDir();
    const db = await openPglite(dir);
    await migrate(db, CORE, "core");
    await db.query("insert into gate_attempts (key, fails, window_start, strikes, touched) values ('k', 5, now(), 1, now())");
    await db.query("insert into gate_failures (key_hash, at) values ('k', now())");
    await db.close();
    const before = readFileSync(SECRET_FILE, "utf8");

    const r = run({ FOUNDATION_DATA_DIR: dir });
    expect(r.stdout).toMatch(/Sign-in is open again/);
    expect(r.status).toBe(0);
    // A new build secret would sign out a running dev session and orphan its limiter keys.
    expect(readFileSync(SECRET_FILE, "utf8")).toBe(before);

    const after = await openPglite(dir);
    expect(await after.query("select key from gate_attempts")).toEqual([]);
    expect(await after.query("select id from gate_failures")).toEqual([]);
    await after.close();
  }, 120_000);

  it("says so and stops when the limiter's tables are missing, and creates nothing", async () => {
    const dir = freshDir();
    await (await openPglite(dir)).close();
    const r = run({ FOUNDATION_DATA_DIR: dir });
    expect(r.stdout).toMatch(/sign-in limiter's tables are not in this database/);
    expect(r.status).not.toBe(0);
    expect(await tables(dir)).toEqual({ a: null, f: null });
  }, 120_000);
});
