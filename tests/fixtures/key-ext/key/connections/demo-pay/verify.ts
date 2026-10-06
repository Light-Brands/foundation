import { createHmac, timingSafeEqual } from "node:crypto";

// A provider signs "<timestamp>." followed by the exact raw body bytes with a shared secret. It sends the
// timestamp (whole seconds since 1970) in x-demo-timestamp and the hex HMAC in x-demo-signature. A delivery
// signed more than ctx.toleranceMs (5 minutes) from now, either way, is refused, so a captured delivery
// replayed after its webhook_events row was pruned never acts.
type VerifyContext = { bytes: Uint8Array; now: Date; toleranceMs: number };

export function verify(req: Request, rawBody: string, secret: string, ctx: VerifyContext): boolean {
  const ts = req.headers.get("x-demo-timestamp") ?? "";
  if (!/^\d{1,12}$/.test(ts)) return false;
  if (Math.abs(ctx.now.getTime() - Number(ts) * 1000) > ctx.toleranceMs) return false;
  const sent = req.headers.get("x-demo-signature") ?? "";
  const want = createHmac("sha256", secret).update(`${ts}.`).update(ctx.bytes).digest("hex");
  return sent.length === want.length && timingSafeEqual(Buffer.from(sent), Buffer.from(want));
}

export async function handle(event: unknown): Promise<void> {
  const g = globalThis as { __demoPayEvents?: unknown[]; __demoPayFail?: boolean };
  if (g.__demoPayFail) throw new Error("the handler failed");
  (g.__demoPayEvents ??= []).push(event);
}
