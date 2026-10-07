import Link from "next/link";
import type { NavHeading } from "@/lib/layout/sections";
import { ChevronRight } from "./icons";

// A section as a phone screen: large rows, grouped under small headings.
export function SectionHub({ headings }: { headings: NavHeading[] }) {
  return (
    <div className="space-y-6">
      {headings.map((h) => (
        <section key={h.label || "main"}>
          {h.label && <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-admin-faint">{h.label}</h2>}
          <ul className="surface divide-y divide-admin-line overflow-hidden">
            {h.entries.map((e) => (
              <li key={e.key}>
                <Link href={e.href} className="flex min-h-[52px] items-center gap-3 px-4 py-3 transition-colors duration-200 ease-breath active:bg-admin-hover">
                  <span className={`flex-1 text-[15px] ${e.state === "built" ? "text-admin-ink" : "text-admin-muted"}`}>{e.label}</span>
                  {e.state === "soon" && <span className="chip">Soon</span>}
                  {e.badge > 0 && <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-on-accent">{e.badge}</span>}
                  <ChevronRight size={18} aria-hidden className="text-admin-faint" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
