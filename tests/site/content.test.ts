import { describe, it, expect } from "vitest";
import { loadPages, visibleText, type Page } from "./helpers";
import { SITE } from "../../src/config/site";

const pages = loadPages();
const SECTION = /^\/(services|materials|industries|locations)\//;
const contentPages = pages.filter((p) => SECTION.test(p.path) && p.path.split("/").filter(Boolean).length === 2);
const indexPages = pages.filter((p) => /^\/(services|materials|industries|locations)\/$/.test(p.path));

const graphs = (p: Page) =>
  p.$('script[type="application/ld+json"]')
    .map((_, el) => JSON.parse(p.$(el).text()))
    .get()
    .flatMap((g: any) => g["@graph"] ?? [g]);

const MIN_WORDS = 700;

describe("content pages exist", () => {
  it("builds at least one content page", () => {
    expect(contentPages.length).toBeGreaterThan(0);
  });
});

describe.each(contentPages.map((p) => [p.path, p] as const))("%s", (path, p) => {
  const nodes = graphs(p);
  const canonical = new URL(path, SITE.url).href;

  it("has a BreadcrumbList ending at this page, and visible breadcrumbs", () => {
    const bc = nodes.find((n) => n["@type"] === "BreadcrumbList");
    expect(bc).toBeDefined();
    expect(bc.itemListElement.at(-1).item).toBe(canonical);
    expect(p.$("nav.breadcrumbs li").length).toBe(bc.itemListElement.length);
  });

  it("has a Service provided by the business node on the same page", () => {
    const svc = nodes.find((n) => n["@type"] === "Service");
    const business = nodes.find((n) => n["@type"] === "ProfessionalService");
    expect(svc).toBeDefined();
    expect(svc.url).toBe(canonical);
    expect(svc.provider["@id"]).toBe(business["@id"]);
  });

  it(`has at least ${MIN_WORDS} words of body copy`, () => {
    const words = p.$("article.prose").text().trim().split(/\s+/).length;
    expect(words).toBeGreaterThanOrEqual(MIN_WORDS);
  });

  it("uses its primary keyword in the title or H1 and in the body", () => {
    const kw = (p.$("article.prose").attr("data-primary-keyword") ?? "").toLowerCase();
    expect(kw).not.toBe("");
    const head = `${p.$("title").text()} ${p.$("h1").text()}`.toLowerCase();
    expect(head).toContain(kw);
    expect(p.$("article.prose").text().toLowerCase()).toContain(kw);
  });

  it("links to at least 3 other spine pages or /capabilities/", () => {
    const targets = new Set<string>();
    p.$("a[href]").each((_, el) => {
      const href = p.$(el).attr("href")!;
      if ((SECTION.test(href) && href.split("/").filter(Boolean).length === 2 && href !== path) || href === "/capabilities/") targets.add(href);
    });
    expect([...targets].length).toBeGreaterThanOrEqual(3);
  });

  it("shows every FAQ question visibly", () => {
    const faq = nodes.find((n) => n["@type"] === "FAQPage");
    if (!faq) return;
    const text = visibleText(p);
    for (const q of faq.mainEntity) expect(text).toContain(q.name);
  });

  it("shows an Updated date that matches WebPage.dateModified", () => {
    const wp = nodes.find((n) => n["@type"] === "WebPage");
    expect(wp).toBeDefined();
    expect(wp.url).toBe(canonical);
    expect(wp.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const time = p.$("time.updated");
    expect(time.attr("datetime")).toBe(wp.dateModified);
    expect(time.text()).toMatch(/Updated [A-Z][a-z]+ \d{4}/);
  });

  it("links to the quote page", () => {
    expect(p.$('a[href="/contact/"]').length).toBeGreaterThan(0);
  });
});

describe.each(indexPages.map((p) => [p.path, p] as const))("index %s", (path, p) => {
  it("lists every published page in its section", () => {
    const children = contentPages.filter((c) => c.path.startsWith(path)).map((c) => c.path).sort();
    const linked = [...new Set(p.$(".cards a").map((_, el) => p.$(el).attr("href")).get())].sort();
    expect(linked).toEqual(children);
  });
});
