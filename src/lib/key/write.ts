import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { isMap, parse, parseDocument, stringify } from "yaml";
import type { ContextBlock } from "./context-block";

/** Write a temp file in the same folder, then rename it into place, so a reader never sees half a file. */
async function writeAtomic(file: string, text: string): Promise<void> {
  const tmp = path.join(path.dirname(file), `.${path.basename(file)}.${randomBytes(6).toString("hex")}.tmp`);
  try {
    await writeFile(tmp, text, "utf8");
    await rename(tmp, file);
  } catch (err) {
    await unlink(tmp).catch(() => {});
    throw err;
  }
}

export async function writeContextBlock(root: string, block: ContextBlock): Promise<void> {
  const dir = path.join(root, "key", "knowledge");
  await mkdir(dir, { recursive: true });
  await writeAtomic(path.join(dir, "context-block.yaml"), stringify(block));
}

/** Set `name` in key/key.yaml to the business name. `client` is the identity set once at setup and stays. */
export async function writeKeyName(root: string, name: string): Promise<void> {
  const file = path.join(root, "key", "key.yaml");
  let text: string;
  try {
    text = await readFile(file, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return;
    throw err;
  }
  const key = parse(text);
  if (typeof key !== "object" || key === null || Array.isArray(key)) throw new Error("key/key.yaml must be a mapping");
  await writeAtomic(file, stringify({ ...key, name }));
}

export type BaseResult =
  | { status: "set" | "same"; base: string }
  | { status: "kept"; base: string }
  | { status: "moved"; base: string; was: string };

/**
 * Set provenance.base in key/key.yaml, the commit the build log starts after.
 * A missing base is set. An existing one is kept unless `force`. Every other field stays as written.
 */
export async function setKeyBase(root: string, sha: string, opts: { force?: boolean } = {}): Promise<BaseResult> {
  const file = path.join(root, "key", "key.yaml");
  const doc = parseDocument(await readFile(file, "utf8"));
  if (doc.errors.length) throw new Error(`key/key.yaml is not valid YAML (${doc.errors[0].message.split("\n")[0]})`);
  if (!isMap(doc.contents)) throw new Error("key/key.yaml must be a mapping");
  const current = doc.getIn(["provenance", "base"]);
  const was = typeof current === "string" ? current : current == null ? "" : String(current);
  if (was === sha) return { status: "same", base: sha };
  if (was && !opts.force) return { status: "kept", base: was };
  doc.setIn(["provenance", "base"], sha);
  await writeAtomic(file, doc.toString());
  return was ? { status: "moved", base: sha, was } : { status: "set", base: sha };
}

export function keyRoot(): string {
  return process.env.FOUNDATION_KEY_ROOT?.trim() || process.cwd();
}
