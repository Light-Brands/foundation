import type { Viewport } from "next";
import "./globals.css";
import { FONT_VARIABLES } from "@/lib/brand/fonts";
import { brandCss } from "@/lib/brand/css";
import { loadBrand } from "@/lib/data/safe";

// Only what every page shares lives here. The command center's own head (its title, manifest, home screen icon and
// noindex) is in src/app/admin/layout.tsx, and each public page names itself after the business.

export async function generateViewport(): Promise<Viewport> {
  const brand = await loadBrand();
  return { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: brand.colors.accent };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const brand = await loadBrand();
  return (
    <html lang="en" className={FONT_VARIABLES}>
      <head>
        <style id="brand" dangerouslySetInnerHTML={{ __html: brandCss(brand) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
