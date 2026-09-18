# Phase 3b: Remaining Spine Pages: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Same template, tests and content rules as `2026-09-18-phase-3a-content-spine.md`.

**Goal:** Complete the 17-URL spine (spec §4) with the remaining pages. Also give quote requests a dedicated `/contact/` page and point every CTA at it.

## Tasks

### 1. Infrastructure
- Add a `locations` collection (same schema) and a `relatedLocations` relation field. Add it to `SECTIONS` and to the content-test section regex.
- Create a `/contact/` page containing the quote form, the address/phone/email and a map link. Point every CTA (header, footer, CTA band, content-page hero) at `/contact/`. The homepage keeps its inline form and its `#contact` anchor.
- Update the content test to require a link to `/contact/`.
- Add the negative phrase `exhaust welding` / `titanium exhaust` / `stainless exhaust` to the lead-quality test (keyword map §3).

### 2. Collection pages (keyword map §4)

| File | Primary keyword | Key points | Hero |
|---|---|---|---|
| `industries/aerospace-welding.md` | aerospace welding | AWS D17.1 (weld classes A/B/C); titanium, nickel, aluminum and stainless; tooling, fixtures, ground support equipment, test rigs, prototypes, R&D. **Name no other supplier approvals.** If a program needs a specific quality-system registration, "tell us up front and we'll tell you honestly whether we're a fit." | none |
| `materials/titanium-welding.md` | titanium welding services | CP Grade 2 / Grade 5 / Grade 9; ERTi-2 and ERTi-5ELI filler (AWS A5.16); trailing shield plus back purge until below ~800°F; weld color vs. contamination; cleanliness. **No exhaust language.** | none |
| `materials/stainless-steel-welding.md` | stainless steel welding | 304/316 and L grades; 308L/316L/309L fillers; distortion; sensitization; heat tint removal; free-iron contamination; passivation | gallery 6 |
| `materials/inconel-welding.md` | inconel welding | 625 → ERNiCrMo-3, 718 → ERNiFeCr-2, 600 → ERNiCr-3; 718 welded solution-annealed then aged; low heat input; cleanliness | none |
| `materials/aluminum-welding.md` | aluminum welding | AC TIG and oxide cleaning; 5xxx vs 6xxx; 4043 vs 5356 (anodize color, strength, Mg content); 6061-T6 HAZ strength loss; hydrogen porosity; 7075 is generally not fusion-weldable | none |
| `industries/food-beverage-welding.md` | food grade stainless steel fabrication | Hygienic design; wash-down construction (sealed tube, continuous welds, sloped tops); 304 vs 316L; customer's 3-A / FDA spec referenced, never claimed; hoppers, chutes, conveyor frames, platforms | gallery 14 |
| `services/metal-fabrication.md` | custom metal fabrication | Cut, form, fit, weld, finish; enclosures, frames, stands, guards, carts, fixtures; product development and design-for-manufacture; partner network | gallery 18 |
| `locations/glendora-ca.md` | metal fabrication Glendora | Gladstone Industrial Park; freeway access; the San Gabriel Valley manufacturers we serve; drop-off and visits by appointment; map link. **Not a doorway page:** real local detail only. | gallery 13 |

### 3. Standalone pages
- `/about/`: family business, third-generation welder, AWS D17.1, the partner-network model, how we work. Photo: about-us.jpg. Breadcrumb JSON-LD. No unconfirmed numbers.
- `/contact/`: see task 1.

### 4. Internal links
Existing pages link into the new ones:
- the TIG metals list → the material pages
- Hastelloy → Inconel
- sanitary → stainless, food
- TIG service area → Glendora

### 5. Review queue, verify, preview, report
Log the new technical assertions, run `npm run verify`, push the branch, find the preview through the GitHub API, run the browser suite and Lighthouse, and report. **Ask before merging to `main`.**
