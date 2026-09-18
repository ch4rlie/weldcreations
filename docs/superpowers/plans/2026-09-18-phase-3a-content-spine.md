# Phase 3a: Content Template + First Six Spine Pages: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable content-page system (collections, template, breadcrumbs, related links, FAQ, schema), then publish the six highest-priority spine pages from `docs/seo/keyword-map.md` §5.

**Architecture:**
- Three Astro content collections (`services`, `materials`, `industries`) share one zod schema. Relations use `reference()`, so a link to a page that doesn't exist fails the build.
- Each collection gets a small `[slug].astro` route and an `index.astro` route that delegate to the shared components `ContentPage.astro` and `SectionIndex.astro`.
- Related links are **bidirectional**: a page shows the pages it references *and* the pages that reference it. Adding one Markdown file updates its siblings automatically.
- `BaseLayout` now always emits the sitewide business graph, so `Service.provider` resolves by `@id` on every page.
- A new `tests/site/content.test.ts` enforces the content rules on every content page.

**Tech:** unchanged (Astro 7.3.3, vitest, cheerio).

**Spec:** `docs/superpowers/specs/2026-09-18-seo-foundation-design.md` §4, §8; **keyword map:** `docs/seo/keyword-map.md` §4–5.

**Verified by probe (2026-09-18):** cross-collection `reference()` resolves; an invalid reference fails the build ("Invalid content reference"); the `image()` schema helper plus `<Image>` optimizes hero photos.

**Scope:** template plus 6 pages: `/services/sanitary-welding/`, `/industries/pharmaceutical-welding/`, `/services/tig-welding/`, `/materials/hastelloy-welding/`, `/services/production-welding/`, `/capabilities/`, plus the `/services/`, `/materials/`, `/industries/` index pages. The remaining spine pages come in Phase 3b, using the same template.

**Content rules (apply to every page):**
- One H1 containing the primary keyword. A specific answer in the first 100 words.
- B2B tone, with no "no job too small" or hobby language (spec §4a).
- **Named certifications:** only AWS D17.1. Industry standards (ASME BPE, 3-A, FDA) may be *referenced* as the customer's spec we build to. They are never *claimed* ("certified", "compliant", "approved").
- **Capabilities** are written broadly, using the "in-house or through our partner network" framing (owner decision, 2026-09-18).
- No customer names, no unconfirmed numbers (years in business, square footage, staff count).
- Every specific technical assertion (filler grades, purge practice, temperatures, finishes) is logged to `docs/technical-review-queue.md`.
- Note: Google restricts FAQ *rich results* to government and health sites. We still emit `FAQPage` because it helps search engines and AI answer engines understand the page. It will not produce FAQ snippets.

---

## File structure

```
src/content.config.ts               collections + shared schema
src/content/services/*.md           sanitary-welding, tig-welding, production-welding
src/content/materials/*.md          hastelloy-welding
src/content/industries/*.md         pharmaceutical-welding
src/lib/content.ts                  COLLECTIONS meta, entryPath(), relatedFor() (forward + reverse)
src/lib/schema.ts                   + serviceSchema(), breadcrumbSchema(), faqSchema()
src/components/Breadcrumbs.astro    visible breadcrumb trail
src/components/ContentPage.astro    page template: breadcrumbs, hero, body, FAQ, related, CTA, JSON-LD
src/components/SectionIndex.astro   index page: intro + cards
src/components/Faq.astro            <details> list
src/components/CtaBand.astro        quote call-to-action
src/pages/{services,materials,industries}/[slug].astro and index.astro
src/pages/capabilities.astro        standalone page
src/styles/global.css               + prose, breadcrumb, card, faq, cta styles
tests/unit/schema.test.ts           + new builders
tests/site/content.test.ts          content-page rules
docs/seo/content-audit-checklist.md manual checklist (spec §8)
```

---

### Task 1: Schema builders (TDD)
Add to `tests/unit/schema.test.ts`, then implement in `src/lib/schema.ts`:
- `serviceSchema({ name, description, path, serviceType })` → `@type: Service`, `@id` = canonical + `#service`, `provider: {"@id": BUSINESS_ID}`, `areaServed` from config, `url` canonical.
- `breadcrumbSchema([{ name, path }])` → `BreadcrumbList` with 1-based positions and absolute `item` URLs.
- `faqSchema([{ q, a }])` → `FAQPage` whose `mainEntity` is a list of `Question` items with `acceptedAnswer.text`.

The tests assert exact shapes. Run: `npx vitest run tests/unit` → fails first, then passes. Commit.

### Task 2: Sitewide business graph in BaseLayout
`BaseLayout` always prepends `siteGraph()` to `jsonLd`, and `index.astro` stops passing it. The existing homepage test still passes, and every page now carries the business node. Commit.

### Task 3: Collections + content helpers
- `src/content.config.ts`: one schema for all three collections. Fields:
  - `title` (≤60), `h1`, `description` (70–155), `navLabel`, `summary` (≤220)
  - `primaryKeyword`, `secondaryKeywords[]`, `serviceType`
  - `heroImage` (`image()`, optional) and `heroAlt` (required when `heroImage` is set, enforced with `superRefine`)
  - `order`, `draft`, `faqs[{q,a}]`
  - `relatedServices` / `relatedMaterials` / `relatedIndustries` (`reference()`)
