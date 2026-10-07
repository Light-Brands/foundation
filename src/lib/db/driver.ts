import type { FoundationEnv } from "@/lib/env";

export type DriverKind = "postgres" | "pglite" | "preview";

// The hosted database (Neon, or any Postgres) wherever its address is set: on Vercel, in npm run dev and in every script.
// Otherwise the local database on the owner's computer, and a preview that saves nothing on a deploy.
export function selectDriver(env: Pick<FoundationEnv, "databaseUrl" | "onVercel">): DriverKind {
  if (env.databaseUrl) return "postgres";
  return env.onVercel ? "preview" : "pglite";
}

/** Email sign-in needs the hosted database, both Supabase settings and an explicit FOUNDATION_SECRET. */
export function emailSignIn(env: Pick<FoundationEnv, "databaseUrl" | "onVercel" | "supabaseUrl" | "supabaseSecretKey" | "secretExplicit">): boolean {
  return selectDriver(env) === "postgres" && !!env.supabaseUrl && !!env.supabaseSecretKey && env.secretExplicit;
}

export const SIGNIN_NEEDS_SECRET = "Email sign-in needs one more setting, FOUNDATION_SECRET. Your setup guide adds it.";

export const DATABASE_INSECURE_MESSAGE =
  "FOUNDATION_DATABASE_URL turns off the database's certificate check (its sslmode). Remove the sslmode part, or set it to verify-full, then start again.";
