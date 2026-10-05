import { describe, it, expect } from "vitest";
import { lessonHref, customHref, lessonPrompt } from "@/lib/links";

describe("Dojo links", () => {
  it("point at the Dojo with the module named", () => {
    expect(lessonHref("deliver", "booking")).toBe("https://dojo.lightbrands.ai/?ref=foundation&module=deliver.booking&door=lesson");
    expect(customHref("deliver", "booking")).toBe("https://dojo.lightbrands.ai/?ref=foundation&module=deliver.booking&door=custom");
  });
  it("write a prompt Claude can run inside the Foundation", () => {
    const p = lessonPrompt("Deliver", "Booking");
    expect(p).toContain("CLAUDE.md");
    expect(p).toContain("Deliver, Booking");
    expect(p).not.toMatch(/[–—]/);
  });
});
