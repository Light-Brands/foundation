import { describe, it, expect } from "vitest";
import { DEFAULT_BRAND, parseBrand, contrastRatio, contrastProblems, onColor, COLOR_SLOTS } from "@/lib/brand/tokens";
import { brandCss } from "@/lib/brand/css";
import { PAIRING_IDS } from "@/lib/brand/pairings";

describe("the brand tokens", () => {
  it("default to a complete brand that passes contrast", () => {
    expect(Object.keys(DEFAULT_BRAND.colors).sort()).toEqual([...COLOR_SLOTS].sort());
    expect(contrastProblems(DEFAULT_BRAND)).toEqual([]);
  });
  it("measure contrast the WCAG way", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
  });
  it("pick readable text for any fill", () => {
    expect(onColor("#111111")).toBe("#ffffff");
    expect(onColor("#f5f0e6")).toBe("#141414");
  });
  it("keep valid values and fall back field by field", () => {
    const b = parseBrand({ colors: { accent: "#AA3300" }, pairing: "modern", radiusCard: 12 });
    expect(b.colors.accent).toBe("#aa3300");
    expect(b.colors.canvas).toBe(DEFAULT_BRAND.colors.canvas);
    expect(b.pairing).toBe("modern");
    expect(b.radiusCard).toBe(12);
  });
  it("refuse anything that could break out of a style tag", () => {
    const evil = parseBrand({
      colors: { canvas: "red;}body{display:none}", ink: "#12345", accent: "url(x)" },
      pairing: "comic;}",
      radiusCard: "8px;}",
      radiusControl: 99,
      logoUrl: "javascript:alert(1)",
    });
    expect(evil.colors.canvas).toBe(DEFAULT_BRAND.colors.canvas);
    expect(evil.colors.ink).toBe(DEFAULT_BRAND.colors.ink);
    expect(evil.colors.accent).toBe(DEFAULT_BRAND.colors.accent);
    expect(evil.pairing).toBe(DEFAULT_BRAND.pairing);
    expect(evil.radiusCard).toBe(DEFAULT_BRAND.radiusCard);
    expect(evil.radiusControl).toBe(DEFAULT_BRAND.radiusControl);
    expect(evil.logoUrl).toBeNull();
    expect(brandCss(evil)).not.toMatch(/display:none|javascript|url\(/);
  });
  it("read a JSON string as well as an object", () => {
    expect(parseBrand(JSON.stringify({ pairing: "classic" })).pairing).toBe("classic");
    expect(parseBrand("not json").pairing).toBe(DEFAULT_BRAND.pairing);
    expect(parseBrand(null)).toEqual(DEFAULT_BRAND);
  });
  it("name a failing pair in plain words", () => {
    const low = parseBrand({ colors: { ink: "#eeeeee", canvas: "#ffffff" } });
    expect(contrastProblems(low)).toContain("Your text is too light to read on your background.");
  });
  it("write every token as a CSS variable", () => {
    const css = brandCss(DEFAULT_BRAND);
    expect(css.startsWith(":root{")).toBe(true);
    for (const v of ["--brand-canvas:", "--brand-primary-deep:", "--brand-on-highlight:", "--brand-on-accent:", "--brand-font-display:", "--brand-radius-card:"]) {
      expect(css).toContain(v);
    }
  });
  it("offer exactly six pairings", () => {
    expect(PAIRING_IDS).toEqual(["sanctuary", "modern", "editorial", "grotesk", "classic", "humanist"]);
  });
});
