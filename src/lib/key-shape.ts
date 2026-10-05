// The one key-shape test: does a value look like a provider key, token, private key or a password in an
// address? The connections registry uses it so a key is never saved where its setting's name goes, and an
// app's save calls looksLikeKey on any free text it keeps, so a pasted key never lands in a table. It is a
// heuristic: it catches the common shapes, never every one, so a key still belongs only in the host's settings.

const KEY_SHAPES = [
  /^(sk|rk|pk)_(live|test)_/i, /^sb_(secret|publishable)_/, /^re_[A-Za-z0-9]{8,}/, /^whsec_/, /^gh[pousr]_[A-Za-z0-9]{20,}/,
  /^xox[abprs]-/, /^AKIA[0-9A-Z]{16}$/, /-----BEGIN [A-Z ]+-----/, /^eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/, /:\/\/[^/\s:@]+:[^/\s@]+@/,
];

/** True when this one value, trimmed, has the shape of a key. Setting names (upper case only) never match. */
export function looksLikeSecret(value: string): boolean {
  const s = value.trim();
  if (KEY_SHAPES.some((re) => re.test(s))) return true;
  // A long run of mixed-case letters and digits with no spaces reads as a token. Setting names are upper case only.
  return s.length >= 24 && /^[A-Za-z0-9_\-+/=.]+$/.test(s) && /\d/.test(s) && /[a-z]/.test(s) && /[A-Z]/.test(s);
}

/** True when the value, or any word in it, has the shape of a key. Call it on free text before saving it. */
export function looksLikeKey(value: string): boolean {
  if (typeof value !== "string") return false;
  return looksLikeSecret(value) || value.split(/\s+/).some((w) => w !== "" && looksLikeSecret(w));
}
