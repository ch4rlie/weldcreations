# Content Audit Checklist

Every spine page must pass this before it goes live (spec §8).

## Automated: the build fails if any of these fail
Checked by `npm run verify`, via `tests/site/*.test.ts`.

- [x] One H1; title ≤ 60 characters; meta description 70–155 characters; unique across the site
- [x] Canonical URL, Open Graph tags, and Service + BreadcrumbList schema whose provider resolves to the business node
- [x] Visible breadcrumbs that match the BreadcrumbList
- [x] ≥ 700 words of body copy
- [x] Primary keyword in the title or H1, and in the body
- [x] ≥ 3 links to other spine pages or `/capabilities/`
- [x] Every FAQ question in the schema is also visible on the page
- [x] A link to the quote form
- [x] No broken internal links or images; no image over 400 KB; descriptive alt text
- [x] **No unconfirmed named certification** ("AS9100 certified", "ASME qualified", and so on)
- [x] **No low-value-lead phrasing** ("no job too small", "cheap", "mobile welding", and so on)
- [x] Every related-page reference points at a page that exists (enforced by the content schema)

## Manual: check each one before publishing
- [ ] **Answer first:** the first 100 words tell an engineer what we do and for whom. No throat-clearing.
- [ ] **Expert voice:** it reads like a welder explaining the work to an engineer, not marketing filler.
- [ ] **Standards referenced, never claimed:** ASME BPE, 3-A and FDA appear only as *the customer's spec we build to*.
- [ ] **Capabilities framed honestly:** "in-house or through our partner network" wherever the work might go to a partner (orbital welding, electropolishing, passivation, machining).
- [ ] **Lead-quality test (spec §4a):** would this attract a buyer with a PO, or a hobbyist with a question?
- [ ] **Proof:** a real photo from Mark's work, or a specific detail that only a practitioner would know.
- [ ] **Specific CTA:** it tells them exactly what to send (drawing, material, quantity, timeline).
- [ ] **Review queue:** every specific technical assertion is logged in `docs/technical-review-queue.md`.
