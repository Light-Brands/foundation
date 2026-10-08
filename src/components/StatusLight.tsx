const STYLES = {
  done: "bg-good shadow-[0_0_10px_color-mix(in_oklch,var(--color-good)_60%,transparent)]",
  next: "bg-warn shadow-[0_0_10px_color-mix(in_oklch,var(--color-warn)_50%,transparent)]",
  later: "bg-admin-ghost",
} as const;

export function StatusLight({ state, label }: { state: keyof typeof STYLES; label: string }) {
  return <span role="img" aria-label={label} className={`inline-block size-2.5 rounded-full ${STYLES[state]}`} />;
}
