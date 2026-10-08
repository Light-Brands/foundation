import { loadBrand, loadProfile } from "@/lib/data/safe";
import { adminCanvas } from "@/lib/brand/tokens";
import { buildManifest, shortNameFor } from "@/lib/pwa/manifest";

export const dynamic = "force-dynamic";

// The command center's app manifest. It is a plain route on purpose: a manifest file at the app root is Next's
// convention, which links it from every page, so Add to Home Screen on a public page would install the admin app.
// Only src/app/admin/layout.tsx names this address.
export async function GET() {
  const [profile, brand] = await Promise.all([loadProfile(), loadBrand()]);
  const body = buildManifest({
    business: profile.business,
    shortName: shortNameFor(profile.business, profile.short_name),
    description: profile.what_we_do,
    accent: brand.colors.accent,
    background: adminCanvas(brand),
  });
  return Response.json(body, { headers: { "content-type": "application/manifest+json" } });
}
