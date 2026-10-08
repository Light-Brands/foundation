import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { loadLogo, clearLogoCache, readPublicLogo, LOGO_MAX_BYTES } from "@/lib/pwa/logo";

const PNG = Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="), (c) => c.charCodeAt(0));
const opts = { base: null, publicDir: "/nonexistent" };
const realFetch = globalThis.fetch;

describe("fetching a remote logo", () => {
  beforeEach(() => {
    clearLogoCache();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
    vi.restoreAllMocks();
  });

  it("stops reading a body the moment it passes the cap", async () => {
    let sent = 0;
    let cancelled = false;
    const chunk = new Uint8Array(64 * 1024);
    globalThis.fetch = (async () => new Response(new ReadableStream({
      pull(c) { sent += chunk.length; c.enqueue(chunk); },
      cancel() { cancelled = true; },
    }), { headers: { "content-type": "image/png" } })) as typeof fetch;
    expect(await loadLogo("https://logo.example/big.png", opts)).toBeNull();
    expect(cancelled).toBe(true);
    expect(sent).toBeLessThan(LOGO_MAX_BYTES + 4 * chunk.length);
  });

  it("refuses a body whose declared length is over the cap without reading it", async () => {
    let pulled = false;
    globalThis.fetch = (async () => new Response(new ReadableStream({ pull(c) { pulled = true; c.enqueue(new Uint8Array(10)); c.close(); } }, { highWaterMark: 0 }), {
      headers: { "content-type": "image/png", "content-length": String(LOGO_MAX_BYTES + 1) },
    })) as typeof fetch;
    expect(await loadLogo("https://logo.example/declared.png", opts)).toBeNull();
    expect(pulled).toBe(false);
  });

  it("fetches a logo once, however many visitors ask, and remembers a failure too", async () => {
    const calls: string[] = [];
    globalThis.fetch = (async (u: RequestInfo | URL) => {
      calls.push(String(u));
      return String(u).includes("ok") ? new Response(PNG, { headers: { "content-type": "image/png" } }) : new Response("no", { status: 500 });
    }) as typeof fetch;
    const results = await Promise.all(Array.from({ length: 5 }, () => loadLogo("https://logo.example/ok.png", opts)));
    expect(results.every((r) => r?.startsWith("data:image/png;base64,"))).toBe(true);
    await loadLogo("https://logo.example/ok.png", opts);
    expect(calls).toEqual(["https://logo.example/ok.png"]);
    await loadLogo("https://logo.example/broken.png", opts);
    await loadLogo("https://logo.example/broken.png", opts);
    expect(calls.filter((c) => c.includes("broken"))).toHaveLength(1);
  });
});

describe("reading a logo from public/", () => {
  it("never follows a link out of public/", async () => {
    const root = mkdtempSync(path.join(tmpdir(), "pub-"));
    const pub = path.join(root, "public");
    mkdirSync(pub);
    writeFileSync(path.join(root, "secret.png"), PNG);
    writeFileSync(path.join(pub, "real.png"), PNG);
    symlinkSync(path.join(root, "secret.png"), path.join(pub, "linked.png"));
    expect(await readPublicLogo("/real.png", pub)).toMatch(/^data:image\/png;base64,/);
    expect(await readPublicLogo("/linked.png", pub)).toBeNull();
  });
});
