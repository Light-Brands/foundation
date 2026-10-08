import "server-only";
import postgres from "postgres";
import type { Db, Tx } from "./types";
import { insecureSslMode } from "@/lib/env";
import { DATABASE_INSECURE_MESSAGE } from "./driver";

// The hosted Postgres database (Neon recommended), reached through its pooler in transaction mode. postgres.js runs the
// same raw SQL with $1 parameters as PGlite and gives each transaction its own connection.
// prepare: false is required by the transaction pooler. Nothing connects until the first query.

type Params = postgres.ParameterOrJSON<never>[];

// postgres.js learns a $n::jsonb parameter is json and would encode the text we pass (already
// JSON.stringify'd, as PGlite expects) a second time, storing a json string. Text passes through as is.
const JSON_TYPE = {
  to: 114,
  from: [114, 3802],
  serialize: (x: unknown) => (typeof x === "string" ? x : JSON.stringify(x)),
  parse: (x: string) => JSON.parse(x) as unknown,
};

function wrap(s: postgres.Sql | postgres.TransactionSql): Tx {
  return {
    async query<T>(text: string, params: unknown[] = []) {
      return (await s.unsafe(text, params as Params)) as unknown as T[];
    },
    async exec(text: string) {
      await s.unsafe(text).simple();
    },
  };
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

/**
 * The options handed to postgres(). The server's certificate is always verified (postgres.js's ssl: "require"
 * would skip that check), against Node's public authorities or the given ca. Only a database on this computer,
 * such as one a test starts, connects without TLS.
 */
export function connectionOptions(url: string, opts: { max?: number; ca?: string | null } = {}) {
  if (insecureSslMode(url)) throw new Error(DATABASE_INSECURE_MESSAGE);
  let host = "";
  try { host = new URL(url).hostname; } catch { /* postgres() reports a malformed address itself */ }
  const ssl = LOCAL_HOSTS.has(host) ? (false as const) : { rejectUnauthorized: true as const, ...(opts.ca ? { ca: opts.ca } : {}) };
  return {
    prepare: false, max: opts.max ?? 5, idle_timeout: 20, connect_timeout: 10, ssl, onnotice: () => {},
    types: { json: JSON_TYPE },
  };
}

export function openPostgres(url: string, opts: { max?: number; ca?: string | null } = {}): Db {
  const sql = postgres(url, connectionOptions(url, opts));
  return {
    ...wrap(sql),
    async transaction<T>(fn: (tx: Tx) => Promise<T>, o: { readOnly?: boolean } = {}): Promise<T> {
      const result = await sql.begin(async (tx) => {
        if (o.readOnly) await tx.unsafe("set transaction read only");
        return fn(wrap(tx));
      });
      return result as T;
    },
    async close() {
      await sql.end({ timeout: 5 });
    },
  };
}
