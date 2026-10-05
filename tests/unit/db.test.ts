import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { selectDriver } from "@/lib/db/driver";
import { openPglite } from "@/lib/db/pglite";
import { migrate, migrateAll, normalizeLegacyNames } from "@/lib/db/migrate";
import { readEnv } from "@/lib/env";

const MIGRATIONS = path.join(__dirname, "../../core/db/migrations");

describe("selectDriver", () => {
  it("runs PGlite locally and preview on Vercel", () => {
    expect(selectDriver(readEnv({}))).toBe("pglite");
    expect(selectDriver(readEnv({ VERCEL: "1" }))).toBe("preview");
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
