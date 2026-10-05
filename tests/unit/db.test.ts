import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { emailSignIn, selectDriver } from "@/lib/db/driver";
import { openPglite } from "@/lib/db/pglite";
import { migrate, migrateAll, normalizeLegacyNames } from "@/lib/db/migrate";
import { readEnv } from "@/lib/env";

const MIGRATIONS = path.join(__dirname, "../../core/db/migrations");

describe("selectDriver", () => {
  it("runs PGlite locally and preview on Vercel", () => {
    expect(selectDriver(readEnv({}))).toBe("pglite");
    expect(selectDriver(readEnv({ VERCEL: "1" }))).toBe("preview");
  });
  it("uses the hosted database wherever its address is set", () => {
    const url = "postgresql://postgres.ref:pw@pooler.example:6543/postgres";
    expect(selectDriver(readEnv({ FOUNDATION_DATABASE_URL: url }))).toBe("supabase");
    expect(selectDriver(readEnv({ FOUNDATION_DATABASE_URL: url, VERCEL: "1" }))).toBe("supabase");
    expect(selectDriver(readEnv({ FOUNDATION_DATABASE_URL: "nonsense", VERCEL: "1" }))).toBe("preview");
  });
  it("offers email sign-in only with the hosted database, both Supabase settings and an explicit secret", () => {
    const url = "postgresql://postgres.ref:pw@pooler.example:6543/postgres";
    const all = { FOUNDATION_DATABASE_URL: url, FOUNDATION_SUPABASE_URL: "https://x.supabase.co", FOUNDATION_SUPABASE_SECRET_KEY: "sb_secret_k", FOUNDATION_SECRET: "a-long-random-value-of-32-characters" };
    expect(emailSignIn(readEnv(all))).toBe(true);
    expect(emailSignIn(readEnv({ ...all, FOUNDATION_SECRET: "" }))).toBe(false);
    expect(emailSignIn(readEnv({ ...all, FOUNDATION_SECRET: "too-short" }))).toBe(false);
    expect(emailSignIn(readEnv({ ...all, FOUNDATION_SUPABASE_SECRET_KEY: "" }))).toBe(false);
    expect(emailSignIn(readEnv({ ...all, FOUNDATION_SUPABASE_URL: "" }))).toBe(false);
    expect(emailSignIn(readEnv({ ...all, FOUNDATION_DATABASE_URL: "" }))).toBe(false);
  });
  it("refuses an address whose sslmode turns off certificate checks, with a plain message", async () => {
    const base = "postgresql://postgres.ref:pw@aws-0-us-west-1.pooler.supabase.com:6543/postgres";
    for (const mode of ["disable", "no-verify", "allow", "prefer", "require"]) {
      const env = readEnv({ FOUNDATION_DATABASE_URL: `${base}?sslmode=${mode}` });
      expect([env.databaseUrl, env.databaseProblem], mode).toEqual([null, "insecure"]);
      expect(selectDriver(env), mode).toBe("pglite");
    }
    for (const mode of ["verify-full", "verify-ca"]) expect(readEnv({ FOUNDATION_DATABASE_URL: `${base}?sslmode=${mode}` }).databaseProblem).toBeNull();
    const { DATABASE_INSECURE_MESSAGE } = await import("@/lib/db/driver");
    expect(DATABASE_INSECURE_MESSAGE).toMatch(/sslmode/);
    const { openSupabase } = await import("@/lib/db/supabase");
    expect(() => openSupabase(`${base}?sslmode=no-verify`)).toThrow(DATABASE_INSECURE_MESSAGE);
  });
  it("verifies the server certificate, and skips TLS only for a database on this computer", async () => {
    const { connectionOptions } = await import("@/lib/db/supabase");
    const hosted = connectionOptions("postgresql://postgres.ref:pw@aws-0-us-west-1.pooler.supabase.com:6543/postgres");
    expect(hosted.ssl).toEqual({ rejectUnauthorized: true });
    expect(hosted.prepare).toBe(false);
    const withCa = connectionOptions("postgresql://postgres.ref:pw@pooler.example:6543/postgres", { ca: "-----BEGIN CERTIFICATE-----\nx\n-----END CERTIFICATE-----" });
    expect(withCa.ssl).toEqual({ rejectUnauthorized: true, ca: "-----BEGIN CERTIFICATE-----\nx\n-----END CERTIFICATE-----" });
    for (const host of ["localhost", "127.0.0.1"]) expect(connectionOptions(`postgresql://postgres:pw@${host}:5432/postgres`).ssl, host).toBe(false);
    expect(readEnv({ FOUNDATION_DATABASE_CA: " pem " }).databaseCa).toBe("pem");
  });
  it("builds a hosted handle without connecting until used", async () => {
    const { openSupabase } = await import("@/lib/db/supabase");
    const db = openSupabase("postgresql://postgres.ref:pw@pooler.invalid:6543/postgres");
    expect(typeof db.transaction).toBe("function");
    await db.close();
  });
});

