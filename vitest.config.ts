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
  },
  resolve: { alias: {
      "@": path.resolve(__dirname, "src"),
      // server-only throws outside the Next server build; tests run in plain Node.
      "server-only": path.resolve(__dirname, "tests/support/empty.ts"),
    } },
});
