import { describe, it, expect } from "vitest";
import { sessionIsValid } from "@/lib/auth/session";
import { signSession } from "@/lib/auth/pin-token";
import { readEnv, type FoundationEnv } from "@/lib/env";

const PIN = "246810";
const SECRET = "test-secret";
const env = (over: Partial<FoundationEnv> = {}): FoundationEnv =>
  ({ pin: PIN, pinProblem: null, secret: SECRET, onVercel: false, businessName: "Harbor", dataDir: ".data", ...over }) as FoundationEnv;

describe("sessionIsValid", () => {
  it("accepts a token signed for the configured PIN and secret", async () => {
    const token = await signSession(PIN, SECRET, 1_000);
    expect(await sessionIsValid(token, env(), 2_000)).toBe(true);
  });
  it("rejects a missing token", async () => {
    expect(await sessionIsValid(undefined, env())).toBe(false);
  });
  it("rejects everything when no PIN is configured", async () => {
    const token = await signSession(PIN, SECRET, 1_000);
    expect(await sessionIsValid(token, env({ pin: null as unknown as string }), 2_000)).toBe(false);
    expect(await sessionIsValid(token, env({ pin: "" }), 2_000)).toBe(false);
  });
  it("rejects a token signed with another secret", async () => {
    const token = await signSession(PIN, "other-secret", 1_000);
    expect(await sessionIsValid(token, env(), 2_000)).toBe(false);
  });
  it("never accepts a session signed with a FOUNDATION_SECRET under 32 characters", async () => {
    const short = "s".repeat(31);
    const token = await signSession(PIN, short, 1_000);
    const live = readEnv({ FOUNDATION_PIN: PIN, FOUNDATION_SECRET: short }, "b".repeat(64));
    expect(await sessionIsValid(token, live, 2_000)).toBe(false);
  });
});
