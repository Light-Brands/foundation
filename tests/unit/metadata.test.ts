import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({ getDb: async () => null, storageMode: () => "preview" }));
vi.mock("@/lib/brand/fonts", () => ({ FONT_VARIABLES: "" }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe("each part of the site carries its own head", () => {
  it("the root carries no command center title, manifest or noindex", async () => {
    vi.stubEnv("FOUNDATION_BUSINESS_NAME", "Harbor Studio");
    const root: Record<string, unknown> = await import("@/app/layout");
    expect(root.generateMetadata).toBeUndefined();
    expect(root.metadata).toBeUndefined();
  });
  it("the command center is the installable, unindexed app", async () => {
    const { generateMetadata } = await import("@/app/admin/layout");
    const m = await generateMetadata();
    expect(m.title).toBe("Command center");
    expect(m.robots).toEqual({ index: false, follow: false });
    expect(m.manifest).toBe("/manifest.webmanifest");
    expect(m.appleWebApp).toMatchObject({ capable: true, title: "Harbor Studio" });
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
