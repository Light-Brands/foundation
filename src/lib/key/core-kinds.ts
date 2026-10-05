import type { CardKindDecl } from "./declarations";

// Kinds the Foundation itself writes. No Key may declare these names.
export const CORE_CARD_KINDS: CardKindDecl[] = [
  { kind: "contact", category: "command", subcategory: "inbox", label: "Message", always_human: false, decide: "done", expires_days: null, on_lapse: "stays", source: "core" },
  { kind: "check-failed", category: "command", subcategory: "alerts", label: "A check could not run", always_human: false, decide: "done", expires_days: 7, on_lapse: "closes", source: "core" },
  { kind: "brief", category: "command", subcategory: "home", label: "Weekly brief", always_human: false, decide: "done", expires_days: null, on_lapse: "stays", source: "core" },
  { kind: "brief-blocked", category: "command", subcategory: "home", label: "The brief did not run", always_human: false, decide: "done", expires_days: null, on_lapse: "stays", source: "core" },
];
