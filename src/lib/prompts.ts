import { readFile } from "node:fs/promises";
import path from "node:path";

export const PROMPT_NAME = /^[a-z0-9-]+(\/[a-z0-9-]+)*$/;

export async function readPrompt(name: string): Promise<string> {
  if (!PROMPT_NAME.test(name)) throw new Error(`Unknown prompt: ${name}`);
  const root = path.join(process.cwd(), "prompts");
  const file = path.join(root, `${name}.md`);
  if (!file.startsWith(root + path.sep)) throw new Error(`Unknown prompt: ${name}`);
  return readFile(file, "utf8");
}
