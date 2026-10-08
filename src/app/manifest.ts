import type { MetadataRoute } from "next";
import { loadBrand, loadProfile } from "@/lib/data/safe";
import { adminCanvas } from "@/lib/brand/tokens";
import { buildManifest, shortNameFor } from "@/lib/pwa/manifest";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [profile, brand] = await Promise.all([loadProfile(), loadBrand()]);
  return buildManifest({
    business: profile.business,
    shortName: shortNameFor(profile.business, profile.short_name),
    description: profile.what_we_do,
    accent: brand.colors.accent,
    background: adminCanvas(brand),
  });
}
