// The content security policy every page is served with. src/proxy.ts makes a fresh nonce per request, sends this
// policy on the response and on the request, and Next.js puts that nonce on its own scripts and inline styles; the
// root layout puts it on the brand style tag. No inline script runs without it. Inline style attributes (React's
// style prop, next/image) stay allowed, since they cannot run code. Logos may come from any https host.

export function newNonce(): string {
  let s = "";
  for (const b of crypto.getRandomValues(new Uint8Array(16))) s += String.fromCharCode(b);
  return btoa(s);
}

export function contentSecurityPolicy(nonce: string, dev: boolean = process.env.NODE_ENV === "development"): string {
  // In development React evaluates code for its error overlay, and the dev server injects styles without a nonce.
  const script = ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(dev ? ["'unsafe-eval'"] : [])];
  const styleElem = ["'self'", dev ? "'unsafe-inline'" : `'nonce-${nonce}'`];
  return [
    "default-src 'self'",
    `script-src ${script.join(" ")}`,
    `style-src ${styleElem.join(" ")}`,
    `style-src-elem ${styleElem.join(" ")}`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "worker-src 'self'",
    "manifest-src 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}
