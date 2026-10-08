import { describe, it, expect } from "vitest";
import { lessonHref, customHref, installPrompt, connectPrompt, installCardCopy, connectCardCopy, showsHours, hoursBack, CUSTOM_CARD_COPY, DOJO_URL } from "@/lib/links";

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
    expect(installCardCopy(false)).toBe("Until the install ships, Claude plans what it will do and what to have ready.");
    const c = connectCardCopy("Book appointments");
    expect(c).toBe("Have Claude map how the tool you already use for Book appointments would connect. Nothing changes until you say so.");
    for (const t of [installCardCopy(true), installCardCopy(false), c, CUSTOM_CARD_COPY]) expect(t).not.toMatch(/[\u2013\u2014;]/);
  });
  it("split the hours a job gives back so the figure can sit in the numeric face", () => {
    expect(hoursBack("1 to 3 hours a week")).toEqual({ lead: "", figure: "1 to 3", tail: "hours back each week" });
    expect(hoursBack("About 1 hour a month")).toEqual({ lead: "About ", figure: "1", tail: "hour back each month" });
    expect(hoursBack("Core")).toBeNull();
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
