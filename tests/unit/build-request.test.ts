import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { buildRequestMailto, buildRequestText, WORTH_PICKS, WORTH_QUESTION, type BuildRequest } from "@/lib/build-request";
import { BuildRequestButton } from "@/components/BuildRequest";

const sample: BuildRequest = {
  name: "Rosa Lind",
  business: "Harbor Studio",
  whatItDoes: "Pottery classes by the water",
  email: "rosa@harbor.example",
  phone: "555 0100",
  want: "Online booking for classes",
  when: "Within a month",
  worth: "$2,500 to $10,000",
  worthNote: "We lose bookings every weekend",
};

const parse = (mailto: string) => {
  expect(mailto.startsWith("mailto:")).toBe(true);
  const [to, query] = mailto.slice("mailto:".length).split("?");
  const params = new URLSearchParams(query);
  return { to, subject: params.get("subject") ?? "", body: params.get("body") ?? "" };
};

describe("the build request", () => {
  it("the mailto goes to hello@lightbrands.ai with every answer", () => {
    const m = parse(buildRequestMailto(sample));
    expect(m.to).toBe("hello@lightbrands.ai");
    expect(m.subject).toBe("Build request: Harbor Studio");
    for (const answer of Object.values(sample)) expect(m.body).toContain(answer);
    expect(m.body).toContain(WORTH_QUESTION);
    expect(m.body.replace(/\r\n/g, "\n")).toBe(buildRequestText(sample));
  });

  it("apostrophes, ampersands and line breaks are encoded", () => {
    const tricky: BuildRequest = { ...sample, business: "Rosa's Bread & Co", want: "A menu page\nand a shop\r\nwith pickup", worthNote: "50% of orders come by phone?" };
    const url = buildRequestMailto(tricky);
    const query = url.slice(url.indexOf("?") + 1);
    expect(query).not.toMatch(/['\n\r ]/);
    // An ampersand inside an answer must never split the query into a new field.
    expect(query.split("&").map((p) => p.split("=")[0])).toEqual(["subject", "body"]);
    expect(query).toContain("%27");
    expect(query).toContain("%26");
    expect(query).toContain("%0D%0A");
    const m = parse(url);
    expect(m.subject).toBe("Build request: Rosa's Bread & Co");
    expect(m.body).toContain("A menu page\r\nand a shop\r\nwith pickup");
    expect(m.body).toContain("50% of orders come by phone?");
  });

  it("a line break in the business name never reaches the subject line", () => {
    const m = parse(buildRequestMailto({ ...sample, business: "Harbor\r\nBcc: someone@example.com" }));
    expect(m.subject).not.toMatch(/[\r\n]/);
    expect(m.subject).toBe("Build request: Harbor Bcc: someone@example.com");
  });

  it("the worth question reads exactly What would it be worth to you to have this built and running?", () => {
    expect(WORTH_QUESTION).toBe("What would it be worth to you to have this built and running?");
    expect(buildRequestText(sample)).toContain("What would it be worth to you to have this built and running?\n$2,500 to $10,000");
    expect(buildRequestText(sample)).toContain("Anything you'd like us to know about that?\nWe lose bookings every weekend");
  });

  it("the word budget appears nowhere", () => {
    const files = ["src/lib/build-request.ts", "src/components/BuildRequest.tsx"];
    for (const f of files) expect(readFileSync(f, "utf8")).not.toMatch(/budget/i);
    expect(buildRequestText(sample)).not.toMatch(/budget/i);
    const h = renderToStaticMarkup(createElement(BuildRequestButton, { business: "Harbor Studio", whatItDoes: "Pottery classes" }));
    expect(h).not.toMatch(/budget/i);
  });

  it("WORTH_PICKS are the six bands in order", () => {
    expect(WORTH_PICKS).toEqual(["Under $2,500", "$2,500 to $10,000", "$10,000 to $30,000", "$30,000 to $100,000", "$100,000 or more", "Not sure yet"]);
  });

  it("the dialog reads Have Light Brands build it for you and fills the business from the profile", () => {
    const h = renderToStaticMarkup(createElement(BuildRequestButton, { business: "Harbor Studio", whatItDoes: "Pottery classes by the water" }));
    expect(h).toContain("Have Light Brands build it for you");
    expect(h).toContain('value="Harbor Studio"');
    expect(h).toContain("Pottery classes by the water");
    expect(h).toContain("Open email");
    expect(h).toContain("Copy message");
    for (const pick of WORTH_PICKS) expect(h).toContain(pick.replace(/&/g, "&amp;"));
    expect(h).not.toContain("$19");
  });

  it("the build request lives inside the command center only", () => {
    const users: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.tsx?$/.test(name) && readFileSync(p, "utf8").includes("@/components/BuildRequest")) users.push(p);
      }
    };
    walk("src");
    expect(users.length).toBeGreaterThan(0);
    for (const p of users) expect(p.startsWith(join("src", "app", "admin", "(console)")) || p.startsWith(join("src", "components", "frame"))).toBe(true);
    expect(readFileSync("src/app/admin/(console)/layout.tsx", "utf8")).toContain("whatItDoes");
    expect(readFileSync("src/app/admin/(console)/page.tsx", "utf8")).toContain("BuildRequest");
  });
});
