import { formatCardTime, formatRelativeTime, toIsoTime } from "@/lib/time";

// A card's time the way a person says it ("2h ago", "Yesterday", "Oct 3") on the business's clock, with the full
// date and zone in the title for anyone who leans in, and the exact instant for machines.
export function CardTime({ at, timezone, now = new Date(), className }: { at: string; timezone: string | null | undefined; now?: Date; className?: string }) {
  const iso = toIsoTime(at);
  const label = formatRelativeTime(at, timezone, now);
  if (!iso) return <span className={className}>{label}</span>;
  return <time dateTime={iso} title={formatCardTime(at, timezone)} className={className}>{label}</time>;
}
