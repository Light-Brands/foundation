import { describe, it, expect } from "vitest";
import { createLimiter, clientKeyFromHeaders } from "@/lib/auth/limit";

const MIN = 60_000;

describe("wrong PIN limiter", () => {
  it("allows 5 wrong tries, then blocks every further attempt", () => {
    const l = createLimiter();
    for (let i = 0; i < 5; i++) {
      expect(l.isBlocked("a", i)).toBe(false);
      l.fail("a", i);
    }
    expect(l.isBlocked("a", 10)).toBe(true);
    expect(l.isBlocked("a", 5 * MIN)).toBe(true);
  });
  it("lifts the block after the window", () => {
    const l = createLimiter();
    for (let i = 0; i < 5; i++) l.fail("a", 0);
    expect(l.isBlocked("a", 10 * MIN - 1)).toBe(true);
    expect(l.isBlocked("a", 10 * MIN + 1)).toBe(false);
    l.fail("a", 10 * MIN + 2);
    expect(l.isBlocked("a", 10 * MIN + 3)).toBe(false);
  });
  it("forgets old failures outside the window", () => {
    const l = createLimiter();
    for (let i = 0; i < 4; i++) l.fail("a", 0);
    l.fail("a", 11 * MIN);
    expect(l.isBlocked("a", 11 * MIN + 1)).toBe(false);
  });
  it("a correct PIN resets the key", () => {
    const l = createLimiter();
    for (let i = 0; i < 4; i++) l.fail("a", 0);
    l.succeed("a");
    l.fail("a", 1);
    expect(l.isBlocked("a", 2)).toBe(false);
  });
  it("keeps keys independent", () => {
    const l = createLimiter();
    for (let i = 0; i < 5; i++) l.fail("a", 0);
    expect(l.isBlocked("a", 1)).toBe(true);
    expect(l.isBlocked("b", 1)).toBe(false);
  });
  it("accepts an injected map", () => {
    const m = new Map();
    const l = createLimiter(m);
    l.fail("a", 0);
    expect(m.size).toBe(1);
  });
});

describe("clientKeyFromHeaders", () => {
  it("reads the first forwarded address, or local", () => {
    expect(clientKeyFromHeaders(new Headers({ "x-forwarded-for": " 203.0.113.9 , 10.0.0.1" }))).toBe("203.0.113.9");
    expect(clientKeyFromHeaders(new Headers())).toBe("local");
  });
});
