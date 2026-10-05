import { describe, it, expect } from "vitest";
import { openPglite } from "@/lib/db/pglite";
import type { Db } from "@/lib/db/types";

export function dbContract(name: string, open: () => Promise<Db>) {
  describe(`the ${name} database handle`, () => {
    it("queries with parameters and runs several statements in exec", async () => {
      const db = await open();
      const t = `contract_${Math.random().toString(36).slice(2, 10)}`;
      try {
        await db.exec(`create table ${t} (id int primary key, v text); insert into ${t} values (1, 'a');`);
        expect(await db.query(`select v from ${t} where id = $1`, [1])).toEqual([{ v: "a" }]);
      } finally {
        await db.exec(`drop table if exists ${t}`);
        await db.close();
      }
    });
    it("commits a transaction and rolls one back on an error", async () => {
      const db = await open();
      const t = `contract_${Math.random().toString(36).slice(2, 10)}`;
      try {
        await db.exec(`create table ${t} (id int primary key)`);
        await db.transaction(async (tx) => { await tx.query(`insert into ${t} values (1)`); });
        await expect(db.transaction(async (tx) => { await tx.query(`insert into ${t} values (2)`); throw new Error("stop"); })).rejects.toThrow("stop");
        expect(await db.query(`select id from ${t} order by id`)).toEqual([{ id: 1 }]);
      } finally {
        await db.exec(`drop table if exists ${t}`);
        await db.close();
      }
    });
    it("refuses writes in a read-only transaction", async () => {
      const db = await open();
      const t = `contract_${Math.random().toString(36).slice(2, 10)}`;
      try {
        await db.exec(`create table ${t} (id int primary key)`);
        await expect(db.transaction(async (tx) => { await tx.query(`insert into ${t} values (1)`); }, { readOnly: true })).rejects.toThrow(/read-only/);
        expect(await db.query(`select count(*)::int as n from ${t}`)).toEqual([{ n: 0 }]);
      } finally {
        await db.exec(`drop table if exists ${t}`);
        await db.close();
      }
    });
    it("takes a transaction-scoped advisory lock", async () => {
      const db = await open();
      try {
        await db.transaction(async (tx) => { await tx.query("select pg_advisory_xact_lock(hashtext($1))", ["foundation:contract"]); });
      } finally {
        await db.close();
      }
    });
  });
}

dbContract("PGlite", () => openPglite());
