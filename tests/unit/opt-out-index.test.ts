import { describe, it, expect } from "vitest";
import { coreDb } from "../support/db";
import { optOutCovers } from "@/lib/data/outbox";

// isOptedOut matches an opt-out by hash, by lower(email) and by the normalized address. Each arm has an index,
// so the check on every send stays an index lookup however many opt-outs a business collects.

async function planOf(sql: string, params: unknown[]): Promise<string> {
  const db = await coreDb();
  await db.query("insert into opt_outs (email, email_hash, source, scope) select 'person' || g || '+tag@example.com', 'h' || g, 't', 'all' from generate_series(1, 200) g");
  await db.query("analyze opt_outs");
  await db.query("set enable_seqscan = off");
  const rows = await db.query<Record<string, string>>(`explain ${sql}`, params);
  await db.close();
  return rows.map((r) => Object.values(r)[0]).join("\n");
}

describe("the opt-out lookup", () => {
  it("uses an index for each way it matches an address", async () => {
    const plan = await planOf(
      `select ${optOutCovers("$1", "$2", "$3", "$4")} as hit`,
      ["h5", "person5@example.com", "person5@example.com", "marketing"],
    );
    expect(plan).toMatch(/opt_outs_email_normalized/);
    expect(plan).toMatch(/opt_outs_email_hash/);
    expect(plan).toMatch(/opt_outs_email\b/);
  });
});
