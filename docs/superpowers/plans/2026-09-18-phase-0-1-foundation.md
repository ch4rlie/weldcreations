# Weld Creations Phase 0–1: Measurement + Astro Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hand-written single `index.html` with an Astro 7 static site at content parity, with the complete SEO/measurement infrastructure the 16-page core spine will plug into, verified by an automated test suite that runs against the built HTML.

**Architecture:** Astro static output (`dist/`) deployed to Cloudflare. One config module (`src/config/site.ts`) is the single source of truth for NAP, domain, confirmed certifications and analytics IDs. Pure helpers (`src/lib/`) build titles, canonicals and JSON-LD and are unit-tested. A `BaseLayout` composes `Seo`, `Analytics`, `Header` and `Footer`, so every future page inherits the SEO layer by using the layout. A "site" test suite parses every HTML file in `dist/` and enforces the SEO rules, the lead-quality rules (spec §4a), and the capability-claim guardrail.

**Tech Stack:** Astro 7.3.3, @astrojs/sitemap 3.7.4, TypeScript 6, vitest 5.0.1, cheerio 1.2.0, @splidejs/splide 4.1.4, @fontsource/kanit + @fontsource-variable/noto-sans-display, Web3Forms (existing key), GA4 + Microsoft Clarity.

**Spec:** `docs/superpowers/specs/2026-09-18-seo-foundation-design.md`

**Scope:** spec Phase 0 (measurement + capability audit) and Phase 1 (technical foundation). Deferred to the Phase 3 plan, because no page needs them until then: `Service`, `BreadcrumbList` and `FAQPage` schema builders, and content collections. The site has no legacy paths besides `/`, so the only redirect concern is the legacy `#anchor` links. The homepage keeps those IDs, and a test checks them.

**Verified facts this plan depends on (checked 2026-09-18):**
- Node 24.15 / npm 11.12 locally; Astro 7 requires Node ≥22.12.
- Astro 7 API confirmed by a probe build: `src/content.config.ts`, `glob` from `astro/loaders`, `z` from `astro/zod`, `render()` from `astro:content`, `<Image>` from `astro:assets`, `trailingSlash: "always"` produces `/path/` canonicals, sitemap writes `sitemap-index.xml` + `sitemap-0.xml`.
- `@astrojs/check` peer-requires TypeScript `^5 || ^6`, so pin `typescript@6.0.3`.
- Production domain: `https://weldcreations.com` (apex serves 200; `www` 301s to apex).
- `ffmpeg` is installed locally. Chrome is **not**, so Lighthouse runs via the PageSpeed Insights API against the deployed preview.
- The homepage currently loads 4–6 MB JPEGs (`precision.jpeg`, `service.jpeg`, `production-service.jpeg`) and lists a 16 MB `.ogv` video source.

---

## File structure

```
astro.config.mjs              Astro config: site URL, trailing slash, sitemap
package.json                  scripts: dev/build/check/test:unit/test:site/verify
tsconfig.json                 extends astro/tsconfigs/strict
vitest.config.ts              test runner config
.node-version                 pins Node 24 for the Cloudflare build image
.gitignore                    node_modules, dist, .astro, .env

public/                       copied verbatim to dist/
  robots.txt  _headers  site.webmanifest  browserconfig.xml
  favicon*.png  favicon.ico  apple-touch-icon.png  android-chrome-*.png
  mstile-150x150.png  safari-pinned-tab.svg  icon.svg  logo.png
  videos/hero-video.mp4  videos/hero-video.webm   (recompressed)

src/
  env.d.ts                    Window.gtag / clarity typings, PUBLIC_GA4_ID
  config/site.ts              SINGLE SOURCE OF TRUTH: NAP, URLs, certs, analytics
  lib/seo.ts                  pageTitle(), canonicalUrl(), length limits
  lib/schema.ts               siteGraph(): ProfessionalService + WebSite JSON-LD
  data/gallery.ts             gallery filenames + descriptive alt text
  layouts/BaseLayout.astro    <html>, fonts, global CSS, Seo, Analytics, Header, Footer
  components/Seo.astro        title, description, canonical, OG/Twitter, JSON-LD
  components/Analytics.astro  Clarity always; GA4 only when PUBLIC_GA4_ID is set
  components/Header.astro     nav + accessible hamburger
  components/Footer.astro     NAP from config, service area, social links
  components/Gallery.astro    Splide carousel + lightbox, optimized images
  components/RfqForm.astro    qualifying quote form -> Web3Forms, fires generate_lead
  pages/index.astro           homepage at content parity
  pages/404.astro             noindex not-found page
  styles/global.css           ported from style.css, Tailwind removed
  assets/images/              all legacy images (only imported ones get emitted)
  assets/gallery/             18 original gallery photos

tests/
  unit/seo.test.ts            pageTitle, canonicalUrl
  unit/schema.test.ts         siteGraph shape, cert guardrail
  site/helpers.ts             list dist HTML pages, load cheerio, URL<->file mapping
  site/pages.test.ts          per-page SEO rules
  site/crawl.test.ts          internal links/images resolve, image weight budget
  site/policy.test.ts         capability-claim guardrail + lead-quality phrases
  site/sitemap.test.ts        sitemap <-> pages, robots.txt

docs/seo/capability-audit.md      questionnaire for Mark (truth source for claims)
docs/seo/measurement-setup.md     owner steps: GA4, GSC, Bing, Cloudflare env var
docs/seo/deploy.md                Cloudflare build settings + cutover checklist
docs/technical-review-queue.md    technical assertions awaiting Mark's review
```

**Deleted** (preserved in git history): root `index.html`, `style.css`, `scripts.js`, `icofont.css`, `icofont.min.css`, `fonts/`, `processImages.js`, `images/slider/thumbnails/`, `images/slider/resized/`, `videos/hero-video.ogv`. Everything else under `images/` moves to `src/assets/`.

---

### Task 1: Scaffold Astro and tooling

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.node-version`, `.gitignore`, `src/env.d.ts`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "weldcreations",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test:unit": "vitest run tests/unit",
    "test:site": "vitest run tests/site",
    "verify": "astro check && vitest run tests/unit && astro build && vitest run tests/site"
  }
}
```

- [ ] **Step 2: Install pinned dependencies**

```bash
npm i astro@7.3.3 @astrojs/sitemap@3.7.4 @splidejs/splide@4.1.4 @fontsource/kanit@5.3.0 @fontsource-variable/noto-sans-display@5.3.0
npm i -D @astrojs/check@0.9.10 typescript@6.0.3 vitest@5.0.1 cheerio@1.2.0
```
Expected: installs with no peer-dependency errors.

- [ ] **Step 3: Write config files**

`astro.config.mjs`:
```js
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://weldcreations.com",
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [sitemap({ filter: (page) => !page.includes("/404") })],
});
```

`tsconfig.json`:
```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"]
}
```

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { include: ["tests/**/*.test.ts"] },
});
```

`.node-version`:
```
24
```

`.gitignore`:
```
node_modules/
dist/
.astro/
.env
.env.*
```

`src/env.d.ts`:
```ts
interface ImportMetaEnv {
  readonly PUBLIC_GA4_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  dataLayer: unknown[];
  gtag?: (...args: unknown[]) => void;
  clarity?: (...args: unknown[]) => void;
}
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json vitest.config.ts .node-version .gitignore src/env.d.ts
git commit -m "Scaffold Astro 7 + vitest tooling"
```

---

### Task 2: Site config (single source of truth)

**Files:**
- Create: `src/config/site.ts`

- [ ] **Step 1: Write `src/config/site.ts`**

The NAP strings are copied character-for-character from the current site. `certifications` holds **only confirmed** credentials. Adding one requires Mark's confirmation via `docs/seo/capability-audit.md`.

```ts
export const SITE = {
  name: "Weld Creations",
  url: "https://weldcreations.com",
  owner: "Mark May",
  phone: "(626) 675-4239",
  phoneE164: "+16266754239",
  email: "weldcreations@yahoo.com",
  address: {
    street: "2041 E Gladstone Unit Q",
    city: "Glendora",
    region: "CA",
    postalCode: "91741",
    country: "US",
  },
  areaServed: ["Los Angeles County", "Orange County", "San Bernardino County"],
  sameAs: [
    "https://www.yelp.com/biz/weld-creations-glendora",
    "https://www.linkedin.com/in/mark-may-3bab7735/",
  ],
  /** Confirmed credentials ONLY. Guarded by tests/site/policy.test.ts. */
  certifications: ["AWS D17.1"] as string[],
  analytics: {
    clarityId: "n18eppb8di",
    ga4Id: import.meta.env.PUBLIC_GA4_ID ?? "",
  },
  web3formsKey: "4023322a-c3d7-49be-bfd3-e3b1a76b24ae",
} as const;

