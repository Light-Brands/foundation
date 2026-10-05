import type { FoundationEnv } from "@/lib/env";
import { pinMatches, signSession } from "@/lib/auth/pin-token";

const PUBLIC = [/^\/gate$/, /^\/api\/gate$/, /^\/contact$/, /^\/_next\//, /^\/favicon\.ico$/];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC.some((re) => re.test(pathname));
}

const ORIGIN = "http://gate.local";

export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || /[\u0000-\u001f\u007f\\]/.test(next)) return "/";
  let url: URL;
  try {
    url = new URL(next, ORIGIN);
  } catch {
    return "/";
  }
  if (url.origin !== ORIGIN) return "/";
  const path = url.pathname + url.search + url.hash;
  return path.startsWith("//") ? "/" : path;
}

export async function handleGatePost(
  body: unknown,
  env: FoundationEnv,
  now: number = Date.now(),
): Promise<{ status: 200 | 400 | 401 | 503; token?: string; error?: string }> {
  if (!env.pin) return { status: 503, error: "setup" };
  const pin = (body as { pin?: unknown } | null)?.pin;
  if (typeof pin !== "string" || pin.length > 32) return { status: 400, error: "bad-request" };
  if (!(await pinMatches(pin, env.pin))) return { status: 401, error: "wrong-pin" };
  return { status: 200, token: await signSession(env.pin, env.secret, now) };
}
