import { describe, it, expect } from "vitest";
import path from "node:path";
import { CORE_MIGRATIONS, KEY_EXT } from "../support/db";
import { openPglite } from "@/lib/db/pglite";
import { migrate } from "@/lib/db/migrate";
import { tablesWithoutRls } from "@/lib/db/rls";

describe("row level security", () => {
  it("every table has row level security", async () => {
    const db = await openPglite();
    await migrate(db, CORE_MIGRATIONS, "core");
    await migrate(db, path.join(KEY_EXT, "key/apps/leads-demo/migrations"), "leads-demo");
    await db.exec("create table proof_open (x int)");
    expect(await tablesWithoutRls(db)).toEqual(["proof_open"]); // the check can fail
    await db.exec("drop table proof_open");
    expect(await tablesWithoutRls(db)).toEqual([]);
    await db.close();
  });
  it("an anonymous query reads nothing", async () => {
    const db = await openPglite();
    await db.exec("create role anon nologin; create role authenticated nologin;");
    await db.exec("grant usage on schema public to anon, authenticated");
    await migrate(db, CORE_MIGRATIONS, "core");
    await db.query("insert into contacts (name, email) values ('Ada', 'ada@example.com')");
    await db.query("insert into core_accounts (email, role) values ('jo@example.com', 'owner')");
    await db.exec("set role anon");
    await expect(db.query("select * from contacts")).rejects.toThrow(/permission denied/);
    await expect(db.query("select * from accounts")).rejects.toThrow(/permission denied/);
    await db.exec("reset role");
    await db.exec("grant select on contacts, accounts, core_accounts to anon");
    await db.exec("set role anon");
    expect(await db.query("select * from contacts")).toEqual([]);
    // The view runs as its caller, so the table's row level security holds through it too.
    expect(await db.query("select * from accounts")).toEqual([]);
    await db.exec("reset role");
    expect((await db.query("select * from contacts")).length).toBe(1);
    expect((await db.query("select * from accounts")).length).toBe(1);
    await db.close();
  });
  it("the accounts view shows checks no user id, session or account id", async () => {
    const db = await openPglite();
    await migrate(db, CORE_MIGRATIONS, "core");
    const cols = await db.query<{ column_name: string }>("select column_name from information_schema.columns where table_name = 'accounts' order by ordinal_position");
    expect(cols.map((c) => c.column_name)).toEqual(["email", "role", "departments", "added_at", "removed_at", "last_signed_in_at"]);
    await db.close();
  });
});
