import { entryForPage, sectionLabel } from "@/lib/dictionary/numbers";

// A page's kicker when the Ninja dictionary numbers it: the number in the figure face, then its section, at every
// width. The heading below carries the title, so nothing repeats, and the longest section still fits one line at
// 375px. A page without a number keeps its own kicker.
export function DictionaryKicker({ page, fallback }: { page: string; fallback: React.ReactNode }) {
  const e = entryForPage(page);
  if (!e) return <>{fallback}</>;
  return (
    <span data-dictionary-number={e.number}>
      <span className="font-mono font-medium tracking-normal text-admin-ink">{e.number}</span>
      {" · "}
      {sectionLabel(e.number)}
    </span>
  );
}
