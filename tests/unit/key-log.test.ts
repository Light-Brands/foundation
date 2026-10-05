import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { formatEntry, parseLog, missingCommits, logFileFor, logTitleFor, type LogEntry } from "@/lib/key/log";
import { checkLogText } from "@/lib/key/formats";

const entry: LogEntry = {
  at: "2026-10-05 14:02", title: "Booking reminders", kind: "lesson", category: "Delivery · Book appointments",
  what: "reminders go out 24 hours and 1 hour before each session",
  files: ["key/apps/booking/definition.yaml", "key/routines/booking-reminders.md"],
  commit: "3f2a91c", checked: "the reminder test passed on a real booking", by: "claude",
};

describe("log entries", () => {
  it("round-trips and uses the middle dot", () => {
    const md = formatEntry(entry);
    expect(md.startsWith("## 2026-10-05 14:02 · Booking reminders\n")).toBe(true);
    expect(parseLog(md)).toEqual([entry]);
    expect(parseLog(md + "\n" + formatEntry({ ...entry, title: "Two" }))).toHaveLength(2);
  });
  it("returns commits whose short sha is not logged", () => {
    const c = (sha: string) => ({ sha, subject: "s", files: [], date: "2026-10-05T14:02:00Z" });
    expect(missingCommits(["3f2a91c"], [c("3f2a91c"), c("abc1234")]).map((x) => x.sha)).toEqual(["abc1234"]);
  });
  it("names the month file", () => {
    expect(logFileFor("2026-10-05T14:02:00Z")).toBe("key/log/2026-10.md");
  });
  it("titles the month file the way docs/standards/log.md says", () => {
    expect(logTitleFor("2026-10-05T14:02:00Z")).toBe("# Build log, October 2026");
    const doc = readFileSync("docs/standards/log.md", "utf8");
    expect(doc).toContain("`# Build log, <Month YYYY>`");
    expect(doc).toContain(`\`${logTitleFor("2026-10")}\``);
    expect(doc).toContain("always in UTC");
  });
  it("round-trips an Entry line placed right after Commit, and omits it when absent", () => {
    const withEntry = { ...entry, entry: "modules/sell/leads" };
    const md = formatEntry(withEntry);
    expect(md).toContain("- Commit: 3f2a91c\n- Entry: modules/sell/leads\n- Checked:");
    expect(parseLog(md)).toEqual([withEntry]);
    expect(formatEntry(entry)).not.toContain("- Entry:");
    expect(parseLog(formatEntry(entry))[0].entry).toBeUndefined();
  });
  it("flags a malformed entry id and accepts a good one", () => {
    expect(checkLogText("x", formatEntry({ ...entry, entry: "routines/monday-brief" }))).toEqual([]);
    for (const bad of ["Routines/Monday", "routines//x", "/routines/x", "routines/x/", "routines/my brief", ""]) {
      expect(checkLogText("x", formatEntry({ ...entry, entry: bad })).join("\n")).toContain("x: log entry id must be lowercase segments joined by /, such as routines/monday-brief");
    }
  });
  it("a formatted entry passes the privacy check, an email fails it", () => {
    expect(checkLogText("x", formatEntry(entry))).toEqual([]);
    expect(checkLogText("x", formatEntry({ ...entry, what: "mail a@b.com" })).length).toBeGreaterThan(0);
  });
  it("an all-digit commit id is not a phone number, but digits elsewhere still are", () => {
    expect(checkLogText("x", formatEntry({ ...entry, commit: "1234567" }))).toEqual([]);
    expect(checkLogText("x", formatEntry({ ...entry, what: "call 555 123 4567" })).length).toBeGreaterThan(0);
  });
});

// A repository the way a member has it: Light Brands' template history, then setup records
// the commit it ran on as provenance.base, then the member's own commits.
function repo(subject2 = "second", date2?: string, opts: { base?: boolean } = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), "logsync-"));
  const git = (...a: string[]) => execFileSync("git", a, { cwd: dir, encoding: "utf8", stdio: "pipe" });
  git("init", "-q"); git("config", "user.email", "t@example.org"); git("config", "user.name", "t");
  mkdirSync(path.join(dir, "key/log"), { recursive: true });
  writeFileSync(path.join(dir, "key/log/.gitkeep"), "");
  writeFileSync(path.join(dir, "template.txt"), "scaffold");
  git("add", "."); git("commit", "-qm", "template scaffold from light brands");
  const base = git("rev-parse", "HEAD").trim();
  const provenance = opts.base === false ? "" : `provenance:\n  guide: foundation\n  base: ${base}\n`;
  writeFileSync(path.join(dir, "key/key.yaml"), `key: 1\nclient: harbor-studio\n${provenance}`);
  writeFileSync(path.join(dir, "a.txt"), "1");
  git("add", "."); git("commit", "-qm", "first — thing");
  writeFileSync(path.join(dir, "a.txt"), "2");
  git("add", ".");
  execFileSync("git", ["commit", "-qm", subject2], { cwd: dir, stdio: "pipe", env: { ...process.env, ...(date2 ? { GIT_AUTHOR_DATE: date2, GIT_COMMITTER_DATE: date2 } : {}) } });
  return dir;
}

