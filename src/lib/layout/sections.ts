import { CATEGORIES, type CategoryId } from "./categories";
import { CORE_SCREENS, hrefFor } from "./registry";

export type SectionId = "command" | "brand" | "agentic" | "grow" | "serve" | "run";
export type EntryState = "built" | "ready" | "soon";
export type NavEntry = { key: string; label: string; blurb: string; href: string; state: EntryState; badge: number };
export type NavHeading = { label: string; entries: NavEntry[] };
export type NavSection = { id: SectionId; label: string; blurb: string; headings: NavHeading[]; badge: number };
export type OwnPage = { id: string; label: string; blurb: string; group?: string; state: EntryState };

// The stage grouping. Departments keep their ids, labels and jobs; this only decides where they sit.
export const SECTION_DEPARTMENTS: Record<SectionId, CategoryId[]> = {
  command: ["command"],
  brand: [],
  agentic: [],
  grow: ["attract", "sell"],
  serve: ["deliver", "keep"],
  run: ["money", "team", "plan", "vendors"],
};
export const SETTINGS_DEPARTMENTS: CategoryId[] = ["system", "risk"];

const SECTION_META: Record<SectionId, { label: string; blurb: string }> = {
  command: { label: "Command center", blurb: "Your day, and everything that needs you." },
  brand: { label: "Brand", blurb: "Your essence. Everything your business says and shows pulls from here." },
  agentic: { label: "Agentic", blurb: "Your AI team: the agents, what they know, and the work that runs on its own." },
  grow: { label: "Grow", blurb: "Bring customers in and win them." },
  serve: { label: "Serve", blurb: "Deliver the work and keep your customers." },
  run: { label: "Run", blurb: "The business behind the business." },
};

export const BRAND_PAGES: OwnPage[] = [
  { id: "overview", label: "Overview", blurb: "How complete your brand is, and the next piece that makes everything sharper.", state: "ready" },
  { id: "identity", label: "Identity", blurb: "Your logo, colors and fonts, with a live preview of your command center and your site.", state: "ready" },
  { id: "story", label: "Story and voice", blurb: "Who you are, what you stand for, and how you sound in every word.", state: "ready" },
  { id: "offers", label: "Offers", blurb: "What you sell: the promise, the price, what is included and who it is for.", state: "ready" },
  { id: "audience", label: "Audience", blurb: "Who you serve and the problems they bring, in their own words.", state: "ready" },
  { id: "proof", label: "Proof", blurb: "Testimonials and results from real customers, each with its source and consent.", state: "ready" },
  { id: "assets-library", label: "Library", group: "Assets", blurb: "Every logo, photo and image you have, tagged, with where each one is used.", state: "ready" },
  { id: "assets-upload", label: "Upload", group: "Assets", blurb: "Add files and photos straight from your computer or your phone.", state: "ready" },
  { id: "assets-kit", label: "Brand kit", group: "Assets", blurb: "Your favicon, share image, light and dark logos and social sizes, made from your logo.", state: "ready" },
  { id: "assets-website", label: "From my website", group: "Assets", blurb: "Bring the logos and images from your current website into your library.", state: "ready" },
  { id: "assets-generate", label: "Generate", group: "Assets", blurb: "Create new images in your brand's style for your pages and posts.", state: "ready" },
  { id: "assets-rights", label: "Rights", group: "Assets", blurb: "Where each asset came from, how it can be used, and consent for anyone shown.", state: "ready" },
];

export const AGENTIC_PAGES: OwnPage[] = [
  { id: "agents", label: "Agents", blurb: "Every agent working for your business, and the crew that builds with Claude Code.", state: "ready" },
  { id: "skills", label: "Skills", blurb: "What your agents know how to do, and where each skill is used.", state: "ready" },
  { id: "recipes", label: "Recipes", blurb: "The library of everything you can add to your command center, ready to install.", state: "soon" },
  { id: "routines", label: "Routines", group: "Routines", blurb: "The work that runs on its own: what it does, when it runs, and how it went.", state: "soon" },
  { id: "runs", label: "Runs", group: "Routines", blurb: "The history of every run and what each one produced.", state: "soon" },
  { id: "workflows", label: "Workflows", group: "Routines", blurb: "Steps that run on a trigger, with your approval where a person decides.", state: "soon" },
  { id: "weaves", label: "Weaves", group: "Routines", blurb: "Workflows across departments, such as a signed contract starting a project.", state: "soon" },
];

const OWN: Record<"brand" | "agentic", OwnPage[]> = { brand: BRAND_PAGES, agentic: AGENTIC_PAGES };

function jobEntries(category: CategoryId, badges: Record<string, number>): NavEntry[] {
  const c = CATEGORIES.find((x) => x.id === category)!;
  return c.subcategories.map((s) => {
    const key = `${c.id}.${s.id}`;
    return { key, label: s.label, blurb: s.blurb, href: hrefFor(c.id, s.id), state: key in CORE_SCREENS ? "built" : "ready", badge: badges[key] ?? 0 };
  });
}

function ownHeadings(section: "brand" | "agentic", badges: Record<string, number>): NavHeading[] {
  const headings: NavHeading[] = [];
  for (const p of OWN[section]) {
    const label = p.group ?? "";
    let h = headings.find((x) => x.label === label);
    if (!h) headings.push((h = { label, entries: [] }));
    const key = `${section}.${p.id}`;
    h.entries.push({ key, label: p.label, blurb: p.blurb, href: `/admin/${section}/${p.id}`, state: p.state, badge: badges[key] ?? 0 });
  }
  return headings;
}