export const FULL_ADDRESS = `${SITE.address.street} ${SITE.address.city}, ${SITE.address.region} ${SITE.address.postalCode}`;

/** Credential names that must never be claimed unless present in SITE.certifications. */
export const GUARDED_CREDENTIALS = [
  "AWS D17.1",
  "AWS D1.1",
  "AWS D1.2",
  "AWS D1.6",
  "AWS D18.1",
  "AS9100",
  "ISO 9001",
  "ITAR",
  "NADCAP",
  "ASME",
  "CWI",
  "3-A",
];
```

- [ ] **Step 2: Commit**

```bash
git add src/config/site.ts
git commit -m "Add site config as single source of truth for NAP and credentials"
```

---

### Task 3: SEO helpers (TDD)

**Files:**
- Create: `tests/unit/seo.test.ts`, `src/lib/seo.ts`

- [ ] **Step 1: Write the failing test**

`tests/unit/seo.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { pageTitle, canonicalUrl, TITLE_MAX } from "../../src/lib/seo";

describe("pageTitle", () => {
  it("appends the brand when it fits", () => {
    expect(pageTitle("Hastelloy Welding Services")).toBe("Hastelloy Welding Services | Weld Creations");
  });
  it("leaves titles that already contain the brand untouched", () => {
    const t = "Weld Creations | Precision TIG Welding, Glendora CA";
    expect(pageTitle(t)).toBe(t);
  });
  it("drops the brand rather than exceed the limit", () => {
    const long = "Sanitary Stainless Steel Welding for Food Processing Plants";
    expect(pageTitle(long)).toBe(long);
    expect(pageTitle(long).length).toBeLessThanOrEqual(TITLE_MAX);
  });
});

describe("canonicalUrl", () => {
  it("builds absolute URLs with a trailing slash", () => {
    expect(canonicalUrl("/materials/hastelloy-welding")).toBe("https://weldcreations.com/materials/hastelloy-welding/");
    expect(canonicalUrl("/materials/hastelloy-welding/")).toBe("https://weldcreations.com/materials/hastelloy-welding/");
  });
  it("handles the root", () => {
    expect(canonicalUrl("/")).toBe("https://weldcreations.com/");
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run tests/unit/seo.test.ts`
Expected: FAIL, cannot resolve `../../src/lib/seo`.

- [ ] **Step 3: Implement `src/lib/seo.ts`**

```ts
import { SITE } from "../config/site";

export const TITLE_MAX = 60;
export const DESCRIPTION_MIN = 70;
export const DESCRIPTION_MAX = 155;

export function pageTitle(title: string): string {
  if (title.includes(SITE.name)) return title;
  const branded = `${title} | ${SITE.name}`;
  return branded.length <= TITLE_MAX ? branded : title;
}

export function canonicalUrl(pathname: string): string {
  const withSlash = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return new URL(withSlash, SITE.url).href;
}
```

- [ ] **Step 4: Run and confirm it passes**

Run: `npx vitest run tests/unit/seo.test.ts`
Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/seo.ts tests/unit/seo.test.ts
git commit -m "Add title and canonical helpers with tests"
```

---

### Task 4: JSON-LD schema builder (TDD)

**Files:**
- Create: `tests/unit/schema.test.ts`, `src/lib/schema.ts`

AWS D17.1 is a welder qualification held by a person, so credentials are attached to the founder `Person`, not the business.

- [ ] **Step 1: Write the failing test**

`tests/unit/schema.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { siteGraph, BUSINESS_ID } from "../../src/lib/schema";
import { SITE } from "../../src/config/site";

type Node = Record<string, any>;
const graph = siteGraph();
const nodes = graph["@graph"] as Node[];
const business = nodes.find((n) => n["@type"] === "ProfessionalService")!;
const website = nodes.find((n) => n["@type"] === "WebSite")!;

describe("siteGraph", () => {
  it("uses the schema.org context", () => {
    expect(graph["@context"]).toBe("https://schema.org");
  });
  it("describes the business with exact NAP from config", () => {
    expect(business["@id"]).toBe(BUSINESS_ID);
    expect(business.name).toBe(SITE.name);
    expect(business.telephone).toBe(SITE.phoneE164);
    expect(business.address).toMatchObject({
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    });
    expect(business.sameAs).toEqual(SITE.sameAs);
  });
  it("lists only confirmed credentials, on the founder", () => {
    const creds = business.founder.hasCredential.map((c: Node) => c.name);
    expect(creds).toEqual(SITE.certifications);
  });
  it("links the website to the business", () => {
    expect(website.publisher).toEqual({ "@id": BUSINESS_ID });
    expect(website.url).toBe("https://weldcreations.com/");
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run tests/unit/schema.test.ts`
Expected: FAIL, cannot resolve `../../src/lib/schema`.

- [ ] **Step 3: Implement `src/lib/schema.ts`**

```ts
import { SITE } from "../config/site";

export const BUSINESS_ID = `${SITE.url}/#business`;
export const WEBSITE_ID = `${SITE.url}/#website`;

export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": BUSINESS_ID,
        name: SITE.name,
        url: `${SITE.url}/`,
        logo: `${SITE.url}/logo.png`,
        image: `${SITE.url}/logo.png`,
        telephone: SITE.phoneE164,
        email: SITE.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: SITE.address.street,
          addressLocality: SITE.address.city,
          addressRegion: SITE.address.region,
          postalCode: SITE.address.postalCode,
          addressCountry: SITE.address.country,
        },
        areaServed: SITE.areaServed.map((name) => ({ "@type": "AdministrativeArea", name })),
        founder: {
          "@type": "Person",
          name: SITE.owner,
          jobTitle: "Owner & Master Welder",
          hasCredential: SITE.certifications.map((name) => ({
            "@type": "EducationalOccupationalCredential",
            name,
          })),
        },
        sameAs: SITE.sameAs,
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: `${SITE.url}/`,
        name: SITE.name,
        publisher: { "@id": BUSINESS_ID },
      },
    ],
  };
}
```

- [ ] **Step 4: Run and confirm it passes**

Run: `npx vitest run tests/unit`
Expected: all unit tests pass (9).

- [ ] **Step 5: Commit**

```bash
git add src/lib/schema.ts tests/unit/schema.test.ts
git commit -m "Add sitewide ProfessionalService + WebSite JSON-LD graph with tests"
```

---

### Task 5: Site test suite against `dist/` (written first, fails until the site exists)

**Files:**
- Create: `tests/site/helpers.ts`, `tests/site/pages.test.ts`, `tests/site/crawl.test.ts`, `tests/site/policy.test.ts`, `tests/site/sitemap.test.ts`

- [ ] **Step 1: Write `tests/site/helpers.ts`**

```ts
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
```

- [ ] **Step 2: Write `tests/site/pages.test.ts`**

```ts
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

