# SEO Implementation Sprint 1 — Performance without SEO regression

Date: 6 November 2026
Environment: local static preview at `http://localhost:4173/`; production was not modified.

## Summary

Implemented responsive AVIF and WebP alternatives for the site's existing JPEG photos, retaining each JPEG as the fallback and keeping the original image dimensions, aspect ratios, crops, alt text, and displayed-size rules. The homepage hero and initially visible destination image remain eager. The three comparison-table header images are deferred on the mobile layout while they are offscreen, then activated as the user scrolls the table; they remain eager on desktop where the table headers are in the initial viewport.

Added two contextual links where the next step was useful: from the general wintering guide to the Alicante–Torrevieja comparison, and from the personal budget calculator to the cost-of-living comparison. No pages, URLs, metadata, comparison data, or comparison calculations were changed.

## Image work

- 60 existing JPEG assets remain unchanged. They cover 30 photo families at the existing full and 700-pixel candidate sizes.
- Added 60 AVIF and 60 WebP files. All 120 files decode successfully and have exactly the same pixel dimensions as their corresponding JPEG fallback.
- Aggregate source-file sizes: JPEG 14,825,821 bytes; AVIF 6,112,707 bytes (58.8% smaller); WebP 9,103,282 bytes (38.6% smaller). These are library totals, not a claim that every visitor downloads every file. Chrome 156 selected AVIF in the browser runs; WebP and JPEG remain format fallbacks.
- Image quality was visually spot-checked on the homepage hero, Torrevieja profile, wintering guide, and Valencia profile at the existing crops and rendered sizes.
- The two new organic decision guides contain no image elements, so no image assets were added to them.

## Performance measurements

These are local lab measurements, not PageSpeed Insights or CrUX field data. Before and after used the same Chrome CDP harness, fresh page/cache-disabled loads, 100 ms emulated latency, 625,000 B/s downstream and 125,000 B/s upstream. Viewports were 390×844 and 1440×900. LCP is the observed browser LCP candidate. Request-byte measurements use the transferred encoded image payloads. Timing is a single run per route and can vary; byte counts are the more repeatable result.

| Route / viewport | LCP before → after | LCP image payload before → after | Initial image payload before → after | CLS before → after |
| --- | ---: | ---: | ---: | ---: |
| Home, mobile | 992 → 724 ms (hero image) | 91,912 → 44,828 B (−51.2%) | 409,606 → 105,764 B (−74.2%) | 0 → 0 |
| Home, desktop | 1,428 → 856 ms (hero image) | 208,292 → 121,774 B (−41.5%) | 525,986 → 238,352 B (−54.7%) | 0.00408 → 0.00408 |
| Wintering guide, mobile | 728 → 584 ms (text paragraph) | Not the LCP element | 393,044 → 162,888 B (−58.6%) | 0 → 0 |
| Wintering guide, desktop | 852 → 660 ms (guide image) | 185,942 → 64,341 B (−65.4%) | 185,942 → 237,547 B (+27.8%) | 0 → 0 |
| Rental guide, desktop | 656 → 552 ms (image) | 90,626 → 30,757 B (−66.1%) | 90,626 → 30,757 B (−66.1%) | 0 → 0 |
| Budget, desktop | 864 → 572 ms (image) | 190,704 → 88,161 B (−53.8%) | 190,704 → 88,161 B (−53.8%) | 0 → 0 |
| Cost of living, desktop | 748 → 564 ms (image) | 98,975 → 45,080 B (−54.5%) | 98,975 → 45,080 B (−54.5%) | 0 → 0.00096 |
| Torrevieja profile, desktop | 756 → 596 ms (image) | 155,153 → 60,936 B (−60.7%) | 155,153 → 60,936 B (−60.7%) | 0 → 0 |
| Orihuela Costa profile, desktop | 692 → 544 ms (image) | 110,639 → 58,447 B (−47.2%) | 110,639 → 58,447 B (−47.2%) | 0 → 0 |
| Valencia profile, desktop | 840 → 648 ms (image) | 207,102 → 98,547 B (−52.4%) | 207,102 → 98,547 B (−52.4%) | 0 → 0 |

The wintering guide desktop row is a mixed result: its LCP image became substantially smaller and appeared earlier, but the after run also requested a second guide image (`valencia-market.avif`, 173,206 bytes) during the initial-load measurement window. The total initial image payload therefore rose in that run. No visible or first-viewport image was made lazy merely to improve the aggregate. This should be rechecked in a production-like repeat run before claiming a whole-page byte reduction for that route.

