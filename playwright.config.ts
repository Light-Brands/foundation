import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: "http://localhost:3100" },
  // named-prompts renames the chief of staff, and first-win saves the whole profile, name included. Running
  // named-prompts after every other file keeps the two from saving over each other.
  projects: [
    { name: "default", testIgnore: /named-prompts\.spec\.ts/ },
    { name: "named-prompts", testMatch: /named-prompts\.spec\.ts/, dependencies: ["default"] },
  ],
  webServer: [{
    command: "npm run build && npm run start -- -p 3100",
    url: "http://localhost:3100/gate",
    timeout: 180_000,
    reuseExistingServer: false,
    // Stop the server the way a person does, so it releases the database lock (.data/e2e.lock) on the way out.
    gracefulShutdown: { signal: "SIGTERM", timeout: 10_000 },
    env: {
      FOUNDATION_PIN: "246810",
      FOUNDATION_SECRET: "e2e-only-secret-of-at-least-32-characters",
      FOUNDATION_BUSINESS_NAME: "Harbor Studio",
      FOUNDATION_DATA_DIR: ".data/e2e",
      FOUNDATION_KEY_ROOT: ".data/e2e-key",
      // The inbound webhook test signs with this. It is a test value, never a real secret.
      E2E_HOOK_SECRET: "e2e-hook-secret",
      // A developer's shell or .env.local may hold hosted settings. Process settings win over .env.local,
      // so these blanks keep every end-to-end run on the local database with the PIN. Neon writes DATABASE_URL and
      // POSTGRES_URL into .env.local on vercel env pull, and readEnv falls back to them, so they are blank too.
      FOUNDATION_DATABASE_URL: "",
      DATABASE_URL: "",
      POSTGRES_URL: "",
      FOUNDATION_SUPABASE_URL: "",
      FOUNDATION_SUPABASE_SECRET_KEY: "",
    },
  },
  // A deployed-like session on the same build: Vercel settings name the repo, and no folder is known on the server.
  // It starts after the first server is up, so the build it serves is ready.
  {
    command: "npm run start -- -p 3101",
    url: "http://localhost:3101/gate",
    timeout: 60_000,
    reuseExistingServer: false,
    gracefulShutdown: { signal: "SIGTERM", timeout: 10_000 },
    env: {
      VERCEL: "1",
      VERCEL_GIT_REPO_OWNER: "harbor-studio",
      VERCEL_GIT_REPO_SLUG: "command-center",
      FOUNDATION_PIN: "246810",
      FOUNDATION_SECRET: "e2e-only-secret-of-at-least-32-characters",
      FOUNDATION_BUSINESS_NAME: "Harbor Studio",
      FOUNDATION_DATA_DIR: ".data/e2e-deployed",
      FOUNDATION_KEY_ROOT: ".data/e2e-deployed-key",
      FOUNDATION_DATABASE_URL: "",
      DATABASE_URL: "",
      POSTGRES_URL: "",
      FOUNDATION_SUPABASE_URL: "",
      FOUNDATION_SUPABASE_SECRET_KEY: "",
    },
  }],
});
