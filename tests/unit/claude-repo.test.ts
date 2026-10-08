import { describe, it, expect } from "vitest";
import { parseRemote, resolveRepo } from "@/lib/claude/repo";

describe("parseRemote", () => {
  it("reads ssh and https GitHub remotes", () => {
    expect(parseRemote("git@github.com:harbor-studio/command-center.git")).toBe("harbor-studio/command-center");
    expect(parseRemote("https://github.com/harbor-studio/command-center")).toBe("harbor-studio/command-center");
    expect(parseRemote("https://github.com/harbor-studio/command-center.git\n")).toBe("harbor-studio/command-center");
  });
  it("refuses anything that is not a GitHub owner and name", () => {
    for (const bad of ["", "https://gitlab.com/a/b", "git@github.com:onlyowner", "https://github.com/a/b/c", "https://github.com/a b/c"]) expect(parseRemote(bad)).toBeNull();
  });
});

describe("resolveRepo", () => {
  it("prefers Vercel's git settings on Vercel, and knows no folder there", () => {
    const r = resolveRepo({ VERCEL_GIT_REPO_OWNER: "harbor-studio", VERCEL_GIT_REPO_SLUG: "command-center" }, () => null, "/var/task", true);
    expect(r).toEqual({ repo: "harbor-studio/command-center", folder: null, label: "command-center" });
  });
  it("reads the git remote and the folder locally", () => {
    const r = resolveRepo({}, () => "git@github.com:harbor-studio/command-center.git", "/Users/jo/harbor", false);
    expect(r).toEqual({ repo: "harbor-studio/command-center", folder: "/Users/jo/harbor", label: "command-center" });
  });
  it("still gives the folder when there is no remote", () => {
    expect(resolveRepo({}, () => null, "/Users/jo/harbor", false)).toEqual({ repo: null, folder: "/Users/jo/harbor", label: "harbor" });
  });
});
