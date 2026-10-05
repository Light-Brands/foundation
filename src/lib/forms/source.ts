// Where a visitor came from, captured on every public form. Values arrive from the page's address,
// so they are cleaned and capped like any other visitor input and stored as data.

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

const clean = (v: unknown): string =>
  (typeof v === "string" ? v : "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, SOURCE_MAX);

function cleanReferrer(v: unknown): string {
  const raw = typeof v === "string" ? v.trim() : "";
  if (!raw) return "";
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    return clean(u.origin + u.pathname);
  } catch {
    return "";
  }
}

export function captureSource(input: Record<string, unknown>): SourceMeta {
  const out: Partial<SourceMeta> = {};
  for (const k of UTM) {
    const v = clean(input[k]);
    if (v) out[k] = v;
  }
  const referrer = cleanReferrer(input.referrer);
  if (referrer) out.referrer = referrer;
  const source = clean(input.source) || out.utm_source || (referrer ? "referral" : "direct");
  return { source, ...out };
}

/** The hidden fields a public page renders, from its own address and the page that linked to it. */
export function sourceFields(search: Record<string, string | string[] | undefined>, referer: string | null): Record<string, string> {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const meta = captureSource({
    source: first(search.source), utm_source: first(search.utm_source), utm_medium: first(search.utm_medium),
    utm_campaign: first(search.utm_campaign), utm_content: first(search.utm_content), referrer: referer ?? "",
  });
  return Object.fromEntries(Object.entries(meta).filter(([, v]) => typeof v === "string" && v !== "")) as Record<string, string>;
}
