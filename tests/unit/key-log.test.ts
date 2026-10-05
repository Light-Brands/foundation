import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
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
});

function repo() {
  const dir = mkdtempSync(path.join(tmpdir(), "logsync-"));
  const git = (...a: string[]) => execFileSync("git", a, { cwd: dir, stdio: "pipe" });
  git("init", "-q"); git("config", "user.email", "t@example.org"); git("config", "user.name", "t");
  mkdirSync(path.join(dir, "key/log"), { recursive: true });
  writeFileSync(path.join(dir, "key/log/.gitkeep"), "");
  writeFileSync(path.join(dir, "a.txt"), "1");
  git("add", "."); git("commit", "-qm", "first — thing");
  writeFileSync(path.join(dir, "a.txt"), "2");
  git("add", "."); git("commit", "-qm", "second");
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
});
