import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { ADMIN_TONES, ADMIN_NEUTRALS, STATUS_COLORS, TONES, toneContrastProblems, type ToneScale } from "@/lib/brand/admin-tone";
import { DEFAULT_BRAND, parseBrand, contrastRatio, contrastProblems } from "@/lib/brand/tokens";
import { brandCss } from "@/lib/brand/css";

// Admin tone: the command center's own neutrals, light (the default), dim or dark. Every tone is checked here
// pair by pair, so a later edit to any value cannot quietly make a screen hard to read.

const css = readFileSync("src/app/globals.css", "utf8");
const range = JSON.parse(readFileSync("tests/fixtures/range-brand.json", "utf8"));

describe("admin tone", () => {
  it("offers light, dim and dark, and defaults to light", () => {
    expect(ADMIN_TONES).toEqual(["light", "dim", "dark"]);
    expect(DEFAULT_BRAND.adminTone).toBe("light");
  });

  it("reads a brand stored before the tone existed as light, and drops anything outside the list", () => {
    expect(parseBrand({ pairing: "modern" }).adminTone).toBe("light");
    expect(parseBrand(null).adminTone).toBe("light");
    for (const bad of ["Dark", "black", "dark;}body{display:none", 1, null]) expect(parseBrand({ adminTone: bad }).adminTone).toBe("light");
    for (const tone of ADMIN_TONES) expect(parseBrand({ adminTone: tone }).adminTone).toBe(tone);
    expect(parseBrand({ admin_tone: "dim" }).adminTone).toBe("dim");
  });

  it("maps the whole neutral scale and the status colors in every tone", () => {
    expect(ADMIN_NEUTRALS).toEqual(["canvas", "surface", "hover", "line", "line-strong", "ink", "muted", "faint", "ghost"]);
    for (const tone of ADMIN_TONES) {
      for (const n of ADMIN_NEUTRALS) expect(TONES[tone].neutrals[n], `${tone} ${n}`).toMatch(/^#[0-9a-f]{6}$/);
      for (const s of STATUS_COLORS) expect(TONES[tone].status[s], `${tone} ${s}`).toMatch(/^#[0-9a-f]{6}$/);
    }
    expect(TONES.light.scheme).toBe("light");
    expect(TONES.dim.scheme).toBe("dark");
    expect(TONES.dark.scheme).toBe("dark");
  });

  it("keeps the light tone's surfaces, lines and ink exactly as the frame had them", () => {
    expect(TONES.light.neutrals).toMatchObject({ canvas: "#f8fafc", surface: "#ffffff", hover: "#f1f5f9", line: "#f1f5f9", "line-strong": "#e2e8f0", ink: "#1e293b", muted: "#475569" });
  });

  for (const tone of ADMIN_TONES) {
    it(`${tone}: every text and background pair reads at AA, and icons and status at their floors`, () => {
      expect(toneContrastProblems(TONES[tone])).toEqual([]);
    });
  }

  it("the check can fail", () => {
    const bad: ToneScale = { ...TONES.dark, neutrals: { ...TONES.dark.neutrals, faint: "#4a4a50", ghost: "#2a2a2e" }, status: { ...TONES.dark.status, bad: "#7f1d1d" } };
    const problems = toneContrastProblems(bad);
    expect(problems).toContain("faint on canvas");
    expect(problems).toContain("ghost on surface");
    expect(problems).toContain("bad on surface");
  });

  it("writes the tone as variables, with the color scheme", () => {
    for (const tone of ADMIN_TONES) {
      const out = brandCss(parseBrand({ adminTone: tone }));
      for (const n of ADMIN_NEUTRALS) expect(out).toContain(`--admin-${n}:${TONES[tone].neutrals[n]};`);
      for (const s of STATUS_COLORS) expect(out).toContain(`--status-${s}:${TONES[tone].status[s]};`);
      expect(out).toContain(`--admin-scheme:${TONES[tone].scheme};`);
    }
  });

  it("the stylesheet reads every admin and status color from the tone, with light as the fallback", () => {
    for (const n of ADMIN_NEUTRALS) expect(css).toContain(`--color-admin-${n}: var(--admin-${n}, ${TONES.light.neutrals[n]});`);
    for (const s of STATUS_COLORS) expect(css).toContain(`--color-${s}: var(--status-${s}, ${TONES.light.status[s]});`);
    expect(css).toMatch(/color-scheme:\s*var\(--admin-scheme, light\)/);
  });

  it("keeps public pages in the light tone whatever the admin wears", () => {
    const at = css.indexOf(".public {");
    const pub = css.slice(at, css.indexOf("}", at));
    for (const n of ADMIN_NEUTRALS) expect(pub).toContain(`--admin-${n}: ${TONES.light.neutrals[n]};`);
    for (const s of STATUS_COLORS) expect(pub).toContain(`--status-${s}: ${TONES.light.status[s]};`);
    expect(pub).toContain("color-scheme: light");
  });

  it("names an accent too faint to mark where you are in the chosen tone", () => {
    const b = parseBrand({ adminTone: "dark", colors: { accent: "#1f2a44" } });
    expect(contrastProblems(b)).toContain("Your accent is hard to see in your command center.");
    expect(contrastProblems(parseBrand({ adminTone: "dark", colors: { accent: "#5a78ff" } }))).toEqual([]);
  });

  it("the range fixture goes dark and keeps every pair readable", () => {
    const b = parseBrand(range);
    expect(b.adminTone).toBe("dark");
    expect(contrastProblems(b)).toEqual([]);
    expect(contrastRatio(b.colors.accent, TONES.dark.neutrals.surface)).toBeGreaterThanOrEqual(4.5);
  });
});
