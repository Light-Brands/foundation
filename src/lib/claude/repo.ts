import "server-only";
import fs from "node:fs";
import path from "node:path";

const NAME = /^[A-Za-z0-9_.-]+$/;

/** A GitHub owner or repo name: plain characters, and not made only of dots. */
function isName(s: string): boolean {
  return NAME.test(s) && !/^\.+$/.test(s);
}

/** owner/name from a GitHub remote address, or null for anything else. */
export function parseRemote(url: string): string | null {
  const m = /^(?:git@github\.com:|https:\/\/github\.com\/)([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/.exec(url.trim());
  if (!m || !isName(m[1]) || !isName(m[2])) return null;
  return `${m[1]}/${m[2]}`;
}

/** The repo and folder an Open in link targets. On Vercel the folder is the owner's to name, in their browser. */
export function resolveRepo(env: Partial<NodeJS.ProcessEnv>, readRemote: () => string | null, cwd: string | null, onVercel: boolean) {
  const owner = env.VERCEL_GIT_REPO_OWNER, slug = env.VERCEL_GIT_REPO_SLUG;
  const fromVercel = owner && slug && isName(owner) && isName(slug) ? `${owner}/${slug}` : null;
  const remote = readRemote();
  const repo = fromVercel ?? (remote ? parseRemote(remote) : null);
  const folder = onVercel ? null : cwd;
  const label = repo ? repo.split("/")[1] : folder ? path.basename(folder) : "your Foundation";
  return { repo, folder, label };
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** The folder goes to the browser only for a local session reached on this computer. Anywhere else the owner names it once. */
export function localFolder(folder: string | null, host: string | null, onVercel: boolean): string | null {
  if (!folder || !host || onVercel) return null;
  const name = host.startsWith("[") ? host.slice(0, host.indexOf("]") + 1) : host.split(":")[0];
  return LOCAL_HOSTS.has(name.toLowerCase()) ? folder : null;
}

/** The url of the `origin` remote in git config text, or null. */
export function originFromConfig(text: string): string | null {
  let inOrigin = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith("[")) {
      inOrigin = /^\[remote\s+"origin"\]$/.test(line);
      continue;
    }
    const m = inOrigin ? /^url\s*=\s*(.+)$/.exec(line) : null;
    if (m) return m[1].trim();
  }
  return null;
}

/** Reads origin's url from the files in .git, for a plain checkout or a worktree. Any failure gives null. */
export function readOriginUrl(cwd: string): string | null {
  try {
    const dot = path.join(cwd, ".git");
    let configDir = dot;
    if (fs.statSync(dot).isFile()) {
      const m = /^gitdir:\s*(.+)$/m.exec(fs.readFileSync(dot, "utf8"));
      if (!m) return null;
      const gitdir = path.resolve(cwd, m[1].trim());
      configDir = gitdir;
      try {
        configDir = path.resolve(gitdir, fs.readFileSync(path.join(gitdir, "commondir"), "utf8").trim());
      } catch {
        configDir = gitdir;
      }
    }
    return originFromConfig(fs.readFileSync(path.join(configDir, "config"), "utf8"));
  } catch {
    return null;
  }
}

let cached: Promise<ReturnType<typeof resolveRepo>> | null = null;

export function repoWhere() {
  cached ??= Promise.resolve().then(() => {
    const onVercel = process.env.VERCEL === "1";
    if (onVercel) return resolveRepo(process.env, () => null, null, true);
    let cwd: string | null = null;
    try {
      cwd = process.cwd();
    } catch {
      cwd = null;
    }
    return resolveRepo(process.env, () => (cwd ? readOriginUrl(cwd) : null), cwd, false);
  });
  return cached;
}
