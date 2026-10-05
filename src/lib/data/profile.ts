import type { Db } from "@/lib/db/types";
import { PROFILE_FIELDS, type Profile } from "@/lib/validate";

export const PREVIEW_MESSAGE =
  "Your live site is not saving yet. Run your command center on your own computer to save now, or connect Supabase from Setup when it arrives.";

export async function getProfile(db: Db | null, fallbackName: string): Promise<Profile> {
  const empty = Object.fromEntries(PROFILE_FIELDS.map((k) => [k, k === "business" ? fallbackName : ""])) as Profile;
  if (!db) return empty;
  const [row] = await db.query<Profile>(`select ${PROFILE_FIELDS.join(", ")} from business_profile where id = 1`);
  return row ?? empty;
}

export async function saveProfile(db: Db, p: Profile): Promise<void> {
  const cols = PROFILE_FIELDS.join(", ");
  const params = PROFILE_FIELDS.map((_, i) => `$${i + 1}`).join(", ");
  const sets = PROFILE_FIELDS.map((k, i) => `${k} = $${i + 1}`).join(", ");
  await db.query(
    `insert into business_profile (id, ${cols}, updated_at) values (1, ${params}, now())
     on conflict (id) do update set ${sets}, updated_at = now()`,
    PROFILE_FIELDS.map((k) => p[k]),
  );
}
