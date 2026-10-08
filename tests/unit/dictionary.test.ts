import { describe, it, expect, vi, afterEach } from "vitest";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { entryForPage, entryPath, entryWritten, sectionLabel, pagePrompt } from "@/lib/dictionary/numbers";
import { dictionaryPrompt, chiefName, checkSystemPrompt, connectDoorPrompt, FRONT_DOOR } from "@/lib/dictionary/prompt";
import { dictionaryPrompt as fromLinks } from "@/lib/links";
import { cleanChiefName, validateProfile, PROFILE_FIELDS, type Profile } from "@/lib/validate";

const DASH = /[–—]/;
const EMPTY: Profile = Object.fromEntries(PROFILE_FIELDS.map((k) => [k, ""])) as Profile;

afterEach(() => vi.restoreAllMocks());

describe("chiefName", () => {
  it("says Claude until a name is set", () => {
    expect(chiefName({ ...EMPTY, chief_name: "" })).toBe("Claude");
    expect(chiefName({ ...EMPTY, chief_name: "   " })).toBe("Claude");
  });
  it("gives the owner's chosen name, trimmed", () => {
    expect(chiefName({ ...EMPTY, chief_name: "  Sage " })).toBe("Sage");
  });
});

describe("chief_name validation", () => {
  it("takes a short name of letters, spaces, apostrophes and hyphens, and allows empty", () => {
    for (const ok of ["Sage", "Mary-Jo", "O'Neil", "Ana Sofia", "Zoë", ""]) expect(cleanChiefName(ok), ok).toEqual({ ok: true, value: ok });
    expect(cleanChiefName("  Sage  ")).toEqual({ ok: true, value: "Sage" });
  });
  it("refuses digits, symbols, line breaks and anything over 40 characters", () => {
    for (const bad of ["R2D2", "Sage!", "<b>", "Sage\nBot", "a".repeat(41), "--", "'"]) expect(cleanChiefName(bad).ok, bad).toBe(false);
  });
  it("is a profile field, checked with the rest", () => {
    expect(PROFILE_FIELDS).toContain("chief_name");
    const r = validateProfile({ business: "Harbor", chief_name: "R2D2" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors)).toEqual(["chief_name"]);
    const good = validateProfile({ business: "Harbor", chief_name: " Sage " });
    expect(good.ok && good.value.chief_name).toBe("Sage");
  });
});

