import "server-only";
import { createHmac } from "node:crypto";
import { BUILD_SECRET } from "@/generated/build-secret";
import { SUPABASE_ROOT_CA } from "@/lib/db/supabase-ca";
import { cleanChiefName } from "@/lib/validate";

export type FoundationEnv = {
  pin: string | null;
  pinProblem: "missing" | "invalid" | null;
  /**
   * Signs sessions and hashes visitors: FOUNDATION_SECRET when it is at least 32 characters, else one derived from
   * the Supabase Marketplace's SUPABASE_JWT_SECRET (deriveSecret), else the build secret.
   */
  secret: string;
  /**
   * FOUNDATION_SECRET, else the secret derived from SUPABASE_JWT_SECRET, never the build secret, or null. At least
   * 32 characters, else null, the same way cronSecret is read. Keys the opt-out list, so it is fixed for the life of
   * the Foundation.
   */
  fixedSecret: string | null;
  onVercel: boolean;
  /**
   * Off Vercel, the request header a proxy in front of the app writes the visitor's address into, lowercased
   * (FOUNDATION_CLIENT_IP_HEADER). Null means no header is trusted and every visitor shares one sign-in limit.
   */
  clientIpHeader: string | null;
  businessName: string;
  /** The chief of staff's name setup saved (FOUNDATION_CHIEF_NAME), seeded into the profile once. Empty when unset or not a name. */
  chiefName: string;
  dataDir: string;
  /** Lets the host's schedule run the checks. At least 16 characters, else null, and null means the cron route refuses everyone. */
  cronSecret: string | null;
  /**
   * The hosted database. FOUNDATION_DATABASE_URL, else the Supabase Marketplace's address (marketplaceDatabaseUrl).
   * Set and well formed turns it on everywhere.
   */
  databaseUrl: string | null;
  /** invalid: not a postgres address. insecure: its sslmode turns off the server certificate check. */
  databaseProblem: "invalid" | "insecure" | null;
  /**
   * PEM certificate authority for the hosted database: FOUNDATION_DATABASE_CA, else Supabase's root certificate when
   * the database host ends .supabase.com, else null (Node's public authorities).
   */
  databaseCa: string | null;
  /** The Supabase project's https origin, for email sign-in. */
  supabaseUrl: string | null;
  /** A new secret API key (sb_secret_...). An old service_role JWT is reported in supabaseKeyProblem, never used. */
  supabaseSecretKey: string | null;
  supabaseKeyProblem: "legacy" | null;
  /** FOUNDATION_SECRET is set and long enough to sign with, so sessions survive a new deploy. Email sign-in needs it. */
  secretExplicit: boolean;
  /** FOUNDATION_DEMO_DEPLOY is exactly "on": this deploy is Light Brands' public demo. */
  demoDeploy: boolean;
};

export const PIN_FORMAT = /^\d{6,12}$/;
export const FIXED_SECRET_MIN = 32;

// sslmode values that skip the server certificate check (libpq's require checks nothing either).
const INSECURE_SSLMODES = new Set(["disable", "allow", "prefer", "require", "no-verify"]);

/** True when a database address asks for TLS without checking the server's certificate, or for no TLS at all. */
export function insecureSslMode(url: string): boolean {
  const q = url.indexOf("?");
  if (q === -1) return false;
  const params = new URLSearchParams(url.slice(q + 1));
  return params.getAll("sslmode").some((m) => INSECURE_SSLMODES.has(m.trim().toLowerCase())) || params.getAll("ssl").some((m) => /^(false|0|disable|no-verify|require|prefer|allow)$/i.test(m.trim()));
}

/**
 * The secret this Foundation signs with when FOUNDATION_SECRET is unset but the Supabase Marketplace gave the
 * project its JWT secret: HMAC-SHA256 of a fixed label under that secret, as 64 hex characters. It is stable for
 * the life of the Supabase project, survives redeploys, and never reveals the JWT secret it came from.
 */
export function deriveSecret(jwtSecret: string): string {
  return createHmac("sha256", jwtSecret).update("foundation-secret:v1").digest("hex");
}

// STEP ZERO: until a real Marketplace install is checked, we assume POSTGRES_URL_NON_POOLING is Supabase's session
// pooler (host ending .pooler.supabase.com, port 5432) and POSTGRES_URL its transaction pooler (port 6543).
const SUPABASE_POOLER = /\.pooler\.supabase\.com$/i;
const SESSION_POOLER_PORT = "5432";
const TRANSACTION_POOLER_PORT = "6543";

