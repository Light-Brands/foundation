import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WorkWithClaude } from "@/components/WorkWithClaude";
import { readOpened, markOpened } from "@/lib/claude/default";

function memory(): Storage {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k), clear: () => m.clear(), key: () => null, length: 0 } as Storage;
}
const throwing = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } } as unknown as Storage;

describe("opened flag", () => {
  it("starts false and round-trips", () => {
    const s = memory();
    expect(readOpened(s)).toBe(false);
    expect(markOpened(s)).toBe(true);
    expect(readOpened(s)).toBe(true);
  });
  it("survives a throwing or missing store", () => {
    expect(readOpened(throwing)).toBe(false);
    expect(markOpened(throwing)).toBe(false);
    expect(readOpened(null)).toBe(false);
    expect(markOpened(null)).toBe(false);
  });
});

describe("WorkWithClaude", () => {
  const out = renderToStaticMarkup(createElement(WorkWithClaude, { prompt: "Say hello." }));
  it("names the three targets and the expected warning", () => {
    for (const t of ["Claude Desktop", "claude.ai/code", "Terminal"]) expect(out).toContain(t);
    expect(out).toContain("Nothing is sent until you press Enter.");
    expect(out).toContain("Prompt from an external link");
  });
  it("carries no dash and no second primary", () => {
    expect(out).not.toMatch(/[–—]/);
    expect(out).not.toContain("btn-primary");
  });
});
