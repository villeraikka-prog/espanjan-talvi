# Local publishing queue — Phase 1

This folder contains a local-only preparation queue for Espanjan Talviarki. It can save campaign drafts, validate them, render a Markdown preview, approve a content-hashed batch and export the approved drafts as JSON.

**Nothing in Phase 1 contacts a social platform, publishes, uploads, or schedules content.** There is no Buffer adapter, account connection, API key handling, or publishing command. Pinterest is labelled a future Buffer candidate; LinkedIn and Facebook are intended channels only; YouTube is future/draft-only; Medium and Reddit are manual drafts.

## Requirements and installation

- Node.js 24 or later. The implementation uses Node's built-in `node:sqlite`; no npm package or install step is required.
- Run commands from the repository root. No `package.json` or website build configuration is needed.

Check the runtime and initialize the local queue:

```powershell
node --version
node tools/publishing/cli.mjs init
node tools/publishing/cli.mjs status
node tools/publishing/cli.mjs help
```

Run the automated tests:

```powershell
node --test tools/publishing/test/queue.test.mjs
```

## Local storage and privacy

By default, the queue stores its SQLite database, imported media, and exports under:

```text
%LOCALAPPDATA%\EspanjanTalviarki\publishing-queue\
```

The files are kept outside Git and outside the static `public/` site. The database uses SQLite schema versioning (`PRAGMA user_version`), foreign keys, a busy timeout, and WAL mode. Existing databases with a newer schema are refused rather than downgraded. Do not put passwords or access tokens in queue fields. The `platform_accounts` table contains only an optional future token *reference*, not the secret itself; Phase 1 does not connect accounts. The local data is not encrypted by this tool, so use the Windows account's normal device protections and make encrypted backups if needed.

To use another local directory, set an external path before invoking the CLI:

```powershell
$env:ESPANJAN_TALVIARKI_PUBLISHING_DATA_DIR = 'D:\LocalData\EspanjanTalviarki\publishing-queue'
node tools/publishing/cli.mjs init
```

The CLI rejects a data path that resolves inside the repository. Media and exports are created under the selected data directory. Media import copies files into managed storage and does not change the source file. Export refuses to overwrite an existing file and rejects destinations resolving inside the repository.

## Target URL allowlist

`targets list` reads the current `public/sitemap.xml`; it does not maintain a second, hand-copied URL table. Each sitemap URL must use the configured canonical origin `https://espanjan-talvi.netlify.app`, be a unique clean path, and map to an existing local `public/.../index.html` file. Unknown hosts and paths, query strings, fragments, credentials, encoded paths, and malformed URLs are rejected. UTM parameters are added separately to the tracked URL. If the canonical domain changes, review and update `VERIFIED_ORIGIN` in `lib/targets.mjs` deliberately.

```powershell
node tools/publishing/cli.mjs targets list
```

No target URL is fetched. Current HTTP availability and indexability are not inferred from the local sitemap.

## Campaign and item workflow

Create a campaign; the slug is derived from the name unless supplied:

```powershell
node tools/publishing/cli.mjs campaign create --name "Talviopas 2026" --topic "Talvehtiminen" --objective "Auttaa lukijaa vertailemaan kohteita"
node tools/publishing/cli.mjs campaign list
```

Create an item JSON file outside the repository when it may contain private notes. Example structure (replace placeholders with reviewed content and real sources before approval):

```json
{
  "platform": "pinterest",
  "channel": "Pinterest Business (intended channel; not connected)",
  "contentType": "pin_image",
  "variant": "torrevieja-winter-guide-01",
  "title": "A useful, specific title",
  "body": "The complete publication text, written for the selected platform.",
  "purpose": "What reader need this post serves.",
  "factualClaims": true,
  "sources": [
    {
      "title": "Source title",
      "url": "https://www.mapa.gob.es/es/alimentacion/temas/consumo-tendencias/panel-de-consumo-alimentario/",
      "checkedOn": "2026-11-03",
      "supports": "The exact factual claim this source supports.",
      "verified": true
    }
  ],
  "unresolvedClaims": [],
  "targetUrl": "https://espanjan-talvi.netlify.app/kohteet/torrevieja/",
  "targetReason": "Why this page is the useful destination for the reader.",
  "utm": {},
  "mediaIds": [],
  "scheduledAt": null
}
```

Use a verified, real source for factual claims. The `verified` flag is an operator attestation; Phase 1 does not fetch or independently check source pages. Creative copy with no factual claims can set `factualClaims` to `false`; do not use that to conceal factual statements. Any unresolved claims or unverified source blocks approval. Reserved placeholder domains such as `example.com` are rejected.

The accepted platform identifiers and content types are:

| `platform` | `contentType` | Media needed for approval |
| --- | --- | --- |
| `pinterest` | `pin_image` | Platform-ready raster image |
| `linkedin` | `post`, `article` | None |
| `linkedin` | `image_post` | Platform-ready raster image |
| `facebook` (Page intent) | `page_post` | None |
| `facebook` (Page intent) | `page_image` | Platform-ready raster image |
| `youtube` | `video` | MP4; remains future/draft-only |
| `medium` | `article` | Manual draft |
| `reddit` | `text_post`, `link_post` | Manual draft |

