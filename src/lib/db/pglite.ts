import { PGlite } from "@electric-sql/pglite";
import { acquireDbLock, lockFileFor } from "./lock";
import type { Db } from "./types";

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
    async close() {
      try {
        await pg.close();
      } finally {
        release();
      }
    },
  };
}
