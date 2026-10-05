import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { stringify } from "yaml";
import type { ContextBlock } from "./context-block";

export async function writeContextBlock(root: string, block: ContextBlock): Promise<void> {
  const dir = path.join(root, "key", "knowledge");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "context-block.yaml"), stringify(block), "utf8");
}
