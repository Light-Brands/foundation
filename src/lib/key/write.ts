import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { parse, stringify } from "yaml";
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

export function keyRoot(): string {
  return process.env.FOUNDATION_KEY_ROOT?.trim() || process.cwd();
}
