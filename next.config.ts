import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CLAUDE.md and AGENTS.md are this project's own. Without this, next dev rewrites both when it sees an AI agent.
  agentRules: false,
  serverExternalPackages: ["@electric-sql/pglite"],
  outputFileTracingIncludes: {
    "/**": ["./prompts/**/*", "./core/db/migrations/**/*", "./key/**/*"],
  },
};

export default nextConfig;
