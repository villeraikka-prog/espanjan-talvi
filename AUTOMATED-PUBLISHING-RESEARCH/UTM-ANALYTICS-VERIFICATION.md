# UTM-attribution and analytics verification

**Checked:** 2026-11-03
**Scope:** read-only review of the local repository and public Netlify responses. No account dashboards, browser analytics session, or analytics administration settings were accessed.

## Decision

**NO-GO for a Buffer publishing pilot whose success is meant to be measured by campaign attribution.** The publishing queue creates correctly structured UTM URLs, and the tested production routes preserve them, but the only analytics tag found is Cloudflare Web Analytics. Cloudflare explicitly says it does not log query strings and does not yet support UTM parameters. No GA4 tag or other UTM-aware analytics implementation was found.

The Buffer adapter could be developed independently, but it should not be connected to real publishing for a measured Pinterest test until a UTM-capable collector is configured, deployed, and verified in its actual reporting interface.

## Existing tracking implementation

- The local site and all 33 production sitemap pages contain one Cloudflare Web Analytics beacon tag each. Production HTML therefore confirms that the tag is published.
- Searches of the local public source and production HTML found no Google Analytics 4 (`gtag.js` / `G-…` measurement ID), Google Tag Manager, or other analytics tag. Google Search Console verification is present, but it verifies site ownership and is not visitor analytics.
- The repository's privacy page distinguishes the HTML tag from confirmed collection: a tag in HTML does not prove that the beacon request succeeds or that data appears in a Cloudflare report.
- **Tag presence is confirmed; successful event ingestion and visible production reports are not.** Cloudflare account settings, configured site/hostname, beacon requests, and dashboard data were not accessible in this audit.

## Production verification

Direct HTTP GET checks on 2026-11-03 found:

| Check | Result |
|---|---|
| `https://espanjan-talvi.netlify.app/sitemap.xml` | HTTP 200, XML, 33 unique `<loc>` URLs |
| `https://espanjan-talvi.netlify.app/robots.txt` | HTTP 200, text/plain; includes a sitemap directive and does not disallow all crawling |
| Pages listed in the sitemap | All 33 returned HTTP 200; each had one Cloudflare beacon script, a canonical link, and no detected GA4 or GTM tag |

These were HTTP fetches, not browser visits. They establish what the server returned, not that analytics JavaScript ran or that Cloudflare accepted a measurement.

## Can current Cloudflare Web Analytics measure UTMs?

Cloudflare Web Analytics can report aggregate page views, visits, performance metrics, and traffic dimensions such as host, page path, and referrer host. Referrer path is available through its GraphQL API rather than as the same dashboard breakdown. These are useful for broad traffic and performance checks, but they do not identify a campaign or creative from query parameters.

Cloudflare's FAQ answers the UTM question directly: it does not currently log query strings, specifically to avoid collecting potentially sensitive data, and UTM support is not yet available. Thus `utm_source`, `utm_medium`, `utm_campaign`, and `utm_content` cannot be used as campaign dimensions in the current Cloudflare Web Analytics reports. A Pinterest referrer host might be visible when sent by the browser, but that is not a reliable substitute for campaign, medium, or pin-level attribution. [Cloudflare Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/), [dimensions](https://developers.cloudflare.com/web-analytics/data-metrics/dimensions/), [high-level metrics](https://developers.cloudflare.com/web-analytics/data-metrics/high-level-metrics/).

## UTM construction and URL handling

The local queue implementation in `tools/publishing/lib/content.mjs`:

- creates `utm_source`, `utm_medium`, `utm_campaign`, and `utm_content` with `URLSearchParams`;
- defaults Pinterest source to `pinterest` and medium to `organic_social`;
- slugifies values, so the generated medium is `organic-social`;
- uses the campaign slug and content variant for campaign and content values.

The queue README correctly warns that generating a tracked URL does not prove that site analytics records attribution.

### Redirects and canonicals

- A test GET to the Netlify homepage and a Torrevieja profile with a four-field Pinterest UTM query returned 200 and retained the full query string.
- A GET to the equivalent old `pages.dev` profile returned 301 directly to the matching Netlify URL; its `Location` retained the path and all four query parameters, and the final Netlify GET returned 200.
- Netlify's `_redirects` contains the legacy `/aluevertailu` routes only. The Cloudflare Pages middleware is host-specific and constructs the Netlify destination from the incoming pathname **and** search string.
- Canonical tags point to clean Netlify URLs without query strings. A canonical is a search-engine canonicalization hint; it does not itself redirect the browser or remove the landing URL's query string.

