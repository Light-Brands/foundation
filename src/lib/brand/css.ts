import { COLOR_SLOTS, onColor, type BrandTokens } from "./tokens";
import { PAIRINGS, NUMERIC_FONT } from "./pairings";

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/** The brand as CSS variables on :root. Only call with a brand that came through parseBrand. */
export function brandCss(b: BrandTokens): string {
  const p = PAIRINGS[b.pairing];
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
  ];
  return `:root{${vars.join("")}}`;
}
