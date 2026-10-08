import Link from "next/link";
import { getDb } from "@/lib/db";
import { keySettingState, listConnections } from "@/lib/data/connections";
import { hasTester } from "@/lib/connections/tester";
import { keyRoot } from "@/lib/key/write";
import { TestButton } from "./TestButton";
import { PageHeader } from "@/components/frame/PageHeader";
import { DictionaryKicker } from "@/components/frame/DictionaryKicker";
import { EmptyState } from "@/components/frame/EmptyState";

const DOOR = { own: "Your own account", custom: "Built by Light Brands" } as const;
const STATUS = { planned: "Planned", connected: "Connected", failing: "Needs a look", disconnected: "Disconnected" } as const;
const KEY_STATE = { set: "set", unset: "not set yet" } as const;

export default async function ConnectionsPage() {
  const rows = await listConnections(await getDb());
  // A connection whose Key keeps a test.ts offers Test now.
  const testable = new Set<string>();
  for (const r of rows) if (await hasTester(keyRoot(), r.service)) testable.add(r.service);
  return (
    <div className="space-y-6">
      <PageHeader
        kicker={<DictionaryKicker page="system/connections" fallback="Settings · Connect your tools" />}
        title="Connect your tools"
        lede={<>Every service your business uses, how it was connected, and the name of the setting that holds its key. Keys stay in your host&apos;s settings, never here.</>}
      />
      {rows.length === 0 ? (
        <EmptyState
          title="Nothing is connected yet."
          body="Each tool you connect appears here with its status. Every job page has a door for connecting the tool you already use for that job."
          action={<Link href="/admin/business" className="btn-primary">Choose a job to connect</Link>}
        />
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            // Only whether the setting holds a value is shown, never the value.
            const keyState = keySettingState(r.key_setting, process.env);
            return (
              <li key={r.service} className="surface p-4">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-admin-ink">{r.service}</p>
                  <p className="text-sm text-admin-muted">{STATUS[r.status]}</p>
                </div>
                <p className="text-sm text-admin-muted">
                  {DOOR[r.door]}
                  {r.key_setting ? `, key in ${r.key_setting}${keyState ? ` (${KEY_STATE[keyState]})` : ""}` : ""}
                  {r.tested_on ? `, tested ${r.tested_on}` : ""}
                </p>
                {r.note && <p className="mt-1 text-sm text-admin-muted">{r.note}</p>}
                {r.scopes.length > 0 && <p className="mt-1 font-mono text-xs text-admin-muted">{r.scopes.join(", ")}</p>}
                {testable.has(r.service) && <TestButton service={r.service} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
