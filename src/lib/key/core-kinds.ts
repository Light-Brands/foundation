import type { CardKindDecl } from "./declarations";

/**
 * The kinds a card may be moved from in the Inbox: a message that waits for the owner to say which job owns it.
 * Each one is routable only when it is a core kind marked routable (contact) or the installed Key declares it
 * with routable: true (mail-in, from the mailbox connection). No other kind may say routable.
 */
export const ROUTABLE_KINDS: readonly string[] = ["contact", "mail-in"];

// Kinds the Foundation itself writes. No Key may declare these names.
export const CORE_CARD_KINDS: CardKindDecl[] = [
  { kind: "contact", category: "command", subcategory: "inbox", label: "Message", always_human: false, decide: "done", expires_days: null, on_lapse: "stays", source: "core", routable: true },
  { kind: "check-failed", category: "command", subcategory: "alerts", label: "A check could not run", always_human: false, decide: "done", expires_days: 7, on_lapse: "closes", source: "core", routable: false },
  { kind: "brief", category: "command", subcategory: "home", label: "Weekly brief", always_human: false, decide: "done", expires_days: null, on_lapse: "stays", source: "core", routable: false },
  // No expiry: a request to be forgotten waits for the owner, it never lapses away.
  { kind: "person-forget", category: "risk", subcategory: "compliance", label: "Forget a person", always_human: true, decide: "approve", expires_days: null, on_lapse: "stays", source: "core", routable: false },
  // Written by the sign-in limiter at most once a day, when wrong PINs spend the site's budget.
  { kind: "sign-in-slowed", category: "command", subcategory: "alerts", label: "Sign-in slowed", always_human: false, decide: "done", expires_days: 7, on_lapse: "closes", source: "core", routable: false },
  { kind: "brief-blocked", category: "command", subcategory: "home", label: "The brief did not run", always_human: false, decide: "done", expires_days: null, on_lapse: "stays", source: "core", routable: false },
];
