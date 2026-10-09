import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PromptPage } from "@/components/PromptPage";
import { RepoProvider } from "@/components/RepoProvider";

const prompt = "Sage, follow 2.1.3 Story and voice from the Ninja dictionary. In this project it is ninja/modules/brand/story.md.";
const render = (over: Record<string, unknown> = {}) => renderToStaticMarkup(createElement(RepoProvider, { value: { repo: "h/c", folder: "/x", label: "c" } },
  createElement(PromptPage, {
    page: "context/story", kicker: "2.1.3 · Context", title: "Story and voice", blurb: "Who you are.", state: "ready", hours: null,
    doors: { category: "context", sub: "story", label: "Story and voice" }, prompt, hasEntry: true, name: "Sage",
    card: { title: "What this page will hold", lines: ["Who you are and what you stand for."] }, ...over,
  })));

describe("PromptPage", () => {
  it("has the three doors and the card", () => {
    const out = render();
    for (const d of ["connect", "install", "custom"]) expect(out).toContain(`data-door="${d}"`);
    expect(out).toContain("What this page will hold");
  });
  it("shows the prompt itself in the install door, whole on a desk and led on a phone", () => {
    const out = render();
    expect(out).toContain("data-prompt");
    expect(out).toContain("ninja/modules/brand/story.md");
    expect(out).toContain("Show the whole prompt");
  });
  it("says Coming soon for a coming page and still offers the prompt", () => {
    const out = render({ state: "soon" });
    expect(out).toContain("Coming soon");
    expect(out).toContain("Open in Claude Desktop");
  });
  it("keeps one primary button", () => {
    // One split button is primary: its main part and its chevron both carry the look, so count the main part.
    expect((render().match(/btn-primary rounded-r-none/g) ?? []).length).toBe(1);
  });
  it("carries no dash", () => {
    expect(render()).not.toMatch(/[–—]/);
  });
});
