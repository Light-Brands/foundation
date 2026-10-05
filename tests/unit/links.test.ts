import { describe, it, expect } from "vitest";
import { lessonHref, customHref, installPrompt, connectPrompt, installCardCopy, connectCardCopy, showsHours, DOJO_URL } from "@/lib/links";

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
  it("write an install prompt for the Ninja framework runner when the job has a dictionary entry", () => {
    const p = installPrompt("deliver", "booking", "Book appointments", true);
    expect(p).toContain("Install Book appointments (modules/deliver/booking)");
    expect(p).toContain("ninja/runner/run.md");
    expect(p).toContain(DOJO_URL);
    expect(p).toContain("change nothing until I approve the plan");
    expect(p).not.toMatch(/[\u2013\u2014;]/);
  });
  it("ask the runner to explain the job and what to prepare when it has no entry yet, changing nothing", () => {
    const p = installPrompt("deliver", "booking", "Book appointments", false);
    expect(p).not.toContain("Install Book appointments");
    expect(p).toContain("learn verb");
    expect(p).toContain("Book appointments (modules/deliver/booking)");
    expect(p).toContain("what to have ready");
    expect(p).toContain("coming dictionary update");
    expect(p).toContain("ninja/runner/run.md");
    expect(p).toContain("Change nothing in this project.");
    expect(p).not.toMatch(/[\u2013\u2014;]/);
  });
  it("write a connect prompt that maps a connection with the learn verb and changes nothing", () => {
    const p = connectPrompt("deliver", "booking", "Book appointments");
    expect(p).toContain("Book appointments (modules/deliver/booking)");
    expect(p).toContain("learn verb");
    expect(p).toContain("coming dictionary updates");
    expect(p).toContain("what access it would need");
    expect(p).toContain("Change nothing in this project.");
    expect(p).toContain("ninja/runner/run.md");
    expect(p).toContain(DOJO_URL);
    expect(p).not.toMatch(/[\u2013\u2014;]/);
  });
  it("give the install card copy for both states, and the connect card copy", () => {
    expect(installCardCopy(true)).toBe("A build crew asks what you want, plans it with you, builds it, tests it and proves it works.");
    expect(installCardCopy(false)).toBe("This job's install arrives in a coming dictionary update. Until then, Claude maps what it will do for you and what to have ready.");
    const c = connectCardCopy("Book appointments");
    expect(c).toContain("Connections arrive with coming dictionary updates.");
    expect(c).toContain("Until then, Claude maps how a tool you use for Book appointments could connect, what access it would need and what you would see, changing nothing.");
    for (const t of [installCardCopy(true), installCardCopy(false), c]) expect(t).not.toMatch(/[\u2013\u2014;]/);
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