These values identify draft destinations only; there are no connected accounts or platform calls.

```powershell
node tools/publishing/cli.mjs item create --campaign CAMPAIGN_ID --file .\draft.json
node tools/publishing/cli.mjs item list CAMPAIGN_ID
node tools/publishing/cli.mjs item validate ITEM_ID
node tools/publishing/cli.mjs item update ITEM_ID --file .\revised-draft.json
```

`item update` supplies the full replacement item. A content change to an approved item clears its approval and marks it invalidated; it must be reviewed and approved again. An approval event keeps a local snapshot and hash for the previous approved version. There is no item deletion command in this phase.

## Sources, media, and rights

Every media manifest asset must state its original source, creator, rights basis, license, explicit attribution instructions, and descriptive alt text. `No attribution required` is an explicit instruction, not an empty field. Rights must be `owned`, `permission_granted`, `public_domain`, or `licensed`; unclear and non-commercial-only terms are rejected for this potentially monetized project. The tool records but does not independently establish that the rights claim is true.

Supported imports: JPEG, PNG, WebP, SVG, HTML graphic source, and MP4 (maximum 250 MiB per file). Raster image dimensions are read from the file. SVG and HTML graphic sources are checked for active content and external/linked resource references; they remain source graphics and are not treated as platform-ready raster uploads. HTML graphic source needs explicit width and height. MP4 signature is checked and width/height must be supplied in the manifest; Phase 1 does not probe video metadata. JPEG/PNG/WebP are marked platform-ready after signature/dimension checks; that does not replace a human visual or platform-format review. YouTube remains draft-only even for MP4.

Media manifest example:

```json
{
  "assets": [
    {
      "file": "./licensed-image.jpg",
      "sourceUrl": "https://www.pexels.com/license/",
      "creator": "Photographer name",
      "rightsStatus": "licensed",
      "license": "CC BY 4.0",
      "attribution": "Credit Photographer name; crop made for this graphic.",
      "altText": "Describe the meaningful image content",
      "width": 1600,
      "height": 1000
    }
  ]
}
```

Relative media paths resolve from the manifest file. The source can be outside the repo, or a Git-tracked asset in `public/assets/`; arbitrary other files inside the repo and untracked repo assets are refused. The example source is illustrative; replace it with the exact page for the imported asset before use.

```powershell
node tools/publishing/cli.mjs media import --file .\media-manifest.json
node tools/publishing/cli.mjs media list
```

`pin_image` and `image_post` / `page_image` require compatible platform-ready raster media. A missing, changed, or rights-incomplete asset blocks approval/export. No paid image-generation API is used.

## Validation, preview, approval, export

```powershell
node tools/publishing/cli.mjs batch preview CAMPAIGN_ID
node tools/publishing/cli.mjs batch approve CAMPAIGN_ID
node tools/publishing/cli.mjs batch export CAMPAIGN_ID
```

Preview is Markdown written to stdout. It shows campaign, platform and intended channel, full copy, purpose, base and tracked target URLs, UTM, schedule field, media paths/dimensions/alt/rights/attribution, sources, validation errors, approval state, and the current content hash.

Validation checks required fields, sitemap target membership, source completeness and verification, unresolved claims, platform/content-type compatibility, media metadata and current file hash, UTM format, and duplicates. The UTM base URL stays separately stored from the tracked URL. Parameters are generated once with `URLSearchParams`; they are not evidence that site analytics currently records campaign attribution.

`batch approve` is all-or-nothing: every item must validate at approval time. Approval is bound to a SHA-256 hash covering campaign, platform, channel, type, variant, exact text, purpose, factual/source metadata, target and reason, UTM/tracked URL, schedule and media metadata/checksums. Editing approved content invalidates the approval. Export rechecks approval, validation, media hashes and the approved hash, and writes only a local JSON draft package with `externalPublicationEnabled: false`. Export uses exclusive file creation and never overwrites.

Duplicate prevention uses campaign + platform + channel + variant + content hash. This prevents duplicate local drafts in the same batch; it is not remote idempotency. Phase 2 will need platform/Buffer IDs, request idempotency where available, and remote-state reconciliation before any external publishing.

## Status and Phase 2 boundary

`status` reports local campaign, item, approved-item, media, intended-account and current sitemap-target counts. Item states describe only this local queue (`draft`, `validated`, `approved`, `invalidated`); they do not mean that an external post exists. No Buffer API calls or accounts are implemented.

Phase 2 should be a separate reviewed change: decide and connect the first real channel, add a Buffer adapter, retrieve credentials from an OS credential store rather than the database/files, implement a dry-run and kill switch, test media upload and rate limits, add remote post IDs/status reconciliation, and validate public visibility/target links after posting. First confirm that UTM attribution is observable in the site's analytics. Require a fresh human approval of the exact payload before any external submission.
