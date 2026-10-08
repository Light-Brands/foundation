import { getDb } from "@/lib/db";
import { readEnv } from "@/lib/env";
import { handleUnsubscribe, type UnsubscribeOutcome } from "@/lib/data/unsubscribe";

export const dynamic = "force-dynamic";

// Public on purpose: the unsubscribe link in a marketing email. A visit only shows a button. A post, from
// that button or from a mail app's one-click (RFC 8058), records the opt-out. The token is checked before
// anything is read, and nothing a visitor sends is written except the opt-out for the token's own row.

const PAGE: Record<UnsubscribeOutcome["status"], { status: number; title: string; text: string }> = {
  confirm: { status: 200, title: "Stop these emails?", text: "Press the button and we will send no more marketing email to this address." },
  done: { status: 200, title: "You are unsubscribed", text: "We will send no more marketing email to this address." },
  invalid: { status: 404, title: "This link does not work", text: "This unsubscribe link is not valid. Reply to the email and ask us to stop, and we will." },
  limited: { status: 429, title: "Please try again soon", text: "We received several requests from this link just now. Please try again in a few minutes." },
  too_large: { status: 413, title: "This link does not work", text: "That request was more than this page takes." },
  preview: { status: 503, title: "Please try again soon", text: "This page is not taking requests yet. Please try again later, or reply to the email and ask us to stop." },
};

// The proxy's nonce is base64 of 16 random bytes (src/lib/security/csp.ts). Anything else is left off the page.
const NONCE = /^[A-Za-z0-9+/]{22}==$/;

function page(outcome: UnsubscribeOutcome, token: string, nonce: string | null): Response {
  const p = PAGE[outcome.status];
  // The token only reaches the page after it matched its strict shape, so it holds no markup.
  const button = outcome.status === "confirm"
    ? `<form method="post" action="/u/${token}"><button type="submit">Unsubscribe</button></form>`
    : "";
  // The page's one style tag carries the request's nonce, so the content security policy lets it apply.
  const style = nonce && NONCE.test(nonce) ? `<style nonce="${nonce}">` : "<style>";
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${p.title}</title>
${style}body{font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem;color:#18181b;background:#fafafa}button{font:inherit;padding:.6rem 1.2rem;border-radius:.6rem;border:1px solid #3f3f46;background:#18181b;color:#fafafa;cursor:pointer}</style></head>
<body><h1>${p.title}</h1><p>${p.text}</p>${button}</body></html>`;
  return new Response(html, { status: p.status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "referrer-policy": "no-referrer" } });
}

async function respond(req: Request, params: Promise<{ token: string }>, method: "GET" | "POST"): Promise<Response> {
  const { token } = await params;
  const length = req.headers.get("content-length");
  const nonce = req.headers.get("x-nonce");
  try {
    const outcome = await handleUnsubscribe(
      { db: method === "POST" ? await getDb() : null, secret: readEnv().fixedSecret },
      { token, method, contentLength: length === null ? null : Number(length) || 0 },
      new Date(),
    );
    return page(outcome, token, nonce);
  } catch (err) {
    // Only the name and the message: a database error's detail can carry the address.
    console.error("unsubscribe failed", err instanceof Error ? `${err.name}: ${err.message}` : "unknown error");
    return page({ status: "preview" }, token, nonce);
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  return respond(req, params, "GET");
}

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  return respond(req, params, "POST");
}
