import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { coreDb } from "../support/db";
import { draftEmail, sendApproved, senderOptions, type Sender } from "@/lib/data/outbox";
import { handleUnsubscribe, publicBaseUrl, readUnsubscribeToken, unsubscribeToken, UNSUBSCRIBE_LIMITS } from "@/lib/data/unsubscribe";
import { isPublicPath } from "@/lib/auth/gate";
import type { Db } from "@/lib/db/types";

const SECRET = "unsubscribe-test-secret-of-at-least-32-chars";
const T0 = new Date("2026-10-05T16:00:00Z");
const BASE = "https://harbor.example";
const ID = "6f1c2a4e-1b2c-4d5e-8f90-1234567890ab";
const OTHER = "0a1b2c3d-1b2c-4d5e-8f90-1234567890ab";
const PROMO = { to: "Jo+News@Harbor.Example", subject: "Fall open house", body: "Come by on Saturday.", sendKey: "promo/fall/jo", kind: "marketing" as const };

beforeEach(() => { vi.stubEnv("FOUNDATION_SECRET", SECRET); });
afterEach(() => { vi.unstubAllEnvs(); });

async function approvedPromo(db: Db, extra: Partial<typeof PROMO> = {}): Promise<string> {
  const d = await draftEmail(db, { ...PROMO, ...extra });
  if (d.status !== "drafted") throw new Error("not drafted");
  await db.query("update outbox set status = 'approved', approved_at = $2 where id = $1", [d.id, T0]);
  return d.id;
}
const capture = () => vi.fn(async () => ({ providerRef: "msg_1" })) as Sender & { mock: { calls: unknown[][] } };
const post = (token: string, extra: Partial<Parameters<typeof handleUnsubscribe>[1]> = {}) => ({ token, method: "POST" as const, contentLength: 26, ...extra });

describe("the unsubscribe token", () => {
  it("reads back the row it was made for, and never shows the address", () => {
    const t = unsubscribeToken(ID, SECRET);
    expect(t).toMatch(/^[0-9a-f-]{36}\.[A-Za-z0-9_-]{43}$/);
    expect(t).not.toMatch(/harbor|jo/i);
    expect(readUnsubscribeToken(t, SECRET)).toBe(ID);
  });
  it("refuses a forged token, one for another row, one under another secret, and anything oversized or odd", () => {
    const t = unsubscribeToken(ID, SECRET);
    const [, sig] = t.split(".");
    expect(readUnsubscribeToken(`${OTHER}.${sig}`, SECRET)).toBeNull();
    expect(readUnsubscribeToken(`${ID}.${"A".repeat(43)}`, SECRET)).toBeNull();
    expect(readUnsubscribeToken(t, "another-secret")).toBeNull();
    expect(readUnsubscribeToken(`${t}x`, SECRET)).toBeNull();
    expect(readUnsubscribeToken("x".repeat(5000), SECRET)).toBeNull();
    expect(readUnsubscribeToken(t.toUpperCase(), SECRET)).toBeNull();
    expect(readUnsubscribeToken(t, "")).toBeNull();
  });
  it("is a public address only in its own shape", () => {
    expect(isPublicPath(`/u/${unsubscribeToken(ID, SECRET)}`)).toBe(true);
    for (const p of ["/u", "/u/", "/u/abc", `/u/${ID}`, `/u/${unsubscribeToken(ID, SECRET)}/x`, "/unsubscribe"]) expect(isPublicPath(p), p).toBe(false);
  });
});

