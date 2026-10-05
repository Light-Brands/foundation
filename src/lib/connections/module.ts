import { realpath } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { connectionsDir } from "@/lib/hooks/declaration";
import { SLUG } from "@/lib/key/frontmatter";

// The one loader for code a connection keeps in key/connections/<connection>/: the email sender (send.ts) and
// the connection test (test.ts). Loaded the way loadVerifier loads a webhook verifier: only when the real paths
// of the folder and the file stay inside key/, so a symlink can never pull code in from elsewhere.

export type LoadedModule = { mod: Record<string, unknown> } | { problem: "missing" | "outside" } | { problem: "broken"; error: string };

const firstLine = (err: unknown): string => (err instanceof Error ? err.message : String(err)).split("\n")[0].slice(0, 200);

/** Never throws: a missing, escaping or broken module gives a problem the caller words. */
export async function loadConnectionModule(root: string, connection: string, file: string): Promise<LoadedModule> {
  if (!SLUG.test(connection)) return { problem: "missing" };
  let key: string;
  let dir: string;
  let real: string;
  try {
    key = await realpath(path.join(root, "key"));
    dir = await realpath(path.join(connectionsDir(root), connection));
    real = await realpath(path.join(dir, file));
  } catch {
    return { problem: "missing" };
  }
  if (!dir.startsWith(key + path.sep) || !real.startsWith(dir + path.sep)) return { problem: "outside" };
  try {
    return { mod: (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ pathToFileURL(real).href)) as Record<string, unknown> };
  } catch (err) {
    return { problem: "broken", error: firstLine(err) };
  }
}
