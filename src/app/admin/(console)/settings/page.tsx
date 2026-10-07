import Link from "next/link";
import { buildSettings } from "@/lib/layout/sections";
import { findSubcategory } from "@/lib/layout/registry";

export default function SettingsHub() {
  const groups = buildSettings();
  return (
    <div className="space-y-10">
      <div>
        <p className="kicker">Settings</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-admin-ink">Settings</h1>
        <p className="mt-2 max-w-2xl text-admin-muted">How your command center is set up, who can get in, and how your data is kept safe.</p>
      </div>
      {groups.map((g) => (
        <section key={g.label} className="space-y-3">
          <h2 className="text-lg font-semibold text-admin-ink">{g.label}</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {g.entries.map((e) => {
              const [category, sub] = e.key.split(".");
              const blurb = findSubcategory(category, sub)?.sub.blurb ?? "";
              return (
                <Link key={e.key} href={e.href} className="surface block p-5 transition-shadow duration-200 ease-breath hover:shadow-md">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-admin-ink">{e.label}</p>
                    {e.state !== "built" && <span className="chip">Ready to set up</span>}
                  </div>
                  <p className="mt-1 text-sm text-admin-muted">{blurb}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
