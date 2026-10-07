import { isPairingId, type PairingId } from "./pairings";

// The eleven color slots every surface paints with. One color per slot; shades come from color-mix in CSS.
export const COLOR_SLOTS = [
  "canvas", "canvasMuted", "ink", "inkMuted", "hairline",
  "primary", "primaryDeep", "accent", "highlight", "onHighlight", "glow",
] as const;
export type ColorSlot = (typeof COLOR_SLOTS)[number];

export type BrandTokens = {
  colors: Record<ColorSlot, string>;
  pairing: PairingId;
  radiusCard: number;
  radiusControl: number;
  logoUrl: string | null;
  logoLightUrl: string | null;
};

// The Foundation's own brand: warm canvas, deep green, terracotta and gold, after the Transformational Epicenter.
export const DEFAULT_BRAND: BrandTokens = {
  colors: {
    canvas: "#fbf9f5",
    canvasMuted: "#f3eee6",
    ink: "#26231f",
    inkMuted: "#5f5a52",
    hairline: "#e5ded2",
    primary: "#1f483a",
    primaryDeep: "#132d24",
    accent: "#b85a36",
    highlight: "#d4a63b",
    onHighlight: "#1a1712",
    glow: "#d4a63b",
  },
  pairing: "sanctuary",
  radiusCard: 16,
  radiusControl: 10,
  logoUrl: null,
  logoLightUrl: null,
};

const HEX = /^#[0-9a-f]{6}$/;
const URL_OK = /^(https:\/\/[^\s"'<>()\\]+|\/[^\s"'<>()\\]*)$/;

function color(v: unknown, fallback: string): string {
  if (typeof v !== "string") return fallback;
  const lower = v.trim().toLowerCase();
  return HEX.test(lower) ? lower : fallback;
}

function radius(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 32 ? v : fallback;
}

function url(v: unknown): string | null {
  return typeof v === "string" && URL_OK.test(v) && !/^\/\//.test(v) ? v : null;
}

/** Turns whatever is stored into a complete, safe brand. Each field falls back to the default on its own. */
export function parseBrand(input: unknown): BrandTokens {
  let raw: unknown = input;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = null;
    }
  }
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const c = (o.colors && typeof o.colors === "object" ? o.colors : {}) as Record<string, unknown>;
  const colors = Object.fromEntries(COLOR_SLOTS.map((s) => [s, color(c[s], DEFAULT_BRAND.colors[s])])) as Record<ColorSlot, string>;
  return {
    colors,
    pairing: isPairingId(o.pairing) ? o.pairing : DEFAULT_BRAND.pairing,
    radiusCard: radius(o.radiusCard, DEFAULT_BRAND.radiusCard),
    radiusControl: radius(o.radiusControl, DEFAULT_BRAND.radiusControl),
    logoUrl: url(o.logoUrl),
    logoLightUrl: url(o.logoLightUrl),
  };
}

function channel(n: number): number {
  const s = n / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const v = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((v >> 16) & 255) + 0.7152 * channel((v >> 8) & 255) + 0.0722 * channel(v & 255);
}

/** WCAG contrast ratio, 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** White or near-black, whichever reads better on the fill. */
export function onColor(hex: string): string {
  return contrastRatio("#ffffff", hex) >= contrastRatio("#141414", hex) ? "#ffffff" : "#141414";
}

const PAIRS: [ColorSlot, ColorSlot, string][] = [
  ["ink", "canvas", "Your text is too light to read on your background."],
  ["onHighlight", "highlight", "The text on your main button is hard to read."],
  ["canvas", "primaryDeep", "Text on your dark bands is hard to read."],
];

/** Plain-words problems where a pair falls below WCAG AA (4.5 to 1). Empty means every pair reads well. */
export function contrastProblems(b: BrandTokens): string[] {
  return PAIRS.filter(([fg, bg]) => contrastRatio(b.colors[fg], b.colors[bg]) < 4.5).map(([, , message]) => message);
}
