import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { selectDriver } from "@/lib/db/driver";
import { openPglite } from "@/lib/db/pglite";
import { migrate } from "@/lib/db/migrate";
import { readEnv } from "@/lib/env";

const MIGRATIONS = path.join(__dirname, "../../db/migrations");

describe("selectDriver", () => {
  it("runs PGlite locally and preview on Vercel", () => {
    expect(selectDriver(readEnv({}))).toBe("pglite");
    expect(selectDriver(readEnv({ VERCEL: "1" }))).toBe("preview");
  });
});

describe("migrate", () => {
  it("applies every migration once and records it", async () => {
    const db = await openPglite();
    expect(await migrate(db, MIGRATIONS)).toEqual(["0001_core.sql"]);
    expect(await migrate(db, MIGRATIONS)).toEqual([]);
    const tables = await db.query<{ table_name: string }>(
      "select table_name from information_schema.tables where table_schema = 'public' order by table_name",
    );
    expect(tables.map((t) => t.table_name)).toEqual(["_migrations", "business_profile", "contacts", "inbox_items"]);
    await db.close();
  });

  it("rolls back a failing migration and names the bad file", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mig-"));
    fs.writeFileSync(path.join(dir, "0001_ok.sql"), "create table t_ok (x int);");
    fs.writeFileSync(path.join(dir, "0002_bad.sql"), "create table t_bad (x int); this is not sql;");
    const db = await openPglite();
    await expect(migrate(db, dir)).rejects.toThrow(/0002_bad\.sql/);
    const recorded = await db.query<{ name: string }>("select name from _migrations order by name");
    expect(recorded.map((r) => r.name)).toEqual(["0001_ok.sql"]);
    const t = await db.query<{ table_name: string }>(
      "select table_name from information_schema.tables where table_schema = 'public' and table_name in ('t_ok','t_bad')",
    );
    expect(t.map((r) => r.table_name)).toEqual(["t_ok"]);
    await db.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
