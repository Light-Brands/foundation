import { NextResponse } from "next/server";
import { readEnv } from "@/lib/env";
import { getDb } from "@/lib/db";
import { handleGatePost } from "@/lib/auth/gate";
import { clientAddress, dbGateLimiter, previewGateLimiter, type GateLimiter } from "@/lib/auth/limit";
import { SESSION_COOKIE, SESSION_HOURS } from "@/lib/auth/pin-token";

/** The database limiter, the in-memory one when this deploy has no database, or null when the database is down. */
async function limiterFor(secret: string): Promise<GateLimiter | null> {
  try {
    const db = await getDb();
    return db ? dbGateLimiter(db, secret) : previewGateLimiter;
  } catch (err) {
    console.error("sign-in: the database could not be reached, so no try is counted or checked", err);
    return null;
  }
}

export async function POST(req: Request) {
  const env = readEnv();
  const body = await req.json().catch(() => null);
  // A try that cannot be counted is never checked: with the database down, sign-in waits for it.
  const limiter = env.pin ? await limiterFor(env.secret) : previewGateLimiter;
  if (!limiter) return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 });
  let result: Awaited<ReturnType<typeof handleGatePost>>;
  try {
    result = await handleGatePost(body, env, Date.now(), { limiter, client: clientAddress(req.headers, env) });
  } catch (err) {
    console.error("sign-in: the try could not be recorded", err);
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 });
  }
  if (result.status === 401) await new Promise((r) => setTimeout(r, 1000));
  const retryAfter = result.retryAfterMs ? Math.ceil(result.retryAfterMs / 1000) : undefined;
  const res = NextResponse.json(
    { ok: result.status === 200, error: result.error, ...(retryAfter ? { retryAfter } : {}) },
    { status: result.status, headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined },
  );
  if (result.token) {
    res.cookies.set(SESSION_COOKIE, result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: req.url.startsWith("https://"),
      path: "/",
      maxAge: SESSION_HOURS * 3600,
    });
  }
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
