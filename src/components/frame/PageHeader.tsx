// Every admin page opens the same way: a small kicker, the title in the brand's heading face, one line of
// purpose, and room for the page's one main action.
// flush drops the header's own bottom margin, for a page whose stack already spaces its parts.
export function PageHeader({ kicker, title, lede, action, flush = false }: {
  kicker?: React.ReactNode;
  title: React.ReactNode;
  lede?: React.ReactNode;
  action?: React.ReactNode;
  flush?: boolean;
}) {
  return (
    <header className={`flex flex-col gap-4 md:flex-row md:items-end md:justify-between ${flush ? "" : "mb-8 md:mb-10"}`}>
      <div className="min-w-0">
        {kicker && <p className="kicker">{kicker}</p>}
        <h1 className={kicker ? "page-title mt-2" : "page-title"}>{title}</h1>
        {lede && <div className="mt-2 max-w-2xl leading-relaxed text-admin-muted">{lede}</div>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </header>
  );
}
