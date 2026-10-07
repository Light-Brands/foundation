"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import type { NavHeading, NavSection } from "@/lib/layout/sections";
import { activeEntry } from "@/lib/layout/sections";
import { SECTION_ICONS, Settings, ExternalLink, ChevronLeft, ChevronDown, Lock } from "./icons";

type Props = {
  businessName: string;
  logoUrl: string | null;
  sections: NavSection[];
  settings: NavHeading[];
  collapsed: boolean;
  onToggle: () => void;
};

export function Monogram({ name }: { name: string }) {
  const letters = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
  return <span className="flex h-8 w-8 items-center justify-center rounded-control bg-accent font-label text-xs font-semibold text-on-accent">{letters || "C"}</span>;
}

export function Sidebar({ businessName, logoUrl, sections, settings, collapsed, onToggle }: Props) {
  const pathname = usePathname();
  const uid = useId();
  const active = activeEntry(pathname, sections, settings);
  const owner = sections.find((s) => s.headings.some((h) => h.entries.some((e) => e.key === active)))?.id ?? "";
  const [open, setOpen] = useState<string>(owner || "command");
  const [synced, setSynced] = useState(owner);
  if (synced !== owner) {
    setSynced(owner);
    if (owner) setOpen(owner);
  }
  const inSettings = settings.some((h) => h.entries.some((e) => e.key === active)) || pathname === "/admin/settings";
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
              <span className="-mt-0.5 block text-[9px] tracking-wider text-admin-faint">Command center</span>
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand the menu" : "Collapse the menu"}
          title="Toggle the menu (⌘B)"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-admin-faint transition-colors hover:bg-admin-hover hover:text-admin-muted"
        >
          <ChevronLeft size={16} className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      <nav aria-label="Command center" className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-3">
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
                onClick={() => (collapsed ? onToggle() : setOpen(isOpen ? "" : s.id))}
                className={`group flex w-full items-center gap-2.5 rounded-control px-3 py-2 text-left text-[13px] font-medium transition-colors duration-200 ease-breath ${
                  holdsActive ? "text-admin-ink" : quiet
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon size={16} aria-hidden className={holdsActive ? "text-accent" : "text-admin-faint group-hover:text-admin-muted"} />
                {!collapsed && <span className="flex-1 truncate">{s.label}</span>}
                {!collapsed && !isOpen && s.badge > 0 && (
                  <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-on-accent" aria-label={`${s.badge} waiting in ${s.label}`}>
                    {s.badge}
                  </span>
                )}
                {!collapsed && <ChevronDown size={14} aria-hidden className={`text-admin-faint transition-transform duration-200 ease-breath ${isOpen ? "" : "-rotate-90"}`} />}
              </button>
              <div id={panelId} className={`grid transition-[grid-template-rows] duration-300 ease-breath ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden" inert={!isOpen}>
                  {s.headings.map((h) => (
                    <div key={h.label || "main"} className="mt-1">
                      {h.label && <h3 className="mb-1 mt-2 pl-9 text-[10px] font-semibold uppercase tracking-wider text-admin-faint">{h.label}</h3>}
                      <ul className="space-y-0.5 pl-6">
                        {h.entries.map((e) => {
                          const isActive = active === e.key;
                          return (
                            <li key={e.key}>
                              <Link
                                href={e.href}
                                aria-current={isActive ? "page" : undefined}
                                className={`flex items-center gap-2 rounded-control px-3 py-1.5 text-[13px] transition-colors duration-200 ease-breath ${
                                  isActive
                                    ? "bg-accent font-medium text-on-accent shadow-sm"
                                    : e.state === "built"
                                      ? quiet
                                      : "text-admin-faint hover:bg-admin-hover hover:text-admin-muted"
                                }`}
                              >
                                <span className="flex-1 truncate">{e.label}</span>
                                {e.state === "soon" && (
                                  <span className="inline-flex items-center rounded-full bg-admin-hover px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-admin-faint">Soon</span>
                                )}
                                {e.badge > 0 && (
                                  <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-on-accent">{e.badge}</span>
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
          className={`flex items-center gap-2.5 rounded-control px-3 py-2 text-[13px] font-medium transition-colors ${inSettings ? "bg-admin-hover text-admin-ink" : quiet} ${collapsed ? "justify-center" : ""}`}
        >
          <Settings size={16} aria-hidden className="text-admin-faint" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <a href="/" target="_blank" rel="noreferrer" title={collapsed ? "View my site" : undefined} className={`flex items-center gap-2.5 rounded-control px-3 py-2 text-[13px] font-medium transition-colors ${quiet} ${collapsed ? "justify-center" : ""}`}>
          <ExternalLink size={16} aria-hidden className="text-admin-faint" />
          {!collapsed && <span>View my site</span>}
        </a>
        <button
          type="button"
          title={collapsed ? "Lock" : undefined}
          onClick={async () => {
            await fetch("/api/gate", { method: "DELETE" });
            // A full load clears every cached screen once the gate is locked.
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.href = "/admin/login";
          }}
          className={`flex w-full items-center gap-2.5 rounded-control px-3 py-2 text-[13px] font-medium transition-colors ${quiet} ${collapsed ? "justify-center" : ""}`}
        >
          <Lock size={16} aria-hidden className="text-admin-faint" />
          {!collapsed && <span>Lock</span>}
        </button>
      </div>
    </div>
  );
}