describe("log:sync", () => {
  it("back-fills missing commits once and stays quiet after", () => {
    const dir = repo();
    const run = () => execFileSync("npx", ["tsx", path.resolve("scripts/log-sync.ts"), "--root", dir], { encoding: "utf8" });
    expect(run()).toContain("added 2 entries");
    const file = path.join(dir, "key/log", readdirSync(path.join(dir, "key/log")).find((f) => f.endsWith(".md"))!);
    const text = readFileSync(file, "utf8");
    expect(parseLog(text)).toHaveLength(2);
    expect(text).toContain("- Category: Settings");
    expect(text).not.toMatch(/[–—]/);
    expect(checkLogText("x", text)).toEqual([]);
    expect(run()).toContain("added 0 entries");
    expect(readFileSync(file, "utf8")).toBe(text);
  }, 60000);

  const sync = (dir: string) => execFileSync("npx", ["tsx", path.resolve("scripts/log-sync.ts"), "--root", dir], { encoding: "utf8" });
  const allLog = (dir: string) => readdirSync(path.join(dir, "key/log")).filter((f) => f.endsWith(".md")).map((f) => readFileSync(path.join(dir, "key/log", f), "utf8")).join("\n");

  it("keeps an email in a commit subject out of the log", () => {
    const dir = repo("fix reminder for ada@example.com");
    sync(dir);
    const text = allLog(dir);
    expect(text).not.toContain("ada@example.com");
    expect(parseLog(text)).toHaveLength(2);
    expect(checkLogText("x", text)).toEqual([]);
  }, 60000);

  it("handles a repo with no commits and a folder with no git", () => {
    const empty = mkdtempSync(path.join(tmpdir(), "logsync-empty-"));
    execFileSync("git", ["init", "-q"], { cwd: empty });
    expect(sync(empty)).toContain("No git history yet. Nothing to add.");
    expect(existsSync(path.join(empty, "key/log"))).toBe(false);
    const plain = mkdtempSync(path.join(tmpdir(), "logsync-plain-"));
    expect(sync(plain)).toContain("No git history yet. Nothing to add.");
    expect(existsSync(path.join(plain, "key/log"))).toBe(false);
  }, 60000);

  it("files each commit by its UTC month and time", () => {
    const dir = repo("late", "2026-10-31T23:30:00-07:00");
    sync(dir);
    const nov = readFileSync(path.join(dir, "key/log/2026-11.md"), "utf8");
    expect(nov).toContain("## 2026-11-01 06:30 \u00b7 late");
  }, 60000);

  it("starts each new month file with its title line, once", () => {
    const dir = repo("late", "2026-10-31T23:30:00-07:00");
    sync(dir);
    const nov = readFileSync(path.join(dir, "key/log/2026-11.md"), "utf8");
    expect(nov.startsWith("# Build log, November 2026\n\n## 2026-11-01 06:30")).toBe(true);
    const git = (...a: string[]) => execFileSync("git", a, { cwd: dir, stdio: "pipe" });
    writeFileSync(path.join(dir, "a.txt"), "3");
    git("add", "a.txt");
    execFileSync("git", ["commit", "-qm", "later"], { cwd: dir, stdio: "pipe", env: { ...process.env, GIT_AUTHOR_DATE: "2026-11-02T10:00:00Z", GIT_COMMITTER_DATE: "2026-11-02T10:00:00Z" } });
    sync(dir);
    const after = readFileSync(path.join(dir, "key/log/2026-11.md"), "utf8");
    expect(after.match(/^# Build log/gm)).toHaveLength(1);
    expect(parseLog(after).map((e) => e.title)).toEqual(["late", "later"]);
  }, 60000);

  it("a work commit followed by a log-only commit naming it is not reported missing", () => {
    const dir = repo("work: add reminders");
    const git = (...a: string[]) => execFileSync("git", a, { cwd: dir, encoding: "utf8", stdio: "pipe" });
    const work = git("rev-parse", "--short", "HEAD").trim();
    sync(dir); // back-fills the first commit and the work commit
    // Start the log over: only the entry for the work commit, written the way a member does it.
    const logFile = path.join(dir, "key/log", readdirSync(path.join(dir, "key/log")).find((f) => f.endsWith(".md"))!);
    const first = git("rev-parse", "--short=7", "HEAD~1").trim();
    writeFileSync(logFile, formatEntry({ ...entry, commit: first, title: "First" }) + "\n" + formatEntry({ ...entry, commit: work, title: "Reminders" }));
    git("add", "key/log");
    git("commit", "-qm", "log: reminders entry");
    const out = sync(dir);
    expect(out).toContain("added 0 entries");
    expect(parseLog(readFileSync(logFile, "utf8")).map((e) => e.commit)).toEqual([first, work]);
  }, 60000);

  it("never logs a commit from before setup's base", () => {
    const dir = repo();
    expect(sync(dir)).toContain("added 2 entries");
    const text = allLog(dir);
    expect(text).not.toContain("template scaffold");
    expect(parseLog(text).map((e) => e.title)).toEqual(["first , thing", "second"]);
  }, 60000);

  it("adds nothing and says why when setup has not recorded a base", () => {
    const dir = repo("second", undefined, { base: false });
    const out = sync(dir);
    expect(out).toContain("The build log starts after setup records its base");
    expect(out).toContain("Run npm run log:base to start it after the current commit.");
    expect(out).toContain("added 0 entries");
    expect(readdirSync(path.join(dir, "key/log")).filter((f) => f.endsWith(".md"))).toEqual([]);
  }, 60000);

  it("withholds a commit subject that names the platform", () => {
    const NAME = ["k", "y", "l", "o", "n"].join("");
    const dir = repo(`wire the ${NAME} bridge`);
    sync(dir);
    const text = allLog(dir);
    expect(text.toLowerCase()).not.toContain(NAME);
    expect(parseLog(text)).toHaveLength(2);
  }, 60000);
});
