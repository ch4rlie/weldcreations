# Phase 4: AI Assistant & Search Visibility: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans.

**Goal:** Make Weld Creations easy for Google, Bing/ChatGPT, Perplexity and other AI answer engines to understand, trust, cite and attribute, and measure the leads they send.

**Evidence base (2026-09-18 research):**
- ChatGPT's local recommendations are retrieved through Bing (Bing Places plus the Bing index).
- Consistent business details, reviews and fresh content drive citations.
- `llms.txt` is ignored by Google Search and barely fetched by AI search bots. It's included only as a cheap, harmless extra.
- AI-assistant referrals convert well above organic search, so they're tracked as their own source.
- Every AI crawler tested gets a 200 response. No Cloudflare block was detected.

## Track A: on-site (this plan)

1. **Entity graph** (TDD, `src/lib/schema.ts`)
   - Business node: `knowsAbout`, `hasOfferCatalog` (an Offer for every published service/material/industry page, linked by `@id`), `sameAs` + the Google Maps listing, and `founder` → a Person `@id` reference.
   - New Person node for Mark May (`@id` `/#mark-may`) with `jobTitle`, `hasCredential` (confirmed only), `knowsAbout` and `worksFor`.
   - `BaseLayout` passes published spine pages into `siteGraph()`.
2. **Freshness**
   - Required `updated` date on every content entry.
   - A visible "Updated Month YYYY" line.
   - A `WebPage` JSON-LD node with `dateModified`, `isPartOf` → WebSite, `about` → Service.
   - A test checks that the visible date matches the schema.
3. **Lead-source attribution**
   - Quote form gets a required "How did you find us?" select: Google search, Google Maps, ChatGPT / AI assistant, Bing, Thomasnet, referral, LinkedIn, other.
   - Hidden `referrer` field captured at first landing, alongside the existing `landing_page`.
   - `generate_lead` gains `lead_source` and `referrer_host` parameters.
4. **`/llms.txt`**: generated at build time from the business config and the collections: a short summary, NAP, certification, and every published page with its summary. A test checks that it lists every spine URL.
5. **Guides collection** (`/guides/`)
   - Article schema: headline, `datePublished` / `dateModified`, author and publisher = the business node.
   - Two guides:
     - `aws-d17-1-certification-explained`: AWS D17.1 explained for buyers
     - `how-to-choose-a-sanitary-welding-company`: a buyer's checklist
   - Guides link into the relevant service and industry pages, and are excluded from the homepage "Specialties" strip.
6. **Owner doc** `docs/seo/ai-visibility.md`: the Track B checklist (Bing Places, Bing Webmaster Tools and Crawler Hints, the AI Crawl Control check, reviews, LinkedIn company page, directories), a review-request email draft, and the monthly AI prompt checklist.

Verify, preview, Lighthouse, report. Ask before merging to `main`.
