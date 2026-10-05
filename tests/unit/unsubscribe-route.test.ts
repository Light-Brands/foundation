import { describe, it, expect, vi, afterEach } from "vitest";

// The route's failure log carries the error's name and message only, never a database detail.
const failure = Object.assign(new Error("duplicate key value violates unique constraint"), {
  name: "PostgresError",
  detail: "Key (email)=(jo@harbor.example) already exists.",
  where: "SQL statement in opt_outs",
});
vi.mock("@/lib/db", () => ({ getDb: async () => { throw failure; } }));
vi.stubEnv("FOUNDATION_SECRET", "route-test-secret-of-at-least-32-chars");
import { POST } from "@/app/u/[token]/route";
import { unsubscribeToken } from "@/lib/email-links";

afterEach(() => { vi.restoreAllMocks(); });

describe("the unsubscribe route's log", () => {
  it("logs only the error's name and message", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const token = unsubscribeToken("6f1c2a4e-1b2c-4d5e-8f90-1234567890ab", "route-test-secret-of-at-least-32-chars");
    const res = await POST(new Request(`https://harbor.example/u/${token}`, { method: "POST" }), { params: Promise.resolve({ token }) });
    expect(res.status).toBe(503);
    expect(log).toHaveBeenCalledTimes(1);
    const logged = JSON.stringify(log.mock.calls[0]);
    expect(logged).toContain("PostgresError");
    expect(logged).toContain("duplicate key value violates unique constraint");
    expect(logged).not.toContain("jo@harbor.example");
    expect(log.mock.calls[0].every((a) => typeof a === "string")).toBe(true);
  });
});
