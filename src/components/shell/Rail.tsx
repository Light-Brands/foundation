"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { activeKey, type NavGroup } from "@/lib/layout/registry";
import { ICONS } from "./icons";

export function Rail({ groups, onNavigate }: { groups: NavGroup[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const uid = useId();
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
        const holdsActive = g.id === owner && active !== null;
        const panelId = `${uid}-nav-${g.id}`;
        return (
          <div key={g.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? "" : g.id)}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 ease-breath hover:bg-white/[0.03] hover:text-white ${
                isOpen || holdsActive ? "text-white" : "text-mist"
              }`}
            >
              <Icon
                size={16}
                strokeWidth={2}
                className={`shrink-0 transition-colors ${holdsActive ? "text-violet-soft" : "text-zinc-500 group-hover:text-zinc-300"}`}
                aria-hidden
              />
              <span className="flex-1 truncate">{g.label}</span>
              {!isOpen && g.badge > 0 && (
                <span className="chip border-violet/30 font-mono text-[11px] text-violet-soft" aria-label={`${g.badge} waiting in ${g.label}`}>
                  {g.badge}
                </span>
              )}
              <ChevronDown
                size={14}
                aria-hidden
                className={`shrink-0 text-zinc-500 transition-transform duration-200 ease-breath ${isOpen ? "" : "-rotate-90"}`}
              />
            </button>
            <div id={panelId} className={`grid transition-[grid-template-rows] duration-300 ease-breath ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <ul className="space-y-0.5 overflow-hidden pl-9" inert={!isOpen}>
                {g.items.map((i) => {
                  const isActive = active === i.key;
                  return (
                    <li key={i.key}>
                      <Link
                        href={i.href}
                        onClick={onNavigate}
                        aria-current={isActive ? "page" : undefined}
                        className={`relative flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-all duration-200 ease-breath ${
                          isActive
                            ? "bg-white/[0.06] text-white ring-1 ring-violet/20"
                            : i.state === "built"
                              ? "text-mist hover:bg-white/[0.03] hover:text-white"
                              : "text-mist/60 hover:bg-white/[0.03] hover:text-zinc-200"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-violet transition-opacity duration-200 ${
                            isActive ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        <span className={isActive ? "text-white" : undefined}>{i.label}</span>
                        {i.badge > 0 && (
                          <span className="font-mono text-[11px] text-violet-soft" aria-label={`${i.badge} waiting`}>
                            {i.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
