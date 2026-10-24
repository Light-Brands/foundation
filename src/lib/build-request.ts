// The build request: an owner asks Light Brands to build something for them. The answers become a plain email the
// owner sends from their own address, so nothing goes through a server and Light Brands can reply directly.

export const BUILD_REQUEST_TO = "hello@lightbrands.ai";

export const WORTH_QUESTION = "What would it be worth to you to have this built and running?";

/** The worth bands, in order. Each is a range of what the work is worth to the owner. */
export const WORTH_PICKS = [
  "Under $2,500",
  "$2,500 to $10,000",
  "$10,000 to $30,000",
  "$30,000 to $100,000",
  "$100,000 or more",
  "Not sure yet",
] as const;

export type WorthPick = (typeof WORTH_PICKS)[number];

export type BuildRequest = {
  name: string;
  business: string;
  whatItDoes: string;
  email: string;
  phone: string;
  want: string;
  when: string;
  worth: WorthPick;
  worthNote: string;
};

/** Each answer's question, in the order the form asks and the email lists them. */
export const QUESTIONS: Record<keyof BuildRequest, string> = {
  name: "Your name",
  business: "Business name",
  whatItDoes: "What the business does",
  email: "Email",
  phone: "Phone",
  want: "What would you like built?",
  when: "How soon would you like it?",
  worth: WORTH_QUESTION,
  worthNote: "Anything you'd like us to know about that?",
};

/** The longest answer each field takes. Long answers are trimmed, and the Copy fallback covers an email app that cuts the message short. */
export const ANSWER_MAX: Record<keyof BuildRequest, number> = {
  name: 120, business: 120, whatItDoes: 300, email: 200, phone: 40, want: 1000, when: 120, worth: 40, worthNote: 400,
};

const ORDER = Object.keys(QUESTIONS) as (keyof BuildRequest)[];

const lines = (s: string) => s.replace(/\r\n?/g, "\n").trim();

/** The message as plain text, each question with its answer beneath it. Copy uses it as it is. */
export function buildRequestText(r: BuildRequest): string {
  const blocks = ORDER.map((k) => `${QUESTIONS[k]}\n${lines(r[k]) || "Not answered"}`);
  return ["Hello Light Brands,", "I would like you to build something for my business. Here are my answers.", ...blocks].join("\n\n") + "\n";
}

/** The subject line: the business name on one line, since a line break there would start a new header. */
export function buildRequestSubject(r: BuildRequest): string {
  const business = r.business.replace(/\s+/g, " ").trim();
  return business ? `Build request: ${business}` : "Build request";
}

// encodeURIComponent leaves ! ' ( ) * as they are; some email apps read an apostrophe or a bracket as the end of
// the address, so every one of them is encoded too.
const encode = (s: string) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

/** A mailto address to hello@lightbrands.ai with the subject and the body. Line breaks are sent as CRLF, as RFC 6068 asks. */
export function buildRequestMailto(r: BuildRequest): string {
  const body = buildRequestText(r).replace(/\n/g, "\r\n");
  return `mailto:${BUILD_REQUEST_TO}?subject=${encode(buildRequestSubject(r))}&body=${encode(body)}`;
}
