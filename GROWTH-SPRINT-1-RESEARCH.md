# Growth Sprint 1 — organic discovery and content baseline

**Checked:** 6 November 2026
**Production:** <https://espanjan-talvi.netlify.app/>
**Purpose:** acquire relevant organic and referral visits. This review does not estimate search volume, keyword difficulty, rankings or traffic that was not measured.

## 1. Baseline and evidence limits

### Production checks before the changes

An HTTP GET of the production `sitemap.xml` returned 200, contained 33 unique URLs, and all 33 listed URLs returned 200 after redirects. The homepage returned 200 and its canonical pointed to the Netlify production origin. `robots.txt` returned 200, allowed crawling and referenced the primary sitemap. These checks establish route availability, not Google indexing.

The repository’s previous production audit recorded self-referencing canonicals, unique titles and descriptions, server-rendered main content, working internal destinations, no missing sitemap anchors, and valid BreadcrumbList data on the directory and 24 profiles. This sprint keeps the existing route structure and adds two static guides. The validator now checks the expanded 35-route set.

The sitemap has no `<lastmod>` values. That is preferable to publishing artificial freshness dates. `sitemap-google.xml` remains a byte-identical alternate copy of the primary sitemap; the site does not need two separately submitted copies, but this sprint does not remove the existing file.

### Search and analytics accounts

Google Search Console and Bing Webmaster Tools dashboards were not available in the connected browser or as account tools in this session. Therefore the following values are **unknown**, not zero:

- Google clicks, impressions, CTR, average position, queries, page indexing and current sitemap report.
- Bing clicks, impressions, crawl/index coverage and sitemap status.
- Cloudflare Web Analytics visitors, referrers, landing pages and data collection status.

The production/source implementation uses Cloudflare Web Analytics. No GA4 or Google Tag Manager implementation was found in the project’s existing tracking audit. The HTML beacon does not establish that production requests are reaching Cloudflare, and the reviewed UTM audit found that Cloudflare Web Analytics does not expose the campaign dimensions required to distinguish UTM source, medium, campaign and content. The new distribution links therefore use clean canonical URLs without UTMs; do not represent them as campaign-measured.

**Measurement baseline recorded:** route and crawlability snapshot above; account-specific traffic baseline unavailable. Once access is available, record the preceding 28 complete days in Search Console and Bing before comparing later periods. Do not backfill missing counts with zero.

## 2. Technical discovery audit

| Check | Evidence / result | Action |
|---|---|---|
| Existing sitemap routes | 33 unique routes; GET 200 for all before changes | Added only the two new guide canonicals; now 35 |
| Robots | 200, `Allow: /`, primary sitemap reference | No change needed |
| Canonicals | Existing production pages use the Netlify origin | New guides use self-referencing Netlify canonicals |
| Redirected legacy route | `/aluevertailu/` is redirected to the homepage and is not in sitemap | No change |
| Sitemap freshness | No `lastmod` values | Leave absent; no artificial freshness signal |
| Internal discovery | Homepage has the primary comparison tool and a directory link; the directory links to 24 profiles | Added contextual homepage links to the two decision guides and Alicante/Torrevieja profiles; directory and profiles link to guides |
| Structured data | Existing 25 destination routes have BreadcrumbList data | New guides also have visible breadcrumbs and BreadcrumbList; no Article/author claims added |
| Mobile crawling | Previous audit simulated Googlebot Smartphone user agent and got 200; this does not reproduce Google rendering | No claim of actual Googlebot render or indexing |
| Old host | The legacy Pages hostname redirects to Netlify; public SEO HTML uses Netlify | No domain or redirect change |

No source supports adding `lastmod`. The sitemap was updated in both existing files, which remain byte-identical. No `sitemap-index.xml` is used.

## 3. Search intent and overlap

Public search results sampled on 6 November 2026 showed practical Finnish material for wintering in Fuengirola, while dedicated no-car comparison material surfaced primarily in English. A focused Finnish search for an Alicante-versus-Torrevieja winter decision guide did not surface a clear one-to-one Finnish guide in this sample. This is a qualitative SERP observation, not proof that no such page exists or a claim about search demand.

Relevant pages reviewed:

