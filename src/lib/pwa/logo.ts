import { readFile } from "node:fs/promises";
import path from "node:path";

const TYPES: Record<string, string> = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml" };
const MAX_BYTES = 1_000_000;

/**
 * Where a logo can be fetched from, decided without looking at the request. An https address passes as it is.
 * A site-relative path joins the configured site address. Anything else gives null.
 */
export function resolveLogoUrl(logoUrl: string | null, base: string | null): string | null {
  if (!logoUrl) return null;
  try {
    if (logoUrl.startsWith("/") && !logoUrl.startsWith("//")) {
      if (!base) return null;
      const u = new URL(logoUrl, base);
      return u.origin === new URL(base).origin ? u.toString() : null;
    }
    const u = new URL(logoUrl);
    return u.protocol === "https:" && !u.username && !u.password ? u.toString() : null;
  } catch {
    return null;
  }
}

function dataUri(type: string, bytes: Uint8Array): string {
  return `data:${type};base64,${Buffer.from(bytes).toString("base64")}`;
}

/** A logo file shipped in public/, as a data address. Paths that leave public/ give null. */
export async function readPublicLogo(logoUrl: string, publicDir: string): Promise<string | null> {
  try {
    const rel = decodeURIComponent(logoUrl.split(/[?#]/)[0]!);
    const type = TYPES[path.extname(rel).toLowerCase()];
    if (!type) return null;
    const root = path.resolve(publicDir);
    const file = path.resolve(root, `.${rel}`);
    if (!file.startsWith(root + path.sep)) return null;
    const bytes = await readFile(file);
    return bytes.length <= MAX_BYTES ? dataUri(type, bytes) : null;
  } catch {
    return null;
  }
}

/** The logo as a data address the image engine can draw without a network request of its own, or null. */
export async function loadLogo(logoUrl: string | null, opts: { base: string | null; publicDir: string }): Promise<string | null> {
  if (!logoUrl) return null;
  if (logoUrl.startsWith("/") && !logoUrl.startsWith("//")) {
    const local = await readPublicLogo(logoUrl, opts.publicDir);
    if (local) return local;
  }
  const url = resolveLogoUrl(logoUrl, opts.base);
  if (!url) return null;
  try {
    const res = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(3000) });
    const type = (res.headers.get("content-type") ?? "").split(";")[0]!.trim().toLowerCase();
    if (!res.ok || !Object.values(TYPES).includes(type)) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    return bytes.length <= MAX_BYTES ? dataUri(type, bytes) : null;
  } catch (err) {
    console.error("pwa icon: the logo could not be loaded, painting the monogram", err);
    return null;
  }
}
