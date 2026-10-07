import { ImageResponse } from "next/og";
import path from "node:path";
import { loadBrand, loadProfile } from "@/lib/data/safe";
import { publicBaseUrl } from "@/lib/email-links";
import { loadLogo } from "@/lib/pwa/logo";
import { onColor } from "@/lib/brand/tokens";
import { PWA_ICONS } from "@/lib/pwa/manifest";

export const dynamic = "force-dynamic";

function monogram(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "C";
}

export async function GET(_req: Request, { params }: { params: Promise<{ icon: string }> }) {
  const { icon } = await params;
  const spec = PWA_ICONS[icon];
  if (!spec) return new Response("Not found", { status: 404 });
  const [profile, brand] = await Promise.all([loadProfile(), loadBrand()]);
  const size = spec.size;
  const inner = Math.round(size * (spec.maskable ? 0.6 : 0.76));
  const fill = brand.colors.accent;
  // The logo is found from the site's own configured address or from public/, never from the request's Host.
  const logo = await loadLogo(brand.logoUrl, { base: publicBaseUrl(), publicDir: path.join(process.cwd(), "public") });
  return new ImageResponse(
    (
      <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", background: fill }}>
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} width={inner} height={inner} style={{ objectFit: "contain" }} alt="" />
        ) : (
          <span style={{ fontSize: Math.round(size * 0.4), fontWeight: 700, color: onColor(fill), letterSpacing: "-0.02em" }}>{monogram(profile.business)}</span>
        )}
      </div>
    ),
    { width: size, height: size, headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
