import { isPairingId, PAIRINGS, type PairingId, type TypeCharacter } from "./pairings";
import { ADMIN_TONES, TONES, type AdminTone } from "./admin-tone";

// The eleven color slots every surface paints with. One color per slot; shades come from color-mix in CSS.
export const COLOR_SLOTS = [
  "canvas", "canvasMuted", "ink", "inkMuted", "hairline",
  "primary", "primaryDeep", "accent", "highlight", "onHighlight", "glow",
] as const;
export type ColorSlot = (typeof COLOR_SLOTS)[number];

// The creative range: levers that change the frame's character beyond its colors. Each is a closed list, so only
// known values ever reach the style tag, and each default reproduces the frame's original look.
export const TYPE_RATIOS = [1.2, 1.25, 1.333] as const;
export const DENSITIES = ["compact", "comfortable", "airy"] as const;
export const SURFACES = ["flat", "soft", "raised", "glass"] as const;
export const MOTIONS = ["still", "subtle", "full"] as const;
export const NAV_MARKERS = ["pill", "rail", "tint"] as const;
export const CHAMBERS = ["glow", "grain", "plain"] as const;
export type TypeRatio = (typeof TYPE_RATIOS)[number];
export type Density = (typeof DENSITIES)[number];
export type SurfaceStyle = (typeof SURFACES)[number];
export type Motion = (typeof MOTIONS)[number];
export type NavMarker = (typeof NAV_MARKERS)[number];
export type Chamber = (typeof CHAMBERS)[number];

export type BrandTokens = {
  colors: Record<ColorSlot, string>;
  pairing: PairingId;
  radiusCard: number;
  radiusControl: number;
  logoUrl: string | null;
  logoLightUrl: string | null;
  /** How fast type steps up: 1.2 calm, 1.25 the default, 1.333 dramatic. */
  typeRatio: TypeRatio;
  density: Density;
  surface: SurfaceStyle;
  motion: Motion;
  /** How the sidebar and the stage control mark where you are. */
  navActive: NavMarker;
  /** The sign-in chamber's atmosphere. */
  chamber: Chamber;
  /** The brand's own type character, over the pairing's. Only the fields set here override. */
  type: Partial<TypeCharacter>;
  /** The command center's neutrals: light (the default), dim or dark. */
  adminTone: AdminTone;
};

// The light tone's canvas (the fallback for --color-admin-canvas in globals.css).
export const ADMIN_CANVAS = TONES.light.neutrals.canvas;

/** The admin canvas a brand paints, for places CSS variables cannot reach, such as the app manifest. */
export function adminCanvas(b: BrandTokens): string {
  return TONES[b.adminTone].neutrals.canvas;
}

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
  typeRatio: 1.25,
  density: "comfortable",
  surface: "soft",
  motion: "full",
  navActive: "pill",
  chamber: "glow",
  type: {},
  adminTone: "light",
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

function oneOf<T extends string | number>(list: readonly T[], v: unknown, fallback: T): T {
  return (list as readonly unknown[]).includes(v) ? (v as T) : fallback;
}

const weight = (v: unknown) => typeof v === "number" && Number.isInteger(v) && v >= 300 && v <= 700 && v % 100 === 0;
const tracking = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v >= -0.05 && v <= 0.2;

function typeOverrides(v: unknown): Partial<TypeCharacter> {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const t: Partial<TypeCharacter> = {};
  if (weight(o.displayWeight)) t.displayWeight = o.displayWeight as number;
  if (weight(o.headingWeight)) t.headingWeight = o.headingWeight as number;
  if (tracking(o.headingTracking)) t.headingTracking = Math.round((o.headingTracking as number) * 1000) / 1000;
  if (o.headingCase === "none" || o.headingCase === "uppercase") t.headingCase = o.headingCase;
  return t;
}

/** The type character a brand renders with: its pairing's, with the brand's own overrides on top. */
export function typeCharacter(b: BrandTokens): TypeCharacter {
  const p = PAIRINGS[b.pairing];
  return {
    displayWeight: b.type.displayWeight ?? p.displayWeight,
    headingWeight: b.type.headingWeight ?? p.headingWeight,
    headingTracking: b.type.headingTracking ?? p.headingTracking,
    headingCase: b.type.headingCase ?? p.headingCase,
  };
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
    typeRatio: oneOf(TYPE_RATIOS, o.typeRatio, DEFAULT_BRAND.typeRatio),
    density: oneOf(DENSITIES, o.density, DEFAULT_BRAND.density),
    surface: oneOf(SURFACES, o.surface, DEFAULT_BRAND.surface),
    motion: oneOf(MOTIONS, o.motion, DEFAULT_BRAND.motion),
    navActive: oneOf(NAV_MARKERS, o.navActive, DEFAULT_BRAND.navActive),
    chamber: oneOf(CHAMBERS, o.chamber, DEFAULT_BRAND.chamber),
    type: typeOverrides(o.type),
    adminTone: oneOf(ADMIN_TONES, o.adminTone ?? o.admin_tone, DEFAULT_BRAND.adminTone),
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
  ["inkMuted", "canvas", "Your secondary text is hard to read on your background."],
  ["canvas", "primaryDeep", "Text on your dark bands is hard to read."],
];

/**
 * Plain-words problems where a pair falls below WCAG AA (4.5 to 1), or where the accent, which marks where you are
 * and what to press, falls below 3 to 1 on the command center's surface in the brand's tone. Empty means every pair
 * reads well.
 */
export function contrastProblems(b: BrandTokens): string[] {
  const problems = PAIRS.filter(([fg, bg]) => contrastRatio(b.colors[fg], b.colors[bg]) < 4.5).map(([, , message]) => message);
  if (contrastRatio(onColor(b.colors.accent), b.colors.accent) < 4.5) problems.push("Text on your buttons is hard to read.");
  if (contrastRatio(b.colors.accent, TONES[b.adminTone].neutrals.surface) < 3) problems.push("Your accent is hard to see in your command center.");
  return problems;
}
