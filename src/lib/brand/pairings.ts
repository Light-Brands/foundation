// The six curated font pairings. Each names the CSS variables that src/lib/brand/fonts.ts creates with next/font.
// Pure data, so tests and the CSS writer can use it without loading fonts.

export const PAIRING_IDS = ["sanctuary", "modern", "editorial", "grotesk", "classic", "humanist"] as const;
export type PairingId = (typeof PAIRING_IDS)[number];

// Type character rides on the pairing: the weight of the display and heading faces, the heading's tracking in em,
// and its case. A brand can override any of them (BrandTokens.type).
export type HeadingCase = "none" | "uppercase";
export type TypeCharacter = { displayWeight: number; headingWeight: number; headingTracking: number; headingCase: HeadingCase };
export type Pairing = { label: string; display: string; heading: string; body: string; label_: string } & TypeCharacter;

// The frame's look before type character existed: a light display face and a regular, slightly tight heading.
const CALM: TypeCharacter = { displayWeight: 300, headingWeight: 400, headingTracking: -0.025, headingCase: "none" };

const SERIF = "Georgia, serif";
const SANS = "system-ui, sans-serif";

export const PAIRINGS: Record<PairingId, Pairing> = {
  sanctuary: { ...CALM, label: "Sanctuary", display: `var(--ff-fraunces), ${SERIF}`, heading: `var(--ff-fraunces), ${SERIF}`, body: `var(--ff-source-sans), ${SANS}`, label_: `var(--ff-dm-sans), ${SANS}` },
  modern: { ...CALM, label: "Modern", display: `var(--ff-inter-tight), ${SANS}`, heading: `var(--ff-inter-tight), ${SANS}`, body: `var(--ff-inter), ${SANS}`, label_: `var(--ff-inter), ${SANS}` },
  editorial: { ...CALM, label: "Editorial", display: `var(--ff-playfair), ${SERIF}`, heading: `var(--ff-playfair), ${SERIF}`, body: `var(--ff-dm-sans), ${SANS}`, label_: `var(--ff-dm-sans), ${SANS}` },
  grotesk: { ...CALM, label: "Grotesk", display: `var(--ff-space-grotesk), ${SANS}`, heading: `var(--ff-space-grotesk), ${SANS}`, body: `var(--ff-dm-sans), ${SANS}`, label_: `var(--ff-space-grotesk), ${SANS}` },
  classic: { ...CALM, displayWeight: 400, label: "Classic", display: `var(--ff-libre-baskerville), ${SERIF}`, heading: `var(--ff-libre-baskerville), ${SERIF}`, body: `var(--ff-source-sans), ${SANS}`, label_: `var(--ff-dm-sans), ${SANS}` },
  humanist: { ...CALM, label: "Humanist", display: `var(--ff-jakarta), ${SANS}`, heading: `var(--ff-jakarta), ${SANS}`, body: `var(--ff-inter), ${SANS}`, label_: `var(--ff-jakarta), ${SANS}` },
};

export const NUMERIC_FONT = "var(--ff-jetbrains), ui-monospace, monospace";

export function isPairingId(v: unknown): v is PairingId {
  return typeof v === "string" && (PAIRING_IDS as readonly string[]).includes(v);
}
