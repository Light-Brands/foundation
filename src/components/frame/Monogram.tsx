import { initials } from "@/lib/brand/initials";
// The brand's initials on its accent, for every place a logo would sit when none is uploaded.
const SIZES = {
  sm: "h-7 w-7 rounded-control text-[11px]",
  md: "h-8 w-8 rounded-control text-xs",
  lg: "h-9 w-9 rounded-control text-[13px]",
  xl: "h-11 w-11 rounded-control text-sm",
  // A home-screen tile, rounded like the icon the phone will show.
  app: "h-10 w-10 rounded-[22%] text-sm",
} as const;

export { initials };

export function Monogram({ name, size = "md" }: { name: string; size?: keyof typeof SIZES }) {
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center bg-accent font-label font-semibold text-on-accent ${SIZES[size]}`}>
      {initials(name)}
    </span>
  );
}
