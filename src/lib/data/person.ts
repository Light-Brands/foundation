import path from "node:path";
import type { Db, Queryable } from "@/lib/db/types";
import type { KindRegistry } from "@/lib/data/card-kinds";
import { writeCard } from "@/lib/data/cards";
import { readEnv } from "@/lib/env";
import { emailHash, InvalidEmailError, MissingSecretError, normalizeEmail, normalizedEmailSql as N } from "@/lib/email";
import { personFields, type PersonRef } from "@/lib/key/schema";
import { readSources } from "@/lib/key/declarations";
import { allows, type Actor } from "@/lib/auth/roles";
import { checkSecretFingerprint, SecretMismatchError } from "@/lib/data/secret-check";

// Seeing or removing what the business holds about one person. A person is found by their address, read by the
// one strict parser in src/lib/email.ts and matched in every spelling its rule joins, and by their team member id,
// read from the people rows their address finds. Forget is always-human: the first run raises a card, and nothing
// changes until the owner approves it. Afterwards only the address's hash, keyed by FOUNDATION_SECRET, stays in
// opt_outs with scope all, so no email of any kind reaches the person again.
// Only the owner may look: anyone else is refused before any lookup, so nobody else learns who is held.
// An export holds only this person: a row or card that also names someone else is cut down to what is about this
// person, and says so. No error, refusal or card ever carries the address or anything found.

const OWNER_ONLY = "Only the owner can see or remove a person's records.";
export class OwnerOnlyError extends Error {
  constructor() {
    super(OWNER_ONLY);
    this.name = "OwnerOnlyError";
  }
}
export type PersonOptions = { actor: Actor | null; secret?: string | null };
const isOwner = (o: PersonOptions | undefined) => !!o && allows(o.actor, "owner");

/** Our own refusals pass through. Anything else, such as a database error that could quote a value, becomes one plain line. */
async function plainErrors<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof InvalidEmailError || err instanceof MissingSecretError || err instanceof OwnerOnlyError || err instanceof SecretMismatchError) throw err;
    throw new Error("The person command could not finish, and nothing was changed.", { cause: err });
  }
}

const IDENT = /^[a-z][a-z0-9_]*$/;
/** A checked table name, quoted. Column names are checked here too and passed bare, as N() requires. */
const table = (name: string) => {
  if (!IDENT.test(name)) throw new TypeError(`"${name}" is not a table name`);
  return `"${name}"`;
};
const column = (name: string) => {
  if (!IDENT.test(name)) throw new TypeError(`"${name}" is not a column name`);
  return name;
};

/** The secret the opt-out list is keyed by: the caller's, else FOUNDATION_SECRET. emailHash refuses one too short. */
const secretOf = (secret: string | null | undefined) => (secret === undefined ? readEnv().fixedSecret : secret);

/** Who is asked about: the matching form of the address, its keyed hash and the secret that keyed it. Throws for anything but one plain address. */
function whoOf(email: string, secret: string | null | undefined): { n: string; hash: string; key: string } {
  const n = normalizeEmail(email);
  const key = secretOf(secret);
  const hash = emailHash(n, key);
  return { n, hash, key: key as string };
}

export async function installedPersonRefs(root: string): Promise<PersonRef[]> {
  const { sources } = await readSources(root);
  const refs: PersonRef[] = [];
  for (const s of sources) if (s.type === "app") refs.push(...personFields(s.data, s.slug));
  return refs;
}

const CARDS_ABOUT = "kind <> 'person-forget' and (contact_id = any($1::uuid[]) or title ~* $2 or body ~* $2 or meta::text ~* $2)";
const OUTBOX_TO = (n: string, ids: string) => `(${N("to_email")} = ${n} or contact_id = any(${ids}::uuid[]))`;
/** An opt-out row is this person's by today's hash, or by the address it keeps (one kept under an earlier secret). */
const OPT_OUT_OF = `(email_hash = $1 or (email is not null and ${N("email")} = $2))`;

