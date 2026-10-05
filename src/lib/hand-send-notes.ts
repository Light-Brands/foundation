// Why an email on a card offers no Copy email, worded for that reason. Plain text the Inbox card shows, kept
// out of server-only code so the card itself words the note.

export type HandSendReason = "opted_out" | "automatic" | "no_secret" | "no_address" | "address_invalid";

export const HAND_SEND_NOTES: Record<HandSendReason, string> = {
  opted_out: "This person asked us to stop.",
  automatic: "Your email connection sends this one on its own.",
  no_secret: "Set FOUNDATION_SECRET to at least 32 characters before sending this email, so we can check who asked us to stop.",
  no_address: "This waits for your live site's address, which its unsubscribe link needs. Send it from your live site, or set FOUNDATION_URL to that address.",
  address_invalid: "FOUNDATION_URL is set but is not a plain https address, so the unsubscribe link cannot be made. Change it to your live site's address, such as https://command.yourbusiness.com.",
};

export function handSendNote(reason: HandSendReason | null): string | null {
  return reason ? HAND_SEND_NOTES[reason] : null;
}
