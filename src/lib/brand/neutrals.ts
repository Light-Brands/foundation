import { ADMIN_NEUTRALS, STATUS_COLORS, TONES, toneContrastProblems, type AdminNeutral, type AdminTone, type ToneScale } from "./admin-tone";
import type { BrandTokens } from "./tokens";

// Brand tinted neutrals: the command center's grays take the brand's hue at low chroma, on top of the current tone.
// Each gray keeps its lightness, so the tone's character holds, and the result must pass every pair the tone itself
// passes (toneContrastProblems). When a tint would cost contrast it is softened, and at worst the tone's own grays
// are used. ADMIN_TONES and TONES are never changed: the tinted scale is a new value built from them.

type Lch = { l: number; c: number; h: number };

const toLinear = (n: number) => {
  const s = n / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const fromLinear = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);

/** A #rrggbb color in OKLCH: lightness 0 to 1, chroma, and hue in degrees. */
export function oklch(hex: string): Lch {
  const v = parseInt(hex.slice(1), 16);
  const [r, g, b] = [toLinear((v >> 16) & 255), toLinear((v >> 8) & 255), toLinear(v & 255)];
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const h = (Math.atan2(B, A) * 180) / Math.PI;
  return { l: L, c: Math.hypot(A, B), h: h < 0 ? h + 360 : h };
}

// The linear sRGB channels of an OKLCH color, which may fall outside 0 to 1 when the color is out of gamut.
function linearRgb({ l: L, c, h }: Lch): [number, number, number] {
  const A = c * Math.cos((h * Math.PI) / 180);
  const B = c * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (rgb: number[]) => rgb.every((x) => x >= -1e-6 && x <= 1 + 1e-6);

/** An OKLCH color as #rrggbb, with chroma reduced until it fits sRGB, so lightness and hue hold. */
export function hexFromOklch(color: Lch): string {
  let c = color.c;
  if (!inGamut(linearRgb({ ...color, c }))) {
    let lo = 0;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + c) / 2;
      if (inGamut(linearRgb({ ...color, c: mid }))) lo = mid;
      else c = mid;
    }
    c = lo;
  }
  const rgb = linearRgb({ ...color, c });
  return `#${rgb.map((x) => Math.round(Math.min(1, Math.max(0, fromLinear(Math.min(1, Math.max(0, x))))) * 255).toString(16).padStart(2, "0")).join("")}`;
}

// How much of the brand's chroma each gray may take: the grounds barely, the lines a little more, the text most.
const CHROMA: Record<AdminNeutral, number> = {
  canvas: 0.012, surface: 0.008, hover: 0.014, line: 0.014, "line-strong": 0.016,
  ink: 0.018, muted: 0.03, faint: 0.03, ghost: 0.028,
};
// Each attempt softens the tint, until the tinted scale passes every pair the tone passes.
const STRENGTHS = [1, 0.75, 0.5, 0.25];

function tint(t: ToneScale, hue: number, maxChroma: number, k: number): ToneScale {
  const neutrals = Object.fromEntries(ADMIN_NEUTRALS.map((n) => {
    const { l } = oklch(t.neutrals[n]);
    return [n, hexFromOklch({ l, c: Math.min(CHROMA[n] * k, maxChroma), h: hue })];
  })) as Record<AdminNeutral, string>;
  return { scheme: t.scheme, neutrals, status: t.status };
}

/** The tone's grays tinted with a brand color's hue, or the tone itself when no tint keeps every contrast pair. */
export function tintedTone(tone: AdminTone, brandHex: string): ToneScale {
  const t = TONES[tone];
  const { c, h } = oklch(brandHex);
  // A gray brand gives gray neutrals: its chroma caps the tint.
  for (const k of STRENGTHS) {
    const scale = tint(t, h, c, k);
    if (toneContrastProblems(scale).length === 0) return scale;
  }
  return t;
}

/** The admin scale a brand renders with: its tone as it is with slate neutrals, tinted with its primary with brand. */
export function brandTone(b: Pick<BrandTokens, "adminTone" | "neutrals" | "colors">): ToneScale {
  return b.neutrals === "brand" ? tintedTone(b.adminTone, b.colors.primary) : TONES[b.adminTone];
}

/** A scale as CSS declarations, in the same order and names as toneVars. */
export function scaleVars(t: ToneScale): string[] {
  return [
    ...ADMIN_NEUTRALS.map((n) => `--admin-${n}:${t.neutrals[n]};`),
    ...STATUS_COLORS.map((s) => `--status-${s}:${t.status[s]};`),
    `--admin-scheme:${t.scheme};`,
  ];
}
