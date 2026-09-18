# AI Assistant & Search Visibility: Owner Checklist

**Why this matters:** ChatGPT, Copilot, Perplexity and Google's AI answers increasingly decide which suppliers a buyer hears about first. Buyers who arrive from AI assistants also convert at several times the rate of ordinary search visitors. The website side is done: structured data, fresh content, guides, `llms.txt` and lead-source tracking. What's left, and what decides whether an assistant *names* Weld Creations, is mostly off-site. It needs account access, so it's on you and Mark.

Items are in priority order.

## 1. Bing Places for Business: highest priority (15 min)
ChatGPT looks up local businesses through Bing, and Bing's local index is fed by Bing Places.
1. Go to <https://www.bingplaces.com> and sign in with a Microsoft account.
2. Choose **Import from Google Business Profile**. This copies the name, address, phone, hours, categories and photos.
3. Check the address matches: `2041 E Gladstone St, Unit Q, Glendora, CA 91740`.
4. Categories: Metal fabricator (primary), Welder.
5. Verify (usually by phone or email for imported listings).

## 2. Bing Webmaster Tools + Cloudflare Crawler Hints (10 min)
- <https://www.bing.com/webmasters> → **Import from Google Search Console** (after Search Console is set up).
- Cloudflare → weldcreations.com → **Caching → Configuration → Crawler Hints: On**. This pings Bing through IndexNow whenever a page changes, so ChatGPT's search layer sees updates quickly.

## 3. Confirm AI crawlers are allowed (2 min)
Cloudflare → weldcreations.com → **Security → Bots** and **AI Crawl Control** (the names vary by plan). Make sure AI search crawlers are **allowed**, not blocked, and that no "managed robots.txt" is blocking AI bots.
Last check from the outside (2026-09-18): GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, Claude-SearchBot, Applebot, Googlebot and Bingbot all got a 200 response.

## 4. Reviews: the biggest off-site signal (ongoing)
AI assistants and Google's map pack both favor businesses with a steady stream of real reviews. Business customers rarely leave reviews unless asked, so ask.
- **Goal:** get to 25+ Google reviews, then 2–4 new ones every month.
- **Who to ask:** past customers Mark did good work for, especially pharma, food, supplement and aerospace customers and the machine shops he subcontracts for.
- **Get the review link:** Google Business Profile → **Ask for reviews** → copy the link.
- **Never** buy, incentivize or write fake reviews. Google removes them and penalizes the listing.

### Review request email (Mark sends it personally)

> **Subject:** Quick favor from Weld Creations
>
> Hi [Name],
>
> Thanks again for trusting us with [the hopper rebuild / the bracket run / project]. If you were happy with the work, would you take a minute to leave a quick Google review? It helps other engineers and buyers find us.
>
> [review link]
>
> A sentence about the part, the material or how it turned out is perfect. For example: "Mark rebuilt our stainless feed hopper and it fit perfectly."
>
> Thanks,
> Mark May
> Weld Creations · (626) 675-4239

Specific reviews that mention the material, industry or part type ("sanitary stainless hopper", "titanium bracket") help most. Those words become what AI assistants associate with the business.

## 5. Consistent listings everywhere (1–2 hours total)
AI assistants skip businesses whose details disagree across the web. Use **exactly** this everywhere:

```
Weld Creations
2041 E Gladstone St, Unit Q
Glendora, CA 91740
(626) 675-4239
https://weldcreations.com/
```

| Listing | Action |
|---|---|
| Google Business Profile | Change the primary category to **Metal fabricator** (see `google-business-profile.md`) |
| Bing Places | Section 1 |
| Yelp | Fix the address: add "St" and ZIP 91740 |
| **LinkedIn company page** | Create a "Weld Creations" company page (only Mark's personal profile exists today). Link it from Mark's profile. Then tell me the URL and I'll add it to the site's structured data. |
| Thomasnet | Claim the free listing (see `keyword-map.md` §6). Then tell me the URL. |
| Apple Business Connect | <https://businessconnect.apple.com>, which feeds Apple Maps and Siri |
| Glendora Chamber of Commerce | A member directory listing is a trusted local citation |

After each new listing goes live, send me the URL and I'll add it to the site's `sameAs` links, so search engines and AI tools can connect all the profiles to one business.

## 6. GA4: see AI traffic separately (10 min)
GA4 → Admin → **Channel groups** → copy the default group → add a channel named **AI assistants** *above* "Referral", with the rule: *Source matches regex* `chatgpt\.com|openai\.com|perplexity\.ai|copilot\.microsoft\.com|gemini\.google\.com|claude\.ai`.

The quote form also records **"How did you find us?"** (it includes "ChatGPT or another AI assistant") and the visitor's first **referrer**. Both appear in every lead email and in the `generate_lead` event. Register `lead_source` and `referrer_host` as custom dimensions in GA4 to report on them.

## 7. Monthly AI check (15 min, first Monday of the month)
Ask each question in **ChatGPT (with search on)**, **Perplexity**, **Google (look at the AI Overview)** and **Copilot**. Record whether Weld Creations is named or linked, and which pages are cited.

1. Who does sanitary stainless steel welding in Los Angeles?
2. I need a shop to weld Hastelloy C-276 in Southern California. Who should I call?
3. Best TIG welding company near Glendora, CA for production parts?
4. Who can fabricate replacement hoppers for a tablet press or capsule filler in LA?
5. AWS D17.1 certified welders in the San Gabriel Valley?
6. Titanium welding services in Los Angeles County?
7. Subcontract TIG welding for machine shops near Pomona / Covina / Azusa?
8. What should I ask a sanitary welding company before hiring them?

| Month | ChatGPT | Perplexity | Google AI Overview | Copilot | Notes |
|---|---|---|---|---|---|
| | | | | | |

Expect it to take weeks to months for new pages, listings and reviews to show up in AI answers. The trend over several months is what matters.

## What the website already does (for reference)
- A structured-data entity graph: business, Mark May as a Person with AWS D17.1, `knowsAbout`, an offer catalog linking every service page, geo pin, and Google Maps `sameAs`
- Service, WebPage, BreadcrumbList and FAQ data on every service, material, industry and location page; Article data on guides
- Visible "Updated" dates that match `dateModified`
- Buyer's guides written to be cited: AWS D17.1 explained, and how to choose a sanitary welding company
- Answer-first page openings, technical tables and FAQs
- `/llms.txt`, a sitemap, and robots.txt that allows all crawlers
- Mobile Lighthouse 100 for performance and accessibility on the pages tested