describe("404 page", () => {
  const nf = pages.find(isNotFoundPage);
  it("exists and is noindex", () => {
    expect(nf).toBeDefined();
    expect(nf!.$('meta[name="robots"]').attr("content")).toMatch(/noindex/);
  });
});
```

- [ ] **Step 3: Write `tests/site/crawl.test.ts`**

```ts
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
```

- [ ] **Step 4: Write `tests/site/policy.test.ts`**

This enforces two owner decisions: no unconfirmed credential claims, and no language that invites hobby/small-repair leads (spec §4a). Mentioning a *standard* ("welded to ASME BPE") is allowed; *claiming* a credential ("ASME certified") is not.

```ts
import { describe, it, expect } from "vitest";
import { loadPages, visibleText } from "./helpers";
import { SITE, GUARDED_CREDENTIALS } from "../../src/config/site";

const pages = loadPages();
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const unconfirmed = GUARDED_CREDENTIALS.filter((c) => !SITE.certifications.includes(c));
const CLAIM = "(certified|certification|registered|accredited|approved|qualified)";

export function credentialClaims(text: string): string[] {
  return unconfirmed.flatMap((cred) => {
    const c = escape(cred);
    const patterns = [
      new RegExp(`\\b${c}\\b[\\w\\s-]{0,20}?\\b${CLAIM}\\b`, "gi"),
      new RegExp(`\\b${CLAIM}\\b[\\w\\s-]{0,20}?\\b${c}\\b`, "gi"),
    ];
    return patterns.flatMap((re) => text.match(re) ?? []);
  });
}

const LOW_VALUE_PHRASES = [
  /no job (is )?too small/i,
  /\bcheap(est)?\b/i,
  /mobile weld(ing|er)/i,
  /welding (classes|lessons)/i,
  /\btire carrier\b/i,
  /\btrailer hitch\b/i,
];

describe("capability-claim guardrail", () => {
  it("detects claims but allows standards references", () => {
    expect(credentialClaims("We are AS9100 certified.")).not.toEqual([]);
    expect(credentialClaims("Certified to ISO 9001 standards.")).not.toEqual([]);
    expect(credentialClaims("Welds inspected against ASME BPE requirements.")).toEqual([]);
    expect(credentialClaims("AWS D17.1 Certified")).toEqual([]);
  });

  it.each(pages.map((p) => [p.path, p]))("%s claims no unconfirmed credentials", (_path, p) => {
    expect(credentialClaims(visibleText(p))).toEqual([]);
  });
});

describe("lead-quality language (spec §4a)", () => {
  it.each(pages.map((p) => [p.path, p]))("%s avoids low-value lead phrasing", (_path, p) => {
    const text = visibleText(p);
    expect(LOW_VALUE_PHRASES.filter((re) => re.test(text)).map(String)).toEqual([]);
  });
});
```

- [ ] **Step 5: Write `tests/site/sitemap.test.ts`**

```ts
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

  it("robots.txt allows crawling and points at the sitemap", () => {
    const robots = read("robots.txt");
    expect(robots).toMatch(/User-agent: \*/);
    expect(robots).not.toMatch(/Disallow: \/\s*$/m);
    expect(robots).toContain(`Sitemap: ${SITE.url}/sitemap-index.xml`);
  });
});
```

- [ ] **Step 6: Run and confirm the suite fails for the right reason**

Run: `npx vitest run tests/site`
Expected: FAIL with `dist/ not found. Run \`npm run build\` first.`

- [ ] **Step 7: Commit**

```bash
git add tests/site
git commit -m "Add site verification suite: SEO, crawl, policy, sitemap"
```

---

### Task 6: Move assets and public files

**Files:**
- Move: `images/*` → `src/assets/images/`, `images/slider/*.jpg` → `src/assets/gallery/`
- Move: favicons, manifest, `browserconfig.xml`, `safari-pinned-tab.svg`, `icon.svg`, `logo.png` → `public/`
- Create: `public/robots.txt`, `public/_headers`
- Modify: `public/site.webmanifest`
- Delete: see "Deleted" list above

- [ ] **Step 1: Move files with git so history is preserved**

```bash
mkdir -p public/videos src/assets/images src/assets/gallery
git mv images/slider/*.jpg src/assets/gallery/
git rm -r -q images/slider/thumbnails images/slider/resized
git mv images/* src/assets/images/
git mv favicon.ico favicon-16x16.png favicon-32x32.png apple-touch-icon.png android-chrome-192x192.png android-chrome-512x512.png mstile-150x150.png safari-pinned-tab.svg icon.svg site.webmanifest browserconfig.xml logo.png public/
git mv shape.png spark.png src/assets/images/
git mv videos/hero-video.mp4 videos/hero-video.webm public/videos/
git rm -q videos/hero-video.ogv processImages.js icofont.css icofont.min.css
git rm -r -q fonts
ls images videos 2>&1
```
Expected: `images` and `videos` no longer exist. (`index.html`, `style.css` and `scripts.js` stay until Task 13, since they are the reference for the port.)

- [ ] **Step 2: Recompress the hero video**

The hero is a muted background loop, so drop audio, cap it at 1280px wide, and use `faststart` so it starts playing before the download finishes.

```bash
cd public/videos
ffmpeg -y -loglevel error -i hero-video.mp4 -an -vf "scale='min(1280,iw)':-2" -c:v libx264 -crf 28 -preset slow -movflags +faststart hero-video.tmp.mp4 && mv hero-video.tmp.mp4 hero-video.mp4
ffmpeg -y -loglevel error -i hero-video.mp4 -an -c:v libvpx-vp9 -crf 38 -b:v 0 -row-mt 1 hero-video.tmp.webm && mv hero-video.tmp.webm hero-video.webm
ls -la && cd ../..
```
Expected: `hero-video.mp4` well under the original 2.5 MB, and `hero-video.webm` well under 4.4 MB. Before committing, open both files and check them visually for quality.

- [ ] **Step 3: Write `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://weldcreations.com/sitemap-index.xml
```

- [ ] **Step 4: Write `public/_headers`**

```
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/videos/*
  Cache-Control: public, max-age=2592000
```

- [ ] **Step 5: Fix `public/site.webmanifest`** (name fields are currently empty)

```json
{
  "name": "Weld Creations",
  "short_name": "Weld Creations",
  "icons": [
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#000000",
  "background_color": "#000000",
  "display": "standalone"
}
```

- [ ] **Step 6: Commit**

```bash
git add -A public src/assets
git commit -m "Move assets into Astro layout, recompress hero video, add robots and headers"
```

---

### Task 7: Global styles (port style.css, remove Tailwind)

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Create `src/styles/global.css`**

Copy `style.css` verbatim, then apply these edits:
1. `body` font-family becomes `"Noto Sans Display Variable", "Noto Sans Display", system-ui, sans-serif`.
2. Every `font-family: "Kanit", sans-serif;` stays as is. `@fontsource/kanit` registers the family name `Kanit`.
3. `.hamburger` becomes a `<button>`, so add `background: none; border: 0; padding: 0;` to the `.hamburger` rule. The bars become `<span>`s, so add `display: block;` to `.hamburger .bar` (inline spans ignore width and height, which would make the icon invisible).
4. The logo link needs `display:block` inside `.logo-container`. Add `.logo-container a { display: block; line-height: 0; }`.
5. Append the replacement for the ~40 Tailwind utilities the old form used, plus the gallery button and focus styles:

