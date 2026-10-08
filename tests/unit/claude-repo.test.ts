import { describe, it, expect, vi, afterEach } from "vitest";
import { parseRemote, resolveRepo, localFolder } from "@/lib/claude/repo";

describe("parseRemote", () => {
  it("reads ssh and https GitHub remotes", () => {
    expect(parseRemote("git@github.com:harbor-studio/command-center.git")).toBe("harbor-studio/command-center");
    expect(parseRemote("https://github.com/harbor-studio/command-center")).toBe("harbor-studio/command-center");
    expect(parseRemote("https://github.com/harbor-studio/command-center.git\n")).toBe("harbor-studio/command-center");
  });
  it("refuses anything that is not a GitHub owner and name", () => {
    for (const bad of ["", "https://gitlab.com/a/b", "git@github.com:onlyowner", "https://github.com/a/b/c", "https://github.com/a b/c"]) expect(parseRemote(bad)).toBeNull();
  });
  it("rejects an owner or name made only of dots", () => {
    for (const bad of ["https://github.com/../x", "https://github.com/a/..", "https://github.com/./x", "git@github.com:../x"]) expect(parseRemote(bad)).toBeNull();
  });
  it("rejects a remote that carries credentials", () => {
    expect(parseRemote("https://u:t@github.com/a/b")).toBeNull();
    expect(parseRemote("https://u@github.com/a/b")).toBeNull();
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

describe("resolveRepo, malformed Vercel values", () => {
  it("falls through to the git remote when Vercel's owner is not a valid name", () => {
    const r = resolveRepo({ VERCEL_GIT_REPO_OWNER: "bad owner", VERCEL_GIT_REPO_SLUG: "command-center" }, () => "git@github.com:harbor-studio/command-center.git", "/Users/jo/harbor", true);
    expect(r.repo).toBe("harbor-studio/command-center");
  });
});

describe("repoWhere", () => {
  afterEach(() => { vi.restoreAllMocks(); vi.resetModules(); });
  it("still resolves with no folder when the working directory cannot be read", async () => {
    vi.spyOn(process, "cwd").mockImplementation(() => { throw new Error("ENOENT"); });
    const { repoWhere } = await import("@/lib/claude/repo");
    const r = await repoWhere();
    expect(r.folder).toBeNull();
    expect(typeof r.label).toBe("string");
  });
});

describe("localFolder", () => {
  it("keeps the folder only for a local session on a local host", () => {
    for (const host of ["localhost", "localhost:3000", "127.0.0.1:3100", "[::1]:3000", "[::1]"]) expect(localFolder("/Users/jo/harbor", host, false)).toBe("/Users/jo/harbor");
  });
  it("drops it for a LAN address, a domain, Vercel or a missing host", () => {
    expect(localFolder("/Users/jo/harbor", "192.168.1.20:3000", false)).toBeNull();
    expect(localFolder("/Users/jo/harbor", "command.harbor.co", false)).toBeNull();
    expect(localFolder("/Users/jo/harbor", "localhost:3000", true)).toBeNull();
    expect(localFolder("/Users/jo/harbor", null, false)).toBeNull();
    expect(localFolder(null, "localhost", false)).toBeNull();
  });
});
