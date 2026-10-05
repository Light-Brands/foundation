import type { Db } from "./types";

/** Every ordinary table in the public schema that does not have row level security turned on. */
export async function tablesWithoutRls(db: Db): Promise<string[]> {
  const rows = await db.query<{ name: string }>(
    `select c.relname as name from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity order by c.relname`,
  );
  return rows.map((r) => r.name);
}