describe("unsubscribing", () => {
  it("a visit only asks, and a post records the opt-out for that row's address", async () => {
    const db = await coreDb();
    const id = await approvedPromo(db);
    const token = unsubscribeToken(id, SECRET);
    expect(await handleUnsubscribe({ db, secret: SECRET }, { token, method: "GET", contentLength: null }, T0)).toEqual({ status: "confirm" });
    expect(await db.query("select count(*)::int as n from opt_outs")).toEqual([{ n: 0 }]);
    expect(await handleUnsubscribe({ db, secret: SECRET }, post(token), T0)).toEqual({ status: "done" });
    expect(await db.query("select email, source, scope from opt_outs")).toEqual([{ email: "Jo+News@harbor.example", source: "unsubscribe link", scope: "marketing" }]);
    expect((await draftEmail(db, { ...PROMO, kind: "transactional", sendKey: "booking/after-unsubscribe" })).status).toBe("drafted");
    await db.close();
  });
  it("a marketing email to an address that unsubscribed is cancelled at send time, in any spelling", async () => {
    const db = await coreDb();
    const first = await approvedPromo(db);
    await approvedPromo(db, { to: "JO@harbor.example", sendKey: "promo/winter/jo" });
    expect(await handleUnsubscribe({ db, secret: SECRET }, post(unsubscribeToken(first, SECRET)), T0)).toEqual({ status: "done" });
    const send = capture();
    expect(await sendApproved(db, send, T0, 20, { baseUrl: BASE })).toEqual({ sent: 0, failed: 0, refused: 2 });
    expect(send).not.toHaveBeenCalled();
    expect(await db.query("select distinct status from outbox")).toEqual([{ status: "cancelled" }]);
    await db.close();
  });
  it("refuses a forged token or one for another row, and writes nothing", async () => {
    const db = await coreDb();
    const id = await approvedPromo(db);
    const [, sig] = unsubscribeToken(id, SECRET).split(".");
    expect(await handleUnsubscribe({ db, secret: SECRET }, post(`${OTHER}.${sig}`), T0)).toEqual({ status: "invalid" });
    expect(await handleUnsubscribe({ db, secret: SECRET }, post(`${id}.${"A".repeat(43)}`), T0)).toEqual({ status: "invalid" });
    expect(await handleUnsubscribe({ db, secret: SECRET }, { ...post(`${id}.${"A".repeat(43)}`), method: "GET" }, T0)).toEqual({ status: "invalid" });
    expect(await handleUnsubscribe({ db, secret: SECRET }, post(unsubscribeToken(OTHER, SECRET)), T0)).toEqual({ status: "invalid" });
    expect(await db.query("select (select count(*)::int from opt_outs) as o, (select count(*)::int from form_counts) as c")).toEqual([{ o: 0, c: 0 }]);
    await db.close();
  });
  it("refuses a token for a row that is not marketing", async () => {
    const db = await coreDb();
    const id = await approvedPromo(db, { kind: "transactional" as never, sendKey: "booking/1" });
    expect(await handleUnsubscribe({ db, secret: SECRET }, post(unsubscribeToken(id, SECRET)), T0)).toEqual({ status: "invalid" });
    await db.close();
  });
  it("refuses an oversized body before reading anything, and is rate limited like a form", async () => {
    const db = await coreDb();
    const id = await approvedPromo(db);
    const token = unsubscribeToken(id, SECRET);
    expect(await handleUnsubscribe({ db, secret: SECRET }, post(token, { contentLength: 1_000_000 }), T0)).toEqual({ status: "too_large" });
    for (let i = 0; i < UNSUBSCRIBE_LIMITS.perClient; i++) expect((await handleUnsubscribe({ db, secret: SECRET }, post(token), T0)).status).toBe("done");
    expect(await handleUnsubscribe({ db, secret: SECRET }, post(token), T0)).toEqual({ status: "limited" });
    expect(await db.query("select count(*)::int as n from opt_outs")).toEqual([{ n: 1 }]);
    await db.close();
  });
  it("says so plainly when nothing can be recorded", async () => {
    const token = unsubscribeToken(ID, SECRET);
    expect(await handleUnsubscribe({ db: null, secret: SECRET }, post(token), T0)).toEqual({ status: "preview" });
    expect(await handleUnsubscribe({ db: null, secret: null }, post(token), T0)).toEqual({ status: "invalid" });
  });
});

