// A fixture connection test. It never reaches a provider: it answers from globalThis, so tests can choose
// a pass, a failure, a throw, a hang or a malformed answer, and see the key it was handed. A real test makes
// one cheap read-only call to the provider with ctx.secret and gives up well under a minute.
type Ctx = { secret: string; now: Date; signal: AbortSignal };
type Plan = { answer?: unknown; throwWith?: string; hang?: boolean; seen?: string[]; signals?: AbortSignal[] };

export async function test(ctx: Ctx): Promise<unknown> {
  const g = globalThis as { __fixtureConnectionTest?: Plan };
  const plan = (g.__fixtureConnectionTest ??= {});
  (plan.seen ??= []).push(ctx.secret);
  (plan.signals ??= []).push(ctx.signal);
  if (plan.hang) return new Promise(() => {});
  if (plan.throwWith) throw new Error(plan.throwWith);
  return plan.answer ?? { ok: true, note: "Signed in and read one event." };
}
