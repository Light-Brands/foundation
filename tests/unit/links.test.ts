import { describe, it, expect } from "vitest";
import { lessonHref, customHref, lessonPrompt, connectPrompt, showsHours } from "@/lib/links";

describe("Dojo links", () => {
  it("point at the Dojo with the module named", () => {
    expect(lessonHref("deliver", "booking")).toBe("https://dojo.lightbrands.ai/?ref=foundation&module=deliver.booking&door=lesson");
    expect(customHref("deliver", "booking")).toBe("https://dojo.lightbrands.ai/?ref=foundation&module=deliver.booking&door=custom");
  });
  it("encode URL params safely without injection", () => {
    const lessonWithAmp = lessonHref("cat", "sub&door=custom");
    const lessonWithSpace = lessonHref("cat", "sub space");
    expect(lessonWithAmp).not.toContain("door=custom");
    expect(lessonWithSpace).not.toContain("sub space");
    expect(lessonWithAmp).toContain("module=cat.sub");
    expect(lessonWithSpace).toContain("module=cat.sub");
  });
  it("write a lesson prompt Claude can run inside the Foundation", () => {
    const p = lessonPrompt("Delivery", "Book appointments");
    expect(p).toContain("CLAUDE.md");
    expect(p).toContain('the Delivery job "Book appointments"');
    expect(p).not.toMatch(/[–—]/);
  });
  it("write a connect prompt for existing tools", () => {
    const p = connectPrompt("Delivery", "Book appointments");
    expect(p).toContain("CLAUDE.md");
    expect(p).toContain('the Delivery job "Book appointments"');
    expect(p).not.toMatch(/[–—]/);
    expect(p).not.toBe(lessonPrompt("Delivery", "Book appointments"));
  });
});

describe("showsHours", () => {
  it("is false for Core screens", () => {
    expect(showsHours("Core")).toBe(false);
  });
  it("is true for named time windows", () => {
    expect(showsHours("5 minutes")).toBe(true);
    expect(showsHours("30 minutes")).toBe(true);
    expect(showsHours("2 hours")).toBe(true);
  });
});
