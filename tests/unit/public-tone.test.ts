import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

// The brand style tag writes the admin tone's --admin-* variables on :root, unlayered. Public pages must win over it
// on the whole document, the body and the overscroll included, so their rule is unlayered and more specific.
const css = readFileSync("src/app/globals.css", "utf8");
const unlayered = css.replace(/@layer[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g, "");

function rule(selector: string): string {
  const at = unlayered.indexOf(`${selector} {`);
  if (at < 0) throw new Error(`no unlayered ${selector} rule`);
  return unlayered.slice(at, unlayered.indexOf("}", at));
}

describe("public pages keep their own tone", () => {
  it("reset the admin tone on the whole document, outside any layer", () => {
    const r = rule("html:has(.public)");
    for (const v of ["--admin-canvas", "--admin-ink", "--admin-surface", "--admin-scheme: light", "color-scheme: light"]) expect(r).toContain(v);
  });
  it("paint the body from the brand", () => {
    const r = rule("html:has(.public) body");
    expect(r).toContain("background-color: var(--color-canvas)");
    expect(r).toContain("color: var(--color-ink)");
  });
});
