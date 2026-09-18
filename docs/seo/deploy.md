# Deploying the Astro Site to Cloudflare

The old site was plain files with **no build step**. The new site must be built (`npm run build` → `dist/`). The Cloudflare build settings therefore have to change **before** this branch merges to `main`.

## 1. Check which kind of Cloudflare project this is
In the Cloudflare dashboard, go to **Workers & Pages** and open the weldcreations project.
- **"Pages"** badge → continue with section 2.
- **"Worker"** (static assets) → stop and record that here. That deploy path needs a `wrangler.jsonc` with `assets.directory = "./dist"` plus a build command, which would be a small follow-up task.

## 2. Pages build settings
Go to Settings → Build → Build configuration:

| Setting | Value |
|---|---|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` (leave empty) |

The Node version comes from `.node-version` (24). If Cloudflare ignores that file, add an environment variable `NODE_VERSION` = `24`.

## 3. Cutover checklist
1. Change the build settings (section 2) **before** merging. Production keeps serving the last successful deployment until the next build, so changing settings alone breaks nothing.
2. Push the branch. Cloudflare builds a **preview** deployment. Production is unaffected.
3. Open the preview URL and check:
   - [ ] the homepage looks right on desktop and phone
   - [ ] the gallery opens full-size photos
   - [ ] `/robots.txt` and `/sitemap-index.xml` load
   - [ ] `/does-not-exist/` shows the branded 404 page
4. Run **PageSpeed Insights** on the preview: `https://pagespeed.web.dev/analysis?url=<preview-url>`. Targets: SEO ≥ 90, Accessibility ≥ 90, Performance ≥ 90 on mobile. Record the scores below.
5. Submit one quote from the preview with "TEST" in the message, and confirm the email arrives. If `PUBLIC_GA4_ID` is set, also confirm that `generate_lead` shows up in GA4 → Admin → DebugView.
6. Merge to `main`. Then check `https://weldcreations.com/`, `/robots.txt`, `/sitemap-index.xml` and `/does-not-exist/` (should return 404) on the live domain.
7. **Rollback, if needed:** Workers & Pages → the project → Deployments → the previous deployment → ⋯ → **Rollback to this deployment**. It takes seconds.

## Scores

| Date | URL | Performance (mobile) | Accessibility | Best Practices | SEO |
|---|---|---|---|---|---|
| | | | | | |

## Local measurements (2026-09-18, headless Chromium)

| | Live site | New build |
|---|---|---|
| Bytes on first load, desktop | 15.55 MB | 1.74 MB |
| Bytes on first load, mobile | 17.90 MB | 1.55 MB |
| Render-blocking stylesheets | 5 (4 third-party) | 2 (same-origin) |
| Deployable output | ~60 MB repo root | 6.4 MB `dist/` |
