import "server-only";
import { execFile } from "node:child_process";
import path from "node:path";

const NAME = /^[A-Za-z0-9_.-]+$/;

/** owner/name from a GitHub remote address, or null for anything else. */
export function parseRemote(url: string): string | null {
  const m = /^(?:git@github\.com:|https:\/\/github\.com\/)([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/.exec(url.trim());
  if (!m || !NAME.test(m[1]) || !NAME.test(m[2])) return null;
  return `${m[1]}/${m[2]}`;
}

/** The repo and folder an Open in link targets. On Vercel the folder is the owner's to name, in their browser. */
export function resolveRepo(env: Partial<NodeJS.ProcessEnv>, readRemote: () => string | null, cwd: string | null, onVercel: boolean) {
  const owner = env.VERCEL_GIT_REPO_OWNER, slug = env.VERCEL_GIT_REPO_SLUG;
  const fromVercel = owner && slug && NAME.test(owner) && NAME.test(slug) ? `${owner}/${slug}` : null;
  const remote = readRemote();
  const repo = fromVercel ?? (remote ? parseRemote(remote) : null);
  const folder = onVercel ? null : cwd;
  const label = repo ? repo.split("/")[1] : folder ? path.basename(folder) : "your Foundation";
  return { repo, folder, label };
}

let cached: Promise<ReturnType<typeof resolveRepo>> | null = null;

export function repoWhere() {
  cached ??= new Promise((resolve) => {
    const onVercel = process.env.VERCEL === "1";
    if (onVercel) return resolve(resolveRepo(process.env, () => null, null, true));
    execFile("git", ["remote", "get-url", "origin"], { cwd: process.cwd(), timeout: 2000 }, (err, out) => {
      resolve(resolveRepo(process.env, () => (err ? null : String(out)), process.cwd(), false));
    });
  });
  return cached;
}
