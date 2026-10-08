import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { TONES } from "@/lib/brand/admin-tone";

// The admin frame's neutrals come from the brand's admin tone (every tone is checked in admin-tone.test.ts). Here the
// default light tone is checked against the two backgrounds every admin screen uses.
const css = readFileSync("src/app/globals.css", "utf8");

function token(name: string): string {
  return TONES.light.neutrals[name.replace(/^admin-/, "") as keyof typeof TONES.light.neutrals];
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

function rule(selector: string): string {
  const at = css.indexOf(`${selector} {`);
  if (at < 0) throw new Error(`no ${selector} rule`);
  return css.slice(at, css.indexOf("}", at));
}

describe("admin tokens", () => {
  it("every text neutral reads at AA on the surface and the canvas", () => {
    for (const ink of ["admin-ink", "admin-muted", "admin-faint"]) {
      for (const bg of ["admin-surface", "admin-canvas"]) {
        expect(contrast(token(ink), token(bg)), `${ink} on ${bg}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("the ghost neutral exists for icons and chevrons, the only places too light for text", () => {
    expect(contrast(token("admin-ghost"), token("admin-surface"))).toBeLessThan(4.5);
  });

  it("the contrast check can fail", () => {
    expect(contrast("#94a3b8", "#ffffff")).toBeLessThan(4.5);
  });

  it("kickers use the label face at 11px and escape the heading face", () => {
    const kicker = rule(".kicker");
    expect(kicker).toContain("font-label");
    expect(kicker).toContain("text-[11px]");
    const heading = css.match(/^(h1[^{]*)\{\s*font-family:\s*var\(--font-heading\)/m)?.[1] ?? "";
    expect(heading).toContain("h2:not(.kicker)");
    expect(heading).toContain("h3:not(.kicker)");
  });

  it("buttons share one height scale, and a disabled primary turns neutral", () => {
    for (const b of [".btn-primary", ".btn-quiet"]) {
      const r = rule(b);
      expect(r, b).toContain("min-h-11");
      expect(r, b).toContain("md:min-h-10");
      expect(r, b).not.toMatch(/\bpy-2\b/);
    }
    expect(rule(".btn-primary")).toContain("disabled:bg-admin-hover");
    expect(rule(".btn-sm")).toContain("min-h-11");
  });
});
