import { PGlite } from "@electric-sql/pglite";
import type { Db } from "./types";

export async function openPglite(dataDir?: string): Promise<Db> {
  const pg = new PGlite(dataDir);
  await pg.waitReady;
  return {
    async query<T>(sql: string, params: unknown[] = []) {
      const r = await pg.query<T>(sql, params);
      return r.rows;
    },
    async exec(sql: string) {
      await pg.exec(sql);
    },
    async close() {
      await pg.close();
    },
  };
}
