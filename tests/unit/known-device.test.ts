import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { coreDb } from "../support/db";
import type { Db } from "@/lib/db/types";
import { GATE_LIMITS, dbGateLimiter } from "@/lib/auth/limit";
import { DEVICE_COOKIE, DEVICE_DAYS, signDevice, verifyDevice } from "@/lib/auth/device";

const SECRET = "device-test-secret-of-at-least-32-characters";
let db: Db;
vi.mock("@/lib/db", () => ({ getDb: async () => db }));

async function post(pin: string, headers: Record<string, string> = {}) {
  const { POST } = await import("@/app/api/gate/route");
  return POST(new Request("https://harbor.example/api/gate", { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify({ pin }) }));
}
const deviceOf = (res: Response) => /fc_device=([^;]+)/.exec(res.headers.get("set-cookie") ?? "")?.[1] ?? null;

describe("the known-device token", () => {
  it("verifies its own signature and nothing else", async () => {
    const t = await signDevice(SECRET);
    const id = await verifyDevice(t, SECRET);
    expect(id).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(await signDevice(SECRET, id!)).toBe(t);
    expect(await verifyDevice(t, "another-secret-of-at-least-32-characters!")).toBeNull();
    const [v, raw, sig] = t.split(".");
    const flip = (s: string) => (s[0] === "A" ? "B" : "A") + s.slice(1);
    expect(await verifyDevice(`${v}.${flip(raw)}.${sig}`, SECRET)).toBeNull();
    expect(await verifyDevice(`${v}.${raw}.${flip(sig)}`, SECRET)).toBeNull();
    for (const bad of [undefined, "", "d1", "d1.x", "d2.a.b", `${t}.x`]) expect(await verifyDevice(bad, SECRET)).toBeNull();
  });
});

describe("sign-in from a known device", () => {
  beforeEach(async () => {
    db = await coreDb();
    vi.stubEnv("FOUNDATION_PIN", "24681012");
    vi.stubEnv("FOUNDATION_SECRET", SECRET);
    vi.stubEnv("VERCEL", "1");
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.useFakeTimers({ toFake: ["Date"] });
  });
  afterEach(async () => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    await db.close();
  });

  async function spendTheSiteBudget() {
    const l = dbGateLimiter(db, SECRET);
    for (let i = 0; i < GATE_LIMITS.globalPerMinute; i++) await l.attempt(`2001:db8:${i + 1}::1`, new Date());
    expect((await l.attempt("203.0.113.77", new Date())).ok).toBe(false);
  }

  it("a right PIN sets a long-lived device cookie for the sign-in route only", async () => {
    const res = await post("24681012", { "x-vercel-forwarded-for": "203.0.113.9" });
    expect(res.status).toBe(200);
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(new RegExp(`${DEVICE_COOKIE}=d1\\.`));
    const device = cookie.split(/,(?=\s*\w+=)/).find((c) => c.trim().startsWith(`${DEVICE_COOKIE}=`)) ?? "";
    expect(device).toMatch(/HttpOnly/i);
    expect(device).toMatch(/Secure/i);
    expect(device).toMatch(/SameSite=lax/i);
    expect(device).toMatch(/Path=\/api\/gate/i);
    expect(device).toMatch(new RegExp(`Max-Age=${DEVICE_DAYS * 86400}`));
  });

  it("gets the owner in at once while a stranger has spent the site's budget", async () => {
    const first = await post("24681012", { "x-vercel-forwarded-for": "203.0.113.9" });
    const token = deviceOf(first)!;
    await spendTheSiteBudget();
    const res = await post("24681012", { "x-vercel-forwarded-for": "198.51.100.200", cookie: `${DEVICE_COOKIE}=${token}` });
    expect(res.status).toBe(200);
    expect(deviceOf(res)).toBe(token);
  });

  it("ignores a forged or tampered device cookie", async () => {
    const token = await signDevice(SECRET);
    await spendTheSiteBudget();
    const forged = await signDevice("someone-elses-secret-of-at-least-32-chars");
    const tampered = token.slice(0, -2) + (token.endsWith("AA") ? "BB" : "AA");
    for (const c of [forged, tampered, "d1.abc.def"]) {
      const res = await post("24681012", { "x-vercel-forwarded-for": "198.51.100.201", cookie: `${DEVICE_COOKIE}=${c}` });
      expect(res.status, c).toBe(429);
    }
  });

  it("holds a known device to its own limit, so a stolen cookie cannot guess", async () => {
    const token = await signDevice(SECRET);
    const cookie = `${DEVICE_COOKIE}=${token}`;
    for (let i = 0; i < GATE_LIMITS.perClient; i++) {
      // A new address each time: the device's own count is what holds.
      expect((await post("11111111", { "x-vercel-forwarded-for": `192.0.2.${i}`, cookie })).status).toBe(401);
    }
    const res = await post("24681012", { "x-vercel-forwarded-for": "192.0.2.99", cookie });
    expect(res.status).toBe(429);
    expect(Number(res.headers.get("retry-after"))).toBe(GATE_LIMITS.clientLockMs / 1000);
  }, 30_000);
});
