/** One connection's queries: the handle itself, or the handle inside a transaction. */
export type Tx = {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  exec(sql: string): Promise<void>;
};

export interface Db extends Tx {
  /** Runs fn inside one transaction on one connection. A thrown error rolls it back. Never nest. */
  transaction<T>(fn: (tx: Tx) => Promise<T>, opts?: { readOnly?: boolean }): Promise<T>;
  close(): Promise<void>;
}

/** What a query needs: a Db or a transaction handle both fit, so a caller can write inside one transaction. */
export type Queryable = Pick<Db, "query">;
