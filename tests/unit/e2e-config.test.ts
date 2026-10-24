import { describe, it, expect } from "vitest";
import config from "../../playwright.config";

// Neon writes DATABASE_URL and POSTGRES_URL into .env.local when an owner pulls their Vercel settings, and readEnv
// falls back to them when FOUNDATION_DATABASE_URL is blank. A test run that blanks only the Foundation's own setting
// would still reach the owner's live database, so every run that means a local or throwaway database blanks all three.
const DATABASE_SETTINGS = ["FOUNDATION_DATABASE_URL", "DATABASE_URL", "POSTGRES_URL"] as const;

describe("test runs never reach a database set by Neon's settings", () => {
  it("every end-to-end server blanks all three database settings", () => {
    const servers = Array.isArray(config.webServer) ? config.webServer : [config.webServer!];
    expect(servers.length).toBeGreaterThan(0);
    for (const s of servers) {
      for (const k of DATABASE_SETTINGS) expect(s.env?.[k], `${s.command}: ${k}`).toBe("");
    }
  });

  it("unit tests, and the scripts they start, run with all three blank", () => {
    for (const k of DATABASE_SETTINGS) expect(process.env[k], k).toBe("");
  });
});
