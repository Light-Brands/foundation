import { describe, it, expect } from "vitest";
import { buildNav, hrefFor, activeKey } from "@/lib/layout/registry";
import { safeNext } from "@/lib/safe-next";

const screens = { "command.home": "/", "sell.leads": "/sell/leads" };

describe("a Foundation mounted under a base path", () => {
  it("prefixes every href with the base", () => {
    expect(hrefFor("sell", "leads", { base: "/admin", screens })).toBe("/admin/sell/leads");
    expect(hrefFor("command", "home", { base: "/admin", screens })).toBe("/admin");
    expect(hrefFor("money", "books", { base: "/admin", screens })).toBe("/admin/money/books");
  });
  it("marks only the screens it is given as built", () => {
    const nav = buildNav({}, { base: "/admin", screens });
    const items = nav.flatMap((g) => g.items);
    expect(items.filter((i) => i.state === "built").map((i) => i.key).sort()).toEqual(["command.home", "sell.leads"]);
  });
  it("lights Home only on the base itself", () => {
    const nav = buildNav({}, { base: "/admin", screens });
    expect(activeKey("/admin", nav)).toBe("command.home");
    expect(activeKey("/admin/sell/leads/42", nav)).toBe("sell.leads");
    expect(activeKey("/admin/nowhere", nav)).toBeNull();
  });
  it("keeps the unmounted defaults", () => {
    expect(hrefFor("command", "inbox")).toBe("/command/inbox");
    expect(activeKey("/", buildNav())).toBe("command.home");
  });
  it("exports safeNext from its own module", () => {
    expect(safeNext("//evil.example")).toBe("/");
    expect(safeNext("/sell/leads?x=1")).toBe("/sell/leads?x=1");
  });
});
