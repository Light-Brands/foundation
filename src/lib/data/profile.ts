import type { Db } from "@/lib/db/types";
import type { Profile } from "@/lib/validate";

export const PREVIEW_MESSAGE =
  "Your live site is not saving yet. Run your command center on your own computer to save now, or connect Supabase from Setup when it arrives.";

export async function getProfile(db: Db | null, fallbackName: string): Promise<Profile> {
  const empty: Profile = { business_name: fallbackName, tagline: "", email: "", phone: "", website: "" };
  if (!db) return empty;
  const [row] = await db.query<Profile>("select business_name, tagline, email, phone, website from business_profile where id = 1");
  return row ?? empty;
}

export async function saveProfile(db: Db, p: Profile): Promise<void> {
  await db.query(
    `insert into business_profile (id, business_name, tagline, email, phone, website, updated_at)
     values (1, $1, $2, $3, $4, $5, now())
     on conflict (id) do update set business_name = $1, tagline = $2, email = $3, phone = $4, website = $5, updated_at = now()`,
    [p.business_name, p.tagline, p.email, p.phone, p.website],
  );
}
