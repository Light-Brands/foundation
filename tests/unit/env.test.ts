import { describe, it, expect } from "vitest";
import { readEnv } from "@/lib/env";

describe("readEnv", () => {
  it("accepts a 6 to 12 digit PIN", () => {
    const env = readEnv({ FOUNDATION_PIN: "246810" });
    expect(env.pin).toBe("246810");
    expect(env.pinProblem).toBeNull();
  });
  it("reports a missing PIN and never invents one", () => {
    const env = readEnv({});
    expect(env.pin).toBeNull();
    expect(env.pinProblem).toBe("missing");
  });
  it("reports a short or non-numeric PIN as invalid", () => {
    expect(readEnv({ FOUNDATION_PIN: "1234" }).pinProblem).toBe("invalid");
    expect(readEnv({ FOUNDATION_PIN: "12345a" }).pinProblem).toBe("invalid");
    expect(readEnv({ FOUNDATION_PIN: "1234567890123" }).pinProblem).toBe("invalid");
  });
  it("uses FOUNDATION_SECRET if provided, otherwise the build secret", () => {
    expect(readEnv({ FOUNDATION_SECRET: "mysecret" }, "buildsecret").secret).toBe("mysecret");
    expect(readEnv({}, "buildsecret").secret).toBe("buildsecret");
  });
  it("never uses VERCEL_PROJECT_PRODUCTION_URL as the secret", () => {
    expect(readEnv({ VERCEL_PROJECT_PRODUCTION_URL: "a.vercel.app" }, "buildsecret").secret).toBe("buildsecret");
  });
  it("falls through to build secret if FOUNDATION_SECRET is empty", () => {
    expect(readEnv({ FOUNDATION_SECRET: "" }, "buildsecret").secret).toBe("buildsecret");
  });
  it("knows when it runs on Vercel", () => {
    expect(readEnv({ VERCEL: "1" }).onVercel).toBe(true);
    expect(readEnv({}).onVercel).toBe(false);
  });
  it("defaults the business name and the data directory", () => {
    const env = readEnv({});
    expect(env.businessName).toBe("Your business");
    expect(env.dataDir).toBe(".data/pglite");
  });
});
