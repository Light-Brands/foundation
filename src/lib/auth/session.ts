import { cookies } from "next/headers";
import { readEnv, type FoundationEnv } from "@/lib/env";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/pin-token";

export async function sessionIsValid(token: string | undefined, env: FoundationEnv, now: number = Date.now()): Promise<boolean> {
  return Boolean(env.pin) && (await verifySession(token, env.pin as string, env.secret, now));
}

export async function hasSession(): Promise<boolean> {
  const store = await cookies();
  return sessionIsValid(store.get(SESSION_COOKIE)?.value, readEnv());
}
