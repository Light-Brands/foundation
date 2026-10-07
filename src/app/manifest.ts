import type { MetadataRoute } from "next";
import { getDb } from "@/lib/db";
import { getProfile } from "@/lib/data/profile";
import { getBrand } from "@/lib/data/brand";
import { readEnv } from "@/lib/env";
import { buildManifest, shortNameFor } from "@/lib/pwa/manifest";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const db = await getDb().catch(() => null);
  const [profile, brand] = await Promise.all([getProfile(db, readEnv().businessName), getBrand(db)]);
  return buildManifest({
    business: profile.business,
    shortName: shortNameFor(profile.business, profile.short_name),
    description: profile.what_we_do,
    accent: brand.colors.accent,
  });
}
