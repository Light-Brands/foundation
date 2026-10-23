import { cache } from "react";
import { getDb } from "@/lib/db";
import { getBrand } from "@/lib/data/brand";
import { loadOwnerBrand } from "@/lib/data/owner-brand";
import { getProfile } from "@/lib/data/profile";
import { countNewInbox } from "@/lib/data/inbox";
import { DEFAULT_BRAND, type BrandTokens } from "@/lib/brand/tokens";
import { readEnv } from "@/lib/env";
import type { Profile } from "@/lib/validate";

// Each loader is read once per request (React's cache), however many layouts, pages and metadata functions ask,
// and a database failure is logged once and answered with a default, never thrown.

/**
 * The brand in its three layers: DEFAULT_BRAND, the owner's key/brand.yaml, then the saved row. When the database
 * cannot be reached it is the default one.
 */
export const loadBrand = cache(async (): Promise<BrandTokens> => {
  try {
    return await getBrand(await getDb(), await loadOwnerBrand());
  } catch (err) {
    console.error("brand: falling back to the default brand", err);
    return DEFAULT_BRAND;
  }
});

/** The saved profile, or an empty one carrying the configured business name when the database cannot be reached. */
export const loadProfile = cache(async (): Promise<Profile> => {
  try {
    return await getProfile(await getDb(), readEnv().businessName);
  } catch (err) {
    console.error("profile: falling back to the default name", err);
    return getProfile(null, readEnv().businessName);
  }
});

/** How many Inbox cards wait, or 0 when the database cannot be reached. */
export const loadInboxCount = cache(async (): Promise<number> => {
  try {
    return await countNewInbox(await getDb());
  } catch (err) {
    console.error("inbox: the waiting count could not be read", err);
    return 0;
  }
});
