"use server";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { hasSession } from "@/lib/auth/session";
import { PIN_OWNER, SESSION_ENDED_MESSAGE, allows } from "@/lib/auth/roles";
import { checkDeps } from "@/lib/checks/deps";
import { describeReport, runChecks } from "@/lib/checks/runner";

export type ChecksResult = { ok: boolean; message: string };

// The owner's button. It takes nothing from the caller: the installed Key's checks run for the current
// period, at the server's now, so no request can pick another app's check or write a run row for one.
export async function runChecksAction(prev: ChecksResult | null): Promise<ChecksResult> {
  void prev; // useActionState passes the last result. Nothing in it, or in any form data, is read.
  const actor = (await hasSession()) ? PIN_OWNER : null;
  if (!actor || !allows(actor, "owner")) return { ok: false, message: SESSION_ENDED_MESSAGE };
  try {
    const db = await getDb();
    if (!db) return { ok: false, message: "Checks run once your database is connected." };
    const deps = await checkDeps(db);
    const report = await runChecks(deps, new Date());
    revalidatePath("/", "layout");
    return { ok: true, message: describeReport(report, deps.checks.length) };
  } catch (err) {
    console.error("runChecksAction failed", err);
    return { ok: false, message: "The checks could not run just now. Try again in a moment." };
  }
}
