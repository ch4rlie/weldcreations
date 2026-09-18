import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://weldcreations.com",
  trailingSlash: "always",
  // ~5 KB of CSS total: inlining beats two render-blocking requests.
  build: { format: "directory", inlineStylesheets: "always" },
  integrations: [sitemap({ filter: (page) => !page.includes("/404") })],
});
