import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { dictionaryPrompt } from "./prompt";

// The dictionary's numbers, read from the copy that ships in ninja/foundation/numbers.yaml. Each number is the same
// on a command center page and in the dictionary. next.config.ts traces ninja/ into the deployed app.

export type DictionaryEntry = { number: string; title: string; entry: string | null };

const SECTIONS: Record<string, string> = {
  "0": "The path", "1": "Command center", "2": "Brand", "3": "Agentic", "4": "Grow", "5": "Serve", "6": "Run", "7": "Settings and security",
};
const ENTRY_ID = /^[a-z0-9-]+(\/[a-z0-9-]+)*$/;

// One read per process for each project root. null means the file could not be read, and that was logged once.
const loaded = new Map<string, Map<string, DictionaryEntry> | null>();

function load(root: string): Map<string, DictionaryEntry> | null {
  if (loaded.has(root)) return loaded.get(root) ?? null;
  let byPage: Map<string, DictionaryEntry> | null = null;
  try {
    const doc = parse(readFileSync(path.join(root, "ninja", "foundation", "numbers.yaml"), "utf8")) as { numbers?: unknown } | null;
    if (!Array.isArray(doc?.numbers)) throw new Error("it holds no numbers list");
    byPage = new Map();
    for (const row of doc.numbers as Record<string, unknown>[]) {
      if (row?.retired === true) continue;
      const number = typeof row?.number === "number" ? String(row.number) : row?.number;
      if (typeof row?.page !== "string" || typeof number !== "string" || typeof row.title !== "string") continue;
      const entry = typeof row.entry === "string" && ENTRY_ID.test(row.entry) ? row.entry : null;
      byPage.set(row.page, { number, title: row.title, entry });
    }
  } catch (err) {
    console.error(`dictionary: ninja/foundation/numbers.yaml could not be read, so prompts use plain wording: ${(err as Error).message.split("\n")[0]}`);
  }
  loaded.set(root, byPage);
  return byPage;
}

const LINK_FORM = /^https:\/\/lb-share\.lightbrands\.ai\/s\/[a-z0-9]+$/;
const linksLoaded = new Map<string, Map<string, string>>();

function loadLinks(root: string): Map<string, string> {
  const cached = linksLoaded.get(root);
  if (cached) return cached;
  const links = new Map<string, string>();
  try {
    const doc = parse(readFileSync(path.join(root, "ninja", "foundation", "links.yaml"), "utf8")) as { links?: unknown } | null;
    if (!doc?.links || typeof doc.links !== "object") throw new Error("it holds no links map");
    for (const [id, url] of Object.entries(doc.links as Record<string, unknown>)) {
      if (ENTRY_ID.test(id) && typeof url === "string" && LINK_FORM.test(url)) links.set(id, url);
    }
  } catch (err) {
    console.error(`dictionary: ninja/foundation/links.yaml could not be read, so prompts use the front door: ${(err as Error).message.split("\n")[0]}`);
  }
  linksLoaded.set(root, links);
  return links;
}

/** The address of an entry's own page in the Dojo Dictionary, or null when it is not published. */
export function entryLink(entry: string, root: string = process.cwd()): string | null {
  return loadLinks(root).get(entry) ?? null;
}

/** The numbered entry for a page: <department>/<job>, context/<page> or agentic/<page>, as numbers.yaml names it. */
export function entryForPage(page: string, root: string = process.cwd()): DictionaryEntry | null {
  return load(root)?.get(page) ?? null;
}

export function entryPath(entry: string): string {
  return `ninja/${entry}.md`;
}

/** The section a number sits in, from its first digit. */
export function sectionLabel(number: string): string {
  return SECTIONS[number.split(".")[0] ?? ""] ?? "";
}

/** True when the entry is named and its file ships in this project's ninja/. */
export function entryWritten(e: DictionaryEntry, root: string = process.cwd()): boolean {
  return e.entry !== null && ENTRY_ID.test(e.entry) && existsSync(path.join(root, entryPath(e.entry)));
}

/** The copied prompt for a page, opening with the chief of staff's name. title is used only when the page has no number. */
export function pagePrompt(name: string, page: string, title: string, root: string = process.cwd()): string {
  const e = entryForPage(page, root);
  if (!e) return dictionaryPrompt({ name, number: null, title, entry: null, link: null });
  const entry = entryWritten(e, root) ? e.entry : null;
  return dictionaryPrompt({ name, number: e.number, title: e.title, entry, link: entry ? entryLink(entry, root) : null });
}
