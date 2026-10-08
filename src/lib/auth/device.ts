// A known device: a browser that has signed in with the right PIN before. It carries "d1.<id>.<HMAC>", where id is
// 16 random bytes and the HMAC key comes from the session secret (FOUNDATION_SECRET), so only this command center can
// mint one, and changing FOUNDATION_SECRET forgets every device at once. A known device's PIN tries skip the site's
// shared budget, so a stranger spending that budget can never stall the owner, and are held to the device's own
// limit instead. The signature is checked with crypto.subtle.verify, which compares in constant time.

export const DEVICE_COOKIE = "fc_device";
export const DEVICE_DAYS = 180;
/** The device cookie goes only to the sign-in route, the one place that reads it. */
export const DEVICE_PATH = "/api/gate";

const enc = new TextEncoder();
const ID = /^[A-Za-z0-9_-]{22}$/;

async function keyFor(secret: string): Promise<CryptoKey> {
  const raw = await crypto.subtle.digest("SHA-256", enc.encode(`foundation:device:v1:${secret}`));
  return crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

function toB64url(buf: ArrayBuffer | Uint8Array): string {
  let s = "";
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(s)) return null;
  try {
    return Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

/** A signed device token: for a new device, or for the id it already has so the cookie is renewed. */
export async function signDevice(secret: string, id: string = toB64url(crypto.getRandomValues(new Uint8Array(16)))): Promise<string> {
  const sig = await crypto.subtle.sign("HMAC", await keyFor(secret), enc.encode(`d1.${id}`));
  return `d1.${id}.${toB64url(sig)}`;
}

/** The device id when the token is one this secret signed, else null. */
export async function verifyDevice(token: string | undefined | null, secret: string): Promise<string | null> {
  const parts = token?.split(".") ?? [];
  if (parts.length !== 3 || parts[0] !== "d1" || !ID.test(parts[1])) return null;
  const sig = fromB64url(parts[2]);
  if (!sig || sig.length !== 32) return null;
  const ok = await crypto.subtle.verify("HMAC", await keyFor(secret), sig as BufferSource, enc.encode(`d1.${parts[1]}`));
  return ok ? parts[1] : null;
}

/** The value of one cookie in a Cookie header. */
export function readCookie(header: string | null, name: string): string | null {
  for (const part of (header ?? "").split(";")) {
    const at = part.indexOf("=");
    if (at > 0 && part.slice(0, at).trim() === name) return part.slice(at + 1).trim();
  }
  return null;
}
