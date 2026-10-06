import { PGlite } from "@electric-sql/pglite";
import { acquireDbLock, lockFileFor } from "./lock";
import type { Db, Tx } from "./types";

// A folder on disk takes the lock first (see lock.ts). No folder means an in-memory database, which needs none.
export async function openPglite(dataDir?: string): Promise<Db> {
  const onDisk = !!dataDir && !dataDir.startsWith("memory://");
  const release = onDisk ? acquireDbLock(lockFileFor(dataDir)) : () => {};
  let pg: PGlite;
  try {
    pg = new PGlite(dataDir);
    await pg.waitReady;
  } catch (err) {
    release();
    throw err;
  }
  return {
    async query<T>(sql: string, params: unknown[] = []) {
      const r = await pg.query<T>(sql, params);
      return r.rows;
    },
    async exec(sql: string) {
      await pg.exec(sql);
    },
    async transaction<T>(fn: (tx: Tx) => Promise<T>, opts: { readOnly?: boolean } = {}): Promise<T> {
      return pg.transaction(async (t) => {
        if (opts.readOnly) await t.exec("set transaction read only");
        return fn({
          async query<R>(sql: string, params: unknown[] = []) { return (await t.query<R>(sql, params)).rows; },
          async exec(sql: string) { await t.exec(sql); },
        });
      });
    },
    async close() {
      try {
        await pg.close();
      } finally {
        release();
      }
    },
  };
}