```css
/** RFQ FORM (replaces Tailwind utilities) **/
.rfq {
  flex: 1;
  max-width: 640px;
  background: #fff;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.rfq h3 {
  font-family: "Kanit", sans-serif;
  font-size: 24px;
  margin-bottom: 8px;
}
.rfq-intro {
  color: #555;
  font-size: 15px;
  margin-bottom: 24px;
}
.rfq-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 20px;
}
.rfq-field {
  display: flex;
  flex-direction: column;
}
.rfq-field.full {
  grid-column: 1 / -1;
}
.rfq-field label {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 6px;
}
.rfq-field input,
.rfq-field select,
.rfq-field textarea {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font: inherit;
  font-size: 16px;
  background: #fff;
}
.rfq-field input:focus,
.rfq-field select:focus,
.rfq-field textarea:focus {
  outline: none;
  border-color: #1b75bb;
  box-shadow: 0 0 0 3px rgba(27, 117, 187, 0.15);
}
.rfq-field .hint {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}
.rfq-field .invalid-feedback,
.rfq-field .empty-feedback {
  color: #dc2626;
  font-size: 13px;
  margin-top: 4px;
}
.rfq button[type="submit"] {
  width: 100%;
  margin-top: 24px;
  padding: 16px;
  font-size: 18px;
  font-weight: 600;
  background-color: #1b75bb;
  border-radius: 6px;
}
.rfq button[type="submit"]:hover {
  background-color: #094c80;
}
.rfq-result {
  text-align: center;
  margin-top: 16px;
  min-height: 1.5em;
}
.rfq-result.ok {
  color: #15803d;
}
.rfq-result.err {
  color: #dc2626;
}
@media (max-width: 640px) {
  .rfq {
    padding: 20px;
  }
  .rfq-grid {
    grid-template-columns: 1fr;
  }
}

/** Gallery thumbnails are buttons for keyboard access **/
.gallery-thumb {
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  display: block;
}

/** Visible keyboard focus **/
a:focus-visible,
button:focus-visible {
  outline: 3px solid #f0a500;
  outline-offset: 2px;
}
```

6. The hero CTA was styled by Tailwind `px-3 py-4 ...` classes plus `.hero-content a`. `.hero-content a` already defines the button, so no Tailwind replacement is needed. Add `display: inline-block;` to `.hero-content a`.

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "Port stylesheet to Astro and replace Tailwind utilities"
```

---

### Task 8: Seo, Analytics and BaseLayout

**Files:**
- Create: `src/components/Seo.astro`, `src/components/Analytics.astro`, `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Write `src/components/Seo.astro`**

```astro
---
import { getImage } from "astro:assets";
import { SITE } from "../config/site";
import { pageTitle, canonicalUrl } from "../lib/seo";
import defaultOg from "../assets/images/hero-video-thumbnail.jpg";

interface Props {
  title: string;
  description: string;
  noindex?: boolean;
  ogImage?: ImageMetadata;
  jsonLd?: Record<string, unknown>[];
}

const { title, description, noindex = false, ogImage = defaultOg, jsonLd = [] } = Astro.props;
const fullTitle = pageTitle(title);
const canonical = canonicalUrl(Astro.url.pathname);
const og = await getImage({ src: ogImage, width: 1200, height: 630, fit: "cover", format: "jpg" });
const ogUrl = new URL(og.src, SITE.url).href;
const toJson = (o: unknown) => JSON.stringify(o).replace(/</g, "\\u003c");
---
<title>{fullTitle}</title>
<meta name="description" content={description} />
{noindex ? <meta name="robots" content="noindex, follow" /> : <link rel="canonical" href={canonical} />}
<meta property="og:type" content="website" />
<meta property="og:site_name" content={SITE.name} />
<meta property="og:title" content={fullTitle} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={ogUrl} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
{jsonLd.map((obj) => <script is:inline type="application/ld+json" set:html={toJson(obj)} />)}
```

- [ ] **Step 2: Write `src/components/Analytics.astro`**

Clarity keeps its current project ID. GA4 renders only when `PUBLIC_GA4_ID` is set at build time, so the site builds and tests cleanly before the owner creates the property.

```astro
---
import { SITE } from "../config/site";
const { clarityId, ga4Id } = SITE.analytics;
---
<script is:inline define:vars={{ clarityId }}>
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", clarityId);
</script>
{ga4Id && <script is:inline async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}></script>}
{ga4Id && (
  <script is:inline define:vars={{ ga4Id }}>
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", ga4Id);
  </script>
)}
```

- [ ] **Step 3: Write `src/layouts/BaseLayout.astro`**

```astro
---
import "@fontsource/kanit/400.css";
import "@fontsource/kanit/600.css";
import "@fontsource/kanit/700.css";
import "@fontsource-variable/noto-sans-display";
import "../styles/global.css";
import Seo from "../components/Seo.astro";
import Analytics from "../components/Analytics.astro";
import Header from "../components/Header.astro";
import Footer from "../components/Footer.astro";

interface Props {
  title: string;
  description: string;
  noindex?: boolean;
  ogImage?: ImageMetadata;
  jsonLd?: Record<string, unknown>[];
}
const props = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <Seo {...props} />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
    <meta name="msapplication-TileColor" content="#2b5797" />
    <meta name="theme-color" content="#000000" />
    <Analytics />
  </head>
  <body>
    <Header />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 4: Commit** (the build still needs Header and Footer, which come in Task 9)

```bash
git add src/components/Seo.astro src/components/Analytics.astro src/layouts/BaseLayout.astro
git commit -m "Add Seo, Analytics and BaseLayout"
```

---

### Task 9: Header and Footer

**Files:**
- Create: `src/components/Header.astro`, `src/components/Footer.astro`

- [ ] **Step 1: Write `src/components/Header.astro`**

Nav links use `/#section` so they work from any page, including 404. Phase 3 changes these to real URLs as the spine pages ship.

```astro
---
import { Image } from "astro:assets";
import logo from "../assets/images/logo.svg";
import { SITE } from "../config/site";
---
<nav class="navbar" aria-label="Main">
  <ul class="nav-links left" id="nav-left">
    <li><a href="/#services">Services</a></li>
    <li><a href="/#industries">Industries</a></li>
  </ul>
  <div class="logo-container">
    <a href="/" aria-label={`${SITE.name} home`}>
      <Image src={logo} alt={`${SITE.name} logo`} class="logo" loading="eager" />
    </a>
  </div>
  <ul class="nav-links right" id="nav-right">
    <li><a href="/#about">About Us</a></li>
    <li><a href="/#contact">Request a Quote</a></li>
  </ul>
  <button class="hamburger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav-left nav-right">
    <span class="bar"></span>
    <span class="bar"></span>
    <span class="bar"></span>
  </button>
</nav>

<script>
  const button = document.querySelector<HTMLButtonElement>(".hamburger")!;
  const lists = document.querySelectorAll(".nav-links");
  const setOpen = (open: boolean) => {
    lists.forEach((l) => l.classList.toggle("active", open));
    button.classList.toggle("active", open);
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  button.addEventListener("click", () => setOpen(button.getAttribute("aria-expanded") !== "true"));
  lists.forEach((l) => l.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest("a")) setOpen(false);
  }));
</script>
```

- [ ] **Step 2: Write `src/components/Footer.astro`**

The Yelp and LinkedIn icon-font glyphs become inline SVGs with accessible labels, which removes the icofont stylesheet and font files.

