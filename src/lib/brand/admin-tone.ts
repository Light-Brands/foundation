// Admin tone: the command center's own neutrals and status colors, in three closed scales. Light is the frame's
// original look; dim is a slate dusk; dark is near black. The brand picks one, and every value here is a constant,
// so nothing a brand stores ever reaches the style tag except the name of a tone on this list.

export const ADMIN_TONES = ["light", "dim", "dark"] as const;
export type AdminTone = (typeof ADMIN_TONES)[number];

export const ADMIN_NEUTRALS = ["canvas", "surface", "hover", "line", "line-strong", "ink", "muted", "faint", "ghost"] as const;
export type AdminNeutral = (typeof ADMIN_NEUTRALS)[number];

export const STATUS_COLORS = ["good", "good-soft", "warn", "warn-soft", "bad", "bad-soft"] as const;
export type StatusColor = (typeof STATUS_COLORS)[number];

export type ToneScale = {
  scheme: "light" | "dark";
  neutrals: Record<AdminNeutral, string>;
  status: Record<StatusColor, string>;
};

export const TONES: Record<AdminTone, ToneScale> = {
  light: {
    scheme: "light",
    neutrals: {
      canvas: "#f8fafc", surface: "#ffffff", hover: "#f1f5f9", line: "#f1f5f9", "line-strong": "#e2e8f0",
      // Faint and ghost sit a shade deeper than the frame first had them, so faint text reads on a hover row and
      // ghost icons clear 3 to 1.
      ink: "#1e293b", muted: "#475569", faint: "#607086", ghost: "#8391a6",
    },
    status: { good: "#15803d", "good-soft": "#f0fdf4", warn: "#b45309", "warn-soft": "#fffbeb", bad: "#b91c1c", "bad-soft": "#fef2f2" },
  },
  dim: {
    scheme: "dark",
    neutrals: {
      canvas: "#1b1f27", surface: "#232833", hover: "#2c323e", line: "#2a303b", "line-strong": "#373e4b",
      ink: "#eceff4", muted: "#b9bfca", faint: "#9aa1ae", ghost: "#7a8291",
    },
    status: { good: "#6ad49a", "good-soft": "#1f3329", warn: "#f0bb5a", "warn-soft": "#3a3020", bad: "#f59a9a", "bad-soft": "#3b2427" },
  },
  dark: {
    scheme: "dark",
    neutrals: {
      canvas: "#0a0a0c", surface: "#131316", hover: "#1c1c20", line: "#1d1d22", "line-strong": "#2b2b31",
      ink: "#f4f4f5", muted: "#b4b4bb", faint: "#8f8f98", ghost: "#6e6e78",
    },
    status: { good: "#5fd38d", "good-soft": "#10241a", warn: "#f3bd4f", "warn-soft": "#2a2112", bad: "#f68b8b", "bad-soft": "#2d1517" },
  },
};

function channel(n: number): number {
  const s = n / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const v = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((v >> 16) & 255) + 0.7152 * channel((v >> 8) & 255) + 0.0722 * channel(v & 255);
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const TEXT = ["ink", "muted", "faint"] as const;
const GROUNDS = ["canvas", "surface", "hover"] as const;

/**
 * Every pair a tone must hold, as "<foreground> on <background>" for each one that falls short. Text neutrals read at
 * 4.5 to 1 on every ground, ghost (icons and hollow marks) at 3 to 1 on canvas and surface, and each status color
 * at 4.5 to 1 on the surface, the canvas and its own soft fill.
 */
export function toneContrastProblems(t: ToneScale): string[] {
  const color: Record<string, string> = { ...t.neutrals, ...t.status };
  const checks: [string, string, number][] = [
    ...TEXT.flatMap((fg) => GROUNDS.map((bg): [string, string, number] => [fg, bg, 4.5])),
    ["ghost", "canvas", 3],
    ["ghost", "surface", 3],
    ...(["good", "warn", "bad"] as const).flatMap((c): [string, string, number][] => [[c, "surface", 4.5], [c, "canvas", 4.5], [c, `${c}-soft`, 4.5]]),
  ];
  return checks.filter(([fg, bg, floor]) => ratio(color[fg]!, color[bg]!) < floor).map(([fg, bg]) => `${fg} on ${bg}`);
}

/** The tone as CSS declarations: the nine neutrals, the six status colors and the color scheme. */
export function toneVars(tone: AdminTone): string[] {
  const t = TONES[tone];
  return [
    ...ADMIN_NEUTRALS.map((n) => `--admin-${n}:${t.neutrals[n]};`),
    ...STATUS_COLORS.map((s) => `--status-${s}:${t.status[s]};`),
    `--admin-scheme:${t.scheme};`,
  ];
}
