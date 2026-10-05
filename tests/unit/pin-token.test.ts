import { describe, it, expect } from "vitest";
import { signSession, verifySession, pinMatches, SESSION_HOURS } from "@/lib/auth/pin-token";

const PIN = "246810";
const SALT = "test-salt";

describe("sessions", () => {
  it("verifies a session it signed", async () => {
    const token = await signSession(PIN, SALT, 1_000);
    expect(await verifySession(token, PIN, SALT, 2_000)).toBe(true);
  });
  it("rejects an expired session", async () => {
    const token = await signSession(PIN, SALT, 0);
    const later = SESSION_HOURS * 3600_000 + 1;
    expect(await verifySession(token, PIN, SALT, later)).toBe(false);
  });
  it("rejects a session after the PIN changes", async () => {
    const token = await signSession(PIN, SALT, 0);
    expect(await verifySession(token, "135790", SALT, 1)).toBe(false);
  });
  it("rejects a tampered expiry", async () => {
    const token = await signSession(PIN, SALT, 0);
    const [v, , sig] = token.split(".");
    const forged = `${v}.${Date.now() + 10 ** 12}.${sig}`;
    expect(await verifySession(forged, PIN, SALT, 1)).toBe(false);
  });
  it("rejects garbage and missing tokens", async () => {
    expect(await verifySession(undefined, PIN, SALT)).toBe(false);
    expect(await verifySession("", PIN, SALT)).toBe(false);
    expect(await verifySession("v1.x.y", PIN, SALT)).toBe(false);
    expect(await verifySession("nope", PIN, SALT)).toBe(false);
  });
});

describe("pinMatches", () => {
  it("matches only the exact PIN", async () => {
    expect(await pinMatches("246810", PIN)).toBe(true);
    expect(await pinMatches("246811", PIN)).toBe(false);
    expect(await pinMatches("", PIN)).toBe(false);
    expect(await pinMatches("2468100", PIN)).toBe(false);
  });
});
