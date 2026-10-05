import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { environment: "node", include: ["tests/unit/**/*.test.ts"] },
  resolve: { alias: {
      "@": path.resolve(__dirname, "src"),
      // server-only throws outside the Next server build; tests run in plain Node.
      "server-only": path.resolve(__dirname, "tests/support/empty.ts"),
    } },
});
