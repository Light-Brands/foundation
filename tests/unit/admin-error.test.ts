import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

describe("the command center's error page", () => {
  it("says what happened calmly, offers a retry and a way back to Today", async () => {
    const { default: AdminError } = await import("@/app/admin/(console)/error");
    const html = renderToStaticMarkup(createElement(AdminError, { error: Object.assign(new Error("boom"), { digest: "d1" }), reset: () => {} }));
    expect(html).toContain("Your command center could not reach its data. Try again in a moment.");
    expect(html).toMatch(/<button[^>]*>Try again<\/button>/);
    expect(html).toContain('href="/admin"');
    expect(html).not.toContain("boom");
    expect(html).not.toMatch(/[–—]/);
  });
});
