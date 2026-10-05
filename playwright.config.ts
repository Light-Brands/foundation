import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: "http://localhost:3100" },
  webServer: {
    command: "npm run build && npx next start -p 3100",
    url: "http://localhost:3100/gate",
    timeout: 180_000,
    reuseExistingServer: false,
    env: {
      FOUNDATION_PIN: "246810",
      FOUNDATION_SECRET: "e2e-only-secret",
      FOUNDATION_BUSINESS_NAME: "Harbor Studio",
      FOUNDATION_DATA_DIR: ".data/e2e",
    },
  },
});