Home comparison-table header images were not requested in the initial mobile state. After vertically scrolling to the table and horizontally scrolling across it, the Torrevieja, Málaga, and Águilas header images loaded as AVIF. Desktop retains eager loading for the visible table headers. The homepage's initial selected-destination photo and hero loaded normally.

## Browser and route QA

- Ran 20 local route/viewport combinations: home, wintering guide, no-car guide, Alicante-vs-Torrevieja guide, rental, budget, living costs, Torrevieja, Orihuela Costa, and Valencia, each at 390×844 and 1440×900.
- All tested pages had no horizontal overflow, no application JavaScript console errors, and no failed local image requests. LCP and CLS were recorded for each run.
- Tested repeated homepage switching through Torrevieja → Alicante → Benidorm → Fuengirola → Torrevieja. Headings and responsive images updated correctly; comparison-table values remained unchanged.
- Tested mobile comparison-table vertical and horizontal scrolling. Initially deferred header photos loaded after the horizontal scroll brought each column into view. Final document width remained equal to the 390-pixel viewport.
- A request to the existing Cloudflare Web Analytics RUM endpoint failed in localhost (`https://cloudflareinsights.com/cdn-cgi/rum`, `net::ERR_FAILED`). The analytics tag was not changed; this local-only external request failure was not an application asset failure.
- Local HTTP sweep: all 35 sitemap routes returned 200; 187 unique local asset candidates discovered in HTML `src`, `href`, and `srcset` returned 200. No sitemap route or canonical changed.

## Internal links

Added:

- General wintering guide → `/alicante-vai-torrevieja/`, as a relevant next step for readers choosing between two winter bases.
- Budget calculator → `/elinkustannukset/`, distinguishing the personal calculator from the destination-level comparison.

Reviewed homepage, destination profiles and directory, guides, rental, budget and cost pages. Existing relevant paths were already connected; no repeated keyword-focused links were added elsewhere.

## Validation

- `node scripts/check-site.mjs` — PASS (35 indexable pages and matching canonical sitemap URLs; internal resource targets and site checks passed).
- `node scripts/generate-destination-pages.mjs --check` — PASS (25 static destination pages).
- `node scripts/generate-organic-guides.mjs --check` — PASS (2 guides).
- `node --check public/assets/area-comparison.mjs` — PASS.
- `node --check scripts/generate-destination-pages.mjs` — PASS.
- `node --check scripts/generate-organic-guides.mjs` — PASS.
- `git diff --check` — PASS. Git printed line-ending conversion notices (LF to CRLF) for modified text files; no whitespace errors were found.
- All 35 routes retain their existing canonical URL, and the existing sitemap remains at 35 unique routes.

## Files changed

Modified tracked files:

- `IMAGE-SOURCES.md`
- `public/assets/area-comparison.mjs`
- `public/assets/site.css`
- `public/index.html`
- `public/budjetti/index.html`
- `public/elinkustannukset/index.html`
- `public/talvehtiminen-espanjassa/index.html`
- `public/vuokraus/index.html`
- `public/kohteet/index.html`
- All 24 generated `public/kohteet/<slug>/index.html` profile pages
- `scripts/check-site.mjs`
- `scripts/generate-destination-pages.mjs`

Added files:

- 120 modern image alternatives in `public/assets/`: `.avif` and `.webp` derivatives at the existing full and `-700` sizes for all 60 registered JPEG files.
- This report: `SEO-IMPLEMENTATION-SPRINT-1.md`.

## Deliberately not changed

- No URL, canonical, sitemap, robots, title, description, or other metadata changes.
- No content strategy, new page, article, destination, or schema changes.
- No JPEG source, quality, crop, alt text, intrinsic dimensions, or comparison data/calculation changes.
- No layout redesign, new dependency, hosting change, analytics change, or third-party script change.
- No PageSpeed score, CrUX result, ranking gain, or indexing improvement is claimed. Those require production or field measurement.

## Conclusion

The browser lab shows substantial reductions in the homepage and most tested image LCP payloads, and lower observed LCP times in the paired runs. Mobile homepage initial image payload fell by 74.2%, with the offscreen comparison header images deferred until needed. These changes are expected to improve transfer efficiency and mobile experience, but ranking impact is unproven. The wintering guide desktop initial-image-payload increase noted above remains a measurement caveat. Production has not been deployed or tested in this sprint.
