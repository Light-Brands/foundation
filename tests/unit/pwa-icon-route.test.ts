import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DEFAULT_BRAND } from "@/lib/brand/tokens";

const brand = { ...DEFAULT_BRAND, logoUrl: "/definitely-not-in-public/logo.png" };
let dbMode: "ok" | "throws" = "ok";

vi.mock("@/lib/db", () => ({
  getDb: async () => ({
    query: async () => {
      if (dbMode === "throws") throw new Error("database is paused");
      return [];
    },
  }),
}));
vi.mock("@/lib/data/brand", async (orig) => {
  const real = await orig<typeof import("@/lib/data/brand")>();
  return {
    ...real,
    getBrand: async (db: unknown) => {
      if (dbMode === "throws") throw new Error("database is paused");
      return db ? brand : real.getBrand(null);
    },
  };
});

const PNG = Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="), (c) => c.charCodeAt(0));

async function icon(headers: Record<string, string> = {}) {
  const { GET } = await import("@/app/pwa/[icon]/route");
  const res = await GET(new Request("http://attacker.internal/pwa/icon-192.png", { headers }), { params: Promise.resolve({ icon: "icon-192.png" }) });
  // The image is drawn while the body is read, so read it to see every fetch.
  const body = new Uint8Array(await res.arrayBuffer());
  return { status: res.status, headers: res.headers, body };
}

describe("the icon route", () => {
  const seen: string[] = [];
  const realFetch = globalThis.fetch;
  beforeEach(() => {
    seen.length = 0;
    dbMode = "ok";
    vi.spyOn(console, "error").mockImplementation(() => {});
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input instanceof Request ? input.url : input);
      // The image engine loads its own files through fetch; only network requests are recorded.
      if (url.startsWith("file:") || url.startsWith("data:")) return realFetch(input);
      seen.push(url);
      return new Response(PNG, { status: 200, headers: { "content-type": "image/png" } });
    }) as typeof fetch;
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("never fetches from a host the request names", async () => {
    vi.stubEnv("FOUNDATION_URL", "https://command.example.com");
    const res = await icon({ host: "attacker.internal" });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");
    expect(res.body.length).toBeGreaterThan(100);
    expect(seen.length).toBeGreaterThan(0);
    for (const u of seen) expect(new URL(u).host).toBe("command.example.com");
  });

  it("paints the monogram without any fetch when no site address is known", async () => {
    vi.stubEnv("FOUNDATION_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    const res = await icon({ host: "attacker.internal" });
    expect(res.status).toBe(200);
    expect(seen).toEqual([]);
  });

  it("still serves an icon when the database throws", async () => {
    dbMode = "throws";
    const res = await icon();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");
  });
});
