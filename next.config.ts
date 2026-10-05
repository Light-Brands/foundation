import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite"],
  outputFileTracingIncludes: {
    "/**": ["./prompts/**/*", "./core/db/migrations/**/*", "./key/**/*"],
  },
};

export default nextConfig;
