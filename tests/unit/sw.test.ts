import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

// Runs public/sw.js in a stand-in worker scope and fires its events.
function worker() {
  const handlers: Record<string, (e: { waitUntil(p: Promise<unknown>): void }) => void> = {};
  const stored = new Map<string, string>();
  const fetched: string[] = [];
  const cache = {
    add: async (u: string) => { fetched.push(u); stored.set(u, "page"); },
    put: async (r: string | Request) => { stored.set(typeof r === "string" ? r : r.url, "page"); },
    keys: async () => [],
    match: async () => undefined,
    delete: async () => true,
  };
  const scope = {
    location: { origin: "https://harbor.example" },
    addEventListener: (t: string, h: (e: { waitUntil(p: Promise<unknown>): void }) => void) => { handlers[t] = h; },
    skipWaiting: async () => {},
    clients: { claim: async () => {} },
  };
  const ctx = { self: scope, caches: { open: async () => cache, keys: async () => ["foundation-v1"], delete: async () => true, match: async () => undefined }, fetch: async (u: string) => { fetched.push(String(u)); return new Response("page"); }, URL, Response, Promise };
  runInNewContext(readFileSync("public/sw.js", "utf8"), ctx);
  const fire = async (t: string) => { let p: Promise<unknown> = Promise.resolve(); handlers[t]({ waitUntil: (x) => { p = x; } }); await p; };
  return { fire, fetched };
}

describe("the service worker", () => {
  it("fetches the offline page fresh each time it activates, so a new deploy's page replaces the old one", async () => {
    const w = worker();
    await w.fire("install");
    const before = w.fetched.filter((u) => u.includes("/offline")).length;
    await w.fire("activate");
    expect(w.fetched.filter((u) => u.includes("/offline")).length).toBeGreaterThan(before);
  });

  it("registers for the command center only, so public pages are never under it", async () => {
    const register = vi.fn(async () => ({}));
    vi.stubGlobal("navigator", { serviceWorker: { register } });
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    const effects: (() => void)[] = [];
    vi.doMock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), useEffect: (fn: () => void) => { effects.push(fn); } }));
    const { RegisterServiceWorker } = await import("@/components/pwa/RegisterServiceWorker");
    RegisterServiceWorker();
    effects.forEach((f) => f());
    vi.doUnmock("react");
    expect(register).toHaveBeenCalledWith("/sw.js", { scope: "/admin" });
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });
});
