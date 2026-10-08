import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DEFAULT_BRAND } from "@/lib/brand/tokens";

// React's cache() memoizes per request only inside the server build; this stand-in memoizes for the test, so a
// loader that is wrapped reads once however many times a request asks for it.
vi.mock("react", async (orig) => {
  const real = await orig<typeof import("react")>();
  const cache = <A extends unknown[], R>(fn: (...a: A) => R) => {
    let hit: { v: R } | null = null;
    const wrapped = (...a: A) => (hit ??= { v: fn(...a) }).v;
    (wrapped as unknown as { reset: () => void }).reset = () => { hit = null; };
    return wrapped;
  };
  return { ...real, cache, default: { ...real, cache } };
});

const db = { query: vi.fn(async () => []) };
vi.mock("@/lib/db", () => ({ getDb: async () => db, storageMode: () => "pglite" }));
vi.mock("next/server", () => ({ after: () => {} }));
vi.mock("@/lib/brand/fonts", () => ({ FONT_VARIABLES: "" }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/navigation", () => ({ usePathname: () => "/admin", useSearchParams: () => new URLSearchParams() }));

const calls = { brand: 0, profile: 0, count: 0 };
const started: string[] = [];
let release: () => void = () => {};
let gate: Promise<void> = Promise.resolve();

vi.mock("@/lib/data/brand", () => ({ getBrand: async () => { calls.brand++; return DEFAULT_BRAND; } }));
vi.mock("@/lib/data/profile", async (orig) => {
  const real = await orig<typeof import("@/lib/data/profile")>();
  return { ...real, getProfile: async (...a: Parameters<typeof real.getProfile>) => { calls.profile++; return real.getProfile(null, a[1]); } };
});
vi.mock("@/lib/data/inbox", () => ({
  countNewInbox: async () => { calls.count++; started.push("count"); await gate; return 0; },
  listInbox: async () => { started.push("list"); await gate; return []; },
}));
vi.mock("@/lib/data/connections", async (orig) => {
  const real = await orig<typeof import("@/lib/data/connections")>();
  return { ...real, connectionStatuses: async () => { started.push("connections"); await gate; return {}; } };
});

describe("one request reads each thing once", () => {
  beforeEach(async () => {
    calls.brand = calls.profile = calls.count = 0;
    started.length = 0;
    const safe = await import("@/lib/data/safe");
    for (const f of [safe.loadBrand, safe.loadProfile, safe.loadInboxCount]) (f as unknown as { reset: () => void }).reset();
  });

  it("the console layout and Today share the brand, the profile and the waiting count", async () => {
    const { default: ConsoleLayout } = await import("@/app/admin/(console)/layout");
    const { default: Today } = await import("@/app/admin/(console)/page");
    const { generateViewport, default: RootLayout } = await import("@/app/layout");
    const { generateMetadata } = await import("@/app/admin/layout");
    await generateMetadata();
    await generateViewport();
    renderToStaticMarkup(await RootLayout({ children: null }));
    renderToStaticMarkup(await ConsoleLayout({ children: null }));
    renderToStaticMarkup(await Today());
    expect(calls).toEqual({ brand: 1, profile: 1, count: 1 });
  });

  it("Today starts its reads together, never one after another", async () => {
    gate = new Promise((r) => { release = r; });
    const { default: Today } = await import("@/app/admin/(console)/page");
    const page = Today();
    await new Promise((r) => setTimeout(r, 20));
    expect([...started].sort()).toEqual(["connections", "count", "list"]);
    release();
    renderToStaticMarkup(await page);
    gate = Promise.resolve();
  });
});
