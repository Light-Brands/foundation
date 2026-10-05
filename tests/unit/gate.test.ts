import { describe, it, expect } from "vitest";
import { safeNext, isPublicPath, handleGatePost } from "@/lib/auth/gate";
import { readEnv } from "@/lib/env";
import { verifySession } from "@/lib/auth/pin-token";

describe("safeNext", () => {
  it("keeps same-site paths", () => {
    expect(safeNext("/sell/pipeline?x=1")).toBe("/sell/pipeline?x=1");
  });
  it("refuses other sites and odd paths", () => {
    for (const bad of ["//evil.com", "https://evil.com", "/\\evil.com", "evil", "", null, undefined]) {
      expect(safeNext(bad)).toBe("/");
    }
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
  const env = readEnv({ FOUNDATION_PIN: "246810", FOUNDATION_SECRET: "s" });

  it("signs a session for the right PIN", async () => {
    const r = await handleGatePost({ pin: "246810" }, env, 0);
    expect(r.status).toBe(200);
    expect(await verifySession(r.token, "246810", "s", 1)).toBe(true);
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