describe("migrate", () => {
  it("applies every migration once and records it", async () => {
    const db = await openPglite();
    const onDisk = fs.readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort().map((f) => `core/${f}`);
    expect(await migrate(db, MIGRATIONS, "core")).toEqual(onDisk);
    expect(onDisk.slice(0, 3)).toEqual(["core/0001_core.sql", "core/0002_core_profile_shape.sql", "core/0003_core_contacts_phone.sql"]);
    expect(await migrate(db, MIGRATIONS, "core")).toEqual([]);
    const tables = await db.query<{ table_name: string }>(
      "select table_name from information_schema.tables where table_schema = 'public' order by table_name",
    );
    expect(tables.map((t) => t.table_name)).toEqual(["_migrations", "business_profile", "check_runs", "connections", "contacts", "core_settings", "form_counts", "form_hits", "inbox_items", "opt_outs", "outbox", "pause", "webhook_events"]);
    await db.close();
  });

  it("rolls back a failing migration and names the bad file", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mig-"));
    fs.writeFileSync(path.join(dir, "0001_ok.sql"), "create table t_ok (x int);");
    fs.writeFileSync(path.join(dir, "0002_bad.sql"), "create table t_bad (x int); this is not sql;");
    const db = await openPglite();
    await expect(migrate(db, dir, "test")).rejects.toThrow(/0002_bad\.sql/);
    const recorded = await db.query<{ name: string }>("select name from _migrations order by name");
    expect(recorded.map((r) => r.name)).toEqual(["test/0001_ok.sql"]);
    const t = await db.query<{ table_name: string }>(
      "select table_name from information_schema.tables where table_schema = 'public' and table_name in ('t_ok','t_bad')",
    );
    expect(t.map((r) => r.table_name)).toEqual(["t_ok"]);
    await db.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe("migrateAll", () => {
  it("applies core then each Key app, recording names with their prefix", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "fnd-"));
    fs.cpSync(MIGRATIONS, path.join(root, "core/db/migrations"), { recursive: true });
    fs.mkdirSync(path.join(root, "key/apps/booking/migrations"), { recursive: true });
    fs.writeFileSync(
      path.join(root, "key/apps/booking/migrations/0001_booking_bookings.sql"),
      "create table bookings (id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), updated_at timestamptz not null default now());",
    );
    const db = await openPglite();
    const applied = await migrateAll(db, root);
    expect(applied[0]).toBe("core/0001_core.sql");
    expect(applied).toContain("booking/0001_booking_bookings.sql");
    expect(await migrateAll(db, root)).toEqual([]);
    await db.close();
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("upgrades a Phase 0 database without re-applying its migration", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "fnd-"));
    fs.cpSync(MIGRATIONS, path.join(root, "core/db/migrations"), { recursive: true });
    const db = await openPglite();
    await migrate(db, path.join(root, "core/db/migrations"), "core");
    await db.exec("update _migrations set name = '0001_core.sql' where name = 'core/0001_core.sql'");
    await normalizeLegacyNames(db);
    const names = (await db.query<{ name: string }>("select name from _migrations order by name")).map((r) => r.name);
    expect(names).toContain("core/0001_core.sql");
    expect(names).not.toContain("0001_core.sql");
    expect(await migrateAll(db, root)).toEqual([]);
    await db.close();
    fs.rmSync(root, { recursive: true, force: true });
  });
});

describe("profile shape migration", () => {
  it("renames the old columns and adds the context-block ones", async () => {
    const db = await openPglite();
    await migrateAll(db, path.join(__dirname, "../.."));
    await expect(db.query("insert into business_profile (business_name) values ('x')")).rejects.toThrow();
    await db.query("select business, what_we_do, city, owner_name from business_profile");
    await db.close();
  });

  it("carries a Phase 0 row forward", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mig-"));
    fs.copyFileSync(path.join(MIGRATIONS, "0001_core.sql"), path.join(dir, "0001_core.sql"));
    const db = await openPglite();
    await migrate(db, dir, "core");
    await db.query("insert into business_profile (business_name, tagline) values ('Harbor', 'Calm')");
    await migrate(db, MIGRATIONS, "core");
    const [row] = await db.query<{ business: string; what_we_do: string }>("select business, what_we_do from business_profile");
    expect(row).toEqual({ business: "Harbor", what_we_do: "Calm" });
    await db.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe("the migration lock", () => {
  it("two starts migrating at once apply each file once", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mig-"));
    // No "if not exists": a second apply would fail, so a pass proves the file ran once.
    fs.writeFileSync(path.join(dir, "0001_once.sql"), "create table t_once (x int);");
    fs.writeFileSync(path.join(dir, "0002_twice.sql"), "create table t_twice (x int);");
    const db = await openPglite();
    const [a, b] = await Promise.all([migrate(db, dir, "race"), migrate(db, dir, "race")]);
    expect([...a, ...b].sort()).toEqual(["race/0001_once.sql", "race/0002_twice.sql"]);
    expect(await db.query("select count(*)::int as n from _migrations")).toEqual([{ n: 2 }]);
    await db.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });
  it("seeds the one profile row without racing", async () => {
    const db = await openPglite();
    await migrate(db, MIGRATIONS, "core");
    for (let i = 0; i < 2; i++) await db.query("insert into business_profile (id, business) values (1, $1) on conflict (id) do nothing", ["Harbor"]);
    expect(await db.query("select count(*)::int as n from business_profile")).toEqual([{ n: 1 }]);
    await db.close();
  });
});
