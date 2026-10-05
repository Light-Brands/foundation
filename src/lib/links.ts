// Every link to the Dojo lives here. The Dojo platform plan adds dedicated
// lesson and request pages; until then the Dojo's front door reads these params.
export const DOJO_URL = "https://dojo.lightbrands.ai";

const dojo = (category: string, sub: string, door: "lesson" | "custom") =>
  `${DOJO_URL}/?ref=foundation&module=${category}.${sub}&door=${door}`;

export const lessonHref = (category: string, sub: string) => dojo(category, sub, "lesson");
export const customHref = (category: string, sub: string) => dojo(category, sub, "custom");

export function lessonPrompt(categoryLabel: string, subLabel: string): string {
  return [
    `I want to set up ${categoryLabel}, ${subLabel} in my command center.`,
    "Read CLAUDE.md in this project first.",
    `Then tell me in plain words what ${subLabel} will do for my business, which tools I already use that it could connect to, and what I need ready before we build it.`,
    "Ask me one question at a time. Do not change any files until I say go.",
  ].join(" ");
}
