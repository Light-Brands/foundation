import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite"],
  outputFileTracingIncludes: {
    "/**": ["./prompts/**/*", "./db/migrations/**/*"],
  },
};

export default nextConfig;
