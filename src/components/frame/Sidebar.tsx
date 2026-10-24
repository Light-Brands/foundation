"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { lockGate } from "./lock";
import type { NavHeading, NavSection } from "@/lib/layout/sections";
import { activeEntry, entryState, hubOwner } from "@/lib/layout/sections";
import { SECTION_ICONS, Settings, ExternalLink, ChevronLeft, ChevronDown, Lock, Sparkles } from "./icons";
import { BuildRequestButton } from "@/components/BuildRequest";
import { Monogram } from "./Monogram";
import { StateDot } from "./SectionHub";

type Props = {
  businessName: string;
  /** What the business does, which the build request fills in. */
  whatItDoes?: string;
  logoUrl: string | null;
  sections: NavSection[];
  settings: NavHeading[];
  collapsed: boolean;
  onToggle: () => void;
};

export function Sidebar({ businessName, whatItDoes = "", logoUrl, sections, settings, collapsed, onToggle }: Props) {
  const pathname = usePathname();
  const uid = useId();
  const active = activeEntry(pathname, sections, settings);
  const stage = useSearchParams().get("stage");
  const owner = sections.find((s) => s.headings.some((h) => h.entries.some((e) => e.key === active)))?.id ?? hubOwner(pathname, stage);
  const [open, setOpen] = useState<string>(owner || "command");
  const [synced, setSynced] = useState(owner);
  if (synced !== owner) {
    setSynced(owner);
    if (owner) setOpen(owner);
  }
  const inSettings = settings.some((h) => h.entries.some((e) => e.key === active)) || pathname === "/admin/settings";
  const [lockFailed, setLockFailed] = useState(false);
  const quiet = "text-admin-muted hover:bg-admin-hover hover:text-admin-ink";

  return (
    <div className="flex h-full flex-col bg-admin-surface">
      <div className={`flex items-center justify-between border-b border-admin-line py-3 ${collapsed ? "px-2" : "px-4"}`}>
        <Link href="/admin" className="group flex min-w-0 items-center gap-2.5">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-8 w-8 shrink-0 object-contain transition-transform duration-200 group-hover:scale-110" />
          ) : (
            <Monogram name={businessName} />
          )}
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold tracking-tight text-admin-ink">{businessName}</span>
              <span className="-mt-0.5 block text-[11px] text-admin-muted">Command center</span>
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand the menu" : "Collapse the menu"}
          title="Toggle the menu (⌘B)"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-admin-ghost transition-colors hover:bg-admin-hover hover:text-admin-muted"
        >
          <ChevronLeft size={16} className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      <nav aria-label="Command center" className="focus-inset min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-8 pt-3 [mask-image:linear-gradient(to_bottom,black_calc(100%-2rem),transparent)]">
        {sections.map((s) => {
          const Icon = SECTION_ICONS[s.id];
          const isOpen = open === s.id && !collapsed;
          const holdsActive = s.id === owner;
          const panelId = `${uid}-${s.id}`;
          return (
            <div key={s.id}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                title={collapsed ? s.label : undefined}
                aria-label={collapsed && s.badge > 0 ? `${s.label}, ${s.badge} waiting` : undefined}
                onClick={() => (collapsed ? onToggle() : setOpen(isOpen ? "" : s.id))}
                className={`group relative flex w-full items-center gap-2.5 rounded-control px-3 py-2 text-left text-[13px] font-medium transition-colors duration-200 ease-breath ${
                  holdsActive ? "text-admin-ink" : quiet
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon size={16} aria-hidden className={holdsActive ? "text-admin-ink" : "text-admin-ghost group-hover:text-admin-muted"} />
                {!collapsed && <span className="flex-1 truncate">{s.label}</span>}
                {collapsed && s.badge > 0 && <span data-badge-dot="" aria-hidden className="absolute right-3 top-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-admin-surface" />}
                {!collapsed && !isOpen && s.badge > 0 && (
                  <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-on-accent" data-badge="" aria-label={`${s.badge} waiting in ${s.label}`}>
                    {s.badge}
                  </span>
                )}
                {!collapsed && <ChevronDown size={14} aria-hidden className={`text-admin-ghost transition-transform duration-200 ease-breath ${isOpen ? "" : "-rotate-90"}`} />}
              </button>
              <div id={panelId} className={`grid transition-[grid-template-rows] duration-300 ease-breath ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden" inert={!isOpen}>
                  {s.headings.map((h) => (
                    <div key={h.label || "main"} className="mt-1">
                      {h.label && <h3 data-group={h.label} className="kicker mb-1 mt-3 pl-9">{h.label}</h3>}
                      <ul className="space-y-0.5 pl-6">
                        {h.entries.map((e) => {
                          const isActive = active === e.key;
                          return (
                            <li key={e.key}>
                              <Link
                                href={e.href}
                                aria-current={isActive ? "page" : undefined}
                                className={`flex items-center gap-2.5 rounded-control px-3 py-1.5 text-[13px] transition-colors duration-200 ease-breath ${
                                  isActive
                                    ? "nav-active"
                                    : e.state === "built"
                                      ? quiet
                                      : "text-admin-faint hover:bg-admin-hover hover:text-admin-muted"
                                }`}
                              >
                                <StateDot state={e.state} />
                                <span className="min-w-0 flex-1 leading-snug">{e.label}<span className="sr-only">, {entryState(e)}</span></span>
                                {e.state === "soon" && (
                                  <span className="inline-flex shrink-0 items-center rounded-full bg-admin-hover px-1.5 py-0.5 text-[11px] font-semibold uppercase leading-none tracking-wide text-admin-faint">Soon</span>
                                )}
                                {e.badge > 0 && (
                                  <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-on-accent" data-badge="">{e.badge}</span>
                                )}
                                {e.badge > 0 && (
                                  <span className="sr-only">, waiting</span>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="space-y-0.5 border-t border-admin-line p-2">
        <Link
          href="/admin/settings"
          aria-current={inSettings ? "page" : undefined}
          title={collapsed ? "Settings" : undefined}
          className={`flex items-center gap-2.5 rounded-control px-3 py-2 text-[13px] font-medium transition-colors ${inSettings ? "nav-active" : quiet} ${collapsed ? "justify-center" : ""}`}
        >
          <Settings size={16} aria-hidden className={inSettings ? undefined : "text-admin-ghost"} />
          {!collapsed && <span>Settings</span>}
        </Link>
        <a href="/" target="_blank" rel="noreferrer" title={collapsed ? "View my site" : undefined} className={`flex items-center gap-2.5 rounded-control px-3 py-2 text-[13px] font-medium transition-colors ${quiet} ${collapsed ? "justify-center" : ""}`}>
          <ExternalLink size={16} aria-hidden className="text-admin-ghost" />
          {!collapsed && <span>View my site</span>}
        </a>
        <BuildRequestButton
          business={businessName}
          whatItDoes={whatItDoes}
          title={collapsed ? "Have Light Brands build it for you" : undefined}
          className={`flex w-full items-center gap-2.5 rounded-control px-3 py-2 text-left text-[13px] font-medium transition-colors ${quiet} ${collapsed ? "justify-center" : ""}`}
        >
          <Sparkles size={16} aria-hidden className="shrink-0 text-admin-ghost" />
          {collapsed ? <span className="sr-only">Have Light Brands build it for you</span> : <span className="leading-snug">Have Light Brands build it for you</span>}
        </BuildRequestButton>
        <button
          type="button"
          title={collapsed ? (lockFailed ? "Could not lock. Try again." : "Lock") : undefined}
          onClick={async () => setLockFailed(!(await lockGate()))}
          className={`flex w-full items-center gap-2.5 rounded-control px-3 py-2 text-[13px] font-medium transition-colors ${lockFailed ? "text-bad hover:bg-admin-hover" : quiet} ${collapsed ? "justify-center" : ""}`}
        >
          <Lock size={16} aria-hidden className={lockFailed ? undefined : "text-admin-ghost"} />
          {!collapsed && <span role={lockFailed ? "status" : undefined}>{lockFailed ? "Could not lock. Try again." : "Lock"}</span>}
        </button>
      </div>
    </div>
  );
}
