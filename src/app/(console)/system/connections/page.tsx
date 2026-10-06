import Link from "next/link";
import { getDb } from "@/lib/db";
import { keySettingState, listConnections } from "@/lib/data/connections";
import { hasTester } from "@/lib/connections/tester";
import { keyRoot } from "@/lib/key/write";
import { TestButton } from "./TestButton";

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
      <div>
        <p className="kicker">Settings · Connect your tools</p>
        <h1 className="mt-1 text-3xl text-zinc-50">Connect your tools</h1>
        <p className="mt-2 max-w-xl text-mist">Every service your business uses, how it was connected, and the name of the setting that holds its key. Keys stay in your host&apos;s settings, never here.</p>
      </div>
      {rows.length === 0 ? (
        <p className="text-mist">
          Nothing is connected yet. Each connection you add appears here with its status. <Link href="/system/modules" className="text-zinc-200 underline">See what you can add</Link>
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            // Only whether the setting holds a value is shown, never the value.
            const keyState = keySettingState(r.key_setting, process.env);
            return (
              <li key={r.service} className="surface p-4">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-zinc-100">{r.service}</p>
                  <p className="text-sm text-mist">{STATUS[r.status]}</p>
                </div>
                <p className="text-sm text-mist">
                  {DOOR[r.door]}
                  {r.key_setting ? `, key in ${r.key_setting}${keyState ? ` (${KEY_STATE[keyState]})` : ""}` : ""}
                  {r.tested_on ? `, tested ${r.tested_on}` : ""}
                </p>
                {r.note && <p className="mt-1 text-sm text-mist">{r.note}</p>}
                {r.scopes.length > 0 && <p className="mt-1 font-mono text-xs text-mist">{r.scopes.join(", ")}</p>}
                {testable.has(r.service) && <TestButton service={r.service} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
