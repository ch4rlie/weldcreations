# Keyword Map: Phase 2 Research

**Date:** 2026-09-18
**Sources (free only, per spec):**
- Google autocomplete: 42 seeds → 725 unique real queries. Raw data: `autocomplete-2026-09-18.json`.
- Manual search-results (SERP) analysis on the priority buying terms.
- A competitor teardown.

**Demand tiers are estimates, not measured volumes.** They are inferred from autocomplete breadth and the shape of the search results. Google Search Console data (from Day 0) replaces them at the 60-day checkpoint.

---

## 1. Findings that change the plan

1. **Exotic-alloy searches come from engineers, not buyers.** Autocomplete for Hastelloy and Inconel is almost entirely technical: "how to weld hastelloy", "welding hastelloy c276 to 316 stainless", "hastelloy welding procedure", "can inconel be welded", "inconel welding filler wire". The results are **forums and info sites** (finishing.com, weldingtipsandtricks.com, materialwelding.com, Haynes International), **not fabricators**. A shop page that genuinely answers the question can outrank them. The reader is the engineer who writes the spec and picks the vendor.
   → Material pages lead with real technical answers, then convert.
2. **"Pharmaceutical welding" is not something people search.** The pharma demand is **"orbital welding pharmaceutical"** plus **"sanitary welding"**. "Sanitary welding company near me" is one of the strongest purchase-intent phrases in the whole dataset.
   → **Spine change: add `/services/sanitary-welding/`** as the conversion page that both pharma and food link into. Rename the food page to match its search term (see §4).
3. **Buying intent is phrased "company / companies / services".** Examples: "sanitary welding company near me", "aerospace welding companies near me", "production welding companies near me", "titanium welding services near me", "stainless steel welding companies near me".
   → Title tags and H1s use this phrasing.
4. **City names below Los Angeles get no searches.** Glendora, Azusa, Irwindale, the San Gabriel Valley and City of Industry return zero or near-zero suggestions. Local demand arrives as **"near me"**, which is driven by the Google Business Profile (GBP) and proximity, or as **Los Angeles** terms.
   → One strong local page; LA terms on the service pages; **no city doorway pages**. This confirms spec §5.
5. **Thomasnet owns the Southern California supplier searches.** "Hastelloy welding services Southern California", "titanium welding services", "precision TIG welding services Southern California" and "aerospace welding services" all return Thomasnet category pages. Purchasing agents search there directly.
   → **Get listed on Thomasnet** (free claim). See §6. It's likely the fastest lead source available.
6. **The domain already has a foothold.** With a single thin page, weldcreations.com appears on page 1 for "production welding contract manufacturing Southern California TIG" and "precision TIG welding and fabrication Los Angeles". Dedicated pages should climb quickly.
7. **The gallery matches real demand.** "ss hopper fabrication", "sheet metal hopper fabrication" and "hopper fabrication" all exist as searches, and no LA-area fabricator ranks for them (the California results are Tracy and national sellers).
   → Hopper page is expansion candidate #1.

## 2. Competitors (Southern California)