```astro
---
import { SITE } from "../config/site";
const year = new Date().getFullYear();
---
<footer class="footer">
  <div class="container">
    <div class="footer-columns">
      <div class="footer-column">
        <h2 class="footer-heading">Contact Us</h2>
        <address style="font-style: normal">
          <p>{SITE.name}</p>
          <p>{SITE.address.street}<br />{SITE.address.city}, {SITE.address.region} {SITE.address.postalCode}</p>
          <p>Phone: <a href={`tel:${SITE.phoneE164}`}>{SITE.phone}</a></p>
          <p>Email: <a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
        </address>
        <p><br />Serving {SITE.areaServed.join(", ").replace(/, ([^,]*)$/, " & $1")} & more.</p>
        {SITE.certifications.map((c) => <p>{c} Certified</p>)}
      </div>
      <div class="footer-column">
        <h2 class="footer-heading">Quick Links</h2>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/#services">Services</a></li>
          <li><a href="/#industries">Industries</a></li>
          <li><a href="/#about">About</a></li>
          <li><a href="/#contact">Request a Quote</a></li>
        </ul>
      </div>
      <div class="footer-column">
        <h2 class="footer-heading">Follow Us</h2>
        <ul class="social-media">
          <li>
            <a href={SITE.sameAs[0]} target="_blank" rel="noopener" aria-label="Weld Creations on Yelp">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.3 16.4l-1.5 4.5c-.3.8-1.3 1-1.9.4l-2.2-2.4c-.6-.6-.3-1.6.5-1.9l4.1-1.7c.7-.3 1.3.4 1 1.1zm.9-3.4l4.6 1.3c.8.2 1.1 1.2.5 1.8l-2.3 2.3c-.6.6-1.6.4-1.9-.4l-1.6-3.9c-.3-.7.3-1.3.7-1.1zm-1.6-1.7L5.8 9.9c-.8-.2-1.1-1.2-.5-1.8l1.8-2c.6-.6 1.6-.4 1.9.4l2.2 4c.4.6-.2 1.2-.6.8zm1.4-2.1V2.6c0-.9.9-1.5 1.7-1.1l3.2 1.5c.8.4.9 1.4.3 2l-4 4.7c-.5.6-1.2.3-1.2-.4zm1.1 3.1l4.4-1.7c.8-.3 1.6.3 1.6 1.1l-.1 3.3c0 .9-1 1.4-1.7 1l-4.2-2.3c-.6-.4-.6-1.2 0-1.4z" /></svg>
            </a>
          </li>
          <li>
            <a href={SITE.sameAs[1]} target="_blank" rel="noopener" aria-label="Mark May on LinkedIn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" /></svg>
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>
        &copy; {year} {SITE.name}. All rights reserved.
        <a style="color: #fff; text-decoration: underline" target="_blank" rel="noopener" href="https://grovefactor.com">Created by GroveFactor</a>
      </p>
    </div>
  </div>
</footer>
```

The old footer used `<h3>` directly under the page, which skips heading levels. Style the new `.footer-heading` like the old `.footer-column h3` by appending to `global.css`:
```css
.footer-heading {
  font-size: 20px;
  margin-bottom: 10px;
  font-family: "Kanit", sans-serif;
}
.footer-column address a {
  color: white;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.astro src/components/Footer.astro src/styles/global.css
git commit -m "Add accessible header and config-driven footer"
```

---

### Task 10: Gallery with descriptive alt text

**Files:**
- Create: `src/data/gallery.ts`, `src/components/Gallery.astro`

- [ ] **Step 1: Write the alt text from the actual photos**

Open each of the 18 files in `src/assets/gallery/` with the Read tool and write one factual alt string per photo. Describe what is visible: the part, the weld type, the material appearance, the setting. **Name an alloy only if the photo makes it unambiguous.** Otherwise say "stainless", "aluminum" or "metal" by appearance. Never write "Image N". Save as `src/data/gallery.ts`, with this exact shape, in numeric file order 1–18:

```ts
export interface GalleryItem {
  file: string;
  alt: string;
}

export const GALLERY: GalleryItem[] = [
  { file: "1.jpg", alt: "<factual description of photo 1>" },
  // ...one entry per photo, 1.jpg through 18.jpg
];
```

Any alt text that names a specific alloy or weld spec also goes into `docs/technical-review-queue.md` (Task 14) so Mark can confirm it.

- [ ] **Step 2: Write `src/components/Gallery.astro`**

Thumbnails are 300px tall and the lightbox gets 2000px WebP. Both are generated by Astro, which replaces `processImages.js` and the committed `thumbnails/` and `resized/` folders.

```astro
---
import { getImage } from "astro:assets";
import "@splidejs/splide/css";
import { GALLERY } from "../data/gallery";

const files = import.meta.glob<{ default: ImageMetadata }>("../assets/gallery/*.jpg", { eager: true });
const items = await Promise.all(
  GALLERY.map(async ({ file, alt }) => {
    const mod = files[`../assets/gallery/${file}`];
    if (!mod) throw new Error(`Gallery image missing: ${file}`);
    const src = mod.default;
    const thumb = await getImage({ src, height: 300, format: "webp" });
    const full = await getImage({ src, width: Math.min(2000, src.width), format: "webp" });
    return { alt, thumb, full };
  }),
);
---
<section class="splide" aria-label="Recent welding and fabrication work">
  <div class="splide__track">
    <ul class="splide__list">
      {items.map(({ alt, thumb, full }, i) => (
        <li class="splide__slide">
          <button class="gallery-thumb" type="button" data-index={i} data-full={full.src} aria-label={`Enlarge: ${alt}`}>
            <img src={thumb.src} alt={alt} width={thumb.attributes.width} height={thumb.attributes.height} loading="lazy" decoding="async" />
          </button>
        </li>
      ))}
    </ul>
  </div>
</section>

<div id="gallery-modal" class="modal" role="dialog" aria-modal="true" aria-label="Enlarged photo">
  <button class="close" type="button" aria-label="Close">&times;</button>
  <button class="arrow arrow-left" type="button" aria-label="Previous photo">&#10094;</button>
  <div class="modal-content"></div>
  <button class="arrow arrow-right" type="button" aria-label="Next photo">&#10095;</button>
</div>

<script>
  import Splide from "@splidejs/splide";

  new Splide(".splide", { type: "loop", height: "300px", autoWidth: true }).mount();

  const modal = document.getElementById("gallery-modal")!;
  // Created on demand so the static HTML has no empty <img>.
  const modalImg = document.createElement("img");
  modal.querySelector(".modal-content")!.append(modalImg);
  // Splide's loop mode clones slides, so read the originals by index.
  const originals = Array.from(document.querySelectorAll<HTMLButtonElement>(".splide__slide:not(.splide__slide--clone) .gallery-thumb"));
  let current = 0;
  let opener: HTMLElement | null = null;

  const show = (i: number) => {
    current = (i + originals.length) % originals.length;
    const btn = originals[current];
    modalImg.src = btn.dataset.full!;
    modalImg.alt = btn.querySelector("img")!.alt;
    modal.style.display = "flex";
    document.body.classList.add("modal-open");
  };
  const close = () => {
    modal.style.display = "none";
    document.body.classList.remove("modal-open");
    opener?.focus();
  };

  document.querySelectorAll<HTMLButtonElement>(".gallery-thumb").forEach((btn) =>
    btn.addEventListener("click", () => {
      opener = btn;
      show(Number(btn.dataset.index));
      modal.querySelector<HTMLButtonElement>(".close")!.focus();
    }),
  );
  modal.querySelector(".close")!.addEventListener("click", close);
  modal.querySelector(".arrow-left")!.addEventListener("click", () => show(current - 1));
  modal.querySelector(".arrow-right")!.addEventListener("click", () => show(current + 1));
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  document.addEventListener("keydown", (e) => {
    if (modal.style.display !== "flex") return;
    if (e.key === "ArrowLeft") show(current - 1);
    else if (e.key === "ArrowRight") show(current + 1);
    else if (e.key === "Escape") close();
  });
</script>
```

- [ ] **Step 3: Commit**

```bash
git add src/data/gallery.ts src/components/Gallery.astro
git commit -m "Add optimized gallery with descriptive alt text and accessible lightbox"
```

---

### Task 11: Qualifying RFQ form with conversion tracking

**Files:**
- Create: `src/components/RfqForm.astro`

Web3Forms' free tier does not accept file uploads, so drawings are requested as a share link. The `landing_page` field reaches Mark's inbox along with the form, so every lead email shows which page brought the buyer in.

- [ ] **Step 1: Write `src/components/RfqForm.astro`**

