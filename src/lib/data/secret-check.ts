import { createHmac, timingSafeEqual } from "node:crypto";
import type { Queryable } from "@/lib/db/types";

// The opt-out list is keyed by FOUNDATION_SECRET, so a forgotten person's opt-out matches only under the secret it
// was written with. Core keeps a keyed fingerprint of that secret, written on the first keyed use, and every keyed
// reader and writer (optOut, isOptedOut, the outbox claim, export and forget) compares today's secret against it
// first. A mismatch, or a fingerprint that cannot be read, refuses: nothing is checked, recorded or sent.

export const SECRET_MISMATCH = "This Foundation's secret does not match the one it started with. Use the same FOUNDATION_SECRET everywhere.";
export const FINGERPRINT_KEY = "secret_fingerprint";
const LABEL = "foundation-fingerprint";

export class SecretMismatchError extends Error {
  constructor() {
    super(SECRET_MISMATCH);
    this.name = "SecretMismatchError";
  }
}

/** HMAC-SHA256 under the secret of a fixed label. It tells two secrets apart and never reveals either. */
export function secretFingerprint(secret: string): string {
  return createHmac("sha256", secret).update(LABEL).digest("hex");
}

/**
 * Records the fingerprint when none is stored yet, then compares. Throws SecretMismatchError unless the stored
 * fingerprint is this secret's. A database error passes through, so a caller that cannot read it refuses too.
 */
export async function checkSecretFingerprint(db: Queryable, secret: string): Promise<void> {
  const mine = secretFingerprint(secret);
  await db.query("insert into core_settings (key, value) values ($1, $2) on conflict (key) do nothing", [FINGERPRINT_KEY, mine]);
  const [row] = await db.query<{ value: string }>("select value from core_settings where key = $1", [FINGERPRINT_KEY]);
  const a = Buffer.from(String(row?.value ?? ""));
  const b = Buffer.from(mine);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new SecretMismatchError();
}
