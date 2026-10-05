import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: "http://localhost:3100" },
  webServer: {
    command: "npm run build && npm run start -- -p 3100",
    url: "http://localhost:3100/gate",
    timeout: 180_000,
    reuseExistingServer: false,
    // Stop the server the way a person does, so it releases the database lock (.data/e2e.lock) on the way out.
    gracefulShutdown: { signal: "SIGTERM", timeout: 10_000 },
    env: {
      FOUNDATION_PIN: "246810",
      FOUNDATION_SECRET: "e2e-only-secret",
      FOUNDATION_BUSINESS_NAME: "Harbor Studio",
      FOUNDATION_DATA_DIR: ".data/e2e",
      FOUNDATION_KEY_ROOT: ".data/e2e-key",
      // The inbound webhook test signs with this. It is a test value, never a real secret.
      E2E_HOOK_SECRET: "e2e-hook-secret",
    },
  },
});