```astro
---
import { SITE } from "../config/site";

const materials = ["Stainless steel", "Aluminum", "Carbon / mild steel", "Titanium", "Hastelloy", "Inconel", "Other / multiple alloys"];
const quantities = ["Prototype (1–10 pcs)", "Short run (11–100 pcs)", "Production (100–1,000 pcs)", "High volume (1,000+ pcs)", "Recurring / annual contract"];
const timelines = ["Under 2 weeks", "2–6 weeks", "6+ weeks", "Budgetary quote / planning"];
---
<div class="rfq">
  <h3>Request a Quote</h3>
  <p class="rfq-intro">
    We build production runs, precision weldments and custom fabrications for manufacturers. Include drawings, material and quantity for the fastest quote.
  </p>
  <form id="rfq-form" action="https://api.web3forms.com/submit" method="POST" class="needs-validation" novalidate>
    <input type="hidden" name="access_key" value={SITE.web3formsKey} />
    <input type="hidden" name="subject" value="Weld Creations Quote Request" />
    <input type="hidden" name="from_name" value="weldcreations.com" />
    <input type="hidden" name="landing_page" value="" />
    <input type="hidden" name="page" value="" />
    <input type="checkbox" name="botcheck" class="hidden" style="display: none" tabindex="-1" autocomplete="off" />

    <div class="rfq-grid">
      <div class="rfq-field">
        <label for="rfq-name">Name</label>
        <input id="rfq-name" name="name" type="text" autocomplete="name" required />
        <div class="empty-feedback">Please provide your name.</div>
      </div>
      <div class="rfq-field">
        <label for="rfq-company">Company</label>
        <input id="rfq-company" name="company" type="text" autocomplete="organization" required />
        <div class="empty-feedback">Please provide your company name.</div>
      </div>
      <div class="rfq-field">
        <label for="rfq-email">Work email</label>
        <input id="rfq-email" name="email" type="email" autocomplete="email" required />
        <div class="empty-feedback">Please provide your email address.</div>
        <div class="invalid-feedback">Please provide a valid email address.</div>
      </div>
      <div class="rfq-field">
        <label for="rfq-phone">Phone</label>
        <input id="rfq-phone" name="phone" type="tel" autocomplete="tel" />
      </div>
      <div class="rfq-field">
        <label for="rfq-material">Primary material</label>
        <select id="rfq-material" name="material" required>
          <option value="">Select…</option>
          {materials.map((m) => <option>{m}</option>)}
        </select>
      </div>
      <div class="rfq-field">
        <label for="rfq-quantity">Quantity</label>
        <select id="rfq-quantity" name="quantity" required>
          <option value="">Select…</option>
          {quantities.map((q) => <option>{q}</option>)}
        </select>
      </div>
      <div class="rfq-field">
        <label for="rfq-timeline">Timeline</label>
        <select id="rfq-timeline" name="timeline" required>
          <option value="">Select…</option>
          {timelines.map((t) => <option>{t}</option>)}
        </select>
      </div>
      <div class="rfq-field">
        <label for="rfq-drawings">Link to drawings (optional)</label>
        <input id="rfq-drawings" name="drawings_link" type="url" placeholder="https://" />
        <div class="invalid-feedback">Please enter a full link starting with https://</div>
        <span class="hint">Dropbox, Google Drive, OneDrive, etc.</span>
      </div>
      <div class="rfq-field full">
        <label for="rfq-message">Project details</label>
        <textarea id="rfq-message" name="message" rows="5" required placeholder="Part description, dimensions or specs, finish, and any certifications or documentation required."></textarea>
        <div class="empty-feedback">Please describe the project.</div>
      </div>
    </div>
    <button type="submit">Send Quote Request</button>
    <p class="rfq-result" id="rfq-result" role="status" aria-live="polite"></p>
  </form>
</div>

<script>
  const form = document.getElementById("rfq-form") as HTMLFormElement;
  const result = document.getElementById("rfq-result")!;
  const field = (name: string) => form.querySelector<HTMLInputElement>(`[name="${name}"]`)!;

  let landing = location.pathname;
  try {
    landing = sessionStorage.getItem("wc_landing") ?? location.pathname;
    sessionStorage.setItem("wc_landing", landing);
  } catch {
    // storage unavailable (private mode); fall back to the current page
  }
  field("landing_page").value = landing;
  field("page").value = location.pathname;

  const setResult = (text: string, kind: "ok" | "err" | "") => {
    result.textContent = text;
    result.className = `rfq-result ${kind}`.trim();
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    form.classList.add("was-validated");
    if (!form.checkValidity()) {
      form.querySelector<HTMLElement>(":invalid")?.focus();
      return;
    }
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    button.disabled = true;
    setResult("Sending…", "");
    try {
      const data = Object.fromEntries(new FormData(form));
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.message ?? "Submission failed");
      window.gtag?.("event", "generate_lead", {
        form_id: "rfq",
        material: data.material,
        quantity: data.quantity,
        landing_page: data.landing_page,
      });
      window.clarity?.("event", "generate_lead");
      setResult("Thanks. Your quote request was sent, and we'll reply within one business day.", "ok");
      form.reset();
      form.classList.remove("was-validated");
      field("landing_page").value = landing;
      field("page").value = location.pathname;
    } catch {
      setResult("Something went wrong. Please call (626) 675-4239 or email weldcreations@yahoo.com.", "err");
    } finally {
      button.disabled = false;
    }
  });
</script>
```

Note: "within one business day" is a service promise. Log it to `docs/technical-review-queue.md` (Task 14) for Mark to confirm or change.

- [ ] **Step 2: Commit**

```bash
git add src/components/RfqForm.astro
git commit -m "Add qualifying RFQ form with generate_lead conversion event"
```

---

### Task 12: Homepage at content parity + 404

**Files:**
- Create: `src/pages/index.astro`, `src/pages/404.astro`

- [ ] **Step 1: Write `src/pages/index.astro`**

The copy is carried over from the current `index.html`, with these fixes only: typos ("Supplments" becomes "Supplements", "professionals specializes" becomes "professionals specializing"), descriptive alt text, section headings, and the new quote form. Full content rewrites belong to Phase 3.

