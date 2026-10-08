/** Up to two initials from a business name, for the monogram wherever a logo would sit. "C" when there are none. */
export function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "C";
}
