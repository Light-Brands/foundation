import type { Profile } from "@/lib/validate";

// The Dojo Dictionary online. Adding /raw to any of its addresses gives the page as plain Markdown.
export const FRONT_DOOR = "https://lb-share.lightbrands.ai/s/dvsaxjofhnyr9bb6";

/** The name the owner gave their chief of staff, or Claude until they choose one. Every copied prompt opens with it. */
export function chiefName(profile: Pick<Profile, "chief_name">): string {
  return profile.chief_name.trim() || "Claude";
}

const PLAN_FIRST = "plan it with me in planning mode, and change nothing until I approve";

/**
 * The one prompt every ready page copies: it opens with the chief of staff's name, then points at the page's
 * numbered entry in the Ninja dictionary, in this project and online. entry is the entry's id when its file ships
 * in ninja/, else null. number is null only for a page the dictionary has no number for.
 */
export function dictionaryPrompt({ name, number, title, entry }: {
  name: string;
  number: string | null;
  title: string;
  entry: string | null;
}): string {
  if (number === null) {
    return `${name}, read ninja/library.md and help me with ${title}. Ask me a few questions about what I want, ${PLAN_FIRST}.`;
  }
  const follow = `${name}, follow ${number} ${title} from the Ninja dictionary.`;
  if (entry !== null) {
    return `${follow} In this project it is ninja/${entry}.md. Online, it is in the Dojo Dictionary at ${FRONT_DOOR}/raw.`;
  }
  return `${follow} Its entry arrives in a coming update, so read ninja/library.md, ask me a few questions about what I want, ${PLAN_FIRST}. Online, the Dojo Dictionary is at ${FRONT_DOOR}/raw.`;
}

/** A prompt's first sentence, the line a phone shows above the whole prompt. */
export function promptLead(prompt: string): string {
  const end = prompt.search(/\.(\s|$)/);
  return end === -1 ? prompt : prompt.slice(0, end + 1);
}

/** The connect door's prompt: the same dictionary prompt, starting from a tool the owner already uses. */
export function connectDoorPrompt(prompt: string): string {
  return `${prompt} Start by mapping how a tool I already use for this could connect.`;
}

export function checkSystemPrompt(name: string): string {
  return `${name}, check my system with the Ninja framework runner.`;
}
