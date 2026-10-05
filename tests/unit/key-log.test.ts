import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { formatEntry, parseLog, missingCommits, logFileFor, type LogEntry } from "@/lib/key/log";
import { checkLogText } from "@/lib/key/formats";

const entry: LogEntry = {
  at: "2026-10-05 14:02", title: "Booking reminders", kind: "lesson", category: "Deliver · Booking",
  what: "reminders go out 24 hours and 1 hour before each session",
  files: ["key/apps/booking/definition.yaml", "key/workflows/booking-reminders.md"],
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
  it("a formatted entry passes the privacy check, an email fails it", () => {
    expect(checkLogText("x", formatEntry(entry))).toEqual([]);
    expect(checkLogText("x", formatEntry({ ...entry, what: "mail a@b.com" })).length).toBeGreaterThan(0);
  });
  it("an all-digit commit id is not a phone number, but digits elsewhere still are", () => {
    expect(checkLogText("x", formatEntry({ ...entry, commit: "1234567" }))).toEqual([]);
    expect(checkLogText("x", formatEntry({ ...entry, what: "call 555 123 4567" })).length).toBeGreaterThan(0);
  });
});

function repo(subject2 = "second", date2?: string) {
  const dir = mkdtempSync(path.join(tmpdir(), "logsync-"));
  const git = (...a: string[]) => execFileSync("git", a, { cwd: dir, stdio: "pipe" });
  git("init", "-q"); git("config", "user.email", "t@example.org"); git("config", "user.name", "t");
  mkdirSync(path.join(dir, "key/log"), { recursive: true });
  writeFileSync(path.join(dir, "key/log/.gitkeep"), "");
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

  it("a work commit followed by a log-only commit naming it is not reported missing", () => {
    const dir = repo("work: add reminders");
    const git = (...a: string[]) => execFileSync("git", a, { cwd: dir, encoding: "utf8", stdio: "pipe" });
    const work = git("rev-parse", "--short", "HEAD").trim();
    sync(dir); // back-fills the first commit and the work commit
    // Start the log over: only the entry for the work commit, written the way a member does it.
    const logFile = path.join(dir, "key/log", readdirSync(path.join(dir, "key/log")).find((f) => f.endsWith(".md"))!);
    const first = git("rev-list", "--max-parents=0", "HEAD").trim().slice(0, 7);
    writeFileSync(logFile, formatEntry({ ...entry, commit: first, title: "First" }) + "\n" + formatEntry({ ...entry, commit: work, title: "Reminders" }));
    git("add", "key/log");
    git("commit", "-qm", "log: reminders entry");
    const out = sync(dir);
    expect(out).toContain("added 0 entries");
    expect(parseLog(readFileSync(logFile, "utf8")).map((e) => e.commit)).toEqual([first, work]);
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
