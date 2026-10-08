import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";

const TYPES: Record<string, string> = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml" };
export const LOGO_MAX_BYTES = 1_000_000;
const MAX_BYTES = LOGO_MAX_BYTES;
/** How long a fetched logo, or a failed fetch, is remembered by a running copy of the site. */
const REMEMBER_MS = 10 * 60_000;

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
    // A link inside public/ may point anywhere, so the file must be a plain file whose real path stays inside.
    if (!(await lstat(file)).isFile()) return null;
    const [realRoot, realFile] = await Promise.all([realpath(root), realpath(file)]);
    if (!realFile.startsWith(realRoot + path.sep)) return null;
    const bytes = await readFile(realFile);
    return bytes.length <= MAX_BYTES ? dataUri(type, bytes) : null;
  } catch {
    return null;
  }
}

/** The body, read chunk by chunk, or null as soon as it passes max bytes (the rest is never downloaded). */
async function readCapped(res: Response, max: number): Promise<Uint8Array | null> {
  const declared = Number(res.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > max) {
    await res.body?.cancel().catch(() => {});
    return null;
  }
  if (!res.body) return new Uint8Array(0);
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.byteLength;
  }
  return out;
}

async function fetchLogo(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(3000) });
    const type = (res.headers.get("content-type") ?? "").split(";")[0]!.trim().toLowerCase();
    if (!res.ok || !Object.values(TYPES).includes(type)) {
      await res.body?.cancel().catch(() => {});
      return null;
    }
    const bytes = await readCapped(res, MAX_BYTES);
    return bytes ? dataUri(type, bytes) : null;
  } catch (err) {
    console.error("pwa icon: the logo could not be loaded, painting the monogram", err);
    return null;
  }
}

// One remembered answer per logo address, the fetch itself while it runs, so any number of visitors asking for the
// icon at once, or again within REMEMBER_MS, cause one fetch. The address comes from the brand, never the request.
const remembered = new Map<string, { at: number; value: Promise<string | null> }>();

export function clearLogoCache(): void {
  remembered.clear();
}

/** The logo as a data address the image engine can draw without a network request of its own, or null. */
export async function loadLogo(logoUrl: string | null, opts: { base: string | null; publicDir: string }, now: number = Date.now()): Promise<string | null> {
  if (!logoUrl) return null;
  if (logoUrl.startsWith("/") && !logoUrl.startsWith("//")) {
    const local = await readPublicLogo(logoUrl, opts.publicDir);
    if (local) return local;
  }
  const url = resolveLogoUrl(logoUrl, opts.base);
  if (!url) return null;
  const hit = remembered.get(url);
  if (hit && now - hit.at < REMEMBER_MS) return hit.value;
  for (const [k, v] of remembered) if (now - v.at >= REMEMBER_MS) remembered.delete(k);
  const value = fetchLogo(url);
  remembered.set(url, { at: now, value });
  return value;
}
