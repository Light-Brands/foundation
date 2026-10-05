const STYLES = {
  done: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]",
  next: "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]",
  later: "bg-ink-300",
} as const;

export function StatusLight({ state, label }: { state: keyof typeof STYLES; label: string }) {
  return <span role="img" aria-label={label} className={`inline-block size-2.5 rounded-full ${STYLES[state]}`} />;
}
