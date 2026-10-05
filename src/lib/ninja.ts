import { existsSync } from "node:fs";
import path from "node:path";
import { SLUG } from "@/lib/key/formats";

// Whether the shipped dictionary has an install entry for a job: ninja/modules/<category>/<job>.md.
// next.config.ts traces ninja/ into the deployed app, so this answers the same on Vercel.
export function hasInstallEntry(categoryId: string, jobId: string, root: string = process.cwd()): boolean {
  if (!SLUG.test(categoryId) || !SLUG.test(jobId)) return false;
  return existsSync(path.join(root, "ninja", "modules", categoryId, `${jobId}.md`));
}
