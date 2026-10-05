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
  "Ask me one question at a time, and change nothing until I approve the plan.",
];

export function installPrompt(categoryId: string, jobId: string, jobLabel: string): string {
  return [
    `Install ${jobLabel} (modules/${categoryId}/${jobId}) with the Ninja framework runner.`,
    ...runnerSteps,
  ].join(" ");
}

export function connectPrompt(categoryId: string, jobId: string, jobLabel: string): string {
  return [
    `Connect a tool I already use for ${jobLabel} (modules/${categoryId}/${jobId}) with the Ninja framework runner.`,
    ...runnerSteps,
  ].join(" ");
}
