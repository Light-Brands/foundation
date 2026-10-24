import { describe, it, expect, vi, afterEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { START_DEEP_LINK, START_PROMPT, CLAUDE_PRO_URL, DESKTOP_MAC_URL, DESKTOP_WINDOWS_URL } from "@/lib/setup-links";

// The public /start page exists only on the demo deployment (FOUNDATION_DEMO_DEPLOY=on).
const notFound = vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); });
vi.mock("next/navigation", () => ({ notFound }));

const render = async () => {
  const { default: StartPage } = await import("@/app/start/page");
  return renderToStaticMarkup(StartPage());
};

afterEach(() => { vi.unstubAllEnvs(); notFound.mockClear(); });

describe("the start page", () => {
  it("answers not found without the demo flag", async () => {
    for (const value of [undefined, "", "off", "ON"]) {
      vi.stubEnv("FOUNDATION_DEMO_DEPLOY", value as string);
      await expect(render()).rejects.toThrow("NEXT_NOT_FOUND");
    }
    expect(notFound).toHaveBeenCalled();
  });

  it("with the flag shows three steps and their actions", async () => {
    vi.stubEnv("FOUNDATION_DEMO_DEPLOY", "on");
    const h = await render();
    expect(notFound).not.toHaveBeenCalled();
    for (const t of ["Your own command center", "Build your business with Claude", "Get Claude Pro", "Download Claude Desktop", "Start your build", "Open in Claude Desktop", "Download for Mac", "hello@lightbrands.ai"]) expect(h).toContain(t);
    expect(h).toContain(`href="${CLAUDE_PRO_URL}"`);
    expect(h).toContain(`href="${DESKTOP_MAC_URL}"`);
    expect(h).toContain(`href="${DESKTOP_WINDOWS_URL}"`);
    expect(h).toContain('href="mailto:hello@lightbrands.ai"');
    // React escapes the apostrophe the encoder leaves alone, so compare the link the browser would read.
    expect(h).toContain(`href="${START_DEEP_LINK.replaceAll("'", "&#x27;")}"`);
    expect(h).toContain("foundation-command-center");
    expect(h).toContain("Set up my Foundation command center with me");
    expect(START_PROMPT.length).toBeGreaterThan(0);
    expect(h).not.toMatch(/[–—]/);
  });
});
