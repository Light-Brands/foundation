import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  DEFAULT_BRAND, parseBrand, contrastProblems, typeCharacter,
  DENSITIES, SURFACES, MOTIONS, NAV_MARKERS, CHAMBERS, TYPE_RATIOS,
} from "@/lib/brand/tokens";
import { brandCss } from "@/lib/brand/css";
import { PAIRINGS, PAIRING_IDS } from "@/lib/brand/pairings";

// The creative range: levers that change the frame's character, beyond its colors. Every lever has a default that
// reproduces the look the frame had before it existed, so a brand saved earlier renders exactly as it did.

const range = JSON.parse(readFileSync("tests/fixtures/range-brand.json", "utf8"));

function vars(css: string): Record<string, string> {
  const body = css.slice(css.indexOf("{") + 1, css.lastIndexOf("}"));
  return Object.fromEntries(body.split(";").filter(Boolean).map((d) => {
    const i = d.indexOf(":");
    return [d.slice(0, i), d.slice(i + 1)];
  }));
}

describe("the creative range", () => {
  it("defaults every lever to the frame's existing look", () => {
    expect(DEFAULT_BRAND).toMatchObject({ typeRatio: 1.25, density: "comfortable", surface: "soft", motion: "full", navActive: "pill", chamber: "glow", type: {} });
    const v = vars(brandCss(DEFAULT_BRAND));
    expect(v["--brand-title-size"]).toBe("1.875rem");
    expect(v["--brand-title-size-lg"]).toBe("2.25rem");
    expect(v["--brand-display-scale"]).toBe("1");
    expect(v["--brand-heading-weight"]).toBe("400");
    expect(v["--brand-heading-tracking"]).toBe("-0.025em");
    expect(v["--brand-heading-case"]).toBe("none");
    expect(v["--brand-display-weight"]).toBe("300");
    expect(v["--density"]).toBe("1");
    expect(v["--motion"]).toBe("1");
    expect(v["--surface-shadow"]).toBe("0 1px 2px rgb(15 23 42 / 0.04)");
    expect(v["--surface-border"]).toBe("var(--color-admin-line-strong)");
    expect(v["--surface-bg"]).toBe("var(--color-admin-surface)");
    expect(v["--nav-active-bg"]).toBe("var(--color-accent)");
    expect(v["--nav-active-ink"]).toBe("var(--color-on-accent)");
    expect(v["--chamber-shaft"]).toBe("1");
  });

  it("reads a brand saved before the levers existed unchanged", () => {
    const old = { colors: { accent: "#aa3300" }, pairing: "modern", radiusCard: 12, radiusControl: 8, logoUrl: null };
    const b = parseBrand(old);
    expect(b).toMatchObject({ typeRatio: 1.25, density: "comfortable", surface: "soft", motion: "full", navActive: "pill", chamber: "glow", type: {} });
    expect(b.colors.accent).toBe("#aa3300");
    expect(parseBrand(null)).toEqual(DEFAULT_BRAND);
  });

  it("keeps every valid value", () => {
    for (const density of DENSITIES) expect(parseBrand({ density }).density).toBe(density);
    for (const surface of SURFACES) expect(parseBrand({ surface }).surface).toBe(surface);
    for (const motion of MOTIONS) expect(parseBrand({ motion }).motion).toBe(motion);
    for (const navActive of NAV_MARKERS) expect(parseBrand({ navActive }).navActive).toBe(navActive);
    for (const chamber of CHAMBERS) expect(parseBrand({ chamber }).chamber).toBe(chamber);
    for (const typeRatio of TYPE_RATIOS) expect(parseBrand({ typeRatio }).typeRatio).toBe(typeRatio);
    const t = parseBrand({ type: { displayWeight: 500, headingWeight: 700, headingTracking: 0.08, headingCase: "uppercase" } }).type;
    expect(t).toEqual({ displayWeight: 500, headingWeight: 700, headingTracking: 0.08, headingCase: "uppercase" });
  });

  it("drops anything outside the range, lever by lever, and never lets it reach the style tag", () => {
    const b = parseBrand({
      typeRatio: 2, density: "squished;}", surface: "url(x)", motion: 3, navActive: "PILL", chamber: "image",
      type: { displayWeight: 350, headingWeight: "bold", headingTracking: 1, headingCase: "lowercase;}body{display:none" },
    });
    expect(b).toMatchObject({ typeRatio: 1.25, density: "comfortable", surface: "soft", motion: "full", navActive: "pill", chamber: "glow", type: {} });
    expect(parseBrand({ type: "heavy" }).type).toEqual({});
    expect(parseBrand({ type: { headingWeight: 800, headingTracking: -0.2 } }).type).toEqual({});
    expect(brandCss(b)).not.toMatch(/display:none|url\(|squished/);
  });

  it("takes type character from the pairing, then the brand's own overrides", () => {
    expect(PAIRING_IDS.every((id) => PAIRINGS[id].headingWeight >= 300)).toBe(true);
    expect(typeCharacter(DEFAULT_BRAND)).toEqual({ displayWeight: 300, headingWeight: 400, headingTracking: -0.025, headingCase: "none" });
    expect(typeCharacter(parseBrand({ pairing: "classic" })).displayWeight).toBe(400);
    expect(typeCharacter(parseBrand({ type: { headingCase: "uppercase" } }))).toMatchObject({ headingWeight: 400, headingCase: "uppercase" });
  });

  it("writes each lever as CSS variables", () => {
    const v = vars(brandCss(parseBrand(range)));
    expect(v["--type-ratio"]).toBe("1.333");
    expect(v["--brand-title-size-lg"]).toBe("2.91rem");
    expect(v["--brand-heading-case"]).toBe("uppercase");
    expect(v["--brand-heading-tracking"]).toBe("0.04em");
    expect(v["--brand-heading-weight"]).toBe("500");
    expect(v["--density"]).toBe("0.875");
    expect(v["--motion"]).toBe("0");
    expect(v["--surface-shadow"]).toBe("none");
    expect(v["--nav-active-ink"]).toBe("var(--color-admin-ink)");
    expect(v["--nav-active-shadow"]).toBe("inset 2px 0 0 var(--color-accent)");
    expect(v["--chamber-shaft"]).toBe("0");
    expect(v["--brand-radius-card"]).toBe("0px");
    const glass = vars(brandCss(parseBrand({ surface: "glass", motion: "subtle", density: "airy", navActive: "tint", chamber: "grain", typeRatio: 1.2 })));
    expect(glass["--surface-blur"]).toBe("12px");
    expect(glass["--motion"]).toBe("0.5");
    expect(glass["--density"]).toBe("1.15");
    expect(glass["--nav-active-shadow"]).toBe("none");
    expect(glass["--chamber-grain"]).toBe("0.28");
    expect(glass["--brand-title-size-lg"]).toBe("1.911rem");
  });

  it("proves the range with a fixture that keeps every color pair readable", () => {
    const b = parseBrand(range);
    expect(b).toMatchObject({ pairing: "grotesk", radiusCard: 0, radiusControl: 2, density: "compact", surface: "flat", motion: "still", navActive: "rail", chamber: "plain" });
    expect(contrastProblems(b)).toEqual([]);
  });
});

describe("the frame consumes every lever", () => {
  const css = readFileSync("src/app/globals.css", "utf8");
  const chamber = readFileSync("src/app/admin/login/chamber.module.css", "utf8");
  function rule(selector: string, from = css): string {
    const at = from.indexOf(`${selector} {`);
    if (at < 0) throw new Error(`no ${selector} rule`);
    return from.slice(at, from.indexOf("}", at));
  }

  it("titles read the type character and the scale", () => {
    const title = rule(".page-title");
    for (const v of ["--brand-title-size", "--brand-heading-weight", "--brand-heading-tracking", "--brand-heading-case"]) expect(title).toContain(v);
    expect(css).toContain("var(--brand-title-size-lg");
    expect(rule(".headline", chamber)).toContain("--brand-heading-weight");
    expect(rule(".wordmark", chamber)).toContain("--brand-display-weight");
    expect(rule(".wordmark", chamber)).toContain("--brand-display-scale");
  });

  it("surfaces read the surface style, and density reaches padding, rows and stacks", () => {
    const surface = rule(".surface");
    for (const v of ["--surface-border", "--surface-bg", "--surface-shadow", "--surface-filter"]) expect(surface).toContain(v);
    expect(rule(".surface-link:hover")).toContain("--shadow-lift");
    for (const v of ["--spacing-card:", "--spacing-row:", "--spacing-stack:"]) expect(css).toContain(v);
    expect(css).toMatch(/--spacing-row:\s*max\(44px/);
  });

  it("the active marker and the chamber atmosphere come from variables", () => {
    expect(rule(".nav-active")).toContain("--nav-active-bg");
    expect(rule(".seg-active")).toContain("--seg-bg-active");
    expect(rule(".shaft", chamber)).toContain("--chamber-shaft");
    expect(rule(".grain", chamber)).toContain("--chamber-grain");
  });

  it("entrances scale with motion and stop for anyone who asked for less", () => {
    expect(rule(".rise")).toContain("var(--duration-enter)");
    expect(css).toMatch(/--duration-enter:\s*calc\(800ms \* var\(--motion/);
    const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(reduced).toMatch(/--motion:\s*0/);
    expect(reduced).toMatch(/\.rise\s*\{\s*animation:\s*none/);
  });
});
