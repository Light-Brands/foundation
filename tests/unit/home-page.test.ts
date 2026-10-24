import { describe, it, expect, vi, afterEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

// The public home page: on the demo deployment (FOUNDATION_DEMO_DEPLOY=on) its one action is the way to set up your
// own command center with Claude; on every owner's copy it stays Get in touch. The build request never appears here.
vi.mock("@/lib/db", () => ({ getDb: async () => null, storageMode: () => "preview" }));

const render = async () => {
  const { default: PublicHome } = await import("@/app/page");
  return renderToStaticMarkup(await PublicHome());
};
const links = (h: string) => h.match(/<a [^>]*>[\s\S]*?<\/a>/g) ?? [];

afterEach(() => vi.unstubAllEnvs());

describe("the public home page", () => {
  it("with demoDeploy the home page offers Build your business with Claude linking /start", async () => {
    vi.stubEnv("FOUNDATION_BUSINESS_NAME", "Harbor Studio");
    vi.stubEnv("FOUNDATION_DEMO_DEPLOY", "on");
    const h = await render();
    const button = links(h).find((a) => a.includes("Build your business with Claude"));
    expect(button).toBeDefined();
    expect(button).toContain('href="/start"');
    expect(h).not.toContain("Get in touch");
    expect(h).toContain("rise");
  });

  it("without demoDeploy it stays Get in touch", async () => {
    vi.stubEnv("FOUNDATION_BUSINESS_NAME", "Harbor Studio");
    for (const value of [undefined, "", "off", "ON", "true"]) {
      if (value === undefined) vi.stubEnv("FOUNDATION_DEMO_DEPLOY", undefined as unknown as string);
      else vi.stubEnv("FOUNDATION_DEMO_DEPLOY", value);
      const h = await render();
      expect(links(h).find((a) => a.includes("Get in touch"))).toContain('href="/contact"');
      expect(h).not.toContain("Build your business with Claude");
      expect(h).not.toContain("/start");
    }
  });

  it("the public home page never shows the build request", async () => {
    vi.stubEnv("FOUNDATION_BUSINESS_NAME", "Harbor Studio");
    for (const value of ["on", "off"]) {
      vi.stubEnv("FOUNDATION_DEMO_DEPLOY", value);
      const h = await render();
      expect(h).not.toContain("Have Light Brands build it for you");
      expect(h).not.toContain("hello@lightbrands.ai");
      expect(h).not.toContain("mailto:");
    }
  });
});
