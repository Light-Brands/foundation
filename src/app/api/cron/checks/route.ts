import { NextResponse } from "next/server";
import { readEnv } from "@/lib/env";
import { getDb } from "@/lib/db";
import { cronAuthorized } from "@/lib/auth/gate";
import { checkDeps } from "@/lib/checks/deps";
import { runChecks } from "@/lib/checks/runner";
import { drainOutbox } from "@/lib/outbox/drain";

export const dynamic = "force-dynamic";

// The host's schedule. The request gate lets it through only with the secret, and it checks again here.
// Nothing in the request chooses what runs: the installed Key's checks, for the current period, with now.
// Then the outbox drains, which sends only while email sending is connected and the pause switch is off.
export async function GET(req: Request) {
  if (!cronAuthorized(req.headers.get("authorization"), readEnv().cronSecret)) return NextResponse.json({ ok: false }, { status: 401 });
  const db = await getDb();
  if (!db) return NextResponse.json({ ok: true, ran: 0, reason: "no-database" });
  const report = await runChecks(await checkDeps(db), new Date());
  const outbox = await drainOutbox(db, process.env, new Date());
  return NextResponse.json({
    ok: true,
    paused: report.paused,
    ran: report.outcomes.filter((o) => o.result !== "already_ran" && o.result !== "skipped").length,
    outbox: { status: outbox.status, sent: outbox.sent },
  });
}
