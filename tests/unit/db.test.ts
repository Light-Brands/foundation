import { describe, it, expect } from "vitest";
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
});
