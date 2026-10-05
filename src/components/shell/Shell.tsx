"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { NavGroup } from "@/lib/layout/registry";
import { Rail } from "./Rail";

export function Shell({
  businessName,
  nav,
  banner,
  children,
}: {
  businessName: string;
  nav: NavGroup[];
  banner?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [drawer, setDrawer] = useState(false);
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/10 bg-ink/80 px-4 backdrop-blur">
        <button type="button" className="lg:hidden" aria-label="Open menu" onClick={() => setDrawer(true)}>
          <Menu size={20} />
        </button>
        <span className="font-display text-sm tracking-wide text-zinc-100">{businessName}</span>
        <span className="kicker ml-2 hidden sm:inline">Command center</span>
        <form action="/api/gate" method="post" className="ml-auto" onSubmit={async (e) => {
          e.preventDefault();
          await fetch("/api/gate", { method: "DELETE" });
          window.location.href = "/gate";
        }}>
          <button type="submit" className="text-xs text-mist hover:text-zinc-100">Lock</button>
        </form>
      </header>
      {banner}
      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-white/10 lg:block">
          <Rail groups={nav} />
        </aside>
        {drawer && (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
            <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close menu" onClick={() => setDrawer(false)} />
            <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-white/10 bg-ink">
              <button type="button" className="m-3" aria-label="Close menu" onClick={() => setDrawer(false)}><X size={20} /></button>
              <Rail groups={nav} onNavigate={() => setDrawer(false)} />
            </div>
          </div>
        )}
        <main className="min-w-0 flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
