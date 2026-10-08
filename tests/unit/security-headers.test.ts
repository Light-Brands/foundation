import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/lib/brand/fonts", () => ({ FONT_VARIABLES: "" }));
vi.mock("@/lib/db", () => ({ getDb: async () => null, storageMode: () => "preview" }));
let nonce: string | null = null;
vi.mock("next/headers", () => ({ headers: async () => new Headers(nonce ? { "x-nonce": nonce } : {}) }));

const header = (h: { key: string; value: string }[], key: string) => h.find((x) => x.key.toLowerCase() === key.toLowerCase())?.value;

describe("the headers on every response", () => {
  it("next.config sends the fixed security headers on every path", async () => {
    const { default: config } = await import("../../next.config");
    const rules = await config.headers!();
    const all = rules.find((r) => r.source === "/:path*");
    expect(all).toBeTruthy();
    const h = all!.headers;
    expect(header(h, "X-Content-Type-Options")).toBe("nosniff");
    expect(header(h, "X-Frame-Options")).toBe("DENY");
    expect(header(h, "Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(header(h, "Permissions-Policy")).toMatch(/camera=\(\).*microphone=\(\).*geolocation=\(\)/);
  });
});

describe("the content security policy", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("has a fresh nonce for scripts and styles, and never lets an inline script run on its own", async () => {
    const { contentSecurityPolicy } = await import("@/lib/security/csp");
    const csp = contentSecurityPolicy("abc123", false);
    const d = Object.fromEntries(csp.split(";").map((x) => x.trim().split(/\s+/)).map(([k, ...v]) => [k, v]));
    expect(d["script-src"]).toContain("'nonce-abc123'");
    expect(d["script-src"]).toContain("'strict-dynamic'");
    expect(d["script-src"]).not.toContain("'unsafe-inline'");
    expect(d["script-src"]).not.toContain("'unsafe-eval'");
    expect(d["style-src-elem"]).toContain("'nonce-abc123'");
    expect(d["style-src-elem"]).not.toContain("'unsafe-inline'");
    expect(d["frame-ancestors"]).toEqual(["'none'"]);
    expect(d["object-src"]).toEqual(["'none'"]);
    expect(d["base-uri"]).toEqual(["'self'"]);
    expect(d["form-action"]).toEqual(["'self'"]);
    expect(d["worker-src"]).toEqual(["'self'"]);
    expect(d["manifest-src"]).toEqual(["'self'"]);
    expect(contentSecurityPolicy("abc123", true)).toContain("'unsafe-eval'");
  });

  it("the proxy puts the policy on the page and hands its nonce to the render", async () => {
    vi.stubEnv("FOUNDATION_PIN", "24681012");
    const { proxy } = await import("@/proxy");
    const res = await proxy(new NextRequest("http://localhost/contact"));
    const csp = res.headers.get("content-security-policy") ?? "";
    const n = /'nonce-([A-Za-z0-9+/=]+)'/.exec(csp)?.[1];
    expect(n).toBeTruthy();
    expect(res.headers.get("x-middleware-request-x-nonce")).toBe(n);
    expect(res.headers.get("x-middleware-request-content-security-policy")).toBe(csp);
    const again = await proxy(new NextRequest("http://localhost/contact"));
    expect(again.headers.get("content-security-policy")).not.toBe(csp);
  });

  it("the brand style tag carries the request's nonce", async () => {
    nonce = "n0nce";
    const { default: RootLayout } = await import("@/app/layout");
    const html = renderToStaticMarkup(await RootLayout({ children: null }));
    expect(html).toMatch(/<style id="brand" nonce="n0nce">/);
    nonce = null;
  });
});

describe("the proxy's redirects", () => {
  it("moves an old address to /admin with its query, and sends a signed-out visitor to sign in", async () => {
    vi.stubEnv("FOUNDATION_PIN", "24681012");
    const { proxy } = await import("@/proxy");
    const moved = await proxy(new NextRequest("http://localhost/command/inbox?x=1"));
    expect(moved.status).toBe(308);
    expect(moved.headers.get("location")).toBe("http://localhost/admin/command/inbox?x=1");
    const out = await proxy(new NextRequest("http://localhost/admin/brand"));
    expect(out.status).toBe(307);
    expect(out.headers.get("location")).toBe("http://localhost/admin/login?next=%2Fadmin%2Fbrand");
    vi.unstubAllEnvs();
  });
});
