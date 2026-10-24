import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { START_PROMPT, START_DEEP_LINK, CLAUDE_PRO_URL, DESKTOP_MAC_URL, DESKTOP_WINDOWS_URL } from "@/lib/setup-links";

// The first message the start page hands to Claude Desktop, and the links around it.
const links = (parse(readFileSync(path.join(process.cwd(), "ninja/foundation/links.yaml"), "utf8")) as { links: Record<string, string> }).links;

describe("the start page constants", () => {
  it("keeps the prompt short enough for a deep link", () => {
    expect(START_PROMPT.length).toBeLessThan(5000);
  });
  it("opens the Code tab with the prompt filled in", () => {
    expect(START_DEEP_LINK.startsWith("claude://code/new?q=")).toBe(true);
    expect(decodeURIComponent(START_DEEP_LINK.slice("claude://code/new?q=".length))).toBe(START_PROMPT);
  });
  it("points at the official Claude pages", () => {
    expect(CLAUDE_PRO_URL).toBe("https://claude.com/pricing");
    expect(DESKTOP_MAC_URL).toBe("https://claude.ai/api/desktop/darwin/universal/dmg/latest/redirect");
    expect(DESKTOP_WINDOWS_URL).toBe("https://claude.ai/api/desktop/win32/x64/setup/latest/redirect");
  });
  it("lists each setup step with the address the dictionary records", () => {
    const steps: Array<[string, string]> = [
      ["0.3.2 Bring in your Foundation", "bring-in-your-foundation"],
      ["0.3.3 Connect GitHub", "connect-github"],
      ["0.3.4 Connect Vercel", "connect-vercel"],
      ["0.3.5 Connect your database", "connect-your-database"],
      ["0.3.6 Go live", "go-live"],
    ];
    for (const [label, slug] of steps) {
      const url = links[`frameworks/foundation-setup/${slug}`];
      expect(url, slug).toMatch(/^https:\/\/lb-share\.lightbrands\.ai\/s\//);
      expect(START_PROMPT).toContain(`${label}: ${url}`);
    }
    const found = START_PROMPT.match(/https:\/\/lb-share\.lightbrands\.ai\/s\/\w+/g) ?? [];
    expect(found).toHaveLength(steps.length);
  });
  it("uses no long or short dash characters", () => {
    expect(START_PROMPT).not.toMatch(/[–—]/);
  });
});
