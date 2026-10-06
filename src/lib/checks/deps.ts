import type { Db } from "@/lib/db/types";
import { loadDeclarations } from "@/lib/key/load";
import { registryFrom } from "@/lib/data/card-kinds";
import { getProfile } from "@/lib/data/profile";
import { businessTimeZone } from "@/lib/time";
import type { RunnerDeps } from "./runner";

export async function checkDeps(db: Db, root?: string): Promise<RunnerDeps> {
  const d = await loadDeclarations(root);
  const { timezone } = await getProfile(db, "");
  return { db, kinds: registryFrom(d.kinds), checks: d.checks, timezone: businessTimeZone(timezone) };
}