function departmentHeadings(ids: CategoryId[], badges: Record<string, number>, unlabeled: boolean): NavHeading[] {
  return ids.map((id) => ({ label: unlabeled ? "" : CATEGORIES.find((c) => c.id === id)!.label, entries: jobEntries(id, badges) }));
}

export function buildSections(badges: Record<string, number> = {}): NavSection[] {
  return (Object.keys(SECTION_META) as SectionId[]).map((id) => {
    const headings =
      id === "brand" || id === "agentic"
        ? ownHeadings(id, badges)
        : departmentHeadings(SECTION_DEPARTMENTS[id], badges, id === "command");
    const badge = headings.flatMap((h) => h.entries).reduce((n, e) => n + e.badge, 0);
    return { id, ...SECTION_META[id], headings, badge };
  });
}

export function buildSettings(badges: Record<string, number> = {}): NavHeading[] {
  return [
    { label: "Settings", entries: jobEntries("system", badges) },
    { label: "Security", entries: jobEntries("risk", badges) },
  ];
}

export function activeEntry(pathname: string, sections: NavSection[], settings: NavHeading[]): string | null {
  const all = [...sections.flatMap((s) => s.headings), ...settings].flatMap((h) => h.entries);
  let best: NavEntry | null = null;
  for (const e of all) {
    const hit = e.href === "/admin" ? pathname === "/admin" : pathname === e.href || pathname.startsWith(e.href + "/");
    if (hit && (!best || e.href.length > best.href.length)) best = e;
  }
  return best?.key ?? null;
}

const STATE_WORDS: Record<EntryState, string> = { built: "running", ready: "ready to set up", soon: "coming soon" };

// What a screen reader hears for a job in any list: its name, then its state, then anything waiting.
export function entryLabel(e: NavEntry): string {
  return [e.label, STATE_WORDS[e.state], e.badge > 0 ? `${e.badge} waiting` : ""].filter(Boolean).join(", ");
}

export function findOwnPage(section: "brand" | "agentic", id: string): OwnPage | undefined {
  return OWN[section].find((p) => p.id === id);
}

export type TabId = "today" | "brand" | "business" | "agentic" | "more";

export const TABS: { id: TabId; label: string; href: string }[] = [
  { id: "today", label: "Today", href: "/admin" },
  { id: "brand", label: "Brand", href: "/admin/brand" },
  { id: "business", label: "Business", href: "/admin/business" },
  { id: "agentic", label: "Agentic", href: "/admin/agentic" },
  { id: "more", label: "More", href: "/admin/more" },
];

export const STAGES: ("grow" | "serve" | "run")[] = ["grow", "serve", "run"];

const SECTION_TAB: Record<SectionId, TabId> = {
  command: "today", brand: "brand", agentic: "agentic", grow: "business", serve: "business", run: "business",
};

function hubFor(pathname: string): TabId | null {
  if (pathname === "/admin") return "today";
  if (pathname === "/admin/brand") return "brand";
  if (pathname === "/admin/business") return "business";
  if (pathname === "/admin/agentic") return "agentic";
  if (pathname === "/admin/more") return "more";
  return null;
}

function sectionOf(key: string, sections: NavSection[]): NavSection | undefined {
  return sections.find((s) => s.headings.some((h) => h.entries.some((e) => e.key === key)));
}

export function tabFor(pathname: string, sections: NavSection[], settings: NavHeading[]): TabId {
  const hub = hubFor(pathname);
  if (hub) return hub;
  if (pathname === "/admin/settings") return "more";
  const key = activeEntry(pathname, sections, settings);
  if (!key) return "today";
  const section = sectionOf(key, sections);
  return section ? SECTION_TAB[section.id] : "more";
}

export function mobileBar(pathname: string, sections: NavSection[], settings: NavHeading[]): { title: string; back: string | null } {
  const hub = hubFor(pathname);
  if (hub) return { title: TABS.find((t) => t.id === hub)!.label, back: null };
  if (pathname === "/admin/settings") return { title: "Settings", back: "/admin/more" };
  const key = activeEntry(pathname, sections, settings);
  const entry = [...sections.flatMap((s) => s.headings), ...settings].flatMap((h) => h.entries).find((e) => e.key === key);
  if (!key || !entry) return { title: "Command center", back: "/admin" };
  const section = sectionOf(key, sections);
  if (!section) return { title: entry.label, back: "/admin/more" };
  const tab = SECTION_TAB[section.id];
  const back = tab === "business" ? `/admin/business?stage=${section.id}` : TABS.find((t) => t.id === tab)!.href;
  return { title: entry.label, back };
}

// Where the desktop top bar says you are: the section, then the page. Hubs are one word.
export function breadcrumb(pathname: string, sections: NavSection[], settings: NavHeading[]): string[] {
  const hub = hubFor(pathname);
  if (hub && hub !== "today") return [TABS.find((t) => t.id === hub)!.label];
  if (pathname === "/admin/settings") return ["Settings"];
  const key = activeEntry(pathname, sections, settings);
  const entry = [...sections.flatMap((s) => s.headings), ...settings].flatMap((h) => h.entries).find((e) => e.key === key);
  if (!key || !entry) return [SECTION_META.command.label];
  const section = sectionOf(key, sections);
  return [section ? section.label : "Settings", entry.label];
}
