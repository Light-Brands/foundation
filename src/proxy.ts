import { NextResponse, type NextRequest } from "next/server";
import { readEnv } from "@/lib/env";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/pin-token";
import { isPublicPath } from "@/lib/auth/gate";

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();
  const env = readEnv();
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (env.pin && (await verifySession(token, env.pin, env.secret))) return NextResponse.next();
  const url = new URL("/gate", req.url);
  url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
