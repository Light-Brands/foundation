import type { Db } from "@/lib/db/types";
import { DEFAULT_BRAND, parseBrand, type BrandTokens } from "@/lib/brand/tokens";

/** The saved brand, made safe and complete. No database, no row or a broken row all give the default. */
export async function getBrand(db: Db | null): Promise<BrandTokens> {
  if (!db) return DEFAULT_BRAND;
  const [row] = await db.query<{ tokens: unknown }>("select tokens from core_brand where id = 1");
  return parseBrand(row?.tokens);
}
