import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// The per-message unsubscribe link on marketing email, served at /u/<token>. The token is the outbox row's
// id and an HMAC of it under FOUNDATION_SECRET, so it names a row and never the address, and it cannot be
// made for a row without the secret.

const TOKEN = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.([A-Za-z0-9_-]{43})$/;
export const UNSUBSCRIBE_TOKEN_MAX = 80;

function sign(id: string, secret: string): string {
  return createHmac("sha256", `foundation:unsubscribe:v1:${secret}`).update(id).digest("base64url");
}

export function unsubscribeToken(id: string, secret: string): string {
  if (!secret) throw new Error("An unsubscribe link needs FOUNDATION_SECRET.");
  return `${id.toLowerCase()}.${sign(id.toLowerCase(), secret)}`;
}

/** The outbox id a token was made for, or null for anything forged, oversized or made under another secret. */
export function readUnsubscribeToken(token: string, secret: string | null | undefined): string | null {
  if (!secret || typeof token !== "string" || token.length > UNSUBSCRIBE_TOKEN_MAX) return null;
  const m = TOKEN.exec(token);
  if (!m) return null;
  const want = Buffer.from(sign(m[1], secret));
  const got = Buffer.from(m[2]);
  return want.length === got.length && timingSafeEqual(want, got) ? m[1] : null;
}

/** The https origin a link may point at, or null. Anything with a path, a query or plain http is refused. */
export function httpsOrigin(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" && !u.username && !u.password ? u.origin : null;
  } catch {
    return null;
  }
}

/**
 * The live site's address. FOUNDATION_URL wins when it is set, and one that is not a plain https address
 * gives null, never a fallback. Else the host's own setting on Vercel. Null on the owner's computer.
 */
export function publicBaseUrl(env: Record<string, string | undefined> = process.env): string | null {
  const own = env.FOUNDATION_URL?.trim() ?? "";
  if (own) return httpsOrigin(own);
  const host = env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ?? "";
  if (!/^[a-z0-9.-]+(:\d+)?$/i.test(host)) return null;
  return httpsOrigin(`https://${host}`);
}

export function unsubscribeUrl(baseUrl: string, id: string, secret: string): string {
  const origin = httpsOrigin(baseUrl);
  if (!origin) throw new Error("An unsubscribe link needs an https address.");
  return `${origin}/u/${unsubscribeToken(id, secret)}`;
}
