# Weld Creations — SEO Foundation & Site Rebuild Design

**Date:** 2026-09-18
**Client:** Weld Creations (Mark May), 2041 E Gladstone Unit Q, Glendora, CA 91741, (626) 675-4239
**Hosting:** Cloudflare Pages
**Status:** Approved design, pending implementation plan

## 1. Goal

Turn a single-page brochure site into an organized, expandable authority site that ranks for high-value TIG welding and specialty-alloy fabrication searches and converts them into RFQs from pharmaceutical, food-grade, and aerospace buyers.

**Business metric:** qualified RFQ form submissions from regulated-industry buyers, attributed to landing page.

## 2. Decisions (locked)

| Decision | Choice | Consequence |
|---|---|---|
| Target market | Commercial regulated industries: pharma, food-grade sanitary, aerospace. Government/military **out of scope**. | No SAM.gov/CAGE track. No solicitation-language content. |
| Architecture | Three-axis topic cluster (Process × Material × Industry) + local layer, **built in phases** | Core spine first; expansion gated on 60 days of Search Console data. |
| Stack | Astro, static output, deployed to Cloudflare Pages | Content lives in Markdown collections; layouts, schema, and sitemap are generated. |
| Keyword data | Free sources only | Volumes are **estimates**, labeled as such. Prioritization uses SERP competition + commercial intent, then is corrected by real GSC data. |
| Technical review | Publish first, Mark corrects later | Every specific technical assertion is logged to `docs/technical-review-queue.md` for a fast sweep. |
| Capability claims | **Only named certifications/registrations are gated.** Materials, processes and capacity are written broadly: Weld Creations is positioned as a full-service partner that delivers in-house or through its partner network. (Owner decision, 2026-09-18.) | Five-question owner check (`docs/seo/capability-audit.md`). The only confirmed certification is AWS D17.1, and the build test blocks any other named cert claim. |
| Lead quality | **Repel low-value hobby/repair work.** Owner explicitly does not want small one-off jobs (e.g. "a little TIG on a tire carrier"). | Negative keyword targeting, B2B/production copy tone, and a qualifying RFQ form. See §4a. |
| Portfolio | Owner's personal trophy truck build is **not** featured anywhere. | No `/projects/` section in the core spine. |

## 3. Current state (baseline audit)

- **1 indexable URL.** All navigation is `#anchor` links.
- No `<meta name="description">`, canonical, Open Graph, `robots.txt`, or `sitemap.xml`.
- Zero structured data.
- Tailwind 2.0.4 full build loaded from CDN as a render-blocking stylesheet; Google Fonts render-blocking; autoplaying hero video with no size budget.
- Measurement: Microsoft Clarity only. **No GA4, no Search Console verification, no conversion tracking** on the Web3Forms contact form.
- Generic alt text ("Image 1" … "Image 18", "Service Image") on every portfolio image.
- Known facts to preserve: AWS D17.1 certified; third-generation welder; materials named on site include steel, titanium, aluminum, Hastelloy, stainless; industries listed include aerospace, defense, food & beverage, pharmaceutical, vitamin & supplement, sheet metal & machining. Yelp and LinkedIn profiles exist.

## 4. Information architecture

URLs are permanent once published. Trailing slashes, lowercase, hyphenated.

```
/                                   Home (hub for all three axes)
/services/
  /services/tig-welding/
  /services/metal-fabrication/
  /services/production-welding/     ← production runs: the highest-value service
  /services/sanitary-welding/       ← added 2026-09-18 (Phase 2 data: strongest purchase-intent term)
/materials/
  /materials/aluminum-welding/
  /materials/titanium-welding/
  /materials/hastelloy-welding/
  /materials/inconel-welding/
  /materials/stainless-steel-welding/
/industries/
  /industries/pharmaceutical-welding/
  /industries/food-beverage-welding/    ← renamed 2026-09-18 to match search demand
  /industries/aerospace-welding/
/capabilities/                      ← vendor-vetting / printable capability statement
/about/                             ← E-E-A-T, third-generation story
/contact/                           ← RFQ form (tracked conversion)
/locations/
  /locations/glendora-ca/               ← primary local hub
```

**Core spine = 17 URLs** (including index pages for `/services/`, `/materials/`, `/industries/`, `/locations/`).

### 4a. Lead-quality rules (negative targeting)

The site should attract production and regulated-industry buyers and quietly filter out hobby and small-repair traffic.

- **Keywords not targeted:** "cheap", "mobile welder", "welding repair near me", "trailer/hitch/tire carrier", "welding classes", DIY/how-to-weld beginner terms, and consumer automotive/off-road accessory terms.
- **Copy signals B2B:** language like production runs, drawings/specs, material certs, lot quantities, and repeat orders. No hourly-rate or "no job too small" language.
- **RFQ form qualifies the lead:** company name, material, estimated quantity or annual volume, drawing upload/link, and timeline. A small job can still submit, but the form makes clear who the shop is for.
- **Content test:** before a topic is published, ask "does this attract a buyer with a PO, or a hobbyist with a question?" Beginner how-to content fails this test even if it has search volume.

