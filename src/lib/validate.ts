export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PROFILE_FIELDS = [
  "business", "short_name", "what_we_do", "who_we_serve", "how_we_sound", "website",
  "email", "phone", "city", "timezone", "owner_name", "owner_first", "owner_role",
] as const;
export type Profile = Record<(typeof PROFILE_FIELDS)[number], string>;

const LIMITS: Record<keyof Profile, number> = {
  business: 120, short_name: 40, what_we_do: 200, who_we_serve: 200, how_we_sound: 200, website: 200,
  email: 254, phone: 40, city: 80, timezone: 64, owner_name: 120, owner_first: 60, owner_role: 80,
};

function isTimeZone(tz: string): boolean {
  try { new Intl.DateTimeFormat("en-US", { timeZone: tz }); return true; } catch { return false; }
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
  if (value.email && !EMAIL.test(value.email)) errors.email = "That email does not look complete.";
  if (value.timezone && !isTimeZone(value.timezone)) errors.timezone = "Use a time zone like America/Chicago.";
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

export function validateContact(input: Record<string, unknown>):
  | { ok: true; value: ContactInput }
  | { ok: false; errors: Partial<Record<keyof ContactInput | "website", string>> } {
  const str = (k: string) => (typeof input[k] === "string" ? (input[k] as string).trim() : "");
  const phone = cleanPhone(input.phone);
  const value = { name: str("name"), email: str("email"), phone: phone.ok ? phone.value : "", message: str("message") };
  const errors: Partial<Record<keyof ContactInput | "website", string>> = {};
  if (str("website")) errors.website = "Something went wrong. Please try again.";
  if (!value.name || value.name.length > 120) errors.name = "Add your name (up to 120 characters).";
  if (!EMAIL.test(value.email) || value.email.length > 254) errors.email = "Add an email we can reply to.";
  if (!phone.ok) errors.phone = phone.error;
  if (!value.message || value.message.length > 4000) errors.message = "Add a message (up to 4,000 characters).";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}
