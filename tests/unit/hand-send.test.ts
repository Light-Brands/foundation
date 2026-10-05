import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { coreDb } from "../support/db";
import { claimNext, draftEmail, markFailed, markSentByHand, optOut } from "@/lib/data/outbox";
import { emailSendingActive, upsertConnection } from "@/lib/data/connections";
import { handSendFor, handSendContext, type HandSendContext } from "@/lib/data/hand-send";
import { HAND_SEND_NOTES, handSendNote } from "@/lib/hand-send-notes";
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
    expect(await handSendFor(db, await row(db, id), CTX)).toEqual({ copyText: null, reason: "opted_out" });
    expect(handSendNote("opted_out")).toBe("This person asked us to stop.");
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
    expect(await handSendFor(db, await row(db, id), { ...CTX, secret: null })).toEqual({ copyText: null, reason: "no_secret" });
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
    expect(await handSendFor(db, await row(db, a), ctx)).toEqual({ copyText: null, reason: "automatic" });
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
    expect(await handSendFor(db, await row(db, d.id), CTX)).toEqual({ copyText: null, reason: null });
    await db.close();
  });
});

describe("the card note gives its real reason", () => {
  it("a marketing email with no live address says to set the address, and an invalid one says to fix it", async () => {
    const db = await coreDb();
    const id = await approved(db, { kind: "marketing" });
    expect(await handSendFor(db, await row(db, id), { ...CTX, baseUrl: null })).toEqual({ copyText: null, reason: "no_address" });
    expect(await handSendFor(db, await row(db, id), { ...CTX, baseUrl: null, addressInvalid: true })).toEqual({ copyText: null, reason: "address_invalid" });
    await db.close();
  });
  it("words each reason for itself", () => {
    expect(handSendNote("no_address")).toMatch(/set FOUNDATION_URL/);
    expect(handSendNote("address_invalid")).toMatch(/FOUNDATION_URL is set but is not a plain https address/);
    expect(handSendNote("no_secret")).toMatch(/at least 32 characters/);
    expect(handSendNote(null)).toBeNull();
    expect(new Set(Object.values(HAND_SEND_NOTES)).size).toBe(Object.keys(HAND_SEND_NOTES).length);
  });
  it("handSendContext reads an http FOUNDATION_URL as invalid and a missing one as missing", async () => {
    vi.stubEnv("FOUNDATION_URL", "http://command.harbor.example");
    expect((await handSendContext(null)).addressInvalid).toBe(true);
    vi.stubEnv("FOUNDATION_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    expect((await handSendContext(null)).addressInvalid).toBe(false);
  });
});

describe("handSendContext and a short FOUNDATION_SECRET", () => {
  it("reads a FOUNDATION_SECRET under 32 characters as no secret", async () => {
    vi.stubEnv("FOUNDATION_SECRET", "s".repeat(31));
    expect((await handSendContext(null)).secret).toBeNull();
  });
});
