export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PROFILE_FIELDS = [
  "business", "short_name", "what_we_do", "who_we_serve", "how_we_sound", "website",
  "email", "phone", "city", "timezone", "owner_name", "owner_first", "owner_role",
  "work_days", "work_start", "work_end", "postal_address", "chief_name",
] as const;
export type Profile = Record<(typeof PROFILE_FIELDS)[number], string>;

const LIMITS: Record<keyof Profile, number> = {
  business: 120, short_name: 40, what_we_do: 200, who_we_serve: 200, how_we_sound: 200, website: 200,
  email: 254, phone: 40, city: 80, timezone: 64, owner_name: 120, owner_first: 60, owner_role: 80,
  work_days: 60, work_start: 5, work_end: 5, postal_address: 300, chief_name: 40,
};

export const CHIEF_NAME_MAX = 40;
export const CHIEF_NAME_ERROR = "Use letters, spaces, apostrophes and hyphens, up to 40 characters.";
// One short name: up to three words of letters, each joined by one space, apostrophe or hyphen. scripts/setup.mjs keeps a copy.
const CHIEF_NAME = /^\p{L}[\p{L}\p{M}]*(?:[ '\u2019-][\p{L}\p{M}]+){0,2}['\u2019]?$/u;

/** The chief of staff's name, trimmed. Empty is allowed, and means prompts say Claude. */
export function cleanChiefName(raw: unknown): { ok: true; value: string } | { ok: false; error: string } {
  const value = (typeof raw === "string" ? raw : "").trim();
  if (value === "") return { ok: true, value };
  if (value.length > CHIEF_NAME_MAX || !CHIEF_NAME.test(value)) return { ok: false, error: CHIEF_NAME_ERROR };
  return { ok: true, value };
}

function isTimeZone(tz: string): boolean {
  try { new Intl.DateTimeFormat("en-US", { timeZone: tz }); return true; } catch { return false; }
}

export const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Weekday = (typeof WEEKDAYS)[number];
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const HOURS_FIELDS = ["work_days", "work_start", "work_end"] as const;

/** Working days as a canonical list in week order, "" for none, or null when a day is unknown or repeats. */
export function cleanWorkDays(raw: string): string | null {
  const parts = raw.toLowerCase().split(/[\s,]+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.some((p) => !(WEEKDAYS as readonly string[]).includes(p)) || new Set(parts).size !== parts.length) return null;
  return WEEKDAYS.filter((d) => parts.includes(d)).join(",");
}

export function validateProfile(input: Record<string, unknown>):
  | { ok: true; value: Profile }
  | { ok: false; errors: Partial<Record<keyof Profile, string>> } {
  const value = Object.fromEntries(
    PROFILE_FIELDS.map((k) => [k, typeof input[k] === "string" ? (input[k] as string).trim() : ""]),
  ) as Profile;
  if (!value.owner_first && value.owner_name) value.owner_first = value.owner_name.split(/\s+/)[0];
  const errors: Partial<Record<keyof Profile, string>> = {};
  if (!value.business) errors.business = "Add your business name.";
  for (const k of PROFILE_FIELDS) {
    if (value[k].length > LIMITS[k]) errors[k] = `Keep this under ${LIMITS[k]} characters.`;
  }
  if (/[\r\n]/.test(value.postal_address) && !errors.postal_address) errors.postal_address = "Keep the postal address on one line.";
  const chief = cleanChiefName(value.chief_name);
  if (!chief.ok && !errors.chief_name) errors.chief_name = chief.error;
  if (value.email && !EMAIL.test(value.email)) errors.email = "That email does not look complete.";
  if (value.timezone && !isTimeZone(value.timezone)) errors.timezone = "Use a time zone like America/Chicago.";
  const days = cleanWorkDays(value.work_days);
  if (days === null) errors.work_days = "List your working days, such as mon, tue, wed, thu, fri.";
  else if (!errors.work_days) value.work_days = days;
  if (value.work_start && !TIME.test(value.work_start)) errors.work_start = "Use a 24 hour time like 09:00.";
  if (value.work_end && !TIME.test(value.work_end)) errors.work_end = "Use a 24 hour time like 17:00.";
  const given = HOURS_FIELDS.filter((k) => value[k] !== "").length;
  if (given > 0 && given < HOURS_FIELDS.length) {
    for (const k of HOURS_FIELDS) if (!value[k] && !errors[k]) errors[k] = "Add this too, or clear all three working hours fields.";
  }
  if (given === HOURS_FIELDS.length && !errors.work_start && !errors.work_end && value.work_start >= value.work_end) {
    errors.work_end = "Make closing time later than opening time.";
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}

export const PHONE_MAX = 40;

// A phone is optional. When given it keeps the person's own formatting, with runs of spaces made one.
export function cleanPhone(raw: unknown): { ok: true; value: string } | { ok: false; error: string } {
  const value = (typeof raw === "string" ? raw : "").trim().replace(/\s+/g, " ");
  if (value === "") return { ok: true, value };
  const digits = value.replace(/\D/g, "").length;
  if (value.length > PHONE_MAX || !/^\+?[0-9 ().-]+$/.test(value) || digits < 7 || digits > 15) {
    return { ok: false, error: "Add a phone number with 7 to 15 digits, or leave it blank." };
  }
  return { ok: true, value };
}

export type ContactInput = { name: string; email: string; phone: string; message: string };