const OTHER_ADDRESS = /[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g;
/** Text with every address that is not this person's replaced. */
const redactOthers = (text: string, n: string) => text.replace(OTHER_ADDRESS, (m) => (whoMatches(m, n) ? m : "[another address]"));
const CARD_WITHHELD = "This card names the person in its text, which may name others too, so only that it exists is exported.";
const ROW_WITHHELD = "This record also names someone else, so only the parts about this person are exported.";

/** Core rows for an export: cards found only through their text, and email to another address, are cut down. */
function coreForExport(core: Record<string, unknown[]>, ids: string[], n: string): Record<string, unknown[]> {
  const contactIds = new Set(ids);
  const cards = (core.inbox_items as Row[]).map((c) => {
    if (!contactIds.has(String(c.contact_id))) return { id: c.id, kind: c.kind, created_at: c.created_at, withheld: CARD_WITHHELD };
    const meta = JSON.parse(redactOthers(JSON.stringify(c.meta ?? {}), n)) as unknown;
    return { ...c, title: redactOthers(String(c.title ?? ""), n), body: redactOthers(String(c.body ?? ""), n), meta };
  });
  const outbox = (core.outbox as Row[]).map((o) => (whoMatches(String(o.to_email ?? ""), n) ? o : { withheld: ROW_WITHHELD }));
  return { ...core, inbox_items: cards, outbox };
}

async function findCore(db: Queryable, n: string, hash: string): Promise<{ ids: string[]; core: Record<string, unknown[]> }> {
  const contacts = await db.query<Record<string, unknown> & { id: string }>(`select * from contacts where ${N("email")} = $1`, [n]);
  const ids = contacts.map((c) => c.id);
  return {
    ids,
    core: {
      contacts,
      inbox_items: await db.query(`select * from inbox_items where ${CARDS_ABOUT} order by created_at, id`, [ids, addressPattern(n)]),
      outbox: await db.query(`select * from outbox where ${OUTBOX_TO("$1", "$2")} order by created_at, id`, [n, ids]),
      opt_outs: await db.query(`select * from opt_outs where ${OPT_OUT_OF}`, [hash, n]),
    },
  };
}

/** The person's ids as a team member: the ids of the people rows whose email field is theirs. */
async function teamIds(db: Queryable, refs: PersonRef[], n: string): Promise<string[]> {
  const ids = new Set<string>();
  for (const r of refs.filter((x) => x.how === "email" && x.table === "people")) {
    const rows = await db.query<{ id: string }>(`select id::text as id from ${table(r.table)} where ${N(column(r.column))} = $1`, [n]);
    for (const x of rows) ids.add(x.id);
  }
  return [...ids];
}

type Row = Record<string, unknown> & { id?: unknown };

/**
 * One app table's row that holds the person. The person's own record (a row holding their address) is exported
 * whole, with any other person's address or team member id in it left out. A row that names this person only by
 * id is exported whole when it names no one else. A row that also names someone else, such as a review one person
 * wrote about another or the roster row of someone they manage, gives only the columns that name this
 * person, and says so, because its other columns may be about the other person.
 */
function forExport(row: Row, tableRefs: PersonRef[], n: string, team: Set<string>): Row {
  const emails = tableRefs.filter((r) => r.how === "email").map((r) => r.column);
  const ids = tableRefs.filter((r) => r.how === "team_id").map((r) => r.column);
  const filled = (c: string) => row[c] != null && row[c] !== "";
  const mineEmail = (c: string) => typeof row[c] === "string" && whoMatches(row[c] as string, n);
  const otherEmail = (c: string) => filled(c) && !mineEmail(c);
  // owner_id may hold "owner", the business owner, who is not another team member.
  const otherId = (c: string) => filled(c) && row[c] !== "owner" && !team.has(String(row[c]));
  if (emails.some(mineEmail)) {
    const out: Row = { ...row };
    for (const c of emails) if (otherEmail(c)) out[c] = null;
    for (const c of ids) if (otherId(c)) out[c] = null;
    return out;
  }
  if (!emails.some(otherEmail) && !ids.some(otherId)) return row;
  // Not even the row's id: on a roster row it is the other person's own id.
  const out: Row = {};
  for (const c of ids) if (team.has(String(row[c]))) out[c] = row[c];
  out.withheld = ROW_WITHHELD;
  return out;
}

/** The one email rule, in code: whether a stored address is this person's matching form. */
function whoMatches(stored: string, n: string): boolean {
  try { return normalizeEmail(stored) === n; } catch { return stored.trim().toLowerCase().replace(/^([^+@]+)\+[^@]*@/, "$1@") === n; }
}

async function findApps(db: Queryable, refs: PersonRef[], n: string): Promise<Record<string, unknown[]>> {
  const team = await teamIds(db, refs, n);
  const teamSet = new Set(team);
  const apps: Record<string, unknown[]> = {};
  for (const key of [...new Set(refs.map((r) => `${r.app}/${r.table}`))]) {
    const tableRefs = refs.filter((r) => `${r.app}/${r.table}` === key);
    const params: unknown[] = [];
    const where = tableRefs.map((r) => {
      params.push(r.how === "email" ? n : team);
      return r.how === "email" ? `${N(column(r.column))} = $${params.length}` : `${column(r.column)} = any($${params.length}::text[])`;
    });
    const rows = await db.query<Row>(`select * from ${table(tableRefs[0].table)} where ${where.join(" or ")} order by created_at, id`, params);
    apps[key] = rows.map((row) => forExport(row, tableRefs, n, teamSet));
  }
  return apps;
}

export type PersonExport = { generated_at: string; email_hash: string; core: Record<string, unknown[]>; apps: Record<string, unknown[]> };

/** Everything held about one person, in core tables, in card text and in every installed app. Reads only. */
export async function exportPerson(db: Db, refs: PersonRef[], email: string, now: Date, opts: PersonOptions): Promise<PersonExport> {
  if (!isOwner(opts)) throw new OwnerOnlyError();
  const { n, hash, key } = whoOf(email, opts.secret);
  return plainErrors(async () => {
    await checkSecretFingerprint(db, key);
    const { ids, core } = await findCore(db, n, hash);
    return { generated_at: now.toISOString(), email_hash: hash, core: coreForExport(core, ids, n), apps: await findApps(db, refs, n) };
  });
}

export type ForgetCounts = Record<string, number>;

/**
 * What a forget would remove or blank, by table. An opt-out counts only while it still keeps the address,
 * because forget replaces it with the hash alone.
 */
export async function planForget(db: Db, refs: PersonRef[], email: string, opts: PersonOptions): Promise<ForgetCounts> {
  if (!isOwner(opts)) throw new OwnerOnlyError();
  const { n, hash, key } = whoOf(email, opts.secret);
  await checkSecretFingerprint(db, key);
  const { core } = await findCore(db, n, hash);
  const counts: ForgetCounts = {};
  for (const [k, v] of Object.entries(core)) {
    const held = k === "opt_outs" ? (v as { email: string | null }[]).filter((o) => o.email !== null) : v;
    if (held.length) counts[k] = held.length;
  }
  for (const [k, v] of Object.entries(await findApps(db, refs, n))) if (v.length) counts[k] = v.length;
  return counts;
}

/** The line for the build log: what went, never who. */
export function forgetSummary(counts: ForgetCounts): string {
  const parts = Object.entries(counts).map(([k, v]) => `${v} ${k}`);
  return `Forgot one person: ${parts.length ? parts.join(", ") : "nothing held"}.`;
}

export type ForgetOutcome =
  | { status: "owner_only" } | { status: "nothing" } | { status: "has_account" }
  | { status: "card_raised"; cardId: string; previous: "none" | "declined" | "closed" | "forgotten" }
  | { status: "waiting" } | { status: "done_before" } | { status: "forgotten"; counts: ForgetCounts };

const reEscape = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Every spelling the one email rule joins, as a case-insensitive Postgres regex for free text. */
export function addressPattern(email: string): string {
  const [local, domain] = normalizeEmail(email).split("@");
  return `(^|[^a-z0-9._%+-])${reEscape(local)}(\\+[^@\\s]*)?@${reEscape(domain)}($|[^a-z0-9.-])`;
}

async function hasAccount(db: Queryable, n: string): Promise<boolean> {
  // Accounts arrive with the hosted database. Before then no one has one.
  const [t] = await db.query<{ present: boolean }>("select to_regclass('accounts') is not null as present");
  if (!t?.present) return false;
  return (await db.query(`select 1 as hit from accounts where removed_at is null and ${N("email")} = $1 limit 1`, [n])).length > 0;
}

type Previous = "none" | "declined" | "closed" | "forgotten";

async function raiseForgetCard(db: Db, kinds: KindRegistry, refs: PersonRef[], email: string, runKey: string, previous: Previous, now: Date, opts: PersonOptions): Promise<ForgetOutcome> {
  const counts = await planForget(db, refs, email, opts);
  if (Object.keys(counts).length === 0) return previous === "forgotten" ? { status: "done_before" } : { status: "nothing" };
  const lines = Object.entries(counts).map(([k, v]) => `${v} in ${k}`);
  const r = await writeCard(db, kinds, {
    kind: "person-forget",
    title: "Forget one person on request",
    runKey,
    body: [
      "When you approve, these records are removed, or kept with the person's details blanked where the app keeps them:",
      ...lines,
      "Only a scrambled fingerprint of the address stays, so this person is never emailed again.",
      "Forget does not read notes or messages inside your apps, or find someone mentioned only by name. Check those by hand first.",
    ].join("\n"),
  }, now);
  return r.status === "written" ? { status: "card_raised", cardId: r.id, previous } : { status: "waiting" };
}

/**
 * Forgets one person, always after the owner's yes. Each request is its own person-forget card under the run key
 * forget:<first 16 of the hash>:<n>. With no card, or after a declined card, a card closed without a decision, or a
 * finished forget followed by fresh records, it raises the next card. While the newest card waits it does nothing.
 * Once that card is approved it removes or blanks every reference in one transaction, keeps only the hash in
 * opt_outs with scope all, and completes the card. Someone with an active account is never forgotten.
 */
export async function forgetPerson(db: Db, kinds: KindRegistry, refs: PersonRef[], email: string, now: Date, opts: PersonOptions): Promise<ForgetOutcome> {
  if (!isOwner(opts)) return { status: "owner_only" };
  const { n, hash, key } = whoOf(email, opts.secret);
  return plainErrors(() => forgetFor(db, kinds, refs, email, n, hash, key, now, opts));
}

async function forgetFor(db: Db, kinds: KindRegistry, refs: PersonRef[], email: string, n: string, hash: string, key: string, now: Date, opts: PersonOptions): Promise<ForgetOutcome> {
  // Under another secret the hash written below would not match, and an earlier hash-only opt-out would be missed.
  await checkSecretFingerprint(db, key);
  if (await hasAccount(db, n)) return { status: "has_account" };
  const prefix = `forget:${hash.slice(0, 16)}:`;
  const cards = await db.query<{ id: string; status: string; decision: string | null; run_key: string }>(
    "select id, status, decision, run_key from inbox_items where kind = 'person-forget' and starts_with(run_key, $1)",
    [prefix],
  );
  const seqOf = (key: string) => Number(key.slice(prefix.length)) || 0;
  const seq = cards.reduce((m, c) => Math.max(m, seqOf(c.run_key)), 0);
  const nextKey = `${prefix}${seq + 1}`;
  const card = cards.find((c) => seqOf(c.run_key) === seq);
  if (!card) return raiseForgetCard(db, kinds, refs, email, nextKey, "none", now, opts);
  if (card.status === "new") return { status: "waiting" };
  if (card.decision === "decline") return raiseForgetCard(db, kinds, refs, email, nextKey, "declined", now, opts);
  if (card.decision === null) return raiseForgetCard(db, kinds, refs, email, nextKey, "closed", now, opts);
  if (card.status === "done") return raiseForgetCard(db, kinds, refs, email, nextKey, "forgotten", now, opts);
  // Approved and not yet carried out: do it now, in one transaction.
  const pattern = addressPattern(n);
  const counts = await db.transaction(async (tx) => {
    const c: ForgetCounts = {};
    const bump = (k: string, by: number) => { if (by) c[k] = (c[k] ?? 0) + by; };
    await checkSecretFingerprint(tx, key);
    const { ids } = await findCore(tx, n, hash);
    // Team ids are read before the people rows go.
    const team = await teamIds(tx, refs, n);
    bump("inbox_items", (await tx.query(
      `update inbox_items set contact_id = null, title = 'A forgotten person', body = '', meta = '{}'::jsonb where ${CARDS_ABOUT} returning id`,
      [ids, pattern],
    )).length);
    // A sent email is a record that stays, blanked. One a sender holds right now is blanked too, never pulled away.
    bump("outbox", (await tx.query(`delete from outbox where ${OUTBOX_TO("$1", "$2")} and status not in ('sent', 'sending') returning id`, [n, ids])).length);
    bump("outbox", (await tx.query(`update outbox set to_email = '', subject = '', body = '' where ${OUTBOX_TO("$1", "$2")} and status in ('sent', 'sending') returning id`, [n, ids])).length);
    // App rows: the person's team member id is blanked wherever it appears, and a row that holds their address is
    // deleted, or kept with the address blanked where its entity says forget: blank. One row counts once per table.
    const touched: Record<string, Set<string>> = {};
    const mark = (key: string, rows: { id: unknown }[]) => { for (const r of rows) (touched[key] ??= new Set()).add(String(r.id)); };
    for (const r of refs.filter((x) => x.how === "team_id")) {
      mark(`${r.app}/${r.table}`, await tx.query<{ id: unknown }>(`update ${table(r.table)} set ${column(r.column)} = '' where ${column(r.column)} = any($1::text[]) returning id`, [team]));
    }
    for (const r of refs.filter((x) => x.how === "email")) {
      const sql = r.forget === "blank"
        ? `update ${table(r.table)} set ${column(r.column)} = '' where ${N(column(r.column))} = $1 returning id`
        : `delete from ${table(r.table)} where ${N(column(r.column))} = $1 returning id`;
      mark(`${r.app}/${r.table}`, await tx.query<{ id: unknown }>(sql, [n]));
    }
    for (const [k, v] of Object.entries(touched)) bump(k, v.size);
    // Only the hash stays, as an opt-out from every email. Any earlier row for this person, including one that
    // kept the address under an earlier secret, is replaced.
    bump("opt_outs", (await tx.query<{ id: string }>(`delete from opt_outs where ${OPT_OUT_OF} and email is not null returning id`, [hash, n])).length);
    await tx.query(`delete from opt_outs where ${OPT_OUT_OF}`, [hash, n]);
    await tx.query("insert into opt_outs (email, email_hash, at, source, scope) values (null, $1, $2, 'forget', 'all')", [hash, now]);
    bump("contacts", (await tx.query("delete from contacts where id = any($1::uuid[]) returning id", [ids])).length);
    const closed = await tx.query("update inbox_items set status = 'done' where id = $1 and status = 'decided' and decision = 'approve' returning id", [card.id]);
    if (closed.length !== 1) throw new Error("The forget card changed while forgetting. Nothing was removed.");
    return c;
  });
  return { status: "forgotten", counts };
}

/**
 * Where an export goes: .data/exports/ by default, or a folder the owner names inside .data/, which git ignores.
 * The name holds the first 12 characters of the keyed hash and the date, never the address.
 */
export function exportTarget(root: string, out: string | null, emailHashHex: string, date: string): string {
  if (!/^[0-9a-f]{64}$/.test(emailHashHex)) throw new TypeError("An export is named by the address's hash.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new TypeError("An export's date is YYYY-MM-DD.");
  const name = `person-${emailHashHex.slice(0, 12)}-${date}.json`;
  const base = path.resolve(root);
  const dir = out ? path.resolve(base, out) : path.join(base, ".data", "exports");
  const rel = path.relative(path.join(base, ".data"), dir);
  if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) throw new Error("Save exports in a folder inside .data, such as .data/exports.");
  return path.join(dir, name);
}
