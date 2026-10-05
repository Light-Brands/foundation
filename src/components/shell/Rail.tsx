"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { activeKey, type NavGroup } from "@/lib/layout/registry";
import { ICONS } from "./icons";

export function Rail({ groups, onNavigate }: { groups: NavGroup[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = activeKey(pathname, groups);
  const owner = groups.find((g) => g.items.some((i) => i.key === active))?.id ?? "command";
  const [open, setOpen] = useState<string>(owner);
  // Re-sync the open group when navigation moves to another group (derived during render, no effect).
  const [syncedOwner, setSyncedOwner] = useState<string>(owner);
  if (syncedOwner !== owner) {
    setSyncedOwner(owner);
    setOpen(owner);
  }

  return (
    <nav aria-label="Command center" className="space-y-1 p-3">
      {groups.map((g) => {
        const Icon = ICONS[g.icon];
        const isOpen = open === g.id;
        return (
          <div key={g.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? "" : g.id)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-zinc-200 transition hover:bg-white/5"
            >
              <Icon size={16} className="text-mist" aria-hidden />
              <span className="flex-1">{g.label}</span>
              {!isOpen && g.badge > 0 && (
                <span className="rounded-full bg-violet/20 px-2 font-mono text-[11px] text-violet-soft">{g.badge}</span>
              )}
            </button>
            <div className={`grid transition-[grid-template-rows] duration-300 ease-breath ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <ul className="overflow-hidden pl-9" inert={!isOpen}>
                {g.items.map((i) => (
                  <li key={i.key}>
                    <Link
                      href={i.href}
                      onClick={onNavigate}
                      aria-current={active === i.key ? "page" : undefined}
                      className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition ${
                        active === i.key ? "bg-violet/15 text-zinc-50" : i.state === "built" ? "text-zinc-300 hover:text-zinc-50" : "text-mist/70 hover:text-zinc-200"
                      }`}
                    >
                      <span>{i.label}</span>
                      {i.badge > 0 && <span className="font-mono text-[11px] text-violet-soft">{i.badge}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
