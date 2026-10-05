// Wrong-PIN limiter: after MAX_FAILS wrong PINs within WINDOW_MS, every further
// attempt from that key is refused until WINDOW_MS after the last wrong try.
// State lives in memory. On Vercel that means it limits per running instance;
// Phase 1 adds recorded lockouts.

export const MAX_FAILS = 5;
export const WINDOW_MS = 10 * 60_000;

type Entry = { fails: number[]; blockedUntil: number };
export type LimitMap = Map<string, Entry>;

export function createLimiter(map: LimitMap = new Map()) {
  return {
    isBlocked(key: string, now: number): boolean {
      const e = map.get(key);
      if (!e) return false;
      if (e.blockedUntil > now) return true;
      if (e.blockedUntil !== 0) map.delete(key);
      return false;
    },
    fail(key: string, now: number): void {
      const e = map.get(key) ?? { fails: [], blockedUntil: 0 };
      e.fails = e.fails.filter((t) => now - t < WINDOW_MS);
      e.fails.push(now);
      if (e.fails.length >= MAX_FAILS) e.blockedUntil = now + WINDOW_MS;
      map.set(key, e);
    },
    succeed(key: string): void {
      map.delete(key);
    },
  };
}

export const gateLimiter = createLimiter();

export function clientKeyFromHeaders(h: { get(name: string): string | null }): string {
  const first = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return first || "local";
}

export function clientKey(req: Request): string {
  return clientKeyFromHeaders(req.headers);
}
