import { ImageResponse } from "next/og";
import { getDb } from "@/lib/db";
import { getProfile } from "@/lib/data/profile";
import { getBrand } from "@/lib/data/brand";
import { readEnv } from "@/lib/env";
import { onColor } from "@/lib/brand/tokens";
import { PWA_ICONS } from "@/lib/pwa/manifest";

export const dynamic = "force-dynamic";

function monogram(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "C";
}

export async function GET(req: Request, { params }: { params: Promise<{ icon: string }> }) {
  const { icon } = await params;
  const spec = PWA_ICONS[icon];
  if (!spec) return new Response("Not found", { status: 404 });
  const db = await getDb().catch(() => null);
  const [profile, brand] = await Promise.all([getProfile(db, readEnv().businessName), getBrand(db)]);
  const size = spec.size;
  const inner = Math.round(size * (spec.maskable ? 0.6 : 0.76));
  const fill = brand.colors.accent;
  const logo = brand.logoUrl ? new URL(brand.logoUrl, req.url).toString() : null;
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
