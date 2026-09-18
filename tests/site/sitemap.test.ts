import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DIST, loadPages, isNotFoundPage, resolveInDist } from "./helpers";
import { SITE } from "../../src/config/site";

const read = (f: string) => readFileSync(join(DIST, f), "utf8");
const locs = (xml: string) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

describe("sitemap + robots", () => {
  const index = read("sitemap-index.xml");
  const urls = locs(index).flatMap((u) => locs(read(new URL(u).pathname.slice(1))));

  it("lists every indexable page", () => {
    const expected = loadPages().filter((p) => !isNotFoundPage(p)).map((p) => new URL(p.path, SITE.url).href);
    expect([...urls].sort()).toEqual([...expected].sort());
  });

  it("lists only URLs that exist", () => {
    expect(urls.filter((u) => !resolveInDist(new URL(u).pathname))).toEqual([]);
  });

  it("serves /sitemap.xml as an index of the same sitemaps", () => {
    const conventional = read("sitemap.xml");
    expect(conventional).toContain("<sitemapindex");
    expect(locs(conventional)).toEqual(locs(index));
  });

  it("robots.txt allows crawling and points at the sitemap", () => {
    const robots = read("robots.txt");
    expect(robots).toMatch(/User-agent: \*/);
    expect(robots).not.toMatch(/Disallow: \/\s*$/m);
    expect(robots).toContain(`Sitemap: ${SITE.url}/sitemap-index.xml`);
  });
});
