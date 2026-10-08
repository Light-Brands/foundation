import { COLOR_SLOTS, onColor, typeCharacter, type BrandTokens, type Chamber, type Density, type Motion, type NavMarker, type SurfaceStyle } from "./tokens";
import { PAIRINGS, NUMERIC_FONT } from "./pairings";
import { toneVars } from "./admin-tone";

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
const round = (n: number) => Number(n.toFixed(3));

// Each lever's value as the variables it sets. Every string here is a constant, so nothing a brand stores is
// ever written into the style tag except through these closed lists.
const DENSITY: Record<Density, string> = { compact: "0.875", comfortable: "1", airy: "1.15" };
const MOTION: Record<Motion, string> = { still: "0", subtle: "0.5", full: "1" };

const SOFT_SHADOW = "0 1px 2px rgb(15 23 42 / 0.04)";
const SOFT_LIFT = "0 6px 20px -8px rgb(15 23 42 / 0.12), 0 1px 2px rgb(15 23 42 / 0.04)";
const SURFACE: Record<SurfaceStyle, Record<string, string>> = {
  flat: { border: "var(--color-admin-line-strong)", bg: "var(--color-admin-surface)", shadow: "none", lift: "0 0 0 1px var(--color-admin-ghost)", blur: "0px", filter: "none" },
  soft: { border: "var(--color-admin-line-strong)", bg: "var(--color-admin-surface)", shadow: SOFT_SHADOW, lift: SOFT_LIFT, blur: "0px", filter: "none" },
  raised: {
    border: "transparent", bg: "var(--color-admin-surface)",
    shadow: "0 1px 2px rgb(15 23 42 / 0.05), 0 8px 24px -12px rgb(15 23 42 / 0.16)",
    lift: "0 2px 4px rgb(15 23 42 / 0.06), 0 16px 32px -12px rgb(15 23 42 / 0.22)", blur: "0px", filter: "none",
  },
  glass: {
    border: "color-mix(in oklch, var(--color-admin-line-strong) 70%, transparent)",
    bg: "color-mix(in oklch, var(--color-admin-surface) 72%, transparent)", shadow: SOFT_SHADOW, lift: SOFT_LIFT, blur: "12px", filter: "blur(12px)",
  },
};

// The bars follow the surface style: how much of the surface shows through, the blur behind, and a shadow for raised.
const BAR: Record<SurfaceStyle, Record<string, string>> = {
  flat: { fill: "100%", "fill-top": "100%", filter: "none", shadow: "none", "shadow-up": "none" },
  soft: { fill: "95%", "fill-top": "85%", filter: "blur(12px)", shadow: "none", "shadow-up": "none" },
  raised: {
    fill: "100%", "fill-top": "100%", filter: "none",
    shadow: "0 1px 2px rgb(15 23 42 / 0.05), 0 6px 16px -10px rgb(15 23 42 / 0.18)",
    "shadow-up": "0 -1px 2px rgb(15 23 42 / 0.05), 0 -6px 16px -10px rgb(15 23 42 / 0.18)",
  },
  glass: { fill: "70%", "fill-top": "62%", filter: "blur(16px) saturate(1.4)", shadow: "none", "shadow-up": "none" },
};

const NAV: Record<NavMarker, Record<string, string>> = {
  pill: {
    bg: "var(--color-accent)", ink: "var(--color-on-accent)", shadow: "0 1px 2px rgb(0 0 0 / 0.05)",
    "dot-built": "var(--color-on-accent)", "dot-ready": "var(--color-on-accent)",
    "seg-bg": "var(--color-admin-surface)", "seg-shadow": "0 1px 2px rgb(0 0 0 / 0.05)",
  },
  rail: {
    bg: "color-mix(in oklch, var(--color-accent) 8%, transparent)", ink: "var(--color-admin-ink)", shadow: "inset 2px 0 0 var(--color-accent)",
    "dot-built": "var(--color-good)", "dot-ready": "var(--color-admin-ghost)",
    "seg-bg": "transparent", "seg-shadow": "inset 0 -2px 0 var(--color-accent)",
  },
  tint: {
    bg: "color-mix(in oklch, var(--color-accent) 12%, transparent)", ink: "var(--color-admin-ink)", shadow: "none",
    "dot-built": "var(--color-good)", "dot-ready": "var(--color-admin-ghost)",
    "seg-bg": "color-mix(in oklch, var(--color-accent) 12%, var(--color-admin-surface))", "seg-shadow": "none",
  },
};

const CHAMBER: Record<Chamber, { shaft: string; grain: string; floor: string }> = {
  glow: { shaft: "1", grain: "0.18", floor: "1" },
  grain: { shaft: "0", grain: "0.28", floor: "0.6" },
  plain: { shaft: "0", grain: "0", floor: "0" },
};

/** The brand as CSS variables on :root. Only call with a brand that came through parseBrand. */
export function brandCss(b: BrandTokens): string {
  const p = PAIRINGS[b.pairing];
  const t = typeCharacter(b);
  // Sizes are anchored to the default ratio, so 1.25 gives exactly the sizes the frame always had.
  const step = b.typeRatio / 1.25;
  const surface = SURFACE[b.surface];
  const nav = NAV[b.navActive];
  const chamber = CHAMBER[b.chamber];
  const vars = [
    ...COLOR_SLOTS.map((s) => `--brand-${kebab(s)}:${b.colors[s]};`),
    `--brand-on-accent:${onColor(b.colors.accent)};`,
    `--brand-font-display:${p.display};`,
    `--brand-font-heading:${p.heading};`,
    `--brand-font-body:${p.body};`,
    `--brand-font-label:${p.label_};`,
    `--brand-font-numeric:${NUMERIC_FONT};`,
    `--brand-radius-card:${b.radiusCard}px;`,
    `--brand-radius-control:${b.radiusControl}px;`,
    `--brand-display-weight:${t.displayWeight};`,
    `--brand-heading-weight:${t.headingWeight};`,
    `--brand-heading-tracking:${t.headingTracking}em;`,
    `--brand-heading-case:${t.headingCase};`,
    `--type-ratio:${b.typeRatio};`,
    `--brand-title-size:${round(1.875 * step ** 3)}rem;`,
    `--brand-title-size-lg:${round(2.25 * step ** 4)}rem;`,
    `--brand-display-scale:${round(step ** 5)};`,
    `--density:${DENSITY[b.density]};`,
    `--motion:${MOTION[b.motion]};`,
    `--surface-border:${surface.border};`,
    `--surface-bg:${surface.bg};`,
    `--surface-shadow:${surface.shadow};`,
    `--shadow-lift:${surface.lift};`,
    `--surface-blur:${surface.blur};`,
    // Only glass sets a filter: a backdrop filter of any kind makes a new containing block, so the others say none.
    `--surface-filter:${surface.filter};`,
    ...Object.entries(BAR[b.surface]).map(([k, v]) => `--bar-${k}:${v};`),
    ...Object.entries(nav).map(([k, v]) => (k.startsWith("seg") ? `--${k}-active:${v};` : `--nav-active-${k}:${v};`)),
    `--chamber-shaft:${chamber.shaft};`,
    `--chamber-grain:${chamber.grain};`,
    `--chamber-floor:${chamber.floor};`,
    ...toneVars(b.adminTone),
  ];
  return `:root{${vars.join("")}}`;
}
