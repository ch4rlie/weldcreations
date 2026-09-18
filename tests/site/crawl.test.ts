import { describe, it, expect } from "vitest";
import { statSync } from "node:fs";
import { loadPages, resolveInDist } from "./helpers";

const pages = loadPages();
const MAX_IMAGE_BYTES = 400 * 1024;
const GENERIC_ALT = /^(image( \d+)?|service image|about us image|logo|photo|picture)$/i;

function localRefs(p: ReturnType<typeof loadPages>[number]) {
  const refs = new Set<string>();
  p.$("a[href], link[href]").each((_, el) => { refs.add(p.$(el).attr("href")!); });
  p.$("img[src], source[src], video[poster]").each((_, el) => {
    const $el = p.$(el);
    refs.add(($el.attr("src") ?? $el.attr("poster"))!);
  });
  p.$("img[srcset], source[srcset]").each((_, el) => {
    for (const part of p.$(el).attr("srcset")!.split(",")) refs.add(part.trim().split(/\s+/)[0]);
  });
  return [...refs].filter((r) => r.startsWith("/") && !r.startsWith("//"));
}

describe("crawl", () => {
  it.each(pages.map((p) => [p.path, p]))("%s has no broken internal links or assets", (_path, p) => {
    const broken = localRefs(p).filter((r) => !resolveInDist(r));
    expect(broken).toEqual([]);
  });

  it.each(pages.map((p) => [p.path, p]))("%s has meaningful alt text on every image", (_path, p) => {
    const bad: string[] = [];
    p.$("img").each((_, el) => {
      const alt = p.$(el).attr("alt");
      const decorative = alt === "" && p.$(el).attr("aria-hidden") === "true";
      if (alt === undefined || (!decorative && (alt.trim() === "" || GENERIC_ALT.test(alt.trim())))) {
        bad.push(p.$(el).attr("src") ?? "?");
      }
    });
    expect(bad).toEqual([]);
  });

  it.each(pages.map((p) => [p.path, p]))("%s references no image over 400 KB", (_path, p) => {
    const heavy = localRefs(p)
      .filter((r) => /\.(jpe?g|png|webp|avif|gif)$/i.test(r.split("?")[0]))
      .map((r) => ({ r, file: resolveInDist(r) }))
      .filter(({ file }) => file && statSync(file).size > MAX_IMAGE_BYTES)
      .map(({ r }) => r);
    expect(heavy).toEqual([]);
  });

  it.each(pages.map((p) => [p.path, p]))("%s opens external links safely", (_path, p) => {
    const unsafe: string[] = [];
    p.$('a[target="_blank"]').each((_, el) => {
      if (!/noopener/.test(p.$(el).attr("rel") ?? "")) unsafe.push(p.$(el).attr("href")!);
    });
    expect(unsafe).toEqual([]);
  });
});
