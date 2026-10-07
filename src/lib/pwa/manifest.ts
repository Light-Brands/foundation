import type { MetadataRoute } from "next";

export const PWA_ICONS: Record<string, { size: number; maskable: boolean }> = {
  "icon-192.png": { size: 192, maskable: false },
  "icon-512.png": { size: 512, maskable: false },
  "icon-maskable.png": { size: 512, maskable: true },
  "apple-touch-icon.png": { size: 180, maskable: false },
};

/** The home-screen name: the owner's short name, or the business name when it fits (15 characters), else its first twelve characters. */
export function shortNameFor(business: string, shortName: string): string {
  const chosen = shortName.trim() || business.trim();
  return chosen.length <= 15 ? chosen : chosen.slice(0, 12).trimEnd();
}

export function buildManifest(input: { business: string; shortName: string; description: string; accent: string; background: string }): MetadataRoute.Manifest {
  return {
    name: input.business,
    short_name: input.shortName,
    description: input.description || "Your command center",
    start_url: "/admin",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: input.background,
    theme_color: input.accent,
    icons: [
      { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/pwa/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
