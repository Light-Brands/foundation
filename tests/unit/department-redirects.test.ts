import { describe, it, expect, vi } from "vitest";

class Redirect extends Error { constructor(public to: string) { super(`redirect ${to}`); } }
class NotFound extends Error {}
vi.mock("next/navigation", () => ({
  redirect: (to: string) => { throw new Redirect(to); },
  permanentRedirect: (to: string) => { throw new Redirect(to); },
  notFound: () => { throw new NotFound(); },
}));

async function where(p: Promise<unknown>): Promise<string> {
  try { await p; return "rendered"; } catch (e) { if (e instanceof Redirect) return e.to; if (e instanceof NotFound) return "404"; throw e; }
}

describe("old department dashboards lead into the frame", () => {
  it("send each department to its place in the sections", async () => {
    const { default: CategoryPage } = await import("@/app/admin/(console)/[category]/page");
    const go = (category: string) => where(CategoryPage({ params: Promise.resolve({ category }) }));
    expect(await go("attract")).toBe("/admin/business?stage=grow");
    expect(await go("keep")).toBe("/admin/business?stage=serve");
    expect(await go("money")).toBe("/admin/business?stage=run");
    expect(await go("command")).toBe("/admin");
    expect(await go("system")).toBe("/admin/settings");
    expect(await go("risk")).toBe("/admin/settings");
    expect(await go("nowhere")).toBe("404");
  });
  it("send a built screen's job address to the screen itself", async () => {
    const { default: ReadyPage } = await import("@/app/admin/(console)/[category]/[sub]/page");
    expect(await where(ReadyPage({ params: Promise.resolve({ category: "command", sub: "home" }) }))).toBe("/admin");
  });
});
