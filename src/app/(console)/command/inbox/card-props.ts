import type { Db } from "@/lib/db/types";
import type { InboxItem } from "@/lib/data/inbox";
import { getProfile } from "@/lib/data/profile";
import { readEnv } from "@/lib/env";
import { loadCardKinds } from "@/lib/data/card-kinds";
import { routableKinds, routeTargets } from "@/lib/data/cards";
import { handSendContext, handSendFor, type HandSend } from "@/lib/data/hand-send";
import type { InboxCardProps } from "./InboxCard";

/**
 * What InboxCard needs for each card, read once for a list: the time zone, each kind's decide mode, where a
 * routable message may move, and the hand-send copy for every approved or failed email. A job that renders its
 * own list calls this, so its cards keep every action the Foundation's Inbox has.
 */
export async function inboxCardProps(db: Db | null, items: InboxItem[]): Promise<(item: InboxItem) => Omit<InboxCardProps, "below">> {
  const kinds = await loadCardKinds();
  const { timezone } = await getProfile(db, readEnv().businessName);
  const ctx = await handSendContext(db);
  const movable = new Set(routableKinds(kinds));
  const targets = routeTargets(kinds);
  const handSend = new Map<string, HandSend>();
  for (const i of items) for (const e of i.emails) handSend.set(e.id, await handSendFor(db, e, ctx));
  return (item) => ({ item, timezone, mode: kinds.get(item.kind)?.decide ?? "done", routes: movable.has(item.kind) ? targets : [], handSend });
}
