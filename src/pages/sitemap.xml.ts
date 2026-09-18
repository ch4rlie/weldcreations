import type { APIRoute } from "astro";
import { SITE } from "../config/site";

/**
 * @astrojs/sitemap writes /sitemap-index.xml, but /sitemap.xml is the URL people
 * and tools try first. Serve the same index here. The site test checks that both
 * list the same sitemaps, so this fails loudly if the integration ever splits
 * into more files.
 */
export const GET: APIRoute = () =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${SITE.url}/sitemap-0.xml</loc></sitemap></sitemapindex>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
