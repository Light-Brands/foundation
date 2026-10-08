import Link from "next/link";
import { CardTime } from "@/components/CardTime";

export const NEEDS_YOU_ROWS = 5;
const INBOX = "/admin/command/inbox";

type Row = { id: string; title: string; created_at: string };

// What needs you, on Today: the count, then up to five of the newest cards, each a row that opens its card in the
// inbox. It sizes to what it holds; when more wait than it shows, See all opens the inbox.
export function NeedsYouCard({ items, waiting, timezone, now = new Date() }: { items: Row[]; waiting: number; timezone: string | null | undefined; now?: Date }) {
  const shown = items.slice(0, NEEDS_YOU_ROWS);
  return (
    <section data-needs-you="" aria-labelledby="today-needs-you" className="surface rise flex flex-col p-card md:p-card-lg lg:col-span-8" style={{ "--i": 1 } as React.CSSProperties}>
      <h2 id="today-needs-you" className="kicker">
        <Link href={INBOX} className="transition-colors duration-200 ease-breath hover:text-admin-ink">What needs you</Link>
      </h2>
      {shown.length ? (
        <>
          <p className="mt-4 flex items-baseline gap-3">
            <span className="font-mono text-4xl tracking-tight text-admin-ink md:text-5xl">{waiting}</span>
            <span className="text-admin-muted">waiting</span>
          </p>
          <ul className="mt-5 divide-y divide-admin-line border-t border-admin-line text-sm">
            {shown.map((i) => (
              <li key={i.id}>
                <Link
                  href={`${INBOX}#card-${i.id}`}
                  className="-mx-2 flex min-h-11 flex-col justify-center gap-0.5 rounded-control px-2 py-2 text-admin-ink transition-colors duration-200 ease-breath hover:bg-admin-hover sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <span className="min-w-0 truncate">{i.title}</span>
                  <CardTime at={i.created_at} timezone={timezone} now={now} className="shrink-0 font-mono text-xs text-admin-muted" />
                </Link>
              </li>
            ))}
          </ul>
          {waiting > shown.length && (
            <Link href={INBOX} className="mt-4 inline-flex min-h-11 items-center self-start text-sm font-medium text-admin-ink underline decoration-admin-line-strong underline-offset-4 hover:decoration-accent md:min-h-0">
              See all {waiting} in the inbox
            </Link>
          )}
        </>
      ) : (
        <p className="mt-4 text-lg text-admin-muted">Nothing needs you right now.</p>
      )}
    </section>
  );
}
