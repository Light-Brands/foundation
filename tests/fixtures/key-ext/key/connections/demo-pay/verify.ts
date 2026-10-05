import { createHmac, timingSafeEqual } from "node:crypto";

// A provider signs the raw body with a shared secret and sends the hex HMAC in a header.
export function verify(req: Request, rawBody: string, secret: string): boolean {
  const sent = req.headers.get("x-demo-signature") ?? "";
  const want = createHmac("sha256", secret).update(rawBody).digest("hex");
  return sent.length === want.length && timingSafeEqual(Buffer.from(sent), Buffer.from(want));
}

export async function handle(event: unknown): Promise<void> {
  const g = globalThis as { __demoPayEvents?: unknown[]; __demoPayFail?: boolean };
  if (g.__demoPayFail) throw new Error("the handler failed");
  (g.__demoPayEvents ??= []).push(event);
}
