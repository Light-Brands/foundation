import type { FoundationEnv } from "@/lib/env";

export type DriverKind = "pglite" | "preview";

// Phase 1 adds "supabase" ahead of these two, chosen when a database URL is set.
export function selectDriver(env: FoundationEnv): DriverKind {
  return env.onVercel ? "preview" : "pglite";
}
