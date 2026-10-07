import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FONT_VARIABLES } from "@/lib/brand/fonts";
import { brandCss } from "@/lib/brand/css";
import { getBrand } from "@/lib/data/brand";
import { getDb } from "@/lib/db";
import { DEFAULT_BRAND } from "@/lib/brand/tokens";
import { RegisterServiceWorker } from "@/components/pwa/RegisterServiceWorker";
import { getProfile } from "@/lib/data/profile";
import { readEnv } from "@/lib/env";


async function loadBrand() {
  try {
    return await getBrand(await getDb());
  } catch (err) {
    // A database that cannot be reached never blanks the page; the default brand paints it.
    console.error("brand: falling back to the default brand", err);
    return DEFAULT_BRAND;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const db = await getDb().catch(() => null);
  const profile = await getProfile(db, readEnv().businessName);
  return {
    title: "Command center",
    robots: { index: false },
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, title: profile.business, statusBarStyle: "default" },
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
      <body>{children}<RegisterServiceWorker /></body>
    </html>
  );
}