/**
 * The database address the Supabase Marketplace integration injected, normalized, or "" when there is none.
 * POSTGRES_URL_NON_POOLING first, then POSTGRES_URL. A Supabase transaction pooler address moves to the session
 * pooler's port, because postgres.js stalls on the transaction pooler. Its sslmode and ssl parameters are removed:
 * the integration writes sslmode=require, which skips the certificate check, and the connection instead verifies
 * the server against databaseCa. An address that is not a URL comes back as given, so readEnv reports it invalid.
 */
export function marketplaceDatabaseUrl(e: Record<string, string | undefined>): string {
  const raw = e.POSTGRES_URL_NON_POOLING?.trim() || e.POSTGRES_URL?.trim() || "";
  if (!raw) return "";
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return raw;
  }
  // STEP ZERO: the transaction pooler (6543) is moved to the session pooler (5432) on the same host.
  if (SUPABASE_POOLER.test(url.hostname) && url.port === TRANSACTION_POOLER_PORT) url.port = SESSION_POOLER_PORT;
  // STEP ZERO: the integration's sslmode is dropped; certificate verification with databaseCa replaces it.
  url.searchParams.delete("sslmode");
  url.searchParams.delete("ssl");
  return url.toString();
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

export function readEnv(e: Record<string, string | undefined> = process.env, buildSecret: string = BUILD_SECRET): FoundationEnv {
  const raw = e.FOUNDATION_PIN?.trim() ?? "";
  const cron = e.CRON_SECRET?.trim() ?? "";
  const own = e.FOUNDATION_SECRET?.trim() ?? "";
  const jwt = e.SUPABASE_JWT_SECRET?.trim() ?? "";
  // FOUNDATION_SECRET always wins. A JWT secret under 32 characters counts as unset, like a short FOUNDATION_SECRET.
  const fixed = own.length >= FIXED_SECRET_MIN ? own : jwt.length >= FIXED_SECRET_MIN ? deriveSecret(jwt) : "";
  const pinProblem = raw === "" ? "missing" : PIN_FORMAT.test(raw) ? null : "invalid";
  // FOUNDATION_DATABASE_URL always wins, even when it is malformed or insecure: it is reported, never replaced.
  const dbRaw = e.FOUNDATION_DATABASE_URL?.trim() || marketplaceDatabaseUrl(e);
  const dbOk = /^postgres(ql)?:\/\/\S+$/.test(dbRaw);
  const dbInsecure = dbOk && insecureSslMode(dbRaw);
  let supabaseUrl: string | null = null;
  try {
    const u = new URL(e.FOUNDATION_SUPABASE_URL?.trim() || e.SUPABASE_URL?.trim() || "");
    if (u.protocol === "https:") supabaseUrl = u.origin;
  } catch { /* not set or not an address */ }
  const key = e.FOUNDATION_SUPABASE_SECRET_KEY?.trim() || e.SUPABASE_SECRET_KEY?.trim() || "";
  return {
    pin: pinProblem ? null : raw,
    pinProblem,
    // A FOUNDATION_SECRET under 32 characters counts as unset everywhere, session signing included.
    secret: fixed.length >= FIXED_SECRET_MIN ? fixed : buildSecret,
    fixedSecret: fixed.length >= FIXED_SECRET_MIN ? fixed : null,
    onVercel: e.VERCEL === "1",
    clientIpHeader: /^[A-Za-z0-9-]{1,64}$/.test(e.FOUNDATION_CLIENT_IP_HEADER?.trim() ?? "") ? (e.FOUNDATION_CLIENT_IP_HEADER as string).trim().toLowerCase() : null,
    businessName: e.FOUNDATION_BUSINESS_NAME?.trim() || "Your business",
    chiefName: ((c) => (c.ok ? c.value : ""))(cleanChiefName(e.FOUNDATION_CHIEF_NAME)),
    dataDir: e.FOUNDATION_DATA_DIR?.trim() || ".data/pglite",
    cronSecret: cron.length >= 16 ? cron : null,
    databaseUrl: dbOk && !dbInsecure ? dbRaw : null,
    databaseProblem: dbRaw && !dbOk ? "invalid" : dbInsecure ? "insecure" : null,
    // STEP ZERO: Supabase's database hosts are assumed to present certificates signed by its root (supabase-ca.ts).
    databaseCa: e.FOUNDATION_DATABASE_CA?.trim() || (/\.supabase\.com$/i.test(hostOf(dbRaw)) ? SUPABASE_ROOT_CA : null),
    supabaseUrl,
    // Only the new secret keys (sb_secret_...) are accepted. An old service_role JWT is reported, not used.
    supabaseSecretKey: /^sb_secret_\S+$/.test(key) ? key : null,
    supabaseKeyProblem: key.startsWith("eyJ") ? "legacy" : null,
    secretExplicit: own.length >= FIXED_SECRET_MIN,
    demoDeploy: e.FOUNDATION_DEMO_DEPLOY === "on",
  };
}
