export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Profile = { business_name: string; tagline: string; email: string; phone: string; website: string };

const LIMITS: Record<keyof Profile, number> = { business_name: 120, tagline: 200, email: 254, phone: 40, website: 200 };

export function validateProfile(input: Record<string, unknown>):
  | { ok: true; value: Profile }
  | { ok: false; errors: Partial<Record<keyof Profile, string>> } {
  const value = Object.fromEntries(
    (Object.keys(LIMITS) as (keyof Profile)[]).map((k) => [k, typeof input[k] === "string" ? (input[k] as string).trim() : ""]),
  ) as Profile;
  const errors: Partial<Record<keyof Profile, string>> = {};
  if (!value.business_name) errors.business_name = "Add your business name.";
  for (const k of Object.keys(LIMITS) as (keyof Profile)[]) {
    if (value[k].length > LIMITS[k]) errors[k] = `Keep this under ${LIMITS[k]} characters.`;
  }
  if (value.email && !EMAIL.test(value.email)) errors.email = "That email does not look complete.";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}