```astro
---
import { Image, getImage } from "astro:assets";
import BaseLayout from "../layouts/BaseLayout.astro";
import Gallery from "../components/Gallery.astro";
import RfqForm from "../components/RfqForm.astro";
import { SITE } from "../config/site";
import { siteGraph } from "../lib/schema";

import tigIcon from "../assets/images/tig-icon.svg";
import metalworkIcon from "../assets/images/metalwork.svg";
import productionIcon from "../assets/images/production.svg";
import precisionImg from "../assets/images/precision.jpeg";
import fabricationImg from "../assets/images/service.jpeg";
import productionImg from "../assets/images/production-service.jpeg";
import aerospaceIcon from "../assets/images/aerospace-icon.svg";
import defenseIcon from "../assets/images/defense-icon.svg";
import foodIcon from "../assets/images/food-bev-icon.svg";
import pharmaIcon from "../assets/images/pharma-icon.svg";
import vitaminIcon from "../assets/images/vitamin-icon.svg";
import machiningIcon from "../assets/images/machining-icon.svg";
import aboutImg from "../assets/images/about-us.jpg";
import heroPoster from "../assets/images/hero-video-thumbnail.jpg";

const poster = await getImage({ src: heroPoster, width: 1600, format: "webp" });

const services = [
  { icon: tigIcon, title: "Precision TIG & MIG Welding", text: "Precision welding services for a variety of metals and applications. Steel, Titanium, Aluminum, Hastelloy, Stainless Steel & more." },
  { icon: metalworkIcon, title: "Metal Fabrication", text: "Custom metal fabrication solutions tailored to your specific needs." },
  { icon: productionIcon, title: "Product Development & Consulting", text: "Let us help you develop your product and bring it to life." },
];

const detailed = [
  {
    img: precisionImg,
    alt: "Close-up of a precision TIG weld bead on a fabricated metal part",
    title: "Precision Welding Experts",
    text: "As TIG welding specialists, we pride ourselves on delivering precise and high-quality welds for a variety of applications. Our expertise doesn't stop there; we also excel in MIG welding, known for its versatility and speed. Our team of experienced professionals is well-versed in all welding techniques, ensuring that we can meet any welding need with the highest level of skill and craftsmanship. Whether it's TIG or MIG, we are committed to providing exceptional welding services that meet the diverse requirements of our clients.",
  },
  {
    img: fabricationImg,
    alt: "Custom metal fabrication work in progress at the Weld Creations shop",
    title: "Custom Metal Fabrication",
    text: "We offer comprehensive metal fabrication services, specializing in cutting, bending, forming, and a wide range of other metalwork techniques to meet the unique demands of our clients. Our state-of-the-art equipment and skilled fabricators enable us to handle projects of all sizes and complexities with precision and efficiency. From initial design to final assembly, we ensure every detail is executed flawlessly, using advanced cutting methods for clean and accurate results, precise bending to achieve the desired angles and shapes, and expert forming to create strong and durable metal components. Whether you need custom parts, structural components, or intricate designs, our team is dedicated to delivering superior quality and craftsmanship in every project. Our extensive experience in metal fabrication allows us to tackle any challenge and provide tailored solutions that perfectly match your specifications.",
  },
  {
    img: productionImg,
    alt: "Batch of TIG welded production parts",
    title: "Production Parts",
    text: "At Weld Creations, we specialize in production part runs, delivering high-quality TIG welded parts that meet the most stringent standards. While our expertise extends to a variety of metalwork and welded components, high-precision TIG welding remains our primary focus. Our skilled welders are dedicated to producing parts with exceptional accuracy and consistency, ensuring that each piece meets the specific requirements of our clients. Whether you need custom components or large-scale production runs, our commitment to quality and precision sets us apart. At Weld Creations, we understand the importance of reliable and durable parts, and our TIG welding capabilities are second to none, providing the perfect solution for your production needs.",
  },
];

const industries = [
  { icon: aerospaceIcon, title: "Aerospace", text: "Expert welding and fabrication for aerospace components, ensuring the highest standards of quality and safety. AWS D17.1 Certified." },
  { icon: defenseIcon, title: "Defense", text: "Welding services for the defense industry, ensuring robust, precise, and reliable welds for critical equipment and components." },
  { icon: foodIcon, title: "Food & Beverage", text: "Delivering expert welding services for the food and beverage industry, ensuring sanitary, durable, and compliant welds for all processing and production equipment." },
  { icon: pharmaIcon, title: "Pharmaceutical", text: "Precise, hygienic, and compliant welds for manufacturing equipment and processes. Our expertise guarantees high-quality and reliable solutions to meet stringent industry standards." },
  { icon: vitaminIcon, title: "Vitamin & Supplements", text: "Specialized welding services for the vitamin and supplement industry, ensuring high-quality and hygienic welds for equipment and manufacturing processes." },
  { icon: machiningIcon, title: "Sheet Metal & Machining", text: "Welding services tailored for the sheet metal and machining industries, enhancing their capabilities with precise and reliable welding solutions." },
];
---
<BaseLayout
  title="Weld Creations | Precision TIG Welding, Glendora CA"
  description="Precision TIG welding and metal fabrication in Glendora, CA. Production runs in stainless, aluminum, titanium and Hastelloy. AWS D17.1 certified."
  jsonLd={[siteGraph()]}
>
  <div class="hero" id="home">
    <video class="hero-video" autoplay muted loop playsinline preload="metadata" poster={poster.src} aria-hidden="true">
      <source src="/videos/hero-video.webm" type="video/webm" />
      <source src="/videos/hero-video.mp4" type="video/mp4" />
    </video>
    <div class="overlay"></div>
    <div class="hero-content">
      <h1>Precision TIG Welding <br />& Fabrication</h1>
      <p>Expert Welding, Metal Fabrication, Product Development<br />Serving All of Southern California</p>
      <a href="#contact">Request a Quote</a>
    </div>
  </div>

  <section class="services" id="services">
    <div class="container">
      <div class="services-header"><h2>Our Services</h2></div>
      <div class="service-columns">
        {services.map((s) => (
          <div class="service-item">
            <Image src={s.icon} alt="" aria-hidden="true" class="service-icon" />
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
      <div class="detailed-services">
        {detailed.map((d) => (
          <div class="detailed-service">
            <Image src={d.img} alt={d.alt} class="service-image" widths={[480, 800, 1200]} sizes="(max-width: 768px) 100vw, 50vw" format="webp" />
            <div class="service-text">
              <h3>{d.title}</h3>
              <p>{d.text}</p>
            </div>
          </div>
        ))}
      </div>
      <Gallery />
    </div>
  </section>

  <section class="industries" id="industries">
    <div class="container">
      <div class="industries-header"><h2>Industries We Serve</h2></div>
      <div class="industry-columns">
        {industries.map((i) => (
          <div class="industry-item">
            <Image src={i.icon} alt="" aria-hidden="true" class="industry-icon" />
            <h3>{i.title}</h3>
            <p>{i.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>

  <section class="about-us" id="about">
    <div class="container">
      <div class="about-header"><h2>About Us</h2></div>
      <div class="about-content">
        <div class="about-text">
          <p style="font-size: 22px">A family business you can trust.</p>
          <p>We are dedicated to delivering exceptional welding and fabrication services across Southern California. We are experienced professionals specializing in TIG welding, metal fabrication, production part runs, and custom metalwork. With a strong commitment to quality and precision, we take pride in our craftsmanship and attention to detail.</p>
          <p style="font-size: 20px">Third Generation Welder</p>
          <p>Founded with a vision to provide top-notch welding solutions, we have built a reputation for excellence in the industry. Our state-of-the-art equipment and advanced techniques ensure that we can handle projects of any size and complexity. From initial design to final production, we work closely with our clients to understand their unique needs and deliver tailored solutions that exceed expectations.</p>
          <p>Whether it's welding for the pharmaceutical, aerospace, automotive, chemical, construction, or marine industries, our expertise and dedication set us apart. We are passionate about what we do and strive to be the go-to welding and fabrication service provider in the region.</p>
        </div>
        <div class="about-image">
          <Image src={aboutImg} alt="Weld Creations owner and master welder Mark May in the Glendora shop" widths={[480, 800, 1200]} sizes="(max-width: 768px) 100vw, 50vw" format="webp" />
        </div>
      </div>
    </div>
  </section>

  <section class="contact-us" id="contact">
    <div class="container">
      <div class="contact-header"><h2>Request a Quote</h2></div>
      <div class="contact-content">
        <div class="contact-info">
          <h3><strong>Get in Touch</strong></h3>
          <p>Send us your drawings, material and quantities, or call to talk through a project.</p>
          <p><strong>Address:</strong> {SITE.address.street} {SITE.address.city}, {SITE.address.region} {SITE.address.postalCode}</p>
          <p><strong>Email:</strong> <a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
          <p><strong>Phone:</strong> <a href={`tel:${SITE.phoneE164}`}>{SITE.phone}</a></p>
        </div>
        <RfqForm />
      </div>
    </div>
  </section>
</BaseLayout>
```

**Before committing, check `about-us.jpg`.** The alt text above assumes it shows Mark in the shop. Open the image with the Read tool, and if it shows something else, rewrite the alt text to describe what is actually there. Apply the same check to the three `detailed` images.

- [ ] **Step 2: Write `src/pages/404.astro`**

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import { SITE } from "../config/site";
---
<BaseLayout title="Page Not Found" description="The page you were looking for could not be found." noindex>
  <section class="services" style="min-height: 50vh; text-align: center">
    <div class="container">
      <h1 style="font-family: Kanit, sans-serif; font-size: 40px; margin-bottom: 16px">Page not found</h1>
      <p style="margin-bottom: 24px">The page you're looking for has moved or doesn't exist.</p>
      <p><a href="/">Go to the homepage</a> · <a href="/#contact">Request a quote</a> · <a href={`tel:${SITE.phoneE164}`}>{SITE.phone}</a></p>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 3: Build**

Run: `npx astro build`
Expected: `Complete!`, with `dist/index.html` and `dist/404.html` generated.

- [ ] **Step 4: Run the site suite and fix failures one at a time**

Run: `npx vitest run tests/site`
Expected: all pass. For any failure, fix the **source**, never the test's threshold, unless the test is demonstrably wrong. If a test is wrong, fix it in a separate commit with a message that explains why.

- [ ] **Step 5: Commit**

