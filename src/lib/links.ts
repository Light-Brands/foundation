// Every link to the Dojo lives here. The Dojo platform plan adds dedicated
// lesson and request pages; until then the Dojo's front door reads these params.
export const DOJO_URL = "https://dojo.lightbrands.ai";

// Every copied prompt that sends the owner to a job or a page is built here, from the dictionary's numbers.
export { dictionaryPrompt, connectDoorPrompt, checkSystemPrompt, chiefName, FRONT_DOOR } from "@/lib/dictionary/prompt";

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

// name is the chief of staff's name, the one every copied prompt opens with.
export function installCardCopy(hasEntry: boolean, name = "Claude"): string {
  return hasEntry
    ? "A build crew asks what you want, plans it with you, builds it, tests it and proves it works."
    : `Until the install ships, ${name} asks what you want and plans it with you. Nothing changes until you approve.`;
}

export function connectCardCopy(jobLabel: string, name = "Claude"): string {
  return `Have ${name} map how the tool you already use for ${jobLabel} would connect. Nothing changes until you say so.`;
}

export const CUSTOM_CARD_COPY = "We build it for you and connect it to your command center.";

/** The hours a job gives back, split so the figure can sit in the numeric face: "1 to 3 hours a week" gives
 *  { lead: "", figure: "1 to 3", tail: "hours back each week" }. Core jobs and any other wording give null. */
export function hoursBack(hours: string): { lead: string; figure: string; tail: string } | null {
  const m = hours.match(/^(About )?(\d+(?: to \d+)?) (hours?) a (week|month)$/);
  if (!m) return null;
  return { lead: m[1] ?? "", figure: m[2]!, tail: `${m[3]} back each ${m[4]}` };
}
