import { describe, it, expect } from "vitest";
import { buildManifest, PWA_ICONS, shortNameFor } from "@/lib/pwa/manifest";

describe("the app manifest", () => {
  const m = buildManifest({ business: "Harbor Studio", shortName: "Harbor", description: "Calm, careful design work", accent: "#b85a36" });
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
