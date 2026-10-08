import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({ getDb: async () => null, storageMode: () => "preview" }));
vi.mock("@/lib/brand/fonts", () => ({ FONT_VARIABLES: "" }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe("each part of the site carries its own head", () => {
  it("the root carries only the brand's icon: no command center title, manifest or noindex", async () => {
    vi.stubEnv("FOUNDATION_BUSINESS_NAME", "Harbor Studio");
    const root: Record<string, unknown> = await import("@/app/layout");
    expect(root.generateMetadata).toBeUndefined();
    expect(root.metadata).toEqual({ icons: { icon: [{ url: "/pwa/icon-192.png", type: "image/png" }] } });
    // The stock create-next-app favicon is gone; the tab shows the business's own monogram or logo.
    const { existsSync } = await import("node:fs");
    expect(existsSync("src/app/favicon.ico")).toBe(false);
    // A manifest file at the app root is Next's convention, which links it from every page, public ones included.
    // The manifest is a route under /pwa instead, linked only from the command center's head.
    for (const f of ["manifest.ts", "manifest.js", "manifest.json", "manifest.webmanifest"]) expect(existsSync(`src/app/${f}`), f).toBe(false);
  });
  it("the command center is the installable, unindexed app", async () => {
    const { generateMetadata } = await import("@/app/admin/layout");
    const m = await generateMetadata();
    expect(m.title).toBe("Command center");
    expect(m.robots).toEqual({ index: false, follow: false });
    expect(m.manifest).toBe("/pwa/app.webmanifest");
    expect(m.appleWebApp).toMatchObject({ capable: true, title: "Harbor Studio" });
    expect(m.icons).toEqual({ icon: [{ url: "/pwa/icon-192.png", type: "image/png" }], apple: "/pwa/apple-touch-icon.png" });
  });
  it("the public pages wear the business's own name", async () => {
    for (const path of ["@/app/page", "@/app/contact/page"]) {
      const { generateMetadata } = await import(/* @vite-ignore */ path);
      const m = await generateMetadata();
      expect(m.title, path).toBe("Harbor Studio");
      expect(m.robots, path).toBeUndefined();
    }
  });
});
