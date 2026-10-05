import type { CardKindDecl } from "@/lib/key/declarations";
import { loadDeclarations } from "@/lib/key/load";

export type KindRegistry = ReadonlyMap<string, CardKindDecl>;

export function registryFrom(kinds: CardKindDecl[]): KindRegistry {
  return new Map(kinds.map((k) => [k.kind, k]));
}

/** The core kinds plus every kind the installed Key declares. */
export async function loadCardKinds(root?: string): Promise<KindRegistry> {
  return registryFrom((await loadDeclarations(root)).kinds);
}
