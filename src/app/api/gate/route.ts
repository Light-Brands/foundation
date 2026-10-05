import { NextResponse } from "next/server";
import { readEnv } from "@/lib/env";
import { handleGatePost } from "@/lib/auth/gate";
import { SESSION_COOKIE, SESSION_HOURS } from "@/lib/auth/pin-token";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const result = await handleGatePost(body, readEnv());
  if (result.status === 401) await new Promise((r) => setTimeout(r, 1000));
  const res = NextResponse.json({ ok: result.status === 200, error: result.error }, { status: result.status });
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