describe("the dictionary numbers", () => {
  it("find a job, a Brand page and an Agentic page by the ids numbers.yaml uses", () => {
    expect(entryForPage("sell/leads")).toEqual({ number: "4.2.1", title: "Capture leads", entry: null });
    expect(entryForPage("brand/story")).toEqual({ number: "2.3", title: "Story and voice", entry: null });
    expect(entryForPage("agentic/agents")).toEqual({ number: "3.1", title: "Agents", entry: null });
  });
  it("give null for a page that has no number", () => {
    expect(entryForPage("sell/nothing-here")).toBeNull();
    expect(entryForPage("")).toBeNull();
  });
  it("name the entry's file and the section of a number", () => {
    expect(entryPath("frameworks/foundation")).toBe("ninja/frameworks/foundation.md");
    expect(["0.3", "1.2", "2.7.1", "3.4.4", "4.2.1", "5.1.1", "6.3.2", "7.2.3"].map(sectionLabel))
      .toEqual(["The path", "Command center", "Brand", "Agentic", "Grow", "Serve", "Run", "Settings and security"]);
  });
  it("count an entry as written only when its file ships in ninja/", () => {
    const root = mkdtempSync(path.join(tmpdir(), "dict-"));
    mkdirSync(path.join(root, "ninja/frameworks"), { recursive: true });
    writeFileSync(path.join(root, "ninja/frameworks/foundation.md"), "# Foundation\n");
    expect(entryWritten({ number: "0.3", title: "Foundation", entry: "frameworks/foundation" }, root)).toBe(true);
    expect(entryWritten({ number: "0.1", title: "Prep", entry: "frameworks/prep" }, root)).toBe(false);
    expect(entryWritten({ number: "4.2.1", title: "Capture leads", entry: null }, root)).toBe(false);
    expect(entryWritten({ number: "9", title: "x", entry: "../../etc/passwd" }, root)).toBe(false);
  });
  it("answer null for every page and log once when numbers.yaml is missing", () => {
    const root = mkdtempSync(path.join(tmpdir(), "dict-missing-"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(entryForPage("sell/leads", root)).toBeNull();
    expect(entryForPage("brand/story", root)).toBeNull();
    expect(log).toHaveBeenCalledTimes(1);
    expect(pagePrompt("Sage", "sell/leads", "Capture leads", root))
      .toBe("Sage, read ninja/library.md and help me with Capture leads. Ask me a few questions about what I want, plan it with me in planning mode, and change nothing until I approve.");
  });
  it("read the file once per process", () => {
    const root = mkdtempSync(path.join(tmpdir(), "dict-once-"));
    mkdirSync(path.join(root, "ninja/foundation"), { recursive: true });
    const file = path.join(root, "ninja/foundation/numbers.yaml");
    writeFileSync(file, 'numbers:\n  - {number: "4.2.1", title: Capture leads, entry: null, page: sell/leads}\n');
    expect(entryForPage("sell/leads", root)?.number).toBe("4.2.1");
    writeFileSync(file, 'numbers:\n  - {number: "9.9.9", title: Capture leads, entry: null, page: sell/leads}\n');
    expect(entryForPage("sell/leads", root)?.number).toBe("4.2.1");
  });
  it("ship with the deployed app, so a Vercel deploy can read them", () => {
    expect(readFileSync("next.config.ts", "utf8")).toMatch(/"\.\/ninja\/\*\*\/\*"/);
  });
});

describe("dictionaryPrompt", () => {
  const written = dictionaryPrompt({ name: "Sage", number: "0.3", title: "Foundation", entry: "frameworks/foundation" });
  const coming = dictionaryPrompt({ name: "Sage", number: "4.2.1", title: "Capture leads", entry: null });
  const plain = dictionaryPrompt({ name: "Sage", number: null, title: "Capture leads", entry: null });

  it("points at the entry's file and the Dojo Dictionary when the entry is written", () => {
    expect(written).toBe(`Sage, follow 0.3 Foundation from the Ninja dictionary. In this project it is ninja/frameworks/foundation.md. Online, it is in the Dojo Dictionary at ${FRONT_DOOR}/raw.`);
  });
  it("plans with the owner and changes nothing when the entry is still coming", () => {
    expect(coming).toBe(`Sage, follow 4.2.1 Capture leads from the Ninja dictionary. Its entry arrives in a coming update, so read ninja/library.md, ask me a few questions about what I want, plan it with me in planning mode, and change nothing until I approve. Online, the Dojo Dictionary is at ${FRONT_DOOR}/raw.`);
  });
  it("falls back to the library when the page has no number", () => {
    expect(plain).toBe("Sage, read ninja/library.md and help me with Capture leads. Ask me a few questions about what I want, plan it with me in planning mode, and change nothing until I approve.");
  });
  it("always starts with the name and never uses a long dash", () => {
    for (const p of [written, coming, plain]) {
      expect(p.startsWith("Sage, ")).toBe(true);
      expect(p).not.toMatch(DASH);
    }
  });
  it("carries the number and title, and the online copy, whenever there is a number", () => {
    for (const p of [written, coming]) {
      expect(p).toMatch(/\d\.\d/);
      expect(p).toContain("/raw");
    }
    expect(written).toContain("ninja/frameworks/foundation.md");
    expect(coming).toContain("4.2.1 Capture leads");
    expect(fromLinks).toBe(dictionaryPrompt);
  });
  it("uses the shipped numbers for a page", () => {
    expect(pagePrompt("Sage", "sell/leads", "Capture leads")).toBe(coming);
  });
  it("keeps the connect door's purpose in one more sentence", () => {
    expect(connectDoorPrompt(coming)).toBe(`${coming} Start by mapping how a tool I already use for this could connect.`);
  });
  it("names the chief of staff in Check my system", () => {
    expect(checkSystemPrompt("Sage")).toBe("Sage, check my system with the Ninja framework runner.");
  });
});
