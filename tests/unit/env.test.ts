import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { deriveSecret, readEnv } from "@/lib/env";
import { SUPABASE_ROOT_CA } from "@/lib/db/supabase-ca";

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
  it("reads the chief of staff's name setup saved, and drops one that is not a name", () => {
    expect(readEnv({}).chiefName).toBe("");
    expect(readEnv({ FOUNDATION_CHIEF_NAME: " Sage " }).chiefName).toBe("Sage");
    expect(readEnv({ FOUNDATION_CHIEF_NAME: "R2D2" }).chiefName).toBe("");
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
    expect(readFileSync(path.join(process.cwd(), "src/lib/db/postgres.ts"), "utf8").startsWith('import "server-only";')).toBe(true);
  });
});

describe("readEnv with the Supabase Marketplace settings", () => {
  const REF = "abcdefghijklmnopqrst";
  const SESSION = `postgres://postgres.${REF}:pw@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require&supa=base-pooler.x`;
  const TRANSACTION = `postgres://postgres.${REF}:pw@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x`;
  it("reads the Marketplace session pooler address when FOUNDATION_DATABASE_URL is unset", () => {
    const env = readEnv({ POSTGRES_URL_NON_POOLING: SESSION, POSTGRES_URL: TRANSACTION, SUPABASE_URL: `https://${REF}.supabase.co`, SUPABASE_SECRET_KEY: "sb_secret_market" });
    expect(env.databaseProblem).toBeNull();
    const u = new URL(env.databaseUrl as string);
    expect([u.hostname, u.port]).toEqual(["aws-0-us-east-1.pooler.supabase.com", "5432"]);
    expect(u.searchParams.has("sslmode")).toBe(false);
    expect(env.databaseCa).toBe(SUPABASE_ROOT_CA);
    expect(env.supabaseUrl).toBe(`https://${REF}.supabase.co`);
    expect(env.supabaseSecretKey).toBe("sb_secret_market");
    // Only POSTGRES_URL, on the transaction pooler: moved to the session pooler's port.
    const only = new URL(readEnv({ POSTGRES_URL: TRANSACTION }).databaseUrl as string);
    expect(only.port).toBe("5432");
    expect(only.searchParams.has("sslmode")).toBe(false);
    expect(readEnv({ POSTGRES_URL: `${TRANSACTION.split("?")[0]}?ssl=false` }).databaseUrl).not.toMatch(/ssl/);
  });
  it("FOUNDATION_DATABASE_URL wins over the Marketplace address", () => {
    const mine = "postgresql://me:pw@db.example.com:5432/postgres";
    const env = readEnv({ FOUNDATION_DATABASE_URL: mine, POSTGRES_URL_NON_POOLING: SESSION, POSTGRES_URL: TRANSACTION, FOUNDATION_DATABASE_CA: "MYCA", FOUNDATION_SUPABASE_URL: "https://mine.example.com", SUPABASE_URL: `https://${REF}.supabase.co`, FOUNDATION_SUPABASE_SECRET_KEY: "sb_secret_mine", SUPABASE_SECRET_KEY: "sb_secret_market" });
    expect(env.databaseUrl).toBe(mine);
    expect(env.databaseCa).toBe("MYCA");
    expect(env.supabaseUrl).toBe("https://mine.example.com");
    expect(env.supabaseSecretKey).toBe("sb_secret_mine");
    // A non-Supabase host gets no Supabase certificate, and an explicit insecure address is still refused, never replaced.
    expect(readEnv({ FOUNDATION_DATABASE_URL: mine }).databaseCa).toBeNull();
    const insecure = readEnv({ FOUNDATION_DATABASE_URL: `${mine}?sslmode=require`, POSTGRES_URL_NON_POOLING: SESSION });
    expect([insecure.databaseUrl, insecure.databaseProblem]).toEqual([null, "insecure"]);
  });
  it("derives a stable 64 character secret from SUPABASE_JWT_SECRET", () => {
    const jwt = "j".repeat(40);
    const a = readEnv({ SUPABASE_JWT_SECRET: jwt }, "buildsecret");
    const b = readEnv({ SUPABASE_JWT_SECRET: jwt }, "buildsecret");
    expect(a.secret).toMatch(/^[0-9a-f]{64}$/);
    expect(a.secret).toBe(b.secret);
    expect(a.secret).toBe(deriveSecret(jwt));
    expect(a.fixedSecret).toBe(a.secret);
    expect(a.secret).not.toBe("buildsecret");
    expect(deriveSecret("k".repeat(40))).not.toBe(a.secret);
    // FOUNDATION_SECRET always wins.
    expect(readEnv({ SUPABASE_JWT_SECRET: jwt, FOUNDATION_SECRET: "m".repeat(32) }, "buildsecret")).toMatchObject({ secret: "m".repeat(32), fixedSecret: "m".repeat(32) });
    // A JWT secret under 32 characters counts as unset, like a short FOUNDATION_SECRET.
    expect(readEnv({ SUPABASE_JWT_SECRET: "short" }, "buildsecret")).toMatchObject({ secret: "buildsecret", fixedSecret: null });
  });
  it("demoDeploy is on only for the exact value on", () => {
    expect(readEnv({ FOUNDATION_DEMO_DEPLOY: "on" }).demoDeploy).toBe(true);
    for (const v of [undefined, "", "On", "ON", "true", "1", " on", "yes"]) expect(readEnv({ FOUNDATION_DEMO_DEPLOY: v }).demoDeploy).toBe(false);
  });
});
