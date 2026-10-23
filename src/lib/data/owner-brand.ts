import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { DEFAULT_BRAND, brandLayerProblems, cleanBrandLayer, parseBrand, type BrandTokens } from "@/lib/brand/tokens";
import { keyRoot } from "@/lib/key/write";

// The owner's own look: key/brand.yaml, any subset of the brand fields by their names, layered over DEFAULT_BRAND
// and under the saved core_brand row. The Key is the owner's, so an update never overwrites it, and the Foundation's
// defaults stay as they ship. next.config.ts traces key/** into the deployed build, so the file is read from disk at
// runtime on Vercel the same way the Key's declarations are.

export const OWNER_BRAND_FILE = "key/brand.yaml";

const warned = new Set<string>();
const cache = new Map<string, Promise<BrandTokens>>();

// Name each problem once per process, so a bad value is visible in the server log without flooding it.
function warnOnce(problem: string): void {
  const line = `${OWNER_BRAND_FILE}: ${problem}`;
  if (warned.has(line)) return;
  warned.add(line);
  console.warn(line);
}

/** Reads the owner's layer under root. No file gives the default; a bad file or value is ignored and named once. */
export async function readOwnerBrand(root: string = keyRoot()): Promise<BrandTokens> {
  let text: string;
  try {
    text = await readFile(path.join(root, OWNER_BRAND_FILE), "utf8");
  } catch {
    return DEFAULT_BRAND;
  }
  let data: unknown;
  try {
    data = parse(text);
  } catch (err) {
    warnOnce(`not valid YAML (${(err as Error).message.split("\n")[0]}), so the default brand is used`);
    return DEFAULT_BRAND;
  }
  for (const p of brandLayerProblems(data)) warnOnce(p);
  return parseBrand(cleanBrandLayer(data), DEFAULT_BRAND);
}

/**
 * The owner's layer for the running app. A deployed app never changes its Key, so production reads it once per
 * process; everywhere else it reads every time, so an edit shows on the next page load.
 */
export function loadOwnerBrand(root: string = keyRoot()): Promise<BrandTokens> {
  if (process.env.NODE_ENV !== "production") return readOwnerBrand(root);
  let hit = cache.get(root);
  if (!hit) {
    hit = readOwnerBrand(root);
    cache.set(root, hit);
  }
  return hit;
}