- `src/lib/content.ts`:
  - `COLLECTIONS` (collection name → section label and path)
  - `entryPath(collection, id)` → `/${collection}/${id}/`
  - `publishedEntries(collection)`
  - `relatedFor(entry)` → the forward references plus every published entry whose relations include this entry, de-duplicated, drafts excluded, grouped by collection.

Commit.

### Task 4: Components, routes, styles
- `ContentPage.astro` takes an `entry`. It renders:
  - the `Breadcrumbs` (Home › Section › Page)
  - a hero (the H1, the summary as a lead paragraph, and the optional hero `<Image>` at width 1200, `loading="eager"`, `fetchpriority="high"`)
  - the Markdown body inside `<article class="prose" data-primary-keyword=…>`
  - `Faq`, then related-link cards grouped by section, then `CtaBand`
  - JSON-LD: Service + BreadcrumbList + FAQPage (when there are FAQs); the hero image becomes the `ogImage`
- `SectionIndex.astro`: breadcrumbs, the H1, the intro, and cards for every published entry sorted by `order`, plus BreadcrumbList JSON-LD.
- Route files: `[slug].astro` uses `getStaticPaths` over the published entries; `index.astro` uses `SectionIndex`.
- Header: Services → `/services/`, Industries → `/industries/`. Footer quick links add Services, Materials and Industries.
- CSS: `.page-hero`, `.breadcrumbs`, `.prose` (headings, lists, tables, blockquote), `.cards`, `.faq`, `.cta-band`, consistent with the existing palette (Kanit headings, `#1b75bb`, `#f0a500`).

Commit.

### Task 5: Content-page tests (written before any page content)
`tests/site/content.test.ts`: for every built page under `/services/*/`, `/materials/*/` and `/industries/*/`:
- BreadcrumbList JSON-LD whose last item equals the canonical URL, plus a visible `nav.breadcrumbs`
- a `Service` JSON-LD node whose `provider["@id"]` resolves to the business node on the same page
- `article.prose` word count ≥ 700
- the primary keyword (from `data-primary-keyword`) appears case-insensitively in the `<title>` or H1, and somewhere in the article
- ≥ 3 internal links to other content pages or `/capabilities/`
- every FAQPage question appears as visible text
- at least one link to the quote form

For every index page: it lists every published entry of its collection.

Run it: it fails, because there are no pages yet. Commit.

### Task 6: Content audit checklist
`docs/seo/content-audit-checklist.md`: the automated checks (with a pointer to the tests) plus the manual ones:
- technical accuracy is logged
- the lead-quality test (spec §4a)
- proof is present (a photo or a specific detail)
- the CTA is specific
- no unconfirmed named certifications
- it reads like an expert wrote it for an engineer

Commit.

### Tasks 7–12: Pages (one commit each; `npm run verify` must pass before each commit)

| Task | File | Primary keyword | Hero | Must cover |
|---|---|---|---|---|
| 7 | `services/sanitary-welding.md` | sanitary welding company | gallery 16 | What makes a weld sanitary (full penetration, smooth ID, no crevices, back purge, heat-tint control); tube vs. vessel/hopper work; surface finish and passivation through partners; building to the customer's ASME BPE / 3-A spec; documentation; pharma + food + supplements; orbital through the partner network |
| 8 | `industries/pharmaceutical-welding.md` | pharmaceutical equipment fabrication | gallery 8 | Cleanroom equipment (stands, hoppers, ducting, frames); tablet press and capsule-line support; 316L; cleanability; installs; documentation; orbital welding for process piping; relations: sanitary, TIG, Hastelloy |
| 9 | `services/tig-welding.md` | TIG welding services Los Angeles | gallery 1 | Why TIG for precision and thin material; the materials list; D17.1; appearance vs. structural welds; production consistency; LA / SoCal service area |
| 10 | `materials/hastelloy-welding.md` | Hastelloy welding services | none | C-276 / C-22 / X; ERNiCrMo-4 (C-276) / ERNiCrMo-10 (C-22) filler; argon back purge; low heat input; stringer beads; interpass below ~200°F; no preheat/PWHT typically; cleanliness (no carbon-steel contamination); joining to 316L/carbon steel; where it's used (chemical, pharma) |
| 11 | `services/production-welding.md` | production welding companies | gallery 2 | Fixturing, repeatability, first-article, runs from prototype to recurring; blanket POs; partner network for machining and finishing; the RFQ info to send |
| 12 | `pages/capabilities.astro` | welding and fabrication capabilities | gallery 17 | Printable capability summary: processes, materials, certification (D17.1 only), industries, services, how to send an RFQ, contact block. Breadcrumb + Service JSON-LD. `@media print` styles. |

After each page, add its technical assertions to `docs/technical-review-queue.md`.

### Task 13: Homepage links into the spine
- The homepage service cards and industry cards link to their pages *when those pages exist* (resolved with `getCollection` at build time).
- Add a "Specialties" strip below the services section that links to all published content pages.

Commit.

### Task 14: Verify, push, preview, report
1. `npm run verify` from a clean install.
2. Push the feature branch, then find the preview URL through the GitHub API.
3. Run the browser suite and Lighthouse (median of 3) on a content page and on the homepage.
4. Report to the user. **Do not merge to `main` without the user's approval.**
