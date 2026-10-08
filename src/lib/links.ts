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

const runnerSteps = [
  "If this command center folder is open in Claude Code, read ninja/runner/run.md and follow it.",
  `Otherwise read ${DOJO_URL} and run the Ninja framework runner.`,
];
const changeNothing = "Ask me one question at a time. Change nothing in this project.";

// hasEntry: the dictionary has an install entry for this job (ninja/modules/<category>/<job>.md).
export function installPrompt(categoryId: string, jobId: string, jobLabel: string, hasEntry: boolean): string {
  const job = `${jobLabel} (modules/${categoryId}/${jobId})`;
  if (hasEntry) {
    return [
      `Install ${job} with the Ninja framework runner.`,
      ...runnerSteps,
      "Ask me one question at a time, and change nothing until I approve the plan.",
    ].join(" ");
  }
  return [
    `Explain ${job} with the Ninja framework runner, using its learn verb.`,
    "Its install arrives in a coming dictionary update, so tell me what this job will do for my business and what to have ready for it.",
    ...runnerSteps,
    changeNothing,
  ].join(" ");
}

export function connectPrompt(categoryId: string, jobId: string, jobLabel: string): string {
  return [
    `Map how a tool I already use for ${jobLabel} (modules/${categoryId}/${jobId}) could connect, with the Ninja framework runner, using its learn verb.`,
    "Connections arrive with coming dictionary updates, so for now tell me how it would connect, what access it would need and what I would see.",
    ...runnerSteps,
    changeNothing,
  ].join(" ");
}

export function installCardCopy(hasEntry: boolean): string {
  return hasEntry
    ? "A build crew asks what you want, plans it with you, builds it, tests it and proves it works."
    : "Until the install ships, Claude plans what it will do and what to have ready.";
}

export function connectCardCopy(jobLabel: string): string {
  return `Have Claude map how the tool you already use for ${jobLabel} would connect. Nothing changes until you say so.`;
}

export const CUSTOM_CARD_COPY = "We build it for you and connect it to your command center.";

/** The hours a job gives back, split so the figure can sit in the numeric face: "1 to 3 hours a week" gives
 *  { lead: "", figure: "1 to 3", tail: "hours back each week" }. Core jobs and any other wording give null. */
export function hoursBack(hours: string): { lead: string; figure: string; tail: string } | null {
  const m = hours.match(/^(About )?(\d+(?: to \d+)?) (hours?) a (week|month)$/);
  if (!m) return null;
  return { lead: m[1] ?? "", figure: m[2]!, tail: `${m[3]} back each ${m[4]}` };
}
