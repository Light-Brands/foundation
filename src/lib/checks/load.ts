import type { CheckDecl } from "@/lib/key/declarations";
import { loadDeclarations } from "@/lib/key/load";

/** Every check the installed Key declares, from app definitions and routine front matter in key/. */
export async function loadChecks(root?: string): Promise<CheckDecl[]> {
  return (await loadDeclarations(root)).checks;
}
