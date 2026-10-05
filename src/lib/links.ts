// Every link to the Dojo lives here. The Dojo platform plan adds dedicated
// lesson and request pages; until then the Dojo's front door reads these params.
export const DOJO_URL = "https://dojo.lightbrands.ai";

const dojo = (category: string, sub: string, door: "lesson" | "custom") => {
  const params = new URLSearchParams({
    ref: "foundation",
    module: `${category}.${sub}`,
    door,
  });
  return `${DOJO_URL}/?${params.toString()}`;
};

export const lessonHref = (category: string, sub: string) => dojo(category, sub, "lesson");
export const customHref = (category: string, sub: string) => dojo(category, sub, "custom");

export function showsHours(hours: string): boolean {
  return hours !== "Core";
}

export function connectPrompt(categoryLabel: string, subLabel: string): string {
  return [
    `I want to connect a tool I already use for the ${categoryLabel} job "${subLabel}" to my command center.`,
    "Read CLAUDE.md in this project first.",
    "Ask me which tool I use, then explain in plain words how it could connect, what access it would need, and what I would see in my command center once it does.",
    "Ask me one question at a time. Do not change any files until I say go.",
  ].join(" ");
}

export function lessonPrompt(categoryLabel: string, subLabel: string): string {
  return [
    `I want to set up the ${categoryLabel} job "${subLabel}" in my command center.`,
    "Read CLAUDE.md in this project first.",
    `Then tell me in plain words what this job will do for my business, which tools I already use that it could connect to, and what I need ready before we build it.`,
    "Ask me one question at a time. Do not change any files until I say go.",
  ].join(" ");
}
