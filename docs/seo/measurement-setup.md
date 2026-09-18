# Measurement Setup (owner steps)

Do these in order. Each needs account access, so none can be done from code. The site builds and runs correctly before any of them are done. GA4 simply stays off until step 2.

This deliberately differs from spec §7: Search Console is verified by **DNS**, not HTML meta tags. DNS verification is stronger, covers every host variant (apex, www, http, https), and needs no code change.

## 1. Create the GA4 property
1. Go to <https://analytics.google.com>, then Admin → Create → Property. Name it **Weld Creations**, time zone Pacific, currency USD.
2. Add a **Web** data stream for `https://weldcreations.com`.
3. Copy the **Measurement ID** (it looks like `G-XXXXXXXXXX`).

## 2. Give the ID to the Cloudflare build
1. Cloudflare dashboard → Workers & Pages → the weldcreations project → Settings → Variables and Secrets.
2. Add a plain-text variable `PUBLIC_GA4_ID` with the Measurement ID as its value, for **both Production and Preview**.
3. Redeploy. The value is read at build time, so it takes effect on the next build.

## 3. Mark quote requests as a key event
1. Submit one real test quote on the site. Put "TEST" in the message so Mark knows to ignore it.
2. In GA4 → Admin → Events, wait for `generate_lead` to appear (this can take up to 24 hours).
3. Toggle it on as a **key event**. That is what "conversions" means in GA4.

The event carries `material`, `quantity` and `landing_page`. To report on them, register each one under GA4 Admin → Custom definitions → Create custom dimension (event scope).

## 4. Google Search Console
1. Go to <https://search.google.com/search-console> → Add property → **Domain** → `weldcreations.com`.
2. Verify it with the DNS TXT record. Because the DNS is on Cloudflare, Google offers to add the record automatically. Accept that.
3. Go to Sitemaps and submit `https://weldcreations.com/sitemap-index.xml`.

## 5. Bing Webmaster Tools
Go to <https://www.bing.com/webmasters> → **Import from Google Search Console**. This also feeds Bing Copilot and DuckDuckGo.

## 6. Microsoft Clarity
Clarity is already live (project `n18eppb8di`). Optionally, connect it to GA4 in Clarity → Settings → Setup, so you can watch session recordings of visitors who submitted a quote.

## 7. Record the baseline (Day 0)
Take a screenshot of the Search Console Performance report. It will be nearly empty, and that's expected. Write the date here: **Day 0 = ____________**. The spec's 60-day data checkpoint counts from this date.

## 8. Decision needed: privacy policy
Running GA4 plus a form that collects names, emails and phone numbers means the site should have a privacy policy (California / CCPA). It's not in the Phase 0–1 scope, so it's flagged here for a decision. It is a short page to add.
