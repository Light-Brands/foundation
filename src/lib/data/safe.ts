import { getDb } from "@/lib/db";
import { getBrand } from "@/lib/data/brand";
import { getProfile } from "@/lib/data/profile";
import { DEFAULT_BRAND, type BrandTokens } from "@/lib/brand/tokens";
import { readEnv } from "@/lib/env";
import type { Profile } from "@/lib/validate";

/** The saved brand, or the default one when the database cannot be reached. The failure is logged, never thrown. */
export async function loadBrand(): Promise<BrandTokens> {
  try {
    return await getBrand(await getDb());
  } catch (err) {
    console.error("brand: falling back to the default brand", err);
    return DEFAULT_BRAND;
  }
}

/** The saved profile, or an empty one carrying the configured business name when the database cannot be reached. */
export async function loadProfile(): Promise<Profile> {
  try {
    return await getProfile(await getDb(), readEnv().businessName);
  } catch (err) {
    console.error("profile: falling back to the default name", err);
    return getProfile(null, readEnv().businessName);
  }
}
