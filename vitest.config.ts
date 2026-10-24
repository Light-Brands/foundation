import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    // Local database tests start an embedded Postgres. On a busy computer that can
    // take several seconds, so the limits leave room and fewer files run at once.
    testTimeout: 30_000,
    hookTimeout: 60_000,
    maxWorkers: 4,
    // Every unit test, and every script a test starts (which inherits this environment), runs on a local or
    // throwaway database. A shell may hold hosted settings, and Neon's DATABASE_URL and POSTGRES_URL are read when
    // FOUNDATION_DATABASE_URL is blank, so all three are blank. A process setting wins over .env.local.
    env: { FOUNDATION_DATABASE_URL: "", DATABASE_URL: "", POSTGRES_URL: "" },
  },
  resolve: { alias: {
      "@": path.resolve(__dirname, "src"),
      // server-only throws outside the Next server build; tests run in plain Node.
      "server-only": path.resolve(__dirname, "tests/support/empty.ts"),
    } },
});
