import type { FoundationEnv } from "@/lib/env";
import { pinMatches, signSession } from "@/lib/auth/pin-token";
import type { GateLimiter } from "@/lib/auth/limit";

export const ADMIN = "/admin";

const PUBLIC = [/^\/$/, /^\/admin\/login$/, /^\/api\/gate$/, /^\/contact$/, /^\/f\/[a-z0-9]+(?:-[a-z0-9]+)*$/, /^\/api\/hooks\/[a-z0-9]+(?:-[a-z0-9]+)*$/, /^\/u\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[A-Za-z0-9_-]{43}$/, /^\/_next\/static\//, /^\/_next\/image$/, /^\/favicon\.ico$/, /^\/pwa\/app\.webmanifest$/, /^\/pwa\/(?:icon-192|icon-512|icon-maskable|apple-touch-icon)\.png$/, /^\/sw\.js$/, /^\/offline$/, /^\/robots\.txt$/];

const LEGACY = /^\/(command|attract|sell|deliver|keep|money|team|plan|vendors|risk|system)(\/.*)?$/;

/** Screens that moved under /admin keep working: the old address answers with the new one. */
export function legacyRedirect(pathname: string): string | null {
  if (pathname === "/gate") return `${ADMIN}/login`;
  const brand = /^\/admin\/brand(\/.*)?$/.exec(pathname);
  if (brand) return `${ADMIN}/context${brand[1] ?? ""}`;
  const m = LEGACY.exec(pathname);
  return m ? `${ADMIN}${pathname}` : null;
}

export function isPublicPath(pathname: string): boolean {
  return PUBLIC.some((re) => re.test(pathname));
}

// The host's schedule. Public only to a request carrying Authorization: Bearer <CRON_SECRET>.
export const CRON_PATHS: readonly string[] = ["/api/cron/checks"];

// Compares in time that does not depend on where the texts differ, once their lengths match.
function sameText(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** True only when a secret is set and the header is exactly Bearer <secret>. No secret set means no one. */
export function cronAuthorized(authorization: string | null, cronSecret: string | null): boolean {
  if (!cronSecret || !authorization) return false;
  return sameText(authorization, `Bearer ${cronSecret}`);
}

export function isPublicRequest(pathname: string, authorization: string | null, cronSecret: string | null): boolean {
  if (isPublicPath(pathname)) return true;
  return CRON_PATHS.includes(pathname) && cronAuthorized(authorization, cronSecret);
}

const ORIGIN = "http://gate.local";

export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || /[\u0000-\u001f\u007f\\]/.test(next)) return ADMIN;
  let url: URL;
  try {
    url = new URL(next, ORIGIN);
  } catch {
    return ADMIN;
  }
  if (url.origin !== ORIGIN) return ADMIN;
  const path = url.pathname + url.search + url.hash;
  // The site's root and the sign-in page itself are never where a sign-in lands.
  return path.startsWith("//") || url.pathname === "/" || url.pathname === `${ADMIN}/login` ? ADMIN : path;
}

/**
 * Checks one sign-in. With a limiter, the try is recorded before the PIN is compared, so a burst of tries at once
 * is counted one by one, and a refused try answers 429 with how long to wait.
 */
export async function handleGatePost(
  body: unknown,
  env: FoundationEnv,
  now: number = Date.now(),
  gate?: { limiter: GateLimiter; client: string; device?: string | null },
): Promise<{ status: 200 | 400 | 401 | 429 | 503; token?: string; error?: string; retryAfterMs?: number }> {
  if (!env.pin) return { status: 503, error: "setup" };
  const pin = (body as { pin?: unknown } | null)?.pin;
  if (typeof pin !== "string" || pin.length > 32) return { status: 400, error: "bad-request" };
  if (gate) {
    const d = await gate.limiter.attempt(gate.client, new Date(now), gate.device);
    if (!d.ok) return { status: 429, error: "too-many", retryAfterMs: d.retryAfterMs };
  }
  if (!(await pinMatches(pin, env.pin))) return { status: 401, error: "wrong-pin" };
  if (gate) await gate.limiter.succeed(gate.client, new Date(now), gate.device);
  return { status: 200, token: await signSession(env.pin, env.secret, now) };
}
