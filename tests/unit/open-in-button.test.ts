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
    const words = out.replace(/<[^>]+>/g, "");
    expect(words).toContain("Opens in command-center. Check it is selected before you send.");
    // The name is a chip in the figure face, with a folder mark for the Desktop default.
    expect(out).toMatch(/<span class="inline-flex[^"]*font-mono[^"]*"><svg[^>]*lucide-folder/);
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
    expect(out.replace(/<[^>]+>/g, "")).toContain("Opens in your Foundation folder. Check it is selected before you send.");
    expect(out).toMatch(/<button[^>]*aria-haspopup="menu"[^>]*aria-expanded="false"[^>]*>Open in Claude Desktop/);
  });
});

describe("OpenIn, design round", () => {
  const where = { repo: "harbor-studio/command-center", folder: null, label: "command-center" };
  const menu = (extra: object = {}) => renderToStaticMarkup(createElement(RepoProvider, { value: where },
    createElement(OpenIn, { prompt: "Sage, hello.", defaultOpen: true, ...extra })));

  it("marks the chosen row with a check and drops the Default tag", () => {
    const out = menu();
    expect(out).toMatch(/aria-checked="true"[^>]*>(?:(?!<\/button>).)*lucide-check/);
    expect(out).not.toMatch(/aria-checked="false"[^>]*>(?:(?!<\/button>).)*lucide-check/);
    expect(out).not.toContain(">Default<");
  });
  it("names a missing folder once, with the field under it and a quiet tag on the rows that need it", () => {
    const out = menu();
    const words = out.replace(/<[^>]+>/g, " ");
    expect(words.match(/Add where your Foundation is on this computer to open it here\./g)).toHaveLength(1);
    expect(out).toMatch(/to open it here\.\s*<\/label><div[^>]*><input/);
    expect(words.match(/Needs folder/g)).toHaveLength(2);
    expect(out).not.toContain("text-warn");
    expect(out).not.toContain("text-accent\">Add");
  });
  it("keeps the door buttons at the 44px tap floor on a desk", () => {
    const out = renderToStaticMarkup(createElement(RepoProvider, { value: { ...where, folder: "/x" } },
      createElement(OpenIn, { prompt: "x", primary: true })));
    expect((out.match(/md:min-h-11/g) ?? []).length).toBeGreaterThanOrEqual(3);
  });
  it("can keep Copy in the menu for a narrow card", () => {
    const closed = renderToStaticMarkup(createElement(RepoProvider, { value: { ...where, folder: "/x" } },
      createElement(OpenIn, { prompt: "x", copyInMenu: true })));
    expect(closed).not.toContain("Copy prompt");
    expect(menu({ copyInMenu: true })).toContain("Copy prompt");
  });
  it("caps the menu's height and lets it scroll", () => {
    expect(menu()).toContain("max-h-[min(70vh,32rem)]");
    expect(menu()).toContain("overflow-y-auto");
  });
});
