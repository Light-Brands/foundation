import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const PALETTE = "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|mist|ink-\\d+|violet-soft|violet-deep";
const PREFIX = "text|bg|border|ring|ring-offset|from|to|via|fill|stroke|placeholder|divide|outline|decoration|shadow|caret|accent";
const RAW = new RegExp(`(?<![\\w-])(?:[a-z]+:)*(?:${PREFIX})-(?:${PALETTE})(?:-\\d{2,3})?(?![\\w-])`, "g");
const HEX_IN_CLASS = /className=["`{][^"`}]*#[0-9a-fA-F]{3,8}/;
// A raw color function inside a Tailwind arbitrary value, such as shadow-[0_0_10px_rgba(52,211,153,0.6)].
const RAW_FN_IN_CLASS = /-\[[^\]\s"'`]*(?<![a-z-])(?:rgba?|hsla?|oklch|oklab)\(/;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) return files(p);
    return p.endsWith(".tsx") ? [p] : [];
  });
}

describe("design tokens", () => {
  it("are the only colors components use", () => {
    const offenders: string[] = [];
    for (const f of files("src")) {
      const text = readFileSync(f, "utf8");
      const hits = text.match(RAW) ?? [];
      if (hits.length) offenders.push(`${f}: ${[...new Set(hits)].join(", ")}`);
      if (HEX_IN_CLASS.test(text)) offenders.push(`${f}: a hex color inside className`);
      if (RAW_FN_IN_CLASS.test(text)) offenders.push(`${f}: a raw color function inside a class`);
    }
    expect(offenders).toEqual([]);
  });
  it("the check can fail", () => {
    expect("text-zinc-200 bg-white/10 hover:text-violet-soft".match(RAW)).toEqual(["text-zinc-200", "bg-white", "hover:text-violet-soft"]);
    expect("text-ink bg-admin-surface text-on-accent".match(RAW)).toBeNull();
    expect(RAW_FN_IN_CLASS.test("shadow-[0_0_10px_rgba(52,211,153,0.6)]")).toBe(true);
    expect(RAW_FN_IN_CLASS.test("shadow-[0_0_10px_color-mix(in_oklch,var(--color-good)_60%,transparent)]")).toBe(false);
  });
});
