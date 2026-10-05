import { readDeclarations, type Declarations } from "./declarations";
import { keyRoot } from "./write";

const cache = new Map<string, Promise<Declarations>>();
const warned = new Set<string>();

// Say what is wrong with the Key once per process, so a bad declaration is visible in the logs without flooding them.
async function readOnce(root: string): Promise<Declarations> {
  const d = await readDeclarations(root);
  if (!warned.has(root)) {
    warned.add(root);
    for (const p of d.problems) console.warn(`Key declaration problem: ${p}`);
    for (const w of d.warnings) console.warn(`Key declaration note: ${w}`);
  }
  return d;
}

/**
 * The installed Key's declarations for the running app, with anything invalid already dropped.
 * A deployed app never changes its Key, so production reads it once per process. Everywhere else it
 * reads every time, so a run's new declarations show up without a restart.
 */
export function loadDeclarations(root: string = keyRoot()): Promise<Declarations> {
  if (process.env.NODE_ENV !== "production") return readOnce(root);
  let hit = cache.get(root);
  if (!hit) {
    hit = readOnce(root).catch((err) => {
      cache.delete(root);
      throw err;
    });
    cache.set(root, hit);
  }
  return hit;
}
