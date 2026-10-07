import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { ADMIN_CANVAS } from "@/lib/brand/tokens";
import { resolveLogoUrl, readPublicLogo } from "@/lib/pwa/logo";
import { buildManifest, PWA_ICONS, shortNameFor } from "@/lib/pwa/manifest";

describe("the app manifest", () => {
  const m = buildManifest({ business: "Harbor Studio", shortName: "Harbor", description: "Calm, careful design work", accent: "#b85a36", background: ADMIN_CANVAS });
  it("opens the command center full screen", () => {
    expect(m.display).toBe("standalone");
    expect(m.start_url).toBe("/admin");
    expect(m.scope).toBe("/");
  });
  it("wears the business's name and color", () => {
    expect(m.name).toBe("Harbor Studio");
    expect(m.short_name).toBe("Harbor");
    expect(m.theme_color).toBe("#b85a36");
  });
  it("lists every icon, including a maskable one", () => {
    const srcs = (m.icons ?? []).map((i) => i.src);
    expect(srcs).toEqual(["/pwa/icon-192.png", "/pwa/icon-512.png", "/pwa/icon-maskable.png"]);
    expect((m.icons ?? []).find((i) => i.purpose === "maskable")?.sizes).toBe("512x512");
    expect(Object.keys(PWA_ICONS).sort()).toEqual(["apple-touch-icon.png", "icon-192.png", "icon-512.png", "icon-maskable.png"]);
  });
  it("shortens a long name for the home screen", () => {
    expect(shortNameFor("Harbor Studio", "")).toBe("Harbor Studio");
    expect(shortNameFor("The Very Long Business Name Company", "")).toBe("The Very Lon");
    expect(shortNameFor("The Very Long Business Name Company", "Very Long")).toBe("Very Long");
  });
});

describe("the manifest background", () => {
  it("is the admin canvas the stylesheet paints", () => {
    const m = buildManifest({ business: "B", shortName: "B", description: "", accent: "#b85a36", background: ADMIN_CANVAS });
    expect(m.background_color).toBe(ADMIN_CANVAS);
    expect(readFileSync("src/app/globals.css", "utf8")).toContain(`--color-admin-canvas: ${ADMIN_CANVAS};`);
  });
});

describe("resolveLogoUrl", () => {
  const base = "https://command.example.com";
  it("joins a relative logo to the configured site address", () => {
    expect(resolveLogoUrl("/logo.png", base)).toBe("https://command.example.com/logo.png");
  });
  it("gives null for a relative logo with no site address", () => {
    expect(resolveLogoUrl("/logo.png", null)).toBeNull();
  });
  it("passes https addresses and refuses everything else", () => {
    expect(resolveLogoUrl("https://cdn.example.com/a.png", base)).toBe("https://cdn.example.com/a.png");
    for (const bad of ["http://evil.test/x.png", "javascript:x", "//evil.test/x.png", "garbage", "", null, "https://u:p@evil.test/x.png"]) {
      expect(resolveLogoUrl(bad, base), String(bad)).toBeNull();
    }
  });
});

describe("readPublicLogo", () => {
  it("never reads outside public/", async () => {
    for (const bad of ["/../package.json", "/%2e%2e/package.json", "/../../etc/passwd.png", "/..%2fpackage.json"]) {
      expect(await readPublicLogo(bad, "public"), bad).toBeNull();
    }
  });
});

describe("the safe loaders", () => {
  it("fall back to the defaults when the database throws", async () => {
    const { vi } = await import("vitest");
    vi.resetModules();
    vi.doMock("@/lib/db", () => ({ getDb: async () => ({ query: async () => { throw new Error("paused"); } }) }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { loadBrand, loadProfile } = await import("@/lib/data/safe");
    const { DEFAULT_BRAND } = await import("@/lib/brand/tokens");
    expect(await loadBrand()).toEqual(DEFAULT_BRAND);
    expect((await loadProfile()).business).toBeTypeOf("string");
    vi.doUnmock("@/lib/db");
    vi.restoreAllMocks();
  });
});
