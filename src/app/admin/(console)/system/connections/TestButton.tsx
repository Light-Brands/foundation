"use client";
import { useActionState } from "react";
import { testConnectionAction, type ConnectionResult } from "./actions";

// Runs a connection's own test from Connect your tools. The answer is also saved on the connection.
export function TestButton({ service }: { service: string }) {
  const [result, run, running] = useActionState<ConnectionResult | null, FormData>(testConnectionAction, null);
  return (
    <form action={run} className="mt-2 flex flex-wrap items-center gap-3">
      <input type="hidden" name="service" value={service} />
      <button type="submit" className="btn-quiet min-h-11" disabled={running}>Test now</button>
      <p role="status" className={`text-sm ${result && !result.ok && !running ? "text-warn" : "text-admin-muted"}`}>{running ? "Testing" : (result?.message ?? "")}</p>
    </form>
  );
}
