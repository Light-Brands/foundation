import "server-only";
import type { Db, Queryable } from "@/lib/db/types";
import type { CardEmail } from "@/lib/data/inbox";
import { composeEmail, isOptedOut, readFooterFacts } from "@/lib/data/outbox";
import { emailSendingActive } from "@/lib/data/connections";
import { readEnv } from "@/lib/env";
import { publicBaseUrl, unsubscribeUrl } from "@/lib/email-links";
import type { HandSendReason } from "@/lib/hand-send-notes";

// Sending one email by hand from the Inbox: the text the owner copies, or the one line that says why there is
// none. Copy is offered for an approved or failed row only. An address that opted out of the row's kind gets
// no copy, and a list that cannot be read gives that one row a plain note while the rest of the page renders.
// An approved row gets no copy while the email connection sends on its own, so the two never both send it,
// unless it was already copied: the sender never claims a copied row. A failed row always offers it, because
// the sender never retries one.

export type HandSend = { copyText: string | null; reason: HandSendReason | null };
export type HandSendContext = {
  secret: string | null;
  baseUrl: string | null;
  /** FOUNDATION_URL is set but is not a plain https address, so baseUrl is null for a reason the owner can fix. */
  addressInvalid?: boolean;
  facts: { postalAddress: string; mailto: string | null };
  senderActive: boolean;
};

/** What the Inbox needs once per page: the fixed secret, the live address, the footer facts and the connection. */
export async function handSendContext(db: Db | null): Promise<HandSendContext> {
  return {
    secret: readEnv().fixedSecret,
    baseUrl: publicBaseUrl(),
    addressInvalid: Boolean(process.env.FOUNDATION_URL?.trim()) && publicBaseUrl() === null,
    facts: db ? await readFooterFacts(db) : { postalAddress: "", mailto: null },
    senderActive: await emailSendingActive(db),
  };
}

type Email = Pick<CardEmail, "id" | "to" | "subject" | "body" | "status" | "kind"> & { copied?: boolean };

export async function handSendFor(db: Queryable | null, e: Email, ctx: HandSendContext): Promise<HandSend> {
  if (e.status !== "approved" && e.status !== "failed") return { copyText: null, reason: null };
  if (!db) return { copyText: null, reason: "no_database" };
  if (!ctx.secret) return { copyText: null, reason: "no_secret" };
  let optedOut: boolean;
  try {
    optedOut = await isOptedOut(db, e.to, e.kind, ctx.secret);
  } catch {
    // Fail closed for this row only: a list that cannot be read never counts as not opted out.
    return { copyText: null, reason: "unchecked" };
  }
  if (optedOut) return { copyText: null, reason: "opted_out" };
  if (e.status === "approved" && ctx.senderActive && !e.copied) return { copyText: null, reason: "automatic" };
  // A marketing email carries its footer and unsubscribe link, so it can be copied only where that link works.
  if (e.kind === "marketing" && !ctx.baseUrl) return { copyText: null, reason: ctx.addressInvalid ? "address_invalid" : "no_address" };
  const unsubscribe = e.kind === "marketing" && ctx.baseUrl ? unsubscribeUrl(ctx.baseUrl, e.id, ctx.secret) : null;
  const out = composeEmail({ id: e.id, to_email: e.to, subject: e.subject, body: e.body, send_key: "", attempts: 0, kind: e.kind }, { ...ctx.facts, unsubscribeUrl: unsubscribe });
  return { copyText: `Subject: ${out.subject}\n\n${out.body}`, reason: null };
}
