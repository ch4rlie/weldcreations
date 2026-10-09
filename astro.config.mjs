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
      // "optional" + preload: the browser uses the real font when it arrives in
      // time and otherwise keeps the metric-matched fallback for that pageview,
      // so text never reflows. Preload alone still shifted (CLS 0.2) on a real
      // network, because a preload can lose the race with first paint.
      display: "optional",
    },
    {
      provider: fontProviders.fontsource(),
      name: "Noto Sans Display",
      cssVariable: "--font-noto",
      weights: [400, 600, 700],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["sans-serif"],
      // "optional" + preload: the browser uses the real font when it arrives in
      // time and otherwise keeps the metric-matched fallback for that pageview,
      // so text never reflows. Preload alone still shifted (CLS 0.2) on a real
      // network, because a preload can lose the race with first paint.
      display: "optional",
    },
  ],
  // ~5 KB of CSS total: inlining beats two render-blocking requests.
  build: { format: "directory", inlineStylesheets: "always" },
  integrations: [sitemap({ filter: (page) => !page.includes("/404") })],
});
