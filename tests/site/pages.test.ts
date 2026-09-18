import { describe, it, expect } from "vitest";
import { loadPages, isNotFoundPage } from "./helpers";
import { SITE } from "../../src/config/site";
import { TITLE_MAX, DESCRIPTION_MIN, DESCRIPTION_MAX } from "../../src/lib/seo";

const pages = loadPages();
const indexable = pages.filter((p) => !isNotFoundPage(p));

describe("every page", () => {
  it.each(pages.map((p) => [p.path, p]))("%s has lang, title, one h1, parseable JSON-LD", (_path, p) => {
    const { $ } = p;
    expect($("html").attr("lang")).toBe("en");
    const title = $("title").text().trim();
    expect(title.length).toBeGreaterThanOrEqual(10);
    expect(title.length).toBeLessThanOrEqual(TITLE_MAX);
    expect($("h1").length).toBe(1);
    $('script[type="application/ld+json"]').each((_, el) => {
      expect(() => JSON.parse($(el).text())).not.toThrow();
    });
  });

  it.each(pages.map((p) => [p.path, p]))("%s ships no legacy CDN CSS or .ogv video", (_path, p) => {
    expect(p.html).not.toMatch(/tailwind(css)?\/2\.0\.4|tailwind\.min\.css/);
    expect(p.html).not.toMatch(/icofont/);
    expect(p.html).not.toMatch(/\.ogv/);
  });

  it.each(pages.map((p) => [p.path, p]))("%s renders exact NAP in the footer", (_path, p) => {
    const footer = p.$("footer").text().replace(/\s+/g, " ");
    expect(footer).toContain(SITE.address.street);
    expect(footer).toContain(`${SITE.address.city}, ${SITE.address.region} ${SITE.address.postalCode}`);
    expect(footer).toContain(SITE.phone);
    expect(footer).toContain(SITE.email);
  });
});

describe("indexable pages", () => {
  it.each(indexable.map((p) => [p.path, p]))("%s has description, canonical, and Open Graph", (path, p) => {
    const { $ } = p;
    const desc = $('meta[name="description"]').attr("content") ?? "";
    expect(desc.length).toBeGreaterThanOrEqual(DESCRIPTION_MIN);
    expect(desc.length).toBeLessThanOrEqual(DESCRIPTION_MAX);

    const canonical = $('link[rel="canonical"]').attr("href");
    expect(canonical).toBe(new URL(path, SITE.url).href);

    expect($('meta[property="og:url"]').attr("content")).toBe(canonical);
    expect($('meta[property="og:title"]').attr("content")).toBeTruthy();
    expect($('meta[property="og:description"]').attr("content")).toBe(desc);
    expect($('meta[property="og:image"]').attr("content")).toMatch(/^https:\/\/weldcreations\.com\//);
    expect($('meta[name="twitter:card"]').attr("content")).toBe("summary_large_image");
    expect($('meta[name="robots"]').attr("content") ?? "").not.toMatch(/noindex/);
  });

  it("titles and descriptions are unique across pages", () => {
    const titles = indexable.map((p) => p.$("title").text());
    const descs = indexable.map((p) => p.$('meta[name="description"]').attr("content"));
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descs).size).toBe(descs.length);
  });
});

describe("homepage", () => {
  const home = pages.find((p) => p.path === "/")!;
  it("carries the ProfessionalService graph", () => {
    const graphs = home.$('script[type="application/ld+json"]').map((_, el) => JSON.parse(home.$(el).text())).get();
    const types = graphs.flatMap((g: any) => (g["@graph"] ?? [g]).map((n: any) => n["@type"]));
    expect(types).toContain("ProfessionalService");
    expect(types).toContain("WebSite");
  });
  it("keeps legacy anchor targets working", () => {
    for (const id of ["home", "services", "industries", "about", "contact"]) {
      expect(home.$(`#${id}`).length, `#${id}`).toBe(1);
    }
  });
  it("has the quote form wired to Web3Forms", () => {
    const form = home.$("form#rfq-form");
    expect(form.length).toBe(1);
    expect(form.find('input[name="access_key"]').attr("value")).toBe(SITE.web3formsKey);
    for (const name of ["name", "company", "email", "material", "quantity", "timeline", "message"]) {
      expect(form.find(`[name="${name}"]`).length, name).toBe(1);
    }
  });
});

describe("contact page", () => {
  const contact = pages.find((p) => p.path === "/contact/");
  it("has the quote form and full NAP", () => {
    expect(contact).toBeDefined();
    expect(contact!.$("form#rfq-form").length).toBe(1);
    const text = contact!.$("main").text().replace(/\s+/g, " ");
    expect(text).toContain(SITE.phone);
    expect(text).toContain(SITE.email);
    expect(text).toContain(SITE.address.street);
  });
  it("is linked from the header on every page", () => {
    for (const p of pages) expect(p.$('nav.navbar a[href="/contact/"]').length, p.path).toBeGreaterThan(0);
  });
});

describe("404 page", () => {
  const nf = pages.find(isNotFoundPage);
  it("exists and is noindex", () => {
    expect(nf).toBeDefined();
    expect(nf!.$('meta[name="robots"]').attr("content")).toMatch(/noindex/);
  });
});
