import type { Metadata } from "next";
import "./globals.css";
import { FONT_VARIABLES } from "@/lib/brand/fonts";
import { brandCss } from "@/lib/brand/css";
import { getBrand } from "@/lib/data/brand";
import { getDb } from "@/lib/db";
import { DEFAULT_BRAND } from "@/lib/brand/tokens";

export const metadata: Metadata = { title: "Command center", robots: { index: false } };

async function loadBrand() {
  try {
    return await getBrand(await getDb());
  } catch {
    // A database that cannot be reached never blanks the page; the default brand paints it.
    return DEFAULT_BRAND;
  }
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
