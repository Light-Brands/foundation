import type { Db } from "@/lib/db/types";
import { PROFILE_FIELDS, cleanChiefName, type Profile } from "@/lib/validate";

export const PREVIEW_MESSAGE =
  "Your live site is not saving yet. Connect your Neon database from Setup, or run your command center on your own computer to save now.";

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

/**
 * Name the chief of staff, the name every copied prompt opens with. Empty sets it back to Claude. The Agents page,
 * Preferences and npm run chief all save through here. Returns the saved profile, for the Key's context block.
 */
export async function setChiefName(db: Db, raw: unknown, fallbackName: string): Promise<{ ok: true; profile: Profile } | { ok: false; error: string }> {
  const name = cleanChiefName(raw);
  if (!name.ok) return name;
  await db.query(
    `insert into business_profile (id, business, chief_name, updated_at) values (1, $2, $1, now())
     on conflict (id) do update set chief_name = excluded.chief_name, updated_at = now()`,
    [name.value, fallbackName],
  );
  return { ok: true, profile: await getProfile(db, fallbackName) };
}
