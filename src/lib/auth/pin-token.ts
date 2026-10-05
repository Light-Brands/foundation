import "server-only";
// The session is "v1.<expiry ms>.<HMAC>". The HMAC key is derived from the PIN
// and the server secret, so only someone who knows both the PIN and the secret
// can mint a session. Changing the PIN or the secret signs everyone out.
// Web Crypto runs in the proxy and in Node.

export const SESSION_COOKIE = "fc_session";
export const SESSION_HOURS = 8;

const enc = new TextEncoder();

async function keyFor(pin: string, secret: string): Promise<CryptoKey> {
  const raw = await crypto.subtle.digest("SHA-256", enc.encode(`foundation:v1:${secret}:${pin}`));
  return crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

function toB64url(buf: ArrayBuffer): string {
  let s = "";
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(s)) return null;
  const pad = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  try {
    return Uint8Array.from(atob(pad), (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

export async function signSession(pin: string, secret: string, now: number = Date.now()): Promise<string> {
  const exp = now + SESSION_HOURS * 3600_000;
  const sig = await crypto.subtle.sign("HMAC", await keyFor(pin, secret), enc.encode(`v1.${exp}`));
  return `v1.${exp}.${toB64url(sig)}`;
}

export async function verifySession(
  token: string | undefined,
  pin: string,
  secret: string,
  now: number = Date.now(),
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1" || !/^\d+$/.test(parts[1])) return false;
  const exp = Number(parts[1]);
  if (!Number.isSafeInteger(exp) || exp < now) return false;
  const sig = fromB64url(parts[2]);
  if (!sig) return false;
  return crypto.subtle.verify("HMAC", await keyFor(pin, secret), sig as BufferSource, enc.encode(`v1.${exp}`));
}

export async function pinMatches(candidate: string, pin: string): Promise<boolean> {
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(candidate)),
    crypto.subtle.digest("SHA-256", enc.encode(pin)),
  ]);
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}
