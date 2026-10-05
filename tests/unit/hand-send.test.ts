import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { coreDb } from "../support/db";
import { claimNext, draftEmail, markFailed, markSentByHand, optOut } from "@/lib/data/outbox";
import { emailSendingActive, upsertConnection } from "@/lib/data/connections";
import { HAND_SEND_NOTES, handSendFor, type HandSendContext } from "@/lib/data/hand-send";
import type { CardEmail } from "@/lib/data/inbox";
import type { Db } from "@/lib/db/types";

const SECRET = "hand-send-test-secret-of-at-least-32-chars";
const T0 = new Date("2026-10-05T16:00:00Z");
const MAIL = { to: "jo@harbor.example", subject: "Your booking", body: "See you Tuesday.", sendKey: "bookings/b1/confirm" };
const CTX: HandSendContext = { secret: SECRET, baseUrl: null, facts: { postalAddress: "", mailto: null }, senderActive: false };
const CONNECTED = { service: "email-sending", door: "own" as const, status: "connected" as const, scopes: ["send"], key_setting: "RESEND_API_KEY", tested_on: null, owner: "Owner" };

beforeEach(() => { vi.stubEnv("FOUNDATION_SECRET", SECRET); });
afterEach(() => { vi.unstubAllEnvs(); });

async function row(db: Db, id: string): Promise<CardEmail> {
  const [r] = await db.query<CardEmail>("select id, to_email as to, subject, body, status, kind, send_after::text as send_after, last_error as note from outbox where id = $1", [id]);
  return r;
}
async function approved(db: Db, extra: Partial<Parameters<typeof draftEmail>[1]> = {}): Promise<string> {
  const d = await draftEmail(db, { ...MAIL, ...extra });
  if (d.status !== "drafted") throw new Error("not drafted");
  await db.query("update outbox set status = 'approved', approved_at = $2 where id = $1", [d.id, T0]);
  return d.id;
}
async function failed(db: Db, sendKey: string): Promise<string> {
  const id = await approved(db, { sendKey });
  await claimNext(db, T0);
  await markFailed(db, id, "provider said no", T0);
  return id;
}

describe("sending by hand and the opt-out list", () => {
  it("an opt-out after approval takes away the copy and refuses the row", async () => {
    const db = await coreDb();
    const id = await approved(db);
    expect((await handSendFor(db, await row(db, id), CTX)).copyText).toBe("Subject: Your booking\n\nSee you Tuesday.");
    await optOut(db, { email: "Jo+x@Harbor.Example", source: "owner", scope: "all" }, T0);
    expect(await handSendFor(db, await row(db, id), CTX)).toEqual({ copyText: null, note: "This person asked us to stop." });
    expect(HAND_SEND_NOTES.optedOut).toBe("This person asked us to stop.");
    expect(await markSentByHand(db, id, T0)).toBe("opted_out");
    expect(await db.query("select status, sent_by_hand from outbox")).toEqual([{ status: "approved", sent_by_hand: false }]);
    await db.close();
  });
  it("refuses a failed row whose address opted out too", async () => {
    const db = await coreDb();
    const id = await failed(db, "k-failed");
    await optOut(db, { email: MAIL.to, source: "owner", scope: "all" }, T0);
    expect((await handSendFor(db, await row(db, id), CTX)).copyText).toBeNull();
    expect(await markSentByHand(db, id, T0)).toBe("opted_out");
    await db.close();
  });
  it("a marketing opt-out leaves a transactional email free to send by hand", async () => {
    const db = await coreDb();
    const id = await approved(db);
    await optOut(db, { email: MAIL.to, source: "unsubscribe link", scope: "marketing" }, T0);
    expect((await handSendFor(db, await row(db, id), CTX)).copyText).not.toBeNull();
    expect(await markSentByHand(db, id, T0)).toBe("sent");
    await db.close();
  });
  it("offers no copy without FOUNDATION_SECRET, because the list cannot be checked", async () => {
    const db = await coreDb();
    const id = await approved(db);
    expect(await handSendFor(db, await row(db, id), { ...CTX, secret: null })).toEqual({ copyText: null, note: HAND_SEND_NOTES.noSecret });
    await db.close();
  });
});

describe("sending by hand and the email connection", () => {
  it("reads the email-sending connection as active only while it is connected", async () => {
    const db = await coreDb();
    expect(await emailSendingActive(db)).toBe(false);
    await upsertConnection(db, { ...CONNECTED, status: "planned" }, T0);
    expect(await emailSendingActive(db)).toBe(false);
    await upsertConnection(db, CONNECTED, T0);
    expect(await emailSendingActive(db)).toBe(true);
    await upsertConnection(db, { ...CONNECTED, status: "failing" }, T0);
    expect(await emailSendingActive(db)).toBe(false);
    await upsertConnection(db, { ...CONNECTED, status: "disconnected" }, T0);
    expect(await emailSendingActive(db)).toBe(false);
    expect(await emailSendingActive(null)).toBe(false);
    await db.close();
  });
  it("with the connection active, an approved row offers no copy and a failed row still does", async () => {
    const db = await coreDb();
    await upsertConnection(db, CONNECTED, T0);
    const ctx = { ...CTX, senderActive: await emailSendingActive(db) };
    const f = await failed(db, "k-failed");
    const a = await approved(db);
    expect(await handSendFor(db, await row(db, a), ctx)).toEqual({ copyText: null, note: HAND_SEND_NOTES.automatic });
    expect((await handSendFor(db, await row(db, f), ctx)).copyText).not.toBeNull();
    expect(await markSentByHand(db, a, T0, { approved: false })).toBe("automatic");
    expect(await markSentByHand(db, f, T0, { approved: false })).toBe("sent");
    expect(await db.query("select status from outbox where id = $1", [a])).toEqual([{ status: "approved" }]);
    await db.close();
  });
  it("with the connection failing, an approved row still offers Copy email", async () => {
    const db = await coreDb();
    await upsertConnection(db, { ...CONNECTED, status: "failing" }, T0);
    const ctx = { ...CTX, senderActive: await emailSendingActive(db) };
    const a = await approved(db);
    expect((await handSendFor(db, await row(db, a), ctx)).copyText).not.toBeNull();
    await db.close();
  });
  it("offers nothing for a draft, a sending, a sent or a cancelled row", async () => {
    const db = await coreDb();
    const d = await draftEmail(db, MAIL);
    if (d.status !== "drafted") throw new Error("not drafted");
    expect(await handSendFor(db, await row(db, d.id), CTX)).toEqual({ copyText: null, note: null });
    await db.close();
  });
});
