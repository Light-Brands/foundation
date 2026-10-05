import "server-only";
import { BUILD_SECRET } from "@/generated/build-secret";

export type FoundationEnv = {
  pin: string | null;
  pinProblem: "missing" | "invalid" | null;
  /** Signs sessions and hashes visitors: FOUNDATION_SECRET when it is at least 32 characters, else the build secret. */
  secret: string;
  /**
   * FOUNDATION_SECRET alone, never the build secret, or null. At least 32 characters, else null, the same way
   * cronSecret is read. Keys the opt-out list, so it is fixed for the life of the Foundation.
   */
  fixedSecret: string | null;
  onVercel: boolean;
  businessName: string;
  dataDir: string;
  /** Lets the host's schedule run the checks. At least 16 characters, else null, and null means the cron route refuses everyone. */
  cronSecret: string | null;
  /** The hosted database (Supabase pooler, transaction mode). Set and well formed turns it on everywhere. */
  databaseUrl: string | null;
  databaseProblem: "invalid" | null;
  /** The Supabase project's https origin, for email sign-in. */
  supabaseUrl: string | null;
  /** A new secret API key (sb_secret_...). An old service_role JWT is reported in supabaseKeyProblem, never used. */
  supabaseSecretKey: string | null;
  supabaseKeyProblem: "legacy" | null;
  /** FOUNDATION_SECRET is set and long enough to sign with, so sessions survive a new deploy. Email sign-in needs it. */
  secretExplicit: boolean;
};

const PIN_FORMAT = /^\d{6,12}$/;
export const FIXED_SECRET_MIN = 32;

export function readEnv(e: Record<string, string | undefined> = process.env, buildSecret: string = BUILD_SECRET): FoundationEnv {
  const raw = e.FOUNDATION_PIN?.trim() ?? "";
  const cron = e.CRON_SECRET?.trim() ?? "";
  const fixed = e.FOUNDATION_SECRET?.trim() ?? "";
  const pinProblem = raw === "" ? "missing" : PIN_FORMAT.test(raw) ? null : "invalid";
  const dbRaw = e.FOUNDATION_DATABASE_URL?.trim() ?? "";
  const dbOk = /^postgres(ql)?:\/\/\S+$/.test(dbRaw);
  let supabaseUrl: string | null = null;
  try {
    const u = new URL(e.FOUNDATION_SUPABASE_URL?.trim() ?? "");
    if (u.protocol === "https:") supabaseUrl = u.origin;
  } catch { /* not set or not an address */ }
  const key = e.FOUNDATION_SUPABASE_SECRET_KEY?.trim() ?? "";
  return {
    pin: pinProblem ? null : raw,
    pinProblem,
    // A FOUNDATION_SECRET under 32 characters counts as unset everywhere, session signing included.
    secret: fixed.length >= FIXED_SECRET_MIN ? fixed : buildSecret,
    fixedSecret: fixed.length >= FIXED_SECRET_MIN ? fixed : null,
    onVercel: e.VERCEL === "1",
    businessName: e.FOUNDATION_BUSINESS_NAME?.trim() || "Your business",
    dataDir: e.FOUNDATION_DATA_DIR?.trim() || ".data/pglite",
    cronSecret: cron.length >= 16 ? cron : null,
    databaseUrl: dbOk ? dbRaw : null,
    databaseProblem: dbRaw && !dbOk ? "invalid" : null,
    supabaseUrl,
    // Only the new secret keys (sb_secret_...) are accepted. An old service_role JWT is reported, not used.
    supabaseSecretKey: /^sb_secret_\S+$/.test(key) ? key : null,
    supabaseKeyProblem: key.startsWith("eyJ") ? "legacy" : null,
    secretExplicit: fixed.length >= FIXED_SECRET_MIN,
  };
}
