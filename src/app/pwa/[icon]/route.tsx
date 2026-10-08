import { ImageResponse } from "next/og";
import path from "node:path";
import { loadBrand, loadProfile } from "@/lib/data/safe";
import { publicBaseUrl } from "@/lib/email-links";
import { loadLogo } from "@/lib/pwa/logo";
import { onColor } from "@/lib/brand/tokens";
import { initials } from "@/lib/brand/initials";
import { PWA_ICONS } from "@/lib/pwa/manifest";
import { MONOGRAM_FONTS, MONOGRAM_GLYPHS } from "@/lib/pwa/monogram-fonts";

export const dynamic = "force-dynamic";


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
  const letters = initials(profile.business);
  // The monogram is set in the brand's own display face when its letters are in the cut, else in the default face.
  const face = !logo && MONOGRAM_GLYPHS.test(letters) ? MONOGRAM_FONTS[brand.pairing] : null;
  return new ImageResponse(
    (
      <div
        style={{
          width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", background: fill,
          // A soft inner glow from the brand's glow color, so the tile has depth under its letters.
          backgroundImage: `radial-gradient(circle at 50% 35%, ${brand.colors.glow}2e, ${fill}00 70%)`,
        }}
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} width={inner} height={inner} style={{ objectFit: "contain" }} alt="" />
        ) : (
          <span style={{ fontSize: Math.round(size * 0.36), fontWeight: 400, color: onColor(fill), letterSpacing: "-0.04em", ...(face ? { fontFamily: "Monogram" } : {}) }}>{letters}</span>
        )}
      </div>
    ),
    {
      width: size, height: size, headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400" },
      ...(face ? { fonts: [{ name: "Monogram", data: Buffer.from(face.data, "base64"), weight: 400 as const, style: "normal" as const }] } : {}),
    },
  );
}
