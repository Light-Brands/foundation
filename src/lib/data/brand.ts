import type { Db } from "@/lib/db/types";
import { DEFAULT_BRAND, parseBrand, type BrandTokens } from "@/lib/brand/tokens";

/**
 * The saved brand, made safe and complete, over a base: the default, or the owner's layer from key/brand.yaml
 * (loadOwnerBrand). No database, no row or a broken row all give the base; a field the row leaves out comes from it.
 */
export async function getBrand(db: Db | null, base: BrandTokens = DEFAULT_BRAND): Promise<BrandTokens> {
  if (!db) return base;
  const [row] = await db.query<{ tokens: unknown }>("select tokens from core_brand where id = 1");
  return parseBrand(row?.tokens, base);
}
