// Card times show the business's own clock: the time zone from the profile, or UTC when it has none.
// The server's zone never decides what the owner sees.

import { WEEKDAYS, type Weekday, type Profile } from "@/lib/validate";

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

export type WorkingHours = { days: Weekday[]; start: string; end: string };

export function workingHours(p: Pick<Profile, "work_days" | "work_start" | "work_end">): WorkingHours | null {
  if (!p.work_days || !p.work_start || !p.work_end) return null;
  return { days: p.work_days.split(",") as Weekday[], start: p.work_start, end: p.work_end };
}

function zoned(tz: string | null | undefined, at: Date): Record<string, string> {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: businessTimeZone(tz), year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23",
  });
  return Object.fromEntries(f.formatToParts(at).map((p) => [p.type, p.value]));
}

export function businessDate(tz: string | null | undefined, at: Date): string {
  const z = zoned(tz, at);
  return `${z.year}-${z.month}-${z.day}`;
}

export function businessWeekday(tz: string | null | undefined, at: Date): Weekday {
  return zoned(tz, at).weekday.slice(0, 3).toLowerCase() as Weekday;
}

export function businessClock(tz: string | null | undefined, at: Date): string {
  const z = zoned(tz, at);
  return `${z.hour}:${z.minute}`;
}

/** The Monday of the business's current week, as YYYY-MM-DD. */
export function businessWeekStart(tz: string | null | undefined, at: Date): string {
  const d = new Date(`${businessDate(tz, at)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - WEEKDAYS.indexOf(businessWeekday(tz, at)));
  return d.toISOString().slice(0, 10);
}

export function isOpenAt(hours: WorkingHours | null, tz: string | null | undefined, at: Date): boolean {
  if (!hours) return true;
  if (!hours.days.includes(businessWeekday(tz, at))) return false;
  const clock = businessClock(tz, at);
  return clock >= hours.start && clock < hours.end;
}
