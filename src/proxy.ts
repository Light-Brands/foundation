import { NextResponse, type NextRequest } from "next/server";
import { readEnv } from "@/lib/env";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/pin-token";
import { isPublicRequest, legacyRedirect, ADMIN } from "@/lib/auth/gate";
import { contentSecurityPolicy, newNonce } from "@/lib/security/csp";

/** Lets the request through with a fresh nonce, and its policy on both the request (for the render) and the response. */
function pass(req: NextRequest): NextResponse {
  const nonce = newNonce();
  const csp = contentSecurityPolicy(nonce);
  const headers = new Headers(req.headers);
  headers.set("x-nonce", nonce);
  headers.set("content-security-policy", csp);
  const res = NextResponse.next({ request: { headers } });
  res.headers.set("content-security-policy", csp);
  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const moved = legacyRedirect(pathname);
  if (moved) {
    const url = new URL(moved, req.url);
    url.search = search;
    return NextResponse.redirect(url, 308);
  }
  const env = readEnv();
  if (isPublicRequest(pathname, req.headers.get("authorization"), env.cronSecret)) return pass(req);
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (env.pin && (await verifySession(token, env.pin, env.secret))) return pass(req);
  const url = new URL(`${ADMIN}/login`, req.url);
  url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

// Every path runs the gate except Next's own static files, its image route and the favicon, each matched exactly.
export const config = { matcher: ["/((?!_next/static/|_next/image(?:/|\\?|$)|favicon\\.ico$).*)"] };
