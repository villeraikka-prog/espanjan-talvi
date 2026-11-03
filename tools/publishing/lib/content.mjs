import crypto from 'node:crypto';

export const PLATFORM_RULES = Object.freeze({
  pinterest: { mode: 'buffer_candidate', mediaTypes: { pin_image: ['raster_image'] } },
  linkedin: { mode: 'buffer_candidate', mediaTypes: { post: [], image_post: ['raster_image'], article: [] } },
  facebook: { mode: 'buffer_candidate', mediaTypes: { page_post: [], page_image: ['raster_image'] } },
  youtube: { mode: 'future_draft', mediaTypes: { video: ['video'] } },
  medium: { mode: 'manual_draft', mediaTypes: { article: [] } },
  reddit: { mode: 'manual_draft', mediaTypes: { text_post: [], link_post: [] } }
});

export function slugify(value) {
  return String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function stableStringify(value) {
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + stableStringify(value[key])).join(',') + '}';
  }
  return JSON.stringify(value);
}

export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function cleanUtmValue(value, name) {
  const cleaned = slugify(value);
  if (!cleaned || cleaned.length > 80) throw new Error(`UTM ${name} must be a short lowercase slug.`);
  return cleaned;
}

export function createUtm(platform, campaignSlug, variant, overrides = {}) {
  const sourceDefaults = { facebook: 'facebook', linkedin: 'linkedin', pinterest: 'pinterest', youtube: 'youtube', medium: 'medium', reddit: 'reddit' };
  const mediumDefaults = { facebook: 'organic_social', linkedin: 'organic_social', pinterest: 'organic_social', youtube: 'organic_video', medium: 'referral', reddit: 'community' };
  const utm = {
    source: cleanUtmValue(overrides.source ?? sourceDefaults[platform] ?? platform, 'source'),
    medium: cleanUtmValue(overrides.medium ?? mediumDefaults[platform] ?? 'referral', 'medium'),
    campaign: cleanUtmValue(overrides.campaign ?? campaignSlug, 'campaign'),
    content: cleanUtmValue(overrides.content ?? variant, 'content')
  };
  return utm;
}

export function makeTrackedUrl(targetUrl, utm) {
  const url = new URL(targetUrl);
  if (url.search || url.hash) throw new Error('The base target URL must not contain a query or fragment.');
  url.searchParams.set('utm_source', utm.source);
  url.searchParams.set('utm_medium', utm.medium);
  url.searchParams.set('utm_campaign', utm.campaign);
  url.searchParams.set('utm_content', utm.content);
  return url.href;
}

export function buildContentHash(item, campaign, media = []) {
  const exact = {
    campaign: { id: campaign.id, slug: campaign.slug },
    platform: item.platform,
    channel: item.channel,
    contentType: item.contentType,
    variant: item.variant,
    title: item.title,
    body: item.body,
    purpose: item.purpose,
    factualClaims: item.factualClaims,
    sources: item.sources,
    unresolvedClaims: item.unresolvedClaims,
    targetUrl: item.targetUrl,
    targetReason: item.targetReason,
    utm: item.utm,
    trackedUrl: item.trackedUrl,
    scheduledAt: item.scheduledAt,
    media: media.map(asset => ({
      sha256: asset.sha256,
      sourceUrl: asset.source_url, creator: asset.creator, rightsStatus: asset.rights_status,
      license: asset.license, attribution: asset.attribution, width: asset.width,
      height: asset.height, mimeType: asset.mime_type, fileType: asset.file_type,
      mediaKind: asset.media_kind, altText: asset.alt_text, platformReady: Boolean(asset.platform_ready)
    }))
  };
  return sha256(stableStringify(exact));
}

export function jsonArray(value) {
  try { const parsed = JSON.parse(value ?? '[]'); return Array.isArray(parsed) ? parsed : []; }
  catch { return []; }
}

export function itemFromRow(row) {
  return {
    id: row.id, campaignId: row.campaign_id, platform: row.platform, channel: row.channel,
    contentType: row.content_type, variant: row.variant, title: row.title, body: row.body,
    purpose: row.purpose, factualClaims: Boolean(row.factual_claims),
    sources: jsonArray(row.sources_json), unresolvedClaims: jsonArray(row.unresolved_claims_json),
    targetUrl: row.target_url, targetReason: row.target_reason,
    utm: (() => { try { return JSON.parse(row.utm_json || '{}'); } catch { return {}; } })(),
    trackedUrl: row.tracked_url, mediaIds: jsonArray(row.media_ids_json), scheduledAt: row.scheduled_at,
    validation: (() => { try { return JSON.parse(row.validation_json || '{}'); } catch { return {}; } })(),
    contentHash: row.content_hash, duplicateKey: row.duplicate_key, approvalState: row.approval_state,
    approvedHash: row.approved_hash, approvedAt: row.approved_at, status: row.status,
    createdAt: row.created_at, updatedAt: row.updated_at
  };
}
