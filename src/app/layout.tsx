import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { FONT_VARIABLES } from "@/lib/brand/fonts";
import { brandCss } from "@/lib/brand/css";
import { loadBrand } from "@/lib/data/safe";

// Only what every page shares lives here. The command center's own head (its title, manifest, home screen icon and
// noindex) is in src/app/admin/layout.tsx, and each public page names itself after the business.

// Every tab shows the business's own monogram or logo, drawn by the icon route.
export const metadata: Metadata = { icons: { icon: [{ url: "/pwa/icon-192.png", type: "image/png" }] } };

export async function generateViewport(): Promise<Viewport> {
  const brand = await loadBrand();
  return { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: brand.colors.accent };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // The proxy's nonce lets the brand style tag past the content security policy (src/lib/security/csp.ts).
  const [brand, nonce] = await Promise.all([loadBrand(), headers().then((h) => h.get("x-nonce") ?? undefined)]);
  return (
    <html lang="en" className={FONT_VARIABLES}>
      <head>
        <style id="brand" nonce={nonce} dangerouslySetInnerHTML={{ __html: brandCss(brand) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
