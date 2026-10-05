import "server-only";
import type { Db, Queryable } from "@/lib/db/types";
import type { CardEmail } from "@/lib/data/inbox";
import { composeEmail, isOptedOut, readFooterFacts } from "@/lib/data/outbox";
import { emailSenderActive } from "@/lib/data/connections";
import { readEnv } from "@/lib/env";
import { publicBaseUrl, unsubscribeUrl } from "@/lib/email-links";

// Sending one email by hand from the Inbox: the text the owner copies, or the one line that says why there is
// none. Copy is offered for an approved or failed row only. An address that opted out of the row's kind gets
// no copy. An approved row gets no copy while the email connection sends on its own, so the two never both
// send it. A failed row always offers it, because the sender never retries one.

export const HAND_SEND_NOTES = {
  optedOut: "This person asked us to stop.",
  automatic: "Your email connection sends this one on its own.",
  noSecret: "Set FOUNDATION_SECRET before sending this email, so we can check who asked us to stop.",
  needsUrl: "This waits for your live site's address, which its unsubscribe link needs. Send it from your live site, or set FOUNDATION_URL to that address.",
} as const;

export type HandSend = { copyText: string | null; note: string | null };
export type HandSendContext = {
  secret: string | null;
  baseUrl: string | null;
  facts: { postalAddress: string; mailto: string | null };
  senderActive: boolean;
};

/** What the Inbox needs once per page: the fixed secret, the live address, the footer facts and the connection. */
export async function handSendContext(db: Db | null): Promise<HandSendContext> {
  return {
    secret: readEnv().fixedSecret,
    baseUrl: publicBaseUrl(),
    facts: db ? await readFooterFacts(db) : { postalAddress: "", mailto: null },
    senderActive: await emailSenderActive(db),
  };
}

type Email = Pick<CardEmail, "id" | "to" | "subject" | "body" | "status" | "kind">;

export async function handSendFor(db: Queryable | null, e: Email, ctx: HandSendContext): Promise<HandSend> {
  if (e.status !== "approved" && e.status !== "failed") return { copyText: null, note: null };
  if (!ctx.secret || !db) return { copyText: null, note: HAND_SEND_NOTES.noSecret };
  if (await isOptedOut(db, e.to, e.kind, ctx.secret)) return { copyText: null, note: HAND_SEND_NOTES.optedOut };
  if (e.status === "approved" && ctx.senderActive) return { copyText: null, note: HAND_SEND_NOTES.automatic };
  // A marketing email carries its footer and unsubscribe link, so it can be copied only where that link works.
  if (e.kind === "marketing" && !ctx.baseUrl) return { copyText: null, note: HAND_SEND_NOTES.needsUrl };
  const unsubscribe = e.kind === "marketing" && ctx.baseUrl ? unsubscribeUrl(ctx.baseUrl, e.id, ctx.secret) : null;
  const out = composeEmail({ id: e.id, to_email: e.to, subject: e.subject, body: e.body, send_key: "", attempts: 0, kind: e.kind }, { ...ctx.facts, unsubscribeUrl: unsubscribe });
  return { copyText: `Subject: ${out.subject}\n\n${out.body}`, note: null };
}
