// A fixture sender. It never reaches a provider: it records what it was given on globalThis, so tests can
// see each send, each lookup and each bounces call. A real sender calls its provider with ctx.secret, gives
// up well under the outbox's stuck window, and passes the row's send_key as the provider's idempotency key.
type Ctx = { secret: string; now: Date };
type Event = { eventId: string; receivedAt: string };
type Mail = {
  sent: Array<{ id: string; to: string; secretSeen: boolean }>;
  lookups: string[];
  events: Event[][];
  bounces: Array<{ email: string; kind: "bounce" | "complaint" }>;
  failWith?: string;
};
type Outgoing = { id: string; to_email: string; send_key: string };

function mail(): Mail {
  const g = globalThis as { __fixtureMail?: Mail };
  return (g.__fixtureMail ??= { sent: [], lookups: [], events: [], bounces: [] });
}

export async function send(email: Outgoing, ctx: Ctx): Promise<{ providerRef: string }> {
  const m = mail();
  if (m.failWith) throw new Error(m.failWith);
  m.sent.push({ id: email.id, to: email.to_email, secretSeen: ctx.secret.length > 0 });
  return { providerRef: `fixture-${email.send_key}` };
}

export async function lookup(ref: string): Promise<"sent" | "unknown"> {
  mail().lookups.push(ref);
  return "unknown";
}

export async function bounces(ctx: Ctx & { events: Event[] }): Promise<Array<{ email: string; kind: "bounce" | "complaint" }>> {
  const m = mail();
  if ((globalThis as { __fixtureMailBouncesThrow?: boolean }).__fixtureMailBouncesThrow) throw new Error("the provider is down");
  m.events.push(ctx.events);
  return m.bounces;
}
