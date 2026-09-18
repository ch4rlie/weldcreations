import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import * as cheerio from "cheerio";

export const DIST = join(process.cwd(), "dist");

export interface Page {
  file: string;
  /** URL path, e.g. "/" or "/materials/hastelloy-welding/" */
  path: string;
  html: string;
  $: cheerio.CheerioAPI;
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

export function fileToPath(file: string): string {
  const rel = relative(DIST, file).split(sep).join("/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  return `/${rel}`;
}

/** Resolve a site-relative URL path to a file in dist/, or null. */
export function resolveInDist(urlPath: string): string | null {
  const clean = decodeURI(urlPath.split("#")[0].split("?")[0]);
  const candidates = clean.endsWith("/")
    ? [join(DIST, clean, "index.html")]
    : [join(DIST, clean), join(DIST, clean, "index.html")];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile()) ?? null;
}

export function loadPages(): Page[] {
  if (!existsSync(DIST)) throw new Error("dist/ not found. Run `npm run build` first.");
  return walk(DIST)
    .filter((f) => f.endsWith(".html"))
    .map((file) => {
      const html = readFileSync(file, "utf8");
      return { file, path: fileToPath(file), html, $: cheerio.load(html) };
    });
}

export const isNotFoundPage = (p: Page) => p.path === "/404.html";

/** Visible text of the page body, scripts and styles removed. */
export function visibleText(p: Page): string {
  const $ = cheerio.load(p.html);
  $("script, style, noscript").remove();
  return $("body").text().replace(/\s+/g, " ");
}
