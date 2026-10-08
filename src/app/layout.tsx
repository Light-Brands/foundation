import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FONT_VARIABLES } from "@/lib/brand/fonts";
import { brandCss } from "@/lib/brand/css";
import { loadBrand, loadProfile } from "@/lib/data/safe";
import { statusBarFor } from "@/lib/pwa/manifest";

export async function generateMetadata(): Promise<Metadata> {
  const [profile, brand] = await Promise.all([loadProfile(), loadBrand()]);
  return {
    title: "Command center",
    robots: { index: false },
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, title: profile.business, statusBarStyle: statusBarFor(brand) },
    icons: { apple: "/pwa/apple-touch-icon.png" },
  };
}

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
