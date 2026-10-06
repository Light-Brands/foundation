import { describe, it, expect } from "vitest";
import { safeNext, isPublicPath, handleGatePost, cronAuthorized, isPublicRequest } from "@/lib/auth/gate";
import { readEnv } from "@/lib/env";
import { verifySession } from "@/lib/auth/pin-token";

describe("safeNext", () => {
  it("keeps same-site paths", () => {
    expect(safeNext("/sell/pipeline?x=1")).toBe("/sell/pipeline?x=1");
  });
  it("refuses other sites and odd paths", () => {
    for (const bad of ["//evil.com", "https://evil.com", "/\\evil.com", "evil", "", null, undefined, "/\t/evil.com", "/\n/evil.com", "/\r/evil.com", "/\u0000x", "/x/..//evil.com", "/%2e%2e//evil.com", "/a/..//b/../evil.com"]) {
      expect(safeNext(bad)).toBe("/");
    }
  });
});

describe("safeNext percent-encoding", () => {
  it("keeps a literal percent string same-site", () => {
    expect(safeNext("/%09/evil.com").startsWith("//")).toBe(false);
  });
});

describe("isPublicPath", () => {
  it("lets the gate, the contact page and static files through", () => {
    for (const p of ["/gate", "/api/gate", "/contact", "/_next/static/x.js", "/favicon.ico"]) {
      expect(isPublicPath(p)).toBe(true);
    }
  });
  it("guards everything else", () => {
    for (const p of ["/", "/command/inbox", "/system/setup", "/gateway", "/contacts"]) {
      expect(isPublicPath(p)).toBe(false);
    }
  });
});

describe("handleGatePost", () => {
  const SECRET = "s".repeat(32);
  const env = readEnv({ FOUNDATION_PIN: "246810", FOUNDATION_SECRET: SECRET });

  it("signs a session for the right PIN", async () => {
    const r = await handleGatePost({ pin: "246810" }, env, 0);
    expect(r.status).toBe(200);
    expect(await verifySession(r.token, "246810", SECRET, 1)).toBe(true);
  });
  it("never signs a session with a FOUNDATION_SECRET under 32 characters", async () => {
    const short = "s".repeat(31);
    const r = await handleGatePost({ pin: "246810" }, readEnv({ FOUNDATION_PIN: "246810", FOUNDATION_SECRET: short }, "b".repeat(64)), 0);
    expect(r.status).toBe(200);
    expect(await verifySession(r.token, "246810", short, 1)).toBe(false);
    expect(await verifySession(r.token, "246810", "b".repeat(64), 1)).toBe(true);
  });
  it("refuses a wrong PIN", async () => {
    const r = await handleGatePost({ pin: "000000" }, env, 0);
    expect(r.status).toBe(401);
    expect(r.token).toBeUndefined();
  });
  it("refuses a malformed body", async () => {
    expect((await handleGatePost(null, env)).status).toBe(400);
    expect((await handleGatePost({ pin: 246810 }, env)).status).toBe(400);
    expect((await handleGatePost({ pin: "x".repeat(100) }, env)).status).toBe(400);
  });
  it("never lets anyone in when the PIN is not set up", async () => {
    const r = await handleGatePost({ pin: "" }, readEnv({}), 0);
    expect(r.status).toBe(503);
    expect(r.token).toBeUndefined();
  });
});

describe("the public form route", () => {
  it("lets every declared form address through, and nothing else under /f", () => {
    for (const p of ["/f/get-in-touch", "/f/apply"]) expect(isPublicPath(p), p).toBe(true);
    for (const p of ["/f", "/f/", "/f/Get-In-Touch", "/f/a/b", "/f/a_b", "/forms/a"]) expect(isPublicPath(p), p).toBe(false);
  });
});

describe("the cron route", () => {
  const secret = "c".repeat(32);
  it("the cron route is public only with its secret", () => {
    expect(isPublicRequest("/api/cron/checks", `Bearer ${secret}`, secret)).toBe(true);
    expect(isPublicRequest("/api/cron/checks", null, secret)).toBe(false);
    expect(isPublicRequest("/api/cron/checks", `Bearer ${secret}x`, secret)).toBe(false);
    expect(isPublicRequest("/api/cron/checks", "Bearer ", null)).toBe(false);
    expect(isPublicRequest("/api/cron/other", `Bearer ${secret}`, secret)).toBe(false);
    expect(isPublicRequest("/contact", null, null)).toBe(true);
  });
  it("never accepts an empty secret", () => {
    expect(cronAuthorized("Bearer ", "")).toBe(false);
    expect(cronAuthorized("Bearer null", null)).toBe(false);
  });
});
