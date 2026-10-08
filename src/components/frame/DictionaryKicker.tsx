import { entryForPage, sectionLabel } from "@/lib/dictionary/numbers";

// A page's kicker when the Ninja dictionary numbers it: the number in the figure face, then the page's name, the same
// number and name its copied prompt follows. On a desk the section sits between them. On a phone it steps aside, so
// the kicker stays one line at 375px. A page without a number keeps its own kicker.
// label replaces the dictionary's title, for a page whose kicker says something else, such as Today's date.
export function DictionaryKicker({ page, fallback, label }: { page: string; fallback: React.ReactNode; label?: React.ReactNode }) {
  const e = entryForPage(page);
  if (!e) return <>{fallback}</>;
  return (
    <span data-dictionary-number={e.number}>
      <span className="font-mono font-medium tracking-normal text-admin-ink">{e.number}</span>
      {" · "}
      <span className="hidden md:inline">{sectionLabel(e.number)} · </span>
      {label ?? e.title}
    </span>
  );
}
