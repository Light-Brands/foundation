export type LogEntry = {
  at: string;
  title: string;
  kind: "lesson" | "module" | "connection" | "setup" | "change";
  category: string;
  what: string;
  files: string[];
  commit: string;
  checked: string;
  by: "claude" | "member" | "light-brands";
};

export type CommitInfo = { sha: string; subject: string; files: string[]; date: string };

const KINDS = ["lesson", "module", "connection", "setup", "change"];
const BYS = ["claude", "member", "light-brands"];

export function formatEntry(e: LogEntry): string {
  return [
    `## ${e.at} · ${e.title}`,
    `- Kind: ${e.kind}`,
    `- Category: ${e.category}`,
    `- What changed: ${e.what}`,
    `- Files: ${e.files.join(", ")}`,
    `- Commit: ${e.commit}`,
    `- Checked: ${e.checked}`,
    `- By: ${e.by}`,
    "",
  ].join("\n");
}

export function parseLog(md: string): LogEntry[] {
  const out: LogEntry[] = [];
  for (const block of md.split(/^(?=## )/m)) {
    const head = /^## (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) · (.*)$/m.exec(block);
    if (!head) continue;
    const field = (label: string) => new RegExp(`^- ${label}: ?(.*)$`, "m").exec(block)?.[1].trim() ?? "";
    const kind = field("Kind");
    const by = field("By");
    out.push({
      at: head[1],
      title: head[2].trim(),
      kind: (KINDS.includes(kind) ? kind : "change") as LogEntry["kind"],
      category: field("Category"),
      what: field("What changed"),
      files: field("Files").split(",").map((f) => f.trim()).filter(Boolean),
      commit: field("Commit"),
      checked: field("Checked"),
      by: (BYS.includes(by) ? by : "member") as LogEntry["by"],
    });
  }
  return out;
}

function sameCommit(a: string, b: string): boolean {
  const x = a.trim().toLowerCase();
  const y = b.trim().toLowerCase();
  if (x.length < 4 || y.length < 4) return false;
  return x.startsWith(y) || y.startsWith(x);
}

export function missingCommits(logged: string[], commits: CommitInfo[]): CommitInfo[] {
  return commits.filter((c) => !logged.some((l) => sameCommit(l, c.sha)));
}

export function logFileFor(date: string): string {
  const m = /^(\d{4}-\d{2})/.exec(date);
  if (!m) throw new Error(`not a date: ${date}`);
  return `key/log/${m[1]}.md`;
}