describe("sending marketing email", () => {
  it("adds the unsubscribe link, its headers and the postal address", async () => {
    const db = await coreDb();
    await db.query("insert into business_profile (id, business, email, postal_address) values (1, 'Harbor Studio', 'hello@harbor.example', '12 Harbor Way, Portland, OR 97201') on conflict (id) do update set email = excluded.email, postal_address = excluded.postal_address");
    const id = await approvedPromo(db);
    const send = capture();
    expect(await sendApproved(db, send, T0, 20, { baseUrl: `${BASE}/some/path` })).toEqual({ sent: 1, failed: 0, refused: 0 });
    const msg = send.mock.calls[0][0] as { body: string; headers: Record<string, string> };
    const url = `${BASE}/u/${unsubscribeToken(id, SECRET)}`;
    expect(msg.body).toBe(`Come by on Saturday.\n\n12 Harbor Way, Portland, OR 97201\nTo stop getting these emails, open ${url}`);
    expect(msg.headers).toEqual({
      "List-Unsubscribe": `<mailto:hello@harbor.example?subject=unsubscribe>, <${url}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    });
    await db.close();
  });
  it("leaves a marketing email approved and unsent when no public address is known", async () => {
    const db = await coreDb();
    const id = await approvedPromo(db);
    const send = capture();
    expect(await sendApproved(db, send, T0)).toEqual({ sent: 0, failed: 0, refused: 0 });
    expect(await sendApproved(db, send, T0, 20, { baseUrl: "http://harbor.example" })).toEqual({ sent: 0, failed: 0, refused: 0 });
    expect(send).not.toHaveBeenCalled();
    expect(await db.query("select status from outbox where id = $1", [id])).toEqual([{ status: "approved" }]);
    await db.close();
  });
  it("sends a transactional email as written, with no footer and no headers", async () => {
    const db = await coreDb();
    await approvedPromo(db, { kind: "transactional" as never, sendKey: "booking/1" });
    const send = capture();
    await sendApproved(db, send, T0, 20, { baseUrl: BASE });
    expect(send.mock.calls[0][0]).toMatchObject({ body: "Come by on Saturday.", headers: {} });
    await db.close();
  });
});

describe("publicBaseUrl", () => {
  it("is the live site's address on Vercel, and nothing on the owner's computer", () => {
    expect(publicBaseUrl({ VERCEL_PROJECT_PRODUCTION_URL: "harbor.example" })).toBe("https://harbor.example");
    expect(publicBaseUrl({ VERCEL_PROJECT_PRODUCTION_URL: "harbor.example/evil?x" })).toBeNull();
    expect(publicBaseUrl({})).toBeNull();
  });
});

describe("the sender's settings", () => {
  it("takes the live site's address from FOUNDATION_URL first, and refuses one that is not https", () => {
    expect(publicBaseUrl({ FOUNDATION_URL: "https://command.harbor.example/", VERCEL_PROJECT_PRODUCTION_URL: "harbor.vercel.app" })).toBe("https://command.harbor.example");
    expect(publicBaseUrl({ FOUNDATION_URL: "  https://command.harbor.example  " })).toBe("https://command.harbor.example");
    expect(publicBaseUrl({ FOUNDATION_URL: "http://command.harbor.example", VERCEL_PROJECT_PRODUCTION_URL: "harbor.vercel.app" })).toBeNull();
    expect(publicBaseUrl({ FOUNDATION_URL: "https://user:pw@command.harbor.example" })).toBeNull();
    expect(publicBaseUrl({ FOUNDATION_URL: "" , VERCEL_PROJECT_PRODUCTION_URL: "harbor.vercel.app" })).toBe("https://harbor.vercel.app");
  });
  it("hands the sender FOUNDATION_URL and the fixed secret, so marketing email carries a working link", async () => {
    const opts = senderOptions({ FOUNDATION_URL: "https://command.harbor.example", FOUNDATION_SECRET: SECRET });
    expect(opts).toEqual({ secret: SECRET, baseUrl: "https://command.harbor.example" });
    const db = await coreDb();
    const id = await approvedPromo(db);
    const send = capture();
    expect(await sendApproved(db, send, T0, 20, opts)).toEqual({ sent: 1, failed: 0, refused: 0 });
    expect((send.mock.calls[0][0] as { body: string }).body).toContain(`https://command.harbor.example/u/${unsubscribeToken(id, SECRET)}`);
    await db.close();
  });
  it("leaves marketing email unsent when neither address is set", async () => {
    expect(senderOptions({ FOUNDATION_SECRET: SECRET })).toEqual({ secret: SECRET, baseUrl: null });
    const db = await coreDb();
    const id = await approvedPromo(db);
    const send = capture();
    expect(await sendApproved(db, send, T0, 20, senderOptions({ FOUNDATION_SECRET: SECRET }))).toEqual({ sent: 0, failed: 0, refused: 0 });
    expect(await db.query("select status from outbox where id = $1", [id])).toEqual([{ status: "approved" }]);
    await db.close();
  });
});
