import { describe, it, expect } from "vitest";
import { signSession, verifySession, pinMatches, SESSION_HOURS } from "@/lib/auth/pin-token";

const PIN = "246810";
const SECRET = "test-secret";

describe("sessions", () => {
  it("verifies a session it signed", async () => {
    const token = await signSession(PIN, SECRET, 1_000);
    expect(await verifySession(token, PIN, SECRET, 2_000)).toBe(true);
  });
  it("rejects an expired session", async () => {
    const token = await signSession(PIN, SECRET, 0);
    const later = SESSION_HOURS * 3600_000 + 1;
    expect(await verifySession(token, PIN, SECRET, later)).toBe(false);
  });
  it("rejects a session after the PIN changes", async () => {
    const token = await signSession(PIN, SECRET, 0);
    expect(await verifySession(token, "135790", SECRET, 1)).toBe(false);
  });
  it("rejects a tampered expiry", async () => {
    const token = await signSession(PIN, SECRET, 0);
    const [v, , sig] = token.split(".");
    const forged = `${v}.${Date.now() + 10 ** 12}.${sig}`;
    expect(await verifySession(forged, PIN, SECRET, 1)).toBe(false);
  });
  it("rejects garbage and missing tokens", async () => {
    expect(await verifySession(undefined, PIN, SECRET)).toBe(false);
    expect(await verifySession("", PIN, SECRET)).toBe(false);
    expect(await verifySession("v1.x.y", PIN, SECRET)).toBe(false);
    expect(await verifySession("nope", PIN, SECRET)).toBe(false);
  });
  it("rejects a session signed with a different secret", async () => {
    const token = await signSession(PIN, SECRET, 0);
    expect(await verifySession(token, PIN, "different-secret", 1)).toBe(false);
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
