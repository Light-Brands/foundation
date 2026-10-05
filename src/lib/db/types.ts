export interface Db {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  exec(sql: string): Promise<void>;
  close(): Promise<void>;
}

/** What a query needs: a Db or a transaction handle both fit, so a caller can write inside one transaction. */
export type Queryable = Pick<Db, "query">;
