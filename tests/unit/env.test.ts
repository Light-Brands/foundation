import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
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
    expect(readEnv({ FOUNDATION_SECRET: "m".repeat(32) }, "buildsecret").secret).toBe("m".repeat(32));
    expect(readEnv({}, "buildsecret").secret).toBe("buildsecret");
  });
  it("never uses VERCEL_PROJECT_PRODUCTION_URL as the secret", () => {
    expect(readEnv({ VERCEL_PROJECT_PRODUCTION_URL: "a.vercel.app" }, "buildsecret").secret).toBe("buildsecret");
  });
  it("keeps the fixed secret for opt-outs only from FOUNDATION_SECRET, never the build secret", () => {
    const fixed = "f".repeat(32);
    expect(readEnv({ FOUNDATION_SECRET: ` ${fixed} ` }, "buildsecret").fixedSecret).toBe(fixed);
    expect(readEnv({ FOUNDATION_SECRET: "" }, "buildsecret").fixedSecret).toBeNull();
    expect(readEnv({}, "buildsecret").fixedSecret).toBeNull();
  });
  it("treats a FOUNDATION_SECRET shorter than 32 characters as unset for opt-outs", () => {
    expect(readEnv({ FOUNDATION_SECRET: "f".repeat(31) }, "buildsecret").fixedSecret).toBeNull();
    expect(readEnv({ FOUNDATION_SECRET: ` ${"f".repeat(31)} ` }, "buildsecret").fixedSecret).toBeNull();
    expect(readEnv({ FOUNDATION_SECRET: "f".repeat(32) }, "buildsecret").fixedSecret).toBe("f".repeat(32));
  });
  it("signs sessions and form hashes with the build secret while FOUNDATION_SECRET is under 32 characters", () => {
    expect(readEnv({ FOUNDATION_SECRET: "m".repeat(31) }, "buildsecret").secret).toBe("buildsecret");
    expect(readEnv({ FOUNDATION_SECRET: ` ${"m".repeat(31)} ` }, "buildsecret").secret).toBe("buildsecret");
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
  it("keeps a cron secret of 16 or more characters and drops a shorter one", () => {
    expect(readEnv({ CRON_SECRET: "x".repeat(16) }).cronSecret).toBe("x".repeat(16));
    expect(readEnv({ CRON_SECRET: "short" }).cronSecret).toBeNull();
    expect(readEnv({}).cronSecret).toBeNull();
  });
  it("reads the hosted database settings, and refuses a malformed address", () => {
    const env = readEnv({
      FOUNDATION_DATABASE_URL: "postgresql://postgres.ref:pw@aws-0-us-west-1.pooler.supabase.com:6543/postgres",
      FOUNDATION_SUPABASE_URL: "https://abcdefghijklmnopqrst.supabase.co/",
      FOUNDATION_SUPABASE_SECRET_KEY: " sb_secret_abc ",
    });
    expect(env.databaseUrl).toMatch(/^postgresql:\/\//);
    expect(env.databaseProblem).toBeNull();
    expect(env.supabaseUrl).toBe("https://abcdefghijklmnopqrst.supabase.co");
    expect(env.supabaseSecretKey).toBe("sb_secret_abc");
    expect(readEnv({ FOUNDATION_SUPABASE_SECRET_KEY: "eyJhbGciOiJIUzI1NiJ9.e30.x" })).toMatchObject({ supabaseSecretKey: null, supabaseKeyProblem: "legacy" });
    // Explicit means a FOUNDATION_SECRET long enough to sign with (32 characters), never the build secret.
    expect(readEnv({ FOUNDATION_SECRET: "s".repeat(32) }).secretExplicit).toBe(true);
    expect(readEnv({ FOUNDATION_SECRET: "short" }, "build").secretExplicit).toBe(false);
    expect(readEnv({}, "build").secretExplicit).toBe(false);
    const bad = readEnv({ FOUNDATION_DATABASE_URL: "mysql://x", FOUNDATION_SUPABASE_URL: "http://plain.example" });
    expect([bad.databaseUrl, bad.databaseProblem, bad.supabaseUrl]).toEqual([null, "invalid", null]);
  });
  it("no setting a browser can read holds a secret", () => {
    const text = readFileSync(path.join(process.cwd(), ".env.example"), "utf8");
    expect(text).not.toMatch(/NEXT_PUBLIC_/);
    expect(readFileSync(path.join(process.cwd(), "src/lib/db/supabase.ts"), "utf8").startsWith('import "server-only";')).toBe(true);
  });
});