These checks show the tested paths preserve query parameters at the HTTP level. They do not guarantee every future redirect, external URL shortener, platform wrapper, browser extension, or consent configuration will preserve or collect them.

### Internal navigation

No site code was found that reads, stores, strips, or propagates UTM parameters. Internal links use ordinary clean URLs, so after a visitor follows one, the browser address no longer contains the initial query. This is not necessarily fatal to a session-based analytics product that successfully records the tagged landing page and its session attribution on entry. It is a limitation for any implementation that expects to recover campaign values later from the current URL, especially if collection is blocked or deferred until after the visitor has navigated away. The present Cloudflare implementation does not provide UTM session attribution either way.

## GA4 status and report capability

GA4 is **not configured in the inspected production HTML or local repository**. There is no evidence in those sources of a GA4 property ID or Google tag. Whether an unconnected GA4 property exists in an account cannot be established from repository files.

Google documents manual UTM fields as traffic-source dimensions. With a working GA4 web data stream and tag, the source, medium, and campaign can be reviewed in **Reports → Acquisition → Traffic acquisition**. `utm_content` maps to the **Session manual ad content** dimension and can be examined by adding that dimension to an Exploration or suitable report. Google also documents Realtime and DebugView for checking incoming events; DebugView requires debug mode. [UTM URL builder](https://support.google.com/analytics/answer/10917952?hl=en), [manual tagging dimensions](https://support.google.com/analytics/answer/11242870?hl=en), [Traffic acquisition report](https://support.google.com/analytics/answer/12923437), [DebugView](https://support.google.com/analytics/answer/7201382).

Google describes the standard GA4 property as the free version. It is the lowest-friction UTM-aware option found in this review, but it adds a third-party analytics tag and requires an explicit decision about data collection, consent/privacy treatment, and the site's privacy description before implementation. No privacy or cookie-policy change is made or proposed silently here. [Google Analytics standard-property support](https://support.google.com/analytics/answer/11828307?hl=en-EN).

## Minimum viable options

| Option | Cost / effort | What it can answer | Assessment |
|---|---|---|---|
| Keep Cloudflare Web Analytics only | No new service or tag | Aggregate visits, pages, performance, and some referrer information; not UTM campaign/content | Does not meet the Pinterest attribution requirement |
| Add a standard GA4 web stream with minimal page-view collection | Standard property is described by Google as free; requires account/property setup, tag deployment, privacy/consent review, and verification | Session source, medium, campaign, landing page; `utm_content` through Session manual ad content | Recommended minimum viable path if the owner accepts GA4 and completes the privacy review |
| Build first-party campaign measurement | Engineering and hosting work; may require a server-side endpoint or a different logging design | Could record selected campaign fields under a deliberately limited schema | Not minimal for this static site; creates implementation, retention, security, and privacy work |

Do not add a paid analytics tool or collect more than the campaign dimensions needed for this pilot. If the owner does not want GA4 or equivalent query-aware measurement, treat the Buffer post as unmeasured and decide separately whether that is acceptable.

## Controlled Pinterest test

Use a unique test campaign and content value. Example, **only after a UTM-aware tag has been approved and deployed**:

```text
https://espanjan-talvi.netlify.app/kohteet/torrevieja/?utm_source=pinterest&utm_medium=organic-social&utm_campaign=phase15-pinterest-20261103&utm_content=pin-test-01
```

The medium matches the publishing queue's current slugified Pinterest default. Do not publish this URL as an external Pinterest post during the measurement test; open it directly in a fresh browser profile so the test is controlled and the campaign is not publicly distributed.

### Procedure and interface verification

1. First configure an approved GA4 property and web data stream, install its tag on all intended indexable pages (including generated destination pages), publish through the normal reviewed release, and document the consent/privacy decision. None of these steps has been performed in this audit.
2. In a fresh browser profile, open the exact URL above. Record the consent choice and avoid ad blockers for the positive test. Confirm in DevTools that the page-view request reaches the intended GA4 measurement endpoint and that the landing URL still has all four parameters. Do not treat the request alone as proof of report attribution.
3. In the correct GA4 property, open **Reports → Realtime** and confirm the test page view/active user appears. If using DebugView, enable debug mode with Tag Assistant and confirm the event there. Realtime/DebugView is an ingestion check; it is not the final campaign report.
4. After standard report processing, open **Reports → Acquisition → Traffic acquisition**. Filter or break down by session source/medium and session campaign. Expected values: source `pinterest`, medium `organic-social`, campaign `phase15-pinterest-20261103`; the landing page should be `/kohteet/torrevieja/`.
5. In **Explore → Free form**, use Session source, Session medium, Session campaign, landing page, and Session manual ad content dimensions with Sessions or Views as the metric. Filter to the unique campaign. Expected content value: `pin-test-01`. This explicitly tests all four fields rather than assuming `utm_content` is shown in the default acquisition table.
6. From the landing page, click one internal link and confirm the browser URL becomes clean. The original session should still be attributed to the tagged entry if its page view was collected. Compare the session report, not the current address bar, to verify persistence.
7. Repeat once as a negative control with analytics blocked or consent declined, where applicable. Do not expect that visit to appear. Remove test visits from any later business interpretation; this is a technical verification, not a traffic-performance experiment.

### Expected reporting result

If the GA4 tag is correctly configured, permitted to run for the test, and the event is accepted, reports should associate the session with Pinterest, `organic-social`, the unique campaign, and its landing page. The content variant should be available as Session manual ad content. Reports may take time to process; a Realtime event does not prove that every standard report dimension is populated. Default channel grouping may classify a custom medium differently than the source/medium dimensions, so assess the raw manual source and medium fields for this test.

## Information not accessible in this audit

No access was available to:

- the Cloudflare Web Analytics dashboard or its configured site, host filters, recent beacons, or report values;
- Netlify deployment/account analytics configuration beyond the public response and repository rules;
- any Google Analytics account/property, stream, measurement ID, consent configuration, or report interface;
- the user's browser consent settings, extensions, or ad blockers.

Therefore this audit cannot claim that Cloudflare beacon events are currently arriving, cannot rule out an unreferenced GA4 property in an account, and cannot show actual Pinterest campaign reports. The public production HTML and repository do establish that no GA4 tag was found in the inspected implementation.

## Exact changes needed before measured Buffer publishing

No files were changed for this research. If GA4 is approved, a later implementation should:

1. Obtain the owner's selected GA4 property/web-stream measurement ID through the account owner; do not invent or expose it in research notes.
2. Agree on minimal page-view-only measurement and the required consent/privacy treatment before editing the policy or installing the tag.
3. Add the approved Google tag to the common page template and destination-page generator so all indexable pages have consistent collection; update the site validator to assert the intended tag count and reject duplicates/placeholders.
4. Publish via the normal reviewed Git/Netlify flow, then run the controlled test above in the actual GA4 interface.
5. Enable Buffer integration for a measured Pinterest pilot only after Realtime/DebugView and processed acquisition dimensions show the expected values.

If the owner declines GA4, leave Buffer publishing unconnected for this attribution-dependent pilot or explicitly accept that campaign attribution will not be available. Cloudflare Web Analytics alone cannot fill the gap.

## Sources

- [Cloudflare Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/) — query-string/UTM handling and beacon behavior.
- [Cloudflare Web Analytics dimensions](https://developers.cloudflare.com/web-analytics/data-metrics/dimensions/) — available traffic dimensions.
- [Cloudflare high-level metrics](https://developers.cloudflare.com/web-analytics/data-metrics/high-level-metrics/) — visits, page views, and performance metrics.
- [Google Analytics URL builders](https://support.google.com/analytics/answer/10917952?hl=en) — UTM fields and Traffic acquisition reporting.
- [Google Analytics manual tagging dimensions](https://support.google.com/analytics/answer/11242870?hl=en) — UTM-to-dimension mapping, including `utm_content`.
- [Google Analytics Traffic acquisition report](https://support.google.com/analytics/answer/12923437) — session source, medium, and campaign reporting.
- [Google Analytics DebugView](https://support.google.com/analytics/answer/7201382) — real-time event troubleshooting.
- [Google Analytics standard-property support](https://support.google.com/analytics/answer/11828307?hl=en-EN) — standard property described as the free version.
- Repository evidence: `tools/publishing/lib/content.mjs`, `tools/publishing/README.md`, `public/_redirects`, `functions/_middleware.js`, production sitemap, robots, and the 33 sitemap page responses.
