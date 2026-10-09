import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://weldcreations.com",
  trailingSlash: "always",
  // Astro self-hosts these and generates metric-matched fallbacks, so text
  // doesn't reflow when the real font arrives (that reflow caused CLS up to 0.2).
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Kanit",
      cssVariable: "--font-kanit",
      weights: [400, 600, 700],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Noto Sans Display",
      cssVariable: "--font-noto",
      weights: [400, 600, 700],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["sans-serif"],
    },
  ],
  // ~5 KB of CSS total: inlining beats two render-blocking requests.
  build: { format: "directory", inlineStylesheets: "always" },
  integrations: [sitemap({ filter: (page) => !page.includes("/404") })],
});
