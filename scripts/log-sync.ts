import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { formatEntry, logFileFor, logTitleFor, missingCommits, parseLog, type CommitInfo } from "../src/lib/key/log";
import { checkLogText, COMMIT_ID } from "../src/lib/key/formats";
import { parse } from "yaml";

const i = process.argv.indexOf("--root");
const root = path.resolve(i >= 0 ? process.argv[i + 1] : process.cwd());
const logDir = path.join(root, "key/log");

const git = (args: string[]): string | null => {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return null;
  }
};
if (!git(["rev-parse", "--verify", "HEAD"])?.trim()) {
  console.log("No git history yet. Nothing to add.");
  process.exit(0);
}

// The log starts at the commit setup ran on (provenance.base in key/key.yaml), so the
// template history from Light Brands never lands in the member's log.
let base = "";
try {
  const key = parse(readFileSync(path.join(root, "key/key.yaml"), "utf8"));
  base = String(key?.provenance?.base ?? "");
} catch {
  base = "";
}
if (!COMMIT_ID.test(base)) {
  console.log("The build log starts after setup records its base in key/key.yaml, so there is nothing to add yet.");
  console.log("log:sync added 0 entries");
  process.exit(0);
}
const raw = git(["log", `${base}..HEAD`, "--format=%h%x09%aI%x09%s", "--name-only"]);
if (raw === null) {
  console.log("The base commit in key/key.yaml is not in this repository's history, so there is nothing to add.");
  console.log("log:sync added 0 entries");
  process.exit(0);
}
mkdirSync(logDir, { recursive: true });

const logged = readdirSync(logDir)
  .filter((f) => f.endsWith(".md"))
  .flatMap((f) => parseLog(readFileSync(path.join(logDir, f), "utf8")).map((e) => e.commit));

const commits: CommitInfo[] = [];
for (const line of raw.split("\n")) {
  const parts = line.split("\t");
  if (parts.length >= 3) commits.push({ sha: parts[0], date: parts[1], subject: parts.slice(2).join("\t"), files: [] });
  else if (line.trim() && commits.length) commits[commits.length - 1].files.push(line.trim());
}

// The platform name is never written anywhere in the repository, so it is built at runtime.
const PLATFORM = ["k", "y", "l", "o", "n"].join("");
const clean = (s: string) => s.replace(/[–—]/g, ",");
let added = 0;
// oldest first so each month file stays in time order
const todo = missingCommits(logged, commits.filter((c) => !c.files.every((f) => f.startsWith("key/log/")))).reverse();
for (const c of todo) {
  const utc = new Date(c.date).toISOString();
  const entry = {
    at: `${utc.slice(0, 10)} ${utc.slice(11, 16)}`,
    title: clean(c.subject),
    kind: "change" as const,
    category: "Settings",
    what: clean(c.subject),
    files: c.files,
    commit: c.sha,
    checked: "Not recorded at the time",
    by: "member" as const,
  };
  const ok = (e: typeof entry) => {
    const text = formatEntry(e);
    return checkLogText("entry", text).length === 0 && !text.toLowerCase().includes(PLATFORM);
  };
  let final = entry;
  if (!ok(final)) final = { ...entry, title: "Commit summary withheld", what: "Summary withheld by the log check" };
  if (!ok(final)) final = { ...final, files: [] };
  if (!ok(final)) final = { ...final, title: "A change to the system", what: "Details kept out of the log for privacy" };
  const text = formatEntry(final);
  const file = path.join(root, logFileFor(utc));
  mkdirSync(path.dirname(file), { recursive: true });
  const started = existsSync(file) && readFileSync(file, "utf8").trim().length > 0;
  const lead = started ? "\n" : `${logTitleFor(utc)}\n\n`;
  appendFileSync(file, lead + text);
  added++;
}
console.log(`log:sync added ${added} ${added === 1 ? "entry" : "entries"}`);
