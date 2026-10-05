// Card times show the business's own clock: the time zone from the profile, or UTC when it has none.
// The server's zone never decides what the owner sees.

export function businessTimeZone(tz: string | null | undefined): string {
  const t = (tz ?? "").trim();
  if (!t) return "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: t });
    return t;
  } catch {
    return "UTC";
  }
}

// Postgres writes timestamptz as text like "2026-10-05 06:30:00.123+00". Make it ISO so every engine reads it.
function parseDbTime(at: string): Date {
  const iso = at.trim().replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00");
  return new Date(iso);
}

export function formatCardTime(at: string, tz: string | null | undefined): string {
  const d = parseDbTime(at);
  if (Number.isNaN(d.getTime())) return at;
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
    timeZone: businessTimeZone(tz), timeZoneName: "short",
  }).format(d);
}