| Competitor | Where | What they rank for | Takeaway |
|---|---|---|---|
| [Pen Manufacturing](https://www.pendarvismanufacturing.com/tig-welding.php) | Anaheim | TIG welding services in California. Lists AWS D1.1/D1.2/D1.6. | A dedicated TIG page with certs in the title ranks. |
| [Stainless Steel Fabricators](https://ssfab.net/) | La Mirada | Stainless for medical, pharma, food. 60,000 sq ft. | Scale-based pitch. Mark wins on precision and exotic alloys. |
| [Advance Welding](https://www.theperfectweld.com/aerospace/) | SoCal | Aerospace and AWS D17.1 | A D17.1 explainer page ranks. Mark holds D17.1 too. |
| [AP Precision Metals](https://apprecision.com/locations/los-angeles/welding-los-angeles/) | LA | "welding los angeles" | Uses a location sub-page. |
| [Noel Welding](https://www.noelwelding.com/tig-welding) | LA | TIG welding LA | Residential/commercial mix, so weaker B2B positioning. |
| [Custom Metal Fabrication & Design](https://custommetalfabricationdesign.com/tig-welding-services-los-angeles/) | Torrance | TIG LA, architectural | Architectural niche, not a direct rival. |
| Sanitary nationals ([Sanitary Welding Solutions](https://www.sanitaryweldingsolutions.com/), [S3](https://www.s3welding.com/), [LWS](https://www.lwsmetalfab.com/welding-services/sanitary-welding/)) | National | "sanitary welding" | They win on dedicated sanitary pages that name ASME BPE, 3-A and orbital. **No LA-local shop owns this.** |

## 3. Negative keywords (spec §4a lead-quality filter)

**Never target these, and avoid them in copy:**
- Hobby/automotive: "exhaust welding" (titanium and stainless exhaust), "welding services for cars", "trailer", "hitch", "tire carrier"
- Mobile, home or repair: "mobile tig welding", "at home", "welding repair near me", "near me open now", "tig welding machine repair"
- Jobs and training: "jobs", "salary", "hourly rate", "classes", "certification near me", "for beginners", "is tig welding easy to learn"
- Consumables and gear: "rod", "electrode", "wire price", "helmet", "gloves", "for sale", "for rent"
- Business how-to: "welding business ideas", "company name ideas", "business cards"

## 4. Page → keyword map (core spine)

**Demand:** H = high, M = medium, L = low, all estimated.
**Competition:** how hard the current page-1 results look.

| # | URL | Primary keyword | Secondary keywords | Intent | Demand | Competition | Proof on hand |
|---|---|---|---|---|---|---|---|
| 1 | `/services/tig-welding/` | TIG welding services Los Angeles | precision TIG welding and fabrication, TIG welding company, aluminum TIG welding services, TIG welder Los Angeles | Commercial | H | Med (Yelp, local shops) | Already ranks with 1 page. D17.1. |
| 2 | **`/services/sanitary-welding/`** *(new)* | sanitary welding company | sanitary stainless welding, sanitary pipe welding, sanitary welding services Los Angeles, food grade welding | Commercial | M | Low-local, national players | Hoppers, V-blender, cleanroom photos |
| 3 | `/industries/pharmaceutical-welding/` | pharmaceutical equipment fabrication | orbital welding pharmaceutical, sanitary welding pharmaceutical, tablet press stands and hoppers, cleanroom stainless fabrication | Commercial + research | L–M | Low (results are articles) | **Strongest:** tablet press and capsule filler installs |
| 4 | `/materials/hastelloy-welding/` | Hastelloy welding services | how to weld Hastelloy C276, Hastelloy C276 to 316 stainless, Hastelloy welding procedure, Hastelloy fabrication | Research → commercial | L–M | **Low (forums)** | Named on the site already |
| 5 | `/services/production-welding/` | production welding companies | contract welding and fabricating, production welding services, production TIG welding, short-run and high-volume welding | Commercial | M | Med | Bracket production-run photos |
| 6 | `/capabilities/` | welding and fabrication capabilities | *(conversion page, not a ranking target)* | Vendor vetting | n/a | n/a | D17.1 plus the "we deliver" network framing |
| 7 | `/materials/titanium-welding/` | titanium welding services | titanium TIG welding, titanium welding company, aerospace titanium welding | Commercial | M | Med (Thomasnet) | D17.1. **Exclude "exhaust".** |
| 8 | `/industries/aerospace-welding/` | aerospace welding companies | AWS D17.1 welding, aerospace TIG welding, aircraft welding services | Commercial | M | Med (Nadcap shops) | D17.1 is the credential that matters. **Do not imply Nadcap or AS9100.** |
| 9 | `/materials/stainless-steel-welding/` | stainless steel welding companies | stainless steel fabrication Los Angeles, 316L welding, stainless steel welding and fabrication | Commercial | H | Med–High | Most of the gallery |
| 10 | `/materials/inconel-welding/` | Inconel welding services | can Inconel be welded, Inconel welding procedure, Inconel to stainless | Research → commercial | L–M | Low (forums) | Mentioned capability |
| 11 | `/materials/aluminum-welding/` | aluminum welding Los Angeles | aluminum welding and fabrication, aluminum TIG welding services, custom aluminum fabrication | Commercial | H | High (many local shops) | Current GBP category |
| 12 | `/industries/food-beverage-welding/` *(renamed from `food-grade-sanitary-welding`)* | food grade stainless steel fabrication | food grade welding, food processing equipment fabrication, 3-A sanitary | Commercial | L–M | Low–Med | Hoppers |
| 13 | `/services/metal-fabrication/` | custom metal fabrication Los Angeles | precision metal fabrication, metal fabrication company, stainless and aluminum fabrication | Commercial | H | High | Enclosures, frames |
| 14 | `/locations/glendora-ca/` | metal fabrication near Glendora | welding shop San Gabriel Valley, TIG welding near Glendora, metal fabricator Glendora | Local | L | Low | GBP pin, address |
| 15 | `/about/` | *(brand / E-E-A-T)* | Mark May welder, third-generation welder | Trust | n/a | n/a | Family story |
| 16 | `/contact/` | *(conversion)* | request a quote, welding quote | Conversion | n/a | n/a | Quote form |
| + | Index pages for `/services/`, `/materials/`, `/industries/`, `/locations/` | Hub pages that pass link authority | | | | | |
| 17 | `/industries/supplement-manufacturing-equipment/` *(added 2026-09-18)* | supplement manufacturing equipment | nutraceutical manufacturing equipment, vitamin manufacturing equipment, capsule filling machine components | Commercial | L–M | Low | Capsule filler, hopper, V-blender photos |
| 18 | `/industries/subcontract-welding-machine-shops/` *(added 2026-09-18)* | subcontract welding | welding subcontractor, contract welding companies, machine shop welding services | Commercial (B2B partner) | L–M | Low–Med | Machined bracket production run |

**Why the renames are safe:** none of these URLs has been published yet, so changing them now costs nothing. The spec's "URLs are permanent" rule applies from first publish.

## 5. Writing order (Phase 3)

The order is set by **intent × winnability × proof on hand**: the pages most likely to produce an RFQ soonest come first.

1. `/services/sanitary-welding/`: high intent, no local owner, strong gallery proof.
2. `/industries/pharmaceutical-welding/`: the strongest proof Mark has (cleanroom tablet press work).
3. `/services/tig-welding/`: the core term, and the domain already ranks for it.
4. `/materials/hastelloy-welding/`: weak competition, and the engineer audience is the target.
5. `/services/production-welding/`: Mark's stated money-maker.
6. `/capabilities/`: the page buyers forward to procurement.
7. `/industries/aerospace-welding/` and `/materials/titanium-welding/`, written together around D17.1.
8. `/materials/stainless-steel-welding/`, `/materials/inconel-welding/`, `/materials/aluminum-welding/`
9. `/industries/food-beverage-welding/`, `/services/metal-fabrication/`
10. `/locations/glendora-ca/`, `/about/`, `/contact/`, index pages

## 6. Off-site actions (owner, high leverage)

| Priority | Action | Why |
|---|---|---|
| 1 | **Claim a free Thomasnet listing** at <https://business.thomasnet.com/get-listed-on-thomasnet>. Categories: Precision TIG Welding Services, Stainless Steel Welding Services, Titanium Welding Services, Hastelloy/Monel/Nickel Welding Services, Aerospace Welding Services. | Thomasnet ranks page 1 for almost every SoCal alloy and service search, and buyers search inside it directly. |
| 2 | Change the GBP primary category to **Metal fabricator** (see `google-business-profile.md`). | Map-pack visibility for commercial terms. |
| 3 | Fix the Yelp address (add "St" and ZIP 91740). | Citation consistency. |

## 7. Expansion candidates (post-spine, in priority order)

1. **Stainless steel hopper fabrication.** Real demand, no LA owner, and gallery photos 14–16 prove it.
2. **What AWS D17.1 certification means for your parts** (supporting article). "what is aws d17.1" and "aws d17.1 class a/b/c" are searched, and it builds buyer trust.
3. **Orbital welding** as its own service page, if Mark confirms it's in-house or through a partner.
4. Tablet press stands, feed hoppers and cleanroom fixtures. Autocomplete shows tablet-press parts demand; this is niche but exact-match to Mark's work.
5. Duplex / Monel / 4130 chromoly material pages, if GSC shows impressions.
