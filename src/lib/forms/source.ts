// Where a visitor came from, captured on every public form. Values arrive from the page's address,
// so they are cleaned and capped like any other visitor input and stored as data. A page on the business's
// own site (this command center, or the website in its profile) is never counted as a referral.

export const SOURCE_KEYS = ["source", "utm_source", "utm_medium", "utm_campaign", "utm_content", "referrer"] as const;
export type SourceMeta = {
  source: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  referrer?: string;
};
export const SOURCE_MAX = 200;
const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

// Capped on code points, so a character outside the basic plane (an emoji) is never cut in half.
const clean = (v: unknown): string =>
  Array.from((typeof v === "string" ? v : "").replace(/[\u0000-\u001f\u007f]/g, "").trim()).slice(0, SOURCE_MAX).join("");

const bareHost = (host: string): string => host.toLowerCase().replace(/^www\./, "");

/** The business's own hosts: the host this page was served from, and the website saved in its profile. */
export function ownHosts(requestHost: string | null | undefined, website: string | null | undefined): string[] {
  const out = new Set<string>();
  const add = (raw: string) => {
    try {
      const u = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
      if (u.hostname) out.add(bareHost(u.hostname));
    } catch { /* not an address: nothing to add */ }
  };
  if (requestHost?.trim()) add(requestHost.trim());
  if (website?.trim()) add(website.trim());
  return [...out];
}

function cleanReferrer(v: unknown, own: readonly string[]): string {
  const raw = typeof v === "string" ? v.trim() : "";
  if (!raw) return "";
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    if (own.map(bareHost).includes(bareHost(u.hostname))) return "";
    return clean(u.origin + u.pathname);
  } catch {
    return "";
  }
}

/** own: the business's own hosts (see ownHosts). A referrer on one of them is dropped, so the visit reads as direct. */
export function captureSource(input: Record<string, unknown>, own: readonly string[] = []): SourceMeta {
  const out: Partial<SourceMeta> = {};
  for (const k of UTM) {
    const v = clean(input[k]);
    if (v) out[k] = v;
  }
  const referrer = cleanReferrer(input.referrer, own);
  if (referrer) out.referrer = referrer;
  const source = clean(input.source) || out.utm_source || (referrer ? "referral" : "direct");
  return { source, ...out };
}

/** The hidden fields a public page renders, from its own address and the page that linked to it. */
export function sourceFields(search: Record<string, string | string[] | undefined>, referer: string | null, own: readonly string[] = []): Record<string, string> {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const meta = captureSource({
    source: first(search.source), utm_source: first(search.utm_source), utm_medium: first(search.utm_medium),
    utm_campaign: first(search.utm_campaign), utm_content: first(search.utm_content), referrer: referer ?? "",
  }, own);
  return Object.fromEntries(Object.entries(meta).filter(([, v]) => typeof v === "string" && v !== "")) as Record<string, string>;
}
