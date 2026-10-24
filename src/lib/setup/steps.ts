import type { DriverKind } from "@/lib/db/driver";
import type { ConnectionStatus } from "@/lib/data/connections";

export type StepStatus = "done" | "next" | "later";
export type StackStep = {
  id: "github" | "vercel" | "database" | "owner" | "domain" | "email" | "claude" | "dojo";
  label: string;
  unlocks: string;
  status: StepStatus;
  prompt?: string;
  custom: boolean;
};

export function stackStatus(env: Record<string, string | undefined>, facts: { storage: DriverKind; connections?: Record<string, ConnectionStatus>; emailSending?: boolean }): StackStep[] {
  const onVercel = env.VERCEL === "1";
  const prod = env.VERCEL_PROJECT_PRODUCTION_URL ?? "";
  const doneIds = new Set<StackStep["id"]>();
  if (!onVercel || env.VERCEL_GIT_REPO_SLUG) doneIds.add("github");
  if (onVercel) doneIds.add("vercel");
  if (onVercel && prod !== "" && !prod.endsWith(".vercel.app")) doneIds.add("domain");
  if (!onVercel && facts.storage === "pglite") doneIds.add("claude");
  const conn = facts.connections ?? {};
  if (conn["hosted-database"] === "connected") doneIds.add("database");
  // emailSending is emailSendingActive(db), the one rule for whether email sends on its own.
  if (facts.emailSending) doneIds.add("email");

  const base: Omit<StackStep, "status">[] = [
    { id: "github", label: "GitHub", unlocks: "Your code, its history, and updates from Light Brands.", custom: true, prompt: "setup/connect-github" },
    { id: "vercel", label: "Vercel", unlocks: "Your command center, live on its own address.", custom: true, prompt: "setup/connect-vercel" },
    { id: "database", label: "Database", unlocks: "Saving on your live site with your own Neon database, your inbox going live, and team accounts.", custom: true },
    { id: "owner", label: "Your account", unlocks: "Signing in with your email in place of the PIN.", custom: true },
    { id: "domain", label: "Your domain", unlocks: "Your command center on your own address, like command.yourbusiness.com.", custom: true, prompt: "setup/own-domain" },
    { id: "email", label: "Email sending", unlocks: "Confirmations and reminders sent from your own domain.", custom: true },
    { id: "claude", label: "Claude", unlocks: "Building every part of your business with prompts, and a working local copy.", custom: true, prompt: "setup/bring-in-your-foundation" },
    { id: "dojo", label: "The Dojo", unlocks: "Lessons, verification, and your next three modules named for your business.", custom: true },
  ];

  // A deployed copy cannot detect a local Claude setup, so the highlight stays on Claude until a later phase detects it through the Dojo key.
  // The one next step: Claude while it is not done, else the first available step not done.
  const candidates = base.filter((s) => s.prompt && !doneIds.has(s.id));
  const next = candidates.find((s) => s.id === "claude") ?? candidates[0];

  return base.map((s) => ({
    ...s,
    status: doneIds.has(s.id) ? "done" : s.id === next?.id ? "next" : "later",
  }));
}
