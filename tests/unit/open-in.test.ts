import { describe, it, expect } from "vitest";
import { openInLink, LIMIT, TARGETS, TARGET_LABEL } from "@/lib/claude/open-in";

const where = { repo: "harbor-studio/command-center", folder: "/Users/jo/harbor" };
const tricky = "Zoë, follow 2.1.3 Story and voice for Harbor & Co. \"Quotes\" stay.\nNext line?";

function param(href: string, key: string) {
  return new URL(href).searchParams.get(key);
}

describe("openInLink", () => {
  it("builds the Desktop link with the prompt and folder", () => {
    const r = openInLink("desktop", tricky, where);
    expect(r.ok && r.href.startsWith("claude://code/new?")).toBe(true);
    if (r.ok) { expect(param(r.href, "q")).toBe(tricky); expect(param(r.href, "folder")).toBe(where.folder); }
  });
  it("builds the web link with the prompt and the repo selected", () => {
    const r = openInLink("web", tricky, where);
    expect(r.ok && r.href.startsWith("https://claude.ai/code?")).toBe(true);
    if (r.ok) { expect(param(r.href, "prompt")).toBe(tricky); expect(param(r.href, "repositories")).toBe(where.repo); }
  });
  it("builds the terminal link with the prompt and working folder", () => {
    const r = openInLink("terminal", tricky, where);
    expect(r.ok && r.href.startsWith("claude-cli://open?")).toBe(true);
    if (r.ok) { expect(param(r.href, "q")).toBe(tricky); expect(param(r.href, "cwd")).toBe(where.folder); }
  });
  it("says what is missing and never builds an empty folder or repo", () => {
    for (const t of ["desktop", "terminal"] as const) {
      const r = openInLink(t, "hi", { repo: where.repo, folder: null });
      expect(r).toEqual({ ok: false, reason: expect.stringContaining("folder") });
    }
    expect(openInLink("web", "hi", { repo: null, folder: where.folder })).toEqual({ ok: false, reason: expect.stringContaining("GitHub") });
  });
  it("falls back when a prompt runs past the target's limit", () => {
    const long = "a".repeat(LIMIT.terminal + 1);
    expect(openInLink("terminal", long, where).ok).toBe(false);
    expect(openInLink("desktop", long, where).ok).toBe(true);
  });
  it("names three targets with dash free labels", () => {
    expect(TARGETS).toEqual(["desktop", "web", "terminal"]);
    for (const t of TARGETS) expect(TARGET_LABEL[t]).not.toMatch(/[–—]/);
  });
});
