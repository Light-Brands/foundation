import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CLAUDE.md and AGENTS.md are this project's own. Without this, next dev rewrites both when it sees an AI agent.
  agentRules: false,
  serverExternalPackages: ["@electric-sql/pglite"],
  // The fixed security headers. The content security policy needs a fresh nonce per request, so src/proxy.ts sends it.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
        ],
      },
    ];
  },
  outputFileTracingIncludes: {
    "/**": ["./prompts/**/*", "./core/db/migrations/**/*", "./key/**/*", "./ninja/**/*"],
  },
};

export default nextConfig;
