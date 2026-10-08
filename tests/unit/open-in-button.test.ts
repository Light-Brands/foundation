import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { OpenIn } from "@/components/OpenIn";
import { RepoProvider } from "@/components/RepoProvider";

const html = (repo: string | null, folder: string | null) => renderToStaticMarkup(
  createElement(RepoProvider, { value: { repo, folder, label: repo ? repo.split("/")[1] : "your Foundation" } },
    createElement(OpenIn, { prompt: "Sage, follow 2.1.3 Story and voice from the Ninja dictionary.", primary: true })));

describe("OpenIn", () => {
  it("leads with Open in Claude Desktop, a menu button and Copy", () => {
    const out = html("harbor-studio/command-center", "/Users/jo/harbor");
    expect(out).toContain("Open in Claude Desktop");
    expect(out).toMatch(/aria-haspopup="menu"/);
    expect(out).toContain("Copy prompt");
    expect(out).toContain("btn-primary");
  });
  it("names the repo under the button and points at Work with Claude", () => {
    const out = html("harbor-studio/command-center", "/Users/jo/harbor");
    expect(out).toContain("Opens in");
    expect(out).toContain("command-center");
    expect(out).toContain("check it is selected before you send");
  });
  it("has a real link for the default target in the first paint", () => {
    expect(html("harbor-studio/command-center", "/Users/jo/harbor")).toMatch(/href="claude:\/\/code\/new\?q=/);
  });
  it("carries no dash in what it says", () => {
    expect(html(null, null)).not.toMatch(/[–—]/);
  });
  it("with no folder, the main part is a button, never a link with an empty folder", () => {
    const out = html("harbor-studio/command-center", null);
    expect(out).not.toContain("claude://");
    expect(out).toContain("Open in Claude Desktop");
  });
});

describe("OpenIn, fix round 1", () => {
  it("hides the setup link when learn is false and words the fallback label without a dot", () => {
    const out = renderToStaticMarkup(createElement(RepoProvider, { value: { repo: null, folder: null, label: "your Foundation" } },
      createElement(OpenIn, { prompt: "x", learn: false })));
    expect(out).not.toContain("How this works");
    expect(out).toContain("Opens in your Foundation folder. Check it is selected before you send.");
    expect(out).toMatch(/<button[^>]*aria-haspopup="menu"[^>]*aria-expanded="false"[^>]*>Open in Claude Desktop/);
  });
});