- [Fuengirolaan.fi: Talvehtiminen Fuengirolassa](https://fuengirolaan.fi/blog/talvehtiminen-fuengirolassa) — useful locally focused wintering information and practical questions; it is a single-destination guide, not a 24-place transport comparison.
- [The Costas: Torrevieja Without a Car](https://thecostas.es/torrevieja-without-a-car/) — English-language neighbourhood and public-transport coverage, including 2026 network context; service details still require an address/date check.
- [We Love Costa Blanca: Costa Blanca Without a Car](https://welovecostablanca.com/guide/costa-blanca-without-a-car) — English-language regional overview that emphasizes choosing a base carefully.
- [Rantapallo: Torrevieja](https://www.rantapallo.fi/espanja/torrevieja/) — Finnish destination overview. Older prices or transport specifics should be checked against current official sources.
- [Idealista News: living in Torrevieja](https://www.idealista.com/en/news/lifestyle-in-spain/2026/09/10/167353-living-in-torrevieja-best-areas-cost-of-living-and-what-its-like) — English commercial property publisher with neighbourhood and rental context; not independent transport measurement.

### Intent boundaries

| Page | Primary intent | Boundary against cannibalization |
|---|---|---|
| `/` | Compare 24 destinations’ existing climate/rent data in an interactive tool | Keep as the product/tool landing page; do not turn it into a long editorial archive |
| `/kohteet/` | Browse destinations and profiles by area | Directory, not a second comparison article |
| `/espanja-ilman-autoa/` | Compare address-dependent walkability, transit evidence and airport candidates across all 24 destinations | No combined “car-free score”; transport/source comparison is the unique purpose |
| `/alicante-vai-torrevieja/` | Choose between two Costa Blanca cities for a 1–6 month winter stay | Detailed decision guide; homepage keeps its short side-by-side section |
| `/kohteet/torrevieja/` | Understand Torrevieja’s place-specific winter routine and services | Individual profile; not a general 24-city comparison |
| `/talvehtiminen-espanjassa/` | Plan a multi-month stay in sequence | General planning intent, not a specific destination answer |

These boundaries are reflected in titles, introductions and contextual links. Avoid creating another general “Espanjaan talveksi” page unless new evidence shows a distinct unanswered intent.

## 4. Highest-priority existing pages reviewed

Metadata was changed only where there was a clear information issue. The destination directory description had repeated the number 24; it now describes the directory’s distinct utility. Other existing title/description pairs were retained because their intent was already clear. Changes to existing pages primarily add contextual routes to the new guides.

| Page | Intent / target theme | Review result and implemented improvement |
|---|---|---|
| Homepage | Compare Spanish winter destinations | Kept title, description, H1 and tool intact; added links to the two guides and the Alicante/Torrevieja profiles outside the tool’s controls/calculations |
| Destination directory | Browse 24 Spanish winter destinations | Removed redundant count from description, clarified profile/tool relationship, linked both guides |
| General winter guide | Plan a 1–6 month stay in Spain | Existing title/description retained; linked address-based transport comparison in the daily travel section |
| Living costs | Compare sourced, limited cost indicators | Existing metadata retained; linked transport and final airport transfer context to the new guide |
| Rental guide | Check a winter rental before committing | Existing metadata retained; added exact-address transit comparison to the location checklist |
| Budget guide | Enter personal cost assumptions | Existing metadata retained; linked transport guide as a planning input, explicitly without assumed prices |
| Alicante profile | Explore Alicante for wintering | Existing destination metadata/content retained; generated related links to the decision and transport guides |
| Torrevieja profile | Explore Torrevieja for wintering | Added a sourced long-stay section on centre/coast/urbanisations, address-based services, rental caveats and the 2 Nov 2026 bus changes; linked both guides |
| Fuengirola profile | Explore Fuengirola for wintering | Existing profile retained; added the 24-destination transport guide to related links |
| Benidorm profile | Explore Benidorm for wintering | Existing profile retained; added the 24-destination transport guide to related links |

No search-volume or difficulty numbers were added. The two new pages use specific search intents, self-referencing canonicals and static Finnish HTML.

## 5. New content and source method

### `/espanja-ilman-autoa/`

The guide renders 24 rows from existing destination names, route/profile IDs, the approved walkability and public-transport ratings, current public-transport claims and the existing airport-candidate map. It does not introduce or calculate a combined score. Existing destination ratings remain separate and are explicitly described as editorial, not route-frequency measurements or an address-level service guarantee.

Each row links to the destination profile, existing public-transport source(s), and the airport candidates already mapped in the Elinkustannukset data. Airport names link to Aena destination pages. “Mapped candidate” is intentional wording: the field does not claim each airport is nearest, has a Finnish direct flight, or provides a confirmed door-to-door transfer.

Finavia’s published winter-season 2026–27 list shows Alicante and Málaga on Helsinki’s scheduled route list and Málaga on Tampere’s list. The page says the list was published on 8 October 2026 and its destinations were verified on that date. Charter flights are excluded, and visitors are directed to verify their exact date with the airline. Source: [Finavia winter 2026–27 routes](https://www.finavia.fi/fi/uutishuone/2026/reittilistaus-minne-finavian-lentoasemilta-voi-lentaa-talvikaudella-2026-2027).

Other primary sources include the destination-level sources already maintained in `public/assets/destinations.mjs` and `public/assets/destination-scores.mjs`. In particular, [Alicante’s public-transport guide](https://alicanteturismo.com/en/public-transport/), [Torrevieja’s official travel/transit guide](https://turismo.torrevieja.es/es/planifica/como-desplazarse), and the [Torrevieja Council’s 26 October bus notice](https://torrevieja.es/es/noticias/2026-10-26-lineas-1-2-autobus-urbano-conectaran-directamente-centro-sin-transbordo) are linked directly. The council notice says changes to routes 1, 2 and 8 took effect on 2 November 2026; it advises checking current route information.

### `/alicante-vai-torrevieja/`

This guide expands the homepage’s concise comparison into a decision framework: city scale, location choice, public transport, airport/last-mile distinction, long-stay rental evidence limits, fit by daily routine, and a repeatable address test. It reuses official sources and the existing profiles. It does not create prices, population facts, a winner or a composite score.

## 6. Referral distribution opportunities

These are opportunities for a human to use where rules permit, not posts or outreach made by this sprint:

1. [Torrevieja.fi](https://torrevieja.fi/) and its community channels are directly relevant to Finnish residents/visitors. Share a useful answer about address-level bus access only where the group allows resource links.
2. [Costa Blanca Suomi-Seura](https://www.costablancasuomiseura.es/uusisivu/) is a relevant community; use an existing member-resource area or event/resource format if accepted, not cold promotion.
3. [Suomi24’s Spain category](https://keskustelu.prod.suomi24.fi/matkailu/matkakohteet/eurooppa/espanja) is suitable only as a reply to a current question the comparison genuinely answers. No unsolicited thread or repeated link drops.
4. A 16 February 2025 [Espanja.com article on Finnish activities around Costa Blanca](https://espanja.com/jaana-pohjanheimo-costa-blancalla/elakelaiset-harrastavat-aktiivisesti-costa-blancalla/) named Facebook groups “Torreviejan aktiiviset yhdessä”, “PoPa Poppoon Pallo & Puuha” and “Torreviejan suomalaiset tapahtumat” as activity/community channels at that time. This is a dated third-party mention, not confirmation that those groups still exist, accept members, allow resource links or are appropriate for this guide. Their current pages, status and rules were not independently verified; do not target or post in them until a person checks each group directly.
5. Pinterest can distribute separate visual summaries for 24-place transport, Alicante/Torrevieja decisions and winter rental address checks. Use existing project images and clearly identify them as editorial summaries.

Publication-ready Finnish copy is in `GROWTH-SPRINT-1-DISTRIBUTION-DRAFTS.md`. A Facebook reply is included only as an optional response to a current, relevant question; it is not an invitation to post in any named group. No content was published, and no person or organization was contacted.

## 7. Measurement plan and first baseline

The technical baseline is a 33/33 production URL GET snapshot before adding two pages. The actual organic-traffic baseline remains unavailable because Search Console/Bing dashboards were inaccessible and the Cloudflare Analytics report could not be verified. Do not interpret unavailable account figures as zero.

When account access is available:

1. Export the previous 28 complete days in Search Console by page/query: clicks, impressions, CTR, average position, country and device; record date range and export time.
2. Export the same period from Bing Webmaster Tools if the site is verified. If not, verify ownership and submit `https://espanjan-talvi.netlify.app/sitemap.xml` in the dashboard; do not claim submission before it happens.
3. From Cloudflare Web Analytics, if the owner confirms dashboard access and data collection, capture unique visits, referrers, landing pages and top paths. This does not provide the required UTM campaign taxonomy in the reviewed implementation.
4. Preserve a weekly snapshot of the same date windows. Compare pages only after allowing for reporting delays and enough post-publication observation; do not attribute changes solely to the sprint.
5. If campaign-level attribution becomes necessary, obtain explicit privacy/legal approval for a measurement change. Do not add GA4 or cookies as part of this sprint.

No analytics code, tag, privacy statement or cookie behavior was changed.

## 8. Prioritized action plan

Impact is a qualitative expectation, not a traffic forecast. Confidence reflects evidence of search intent and implementation fit.

| Priority | Action | Expected organic/referral effect | Time | Confidence | Status |
|---:|---|---|---|---|---|
| 1 | Publish and internally link `/espanja-ilman-autoa/` | Fills a concrete comparison intent and sends readers to 24 sourced profiles | Medium | Medium | Implemented locally |
| 2 | Publish `/alicante-vai-torrevieja/` and link from the existing home section/profiles | Gives two destinations a distinct decision landing page without replacing the core tool | Medium | Medium | Implemented locally |
| 3 | Keep Torrevieja’s winter/transit details date-aware and address-based | Better answers long-stay queries and avoids stale route claims | Low–medium | Medium-high | Implemented locally; recheck official route page after timetable changes |
| 4 | Request/inspect GSC and Bing exports; establish measured baseline | Finds pages/query impressions and crawl coverage; needed to prioritize from actual search performance | Low once access is granted | High | Waiting on account access; no user action requested in this report |
| 5 | Offer the free guide only in relevant community contexts, using prepared drafts | Can create qualified referral visits and real discovery without mass submissions | Low per accepted contribution | Low–medium | Drafts prepared, not posted |
| 6 | Review title/description CTR only after Search Console query/page data exists | Changes can improve search-result clicks when an impression/title mismatch is evidenced | Low | Low until data | No speculative metadata changes made |

## 9. Release checks

The new pages are generated from `scripts/generate-organic-guides.mjs`; directory/profile pages remain generated by `scripts/generate-destination-pages.mjs`. The `scripts/check-site.mjs` validator now checks guide freshness, the 24-row coverage, the sourced airport candidates, the two sitemap canonicals, and the expanded 35-route inventory. See the sprint completion report for test and deployment results.