### Interlinking rules

- Every material page links to ≥2 industry pages that use that material, and to `/services/tig-welding/`.
- Every industry page links to every material page relevant to it, and to `/capabilities/`.
- Every page links to `/contact/` via a primary CTA.
- Links are generated from front-matter relationships (`relatedMaterials`, `relatedIndustries`), not hand-maintained, so adding a page updates its siblings automatically.

### Expansion model (post-checkpoint)

New materials, industries, services, projects, and locations are added as single Markdown files in their collection. Candidate expansion list, prioritized by Phase 5 data: Inconel 718 vs 625 split, duplex stainless, Monel, copper/nickel alloys, chromoly/4130, vitamin & supplement, chemical processing, semiconductor, additional San Gabriel Valley locations (Irwindale, Azusa, City of Industry, Pomona, Ontario).

**On hold (owner decision, 2026-09-18):** high-end off-road/motorsport fabrication. If revisited, it is scoped to high-end builds only (race/pro-level chassis and fabrication) and must pass §4a. Case studies go in a future `/projects/` collection, and only with owner approval.

## 5. Local SEO

- **Primary hub:** `/locations/glendora-ca/`, targeting Glendora plus the San Gabriel Valley industrial corridor.
- **No doorway pages.** A location page is published only when it has distinct content (actual industrial zones, drive time, and projects or clients in that area).
- NAP (name, address, phone) rendered from one config source, identical everywhere, matching Google Business Profile exactly.
- Google Business Profile optimization is an off-site deliverable: categories, services, photos, and a posting cadence. Documented as a checklist for the owner to execute, because it requires account access.

## 6. Technical foundation

- **Astro** static build → `dist/` → Cloudflare Pages.
- Visual design carried over from the current site so the rebuild is not a rebrand.
- Remove the Tailwind CDN. Styling is scoped CSS with only the rules actually used.
- Self-hosted fonts with `font-display: swap`.
- Hero video: compressed, poster-first, lazy-loaded.
- Images converted to AVIF/WebP with explicit dimensions and descriptive alt text.
- Generated: `sitemap.xml`, `robots.txt`, canonical per page, meta description per page, Open Graph/Twitter cards.
- **Schema (JSON-LD):** `ProfessionalService` + `Organization` sitewide; `Service` per service/material/industry page; `BreadcrumbList` on all non-home pages; `FAQPage` where a page has a real FAQ section.
- **Redirects:** old anchor URLs keep working on the homepage. `_redirects` covers any legacy paths.

## 7. Measurement

- GA4 with a `generate_lead` conversion event on successful RFQ submission, including the landing page as a parameter.
- Google Search Console and Bing Webmaster Tools verified. Sitemap submitted.
- Clarity retained.
- Verification tokens and the GA4 measurement ID require account access, so they are owner inputs and are read from config.

## 8. Content standards

Every page must have:
- One H1 containing the primary keyword; a unique title (≤60 chars) and meta description (≤155 chars).
- A real, specific answer in the first 100 words (no filler intros).
- A technical depth section, a "why Weld Creations" section, relevant internal links, and a CTA.
- A pass of the §4a lead-quality test.
- Named certifications only from the confirmed list. Capabilities can be stated broadly ("in-house or through our partner network"). Specific technical assertions (filler grades, purge specs) are logged to the review queue.

A **content audit checklist** (`docs/seo/content-audit-checklist.md`) is applied to every page before it is published.

## 9. Phases

| # | Phase | Output | Verification |
|---|---|---|---|
| 0 | Measurement & truth | Capability audit sheet; GA4/GSC/Bing integration points; conversion event | Build passes; event fires in GA4 debug view (owner) |
| 1 | Technical foundation | Astro site at parity with current content; SEO infrastructure; schema | Build passes; every page validates (schema, meta, links); Lighthouse ≥90 SEO/Perf |
| 2 | Research | `docs/seo/keyword-map.md`: keyword universe, SERP teardown, keyword→URL map | Every spine URL has a primary + secondary keyword set |
| 3 | Core spine content | 17 URLs written and interlinked (keyword map: `docs/seo/keyword-map.md`) | Each page passes the content audit checklist |
| 4 | Local | Glendora hub; GBP and citation checklist | NAP consistent across all pages |
| 5 | Audit & iterate | Full technical + content audit; 60-day data checkpoint | Documented expansion decisions |

## 10. Out of scope

- Government/military bid readiness (SAM.gov, CAGE, NAICS registration). The existing homepage "Defense" industry card is kept (subcontract work for commercial defense primes), but it gets no dedicated page in the core spine.
- Paid search
- Link-building outreach campaigns (a digital PR plan may follow Phase 5)
- Any change to the business's actual certifications
