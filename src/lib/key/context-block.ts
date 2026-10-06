import type { Profile } from "@/lib/validate";

export type ContextBlock = {
  business: string;
  short_name: string;
  what_we_do: string;
  who_we_serve: string;
  how_we_sound: string;
  website: string;
  email: string;
  phone: string;
  city: string;
  timezone: string;
  work_days: string;
  work_start: string;
  work_end: string;
  postal_address: string;
  owner: { name: string; first: string; role: string };
  stated_by: string;
  recorded: string;
};

export function contextBlockFromProfile(p: Profile, statedBy: string, recorded: string): ContextBlock {
  return {
    business: p.business,
    short_name: p.short_name,
    what_we_do: p.what_we_do,
    who_we_serve: p.who_we_serve,
    how_we_sound: p.how_we_sound,
    website: p.website,
    email: p.email,
    phone: p.phone,
    city: p.city,
    timezone: p.timezone,
    work_days: p.work_days,
    work_start: p.work_start,
    work_end: p.work_end,
    postal_address: p.postal_address,
    owner: { name: p.owner_name, first: p.owner_first, role: p.owner_role },
    stated_by: statedBy,
    recorded,
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
