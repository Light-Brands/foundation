// A screen with nothing in it yet: a calm card that says what will appear here and offers the one next step, so an
// empty page reads as ready rather than broken.
export function EmptyState({ kicker, title, body, action }: {
  kicker?: React.ReactNode;
  title: React.ReactNode;
  body?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="surface rise max-w-2xl p-card md:p-card-lg" style={{ "--i": 1 } as React.CSSProperties}>
      {kicker && <p className="kicker mb-3">{kicker}</p>}
      <p className="text-lg text-admin-ink">{title}</p>
      {body && <div className="mt-2 leading-relaxed text-admin-muted">{body}</div>}
      {action && <div className="mt-5 flex flex-wrap items-center gap-3">{action}</div>}
    </section>
  );
}