```bash
git add src/pages
git commit -m "Rebuild homepage in Astro at content parity, add 404"
```

---

### Task 13: Remove legacy files and run full verification

**Files:**
- Delete: `index.html`, `style.css`, `scripts.js`

- [ ] **Step 1: Delete the reference files**

```bash
git rm -q index.html style.css scripts.js
```

- [ ] **Step 2: Full verification**

Run: `npm run verify`
Expected: `astro check` reports 0 errors, the unit tests pass, the build completes, and the site tests pass.

- [ ] **Step 3: Visual parity check**

Run: `npx astro preview --port 4321` in the background, then fetch `http://localhost:4321/` and confirm:
- the page returns 200
- the hero, services, gallery, industries, about and quote-form sections are all present
- `/does-not-exist/` returns the 404 page

Compare section order and copy against `git show HEAD~1:index.html`. The layout should look the same as before.

- [ ] **Step 4: Weight comparison** (record in the commit message)

```bash
du -sh dist
find dist -name "*.webp" -size +400k
```
Expected: no image over 400 KB. The old homepage shipped more than 15 MB of JPEGs and 16 MB of unused `.ogv`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Remove legacy static site files; Astro build is now the site"
```

---

### Task 14: Phase 0 owner documents

**Files:**
- Create: `docs/seo/capability-audit.md`, `docs/seo/measurement-setup.md`, `docs/seo/deploy.md`, `docs/technical-review-queue.md`

- [ ] **Step 1: Write `docs/seo/capability-audit.md`**

This is a questionnaire for Mark, printable or answered over the phone. Every answer becomes either a confirmed claim in `src/config/site.ts` or a Phase 3 content fact. Sections, each one a table with columns **Question | Answer | OK to publish? (Y/N)**:

1. **Business identity:** the exact business name and address **as they appear on the Google Business Profile** (for NAP matching), business hours, year founded, years welding, number of welders on staff, and shop square footage.
2. **Certifications:** one row each for AWS D17.1 (cert number and expiry date), AWS D1.1, AWS D1.2, AWS D1.6, AWS D18.1, ASME Section IX, CWI on staff, AS9100, ISO 9001, NADCAP, ITAR registration, and 3-A. For each row, mark it Held, In progress or Not held.
3. **Materials:** for each of aluminum (and which series), stainless (304/316L), carbon steel, chromoly/4130, titanium (grades), Hastelloy (C-276/C-22/X), Inconel (625/718), duplex, Monel, and copper/nickel, record: Yes/No, thickness range, typical parts, and the most demanding job he has done in that material.
4. **Processes and techniques:** GTAW/TIG, GMAW/MIG, orbital welding, back purging (and the oxygen analyzer model, if any), trailing shields, pulse TIG, and any spot, stick or laser work.
5. **Equipment:** welding machines (make and model), positioners, tube bender, press brake (tonnage), shear, saw, CNC/plasma, fixtures and tables, and in-house or partner passivation/electropolish.
6. **Quality and documentation:** material traceability and MTRs, weld maps and logs, first article inspection, inspection tools, NDT (in-house or through a partner: dye penetrant, X-ray), documentation packages, and whether he has passed any customer quality audit.
7. **Capacity:** largest and smallest part, max weight, lift or crane capacity, typical lead time, the largest production run he has done, shifts, and whether he can take recurring or blanket POs.
8. **Customers and proof:** industries actually served, whether any customer names can be published (or anonymized as "tier-1 aerospace supplier" and the like), testimonials, and photos he is able to share (NDA check).
9. **Lead preferences:** the smallest job worth quoting (minimum order value or quantity), work to decline, the service radius, and whether he does on-site work.

The document opens with this line: "Nothing on the website claims a certification, capability or customer until it is marked Y here."

- [ ] **Step 2: Write `docs/seo/measurement-setup.md`** (owner steps, in order)

1. **GA4:** In analytics.google.com, create a property named "Weld Creations" with a Web data stream for `https://weldcreations.com`, and copy the Measurement ID (`G-XXXXXXXXXX`).
2. **Cloudflare:** Add the environment variable `PUBLIC_GA4_ID` = that ID to **both** Production and Preview, then redeploy. The value is read at build time.
3. **Key event:** In GA4 Admin → Events, once `generate_lead` has appeared (submit one test quote), mark it as a **key event**.
4. **Search Console:** Add a **Domain** property for `weldcreations.com` and verify it with the DNS TXT record. Cloudflare's automatic verification can add the record for you. This covers apex, www, http and https, and needs no HTML tag. Then submit `https://weldcreations.com/sitemap-index.xml`.
5. **Bing Webmaster Tools:** Choose "Import from Google Search Console".
6. **Clarity:** already live (`n18eppb8di`). Optionally link it to GA4 in Clarity settings.
7. **Baseline:** Screenshot the Search Console Performance report (it will be near-empty) and note the date as Day 0 for the 60-day checkpoint.
8. **Privacy:** GA4 plus a lead form that collects personal data means the site should have a privacy policy (California, CCPA). This isn't in the Phase 1 scope; it's flagged here for a decision.

This deliberately differs from spec §7: verification is done by DNS instead of HTML meta tags. It's stronger, covers every host variant, and needs no code.

- [ ] **Step 3: Write `docs/seo/deploy.md`**

- **Cloudflare Pages build settings** (dashboard → the project → Settings → Build): Framework preset **Astro**, build command `npm run build`, output directory `dist`, root directory `/`. The Node version comes from `.node-version` (24).
- **Cutover checklist:**
  1. Change the build settings **before** merging to `main`. The old site had no build step, so if the branch merges while the settings still point to the repo root, production breaks.
  2. Push the branch and open its Cloudflare preview URL.
  3. Run PageSpeed Insights on the preview: `https://pagespeed.web.dev/analysis?url=<preview-url>`. Targets: SEO ≥ 90, Performance ≥ 90 (mobile), Accessibility ≥ 90. Record the scores.
  4. Submit a test quote from the preview and confirm the email arrives. If `PUBLIC_GA4_ID` is set, also confirm `generate_lead` shows up in GA4 DebugView.
  5. Merge to `main`, then check that `https://weldcreations.com/`, `/robots.txt`, `/sitemap-index.xml` and `/does-not-exist/` (should return 404) all behave correctly.
  6. Rollback: Cloudflare Pages → Deployments → the previous deployment → "Rollback to this deployment".
- **If the project is Workers-based instead of Pages** (check the dashboard): note it in this file. Deploying would then need a `wrangler.jsonc` with `assets.directory = "./dist"`, which becomes a follow-up task.

- [ ] **Step 4: Write `docs/technical-review-queue.md`**

Header: "Technical and business assertions published before Mark reviewed them. Mark marks each one ✅ correct, ✏️ change to…, or ❌ remove." Use a table with columns **Page | Location | Assertion | Status**. Seed rows:
- `/`, RFQ form success message: "we'll reply within one business day"
- `/`, homepage meta description: lists stainless, aluminum, titanium, Hastelloy as production-run materials
- `/`, About image alt text: "owner and master welder Mark May" (confirm this is him)
- One row for every gallery alt text from Task 10 that names a specific alloy, weld type or part

- [ ] **Step 5: Commit**

```bash
git add docs
git commit -m "Add Phase 0 owner docs: capability audit, measurement, deploy, review queue"
```

---

### Task 15: Final verification and handoff

- [ ] **Step 1:** Run `npm run verify` and paste the summary lines (test counts, astro check result) into the handoff message.
- [ ] **Step 2:** Run `git status` (clean) and `git log --oneline main..HEAD` (one commit per task).
- [ ] **Step 3:** Push the branch so Cloudflare builds a preview, **only after the user confirms the build settings change from `docs/seo/deploy.md`**. Pushing to a non-main branch does not affect production.
- [ ] **Step 4:** Report back:
  - what shipped
  - page weight before and after
  - test counts
  - the owner actions still pending: build settings, GA4 ID, Search Console, and the capability audit
  - the next plan: Phase 2 research
