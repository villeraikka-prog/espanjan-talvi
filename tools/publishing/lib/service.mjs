import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { REPOSITORY_ROOT, isPathInside } from './config.mjs';
import { buildContentHash, itemFromRow, PLATFORM_RULES } from './content.mjs';
import { fileSha256 } from './media.mjs';
import { validateItemData } from './validation.mjs';

const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();

export function createCampaign(db, input) {
  if (!input?.name?.trim()) throw new Error('Campaign name is required.');
  const slug = String(input.slug ?? input.name).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (!slug) throw new Error('Campaign needs a non-empty slug.');
  if (slug.length > 80) throw new Error('Campaign slug must be 80 characters or fewer.');
  const timestamp = now();
  const campaign = { id: id(), name: input.name.trim(), slug, topic: String(input.topic ?? '').trim(), objective: String(input.objective ?? '').trim(), status: 'draft', createdAt: timestamp, updatedAt: timestamp };
  try {
    db.prepare('INSERT INTO campaigns (id, name, slug, topic, objective, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(campaign.id, campaign.name, campaign.slug, campaign.topic, campaign.objective, campaign.status, timestamp, timestamp);
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) throw new Error(`Campaign slug already exists: ${slug}`);
    throw error;
  }
  return campaign;
}

export function listCampaigns(db) {
  return db.prepare('SELECT * FROM campaigns ORDER BY created_at, name').all();
}

function getCampaign(db, campaignId) {
  return db.prepare('SELECT * FROM campaigns WHERE id = ?').get(campaignId) ?? null;
}

function normalizeItem(input, campaignId, existingId = null) {
  const factualClaims = input?.factualClaims === undefined ? true : input.factualClaims;
  if (typeof factualClaims !== 'boolean') throw new Error('factualClaims must be true or false.');
  const list = (value, label) => {
    if (value === undefined) return [];
    if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
    return value;
  };
  const utm = input?.utm === undefined ? {} : input.utm;
  if (!utm || typeof utm !== 'object' || Array.isArray(utm)) throw new Error('utm must be an object.');
  return {
    id: existingId ?? id(), campaignId,
    platform: String(input?.platform ?? '').trim().toLowerCase(),
    channel: String(input?.channel ?? '').trim(),
    contentType: String(input?.contentType ?? '').trim().toLowerCase(),
    variant: String(input?.variant ?? '').trim(),
    title: String(input?.title ?? '').trim(), body: String(input?.body ?? '').trim(),
    purpose: String(input?.purpose ?? '').trim(), factualClaims,
    sources: list(input?.sources, 'sources'), unresolvedClaims: list(input?.unresolvedClaims, 'unresolvedClaims'),
    targetUrl: typeof input?.targetUrl === 'string' ? input.targetUrl : String(input?.targetUrl ?? ''), targetReason: String(input?.targetReason ?? '').trim(),
    utm, trackedUrl: '', mediaIds: list(input?.mediaIds, 'mediaIds'),
    scheduledAt: input?.scheduledAt === undefined || input.scheduledAt === '' ? null : input.scheduledAt
  };
}

function mediaForItem(db, item) {
  return item.mediaIds.map(mediaId => db.prepare('SELECT * FROM media_assets WHERE id = ?').get(mediaId)).filter(Boolean);
}

function serializeItem(item) {
  return {
    id: item.id, campaignId: item.campaignId, platform: item.platform, channel: item.channel,
    contentType: item.contentType, variant: item.variant, title: item.title, body: item.body,
    purpose: item.purpose, factualClaims: item.factualClaims, sources: item.sources,
    unresolvedClaims: item.unresolvedClaims, targetUrl: item.targetUrl, targetReason: item.targetReason,
    utm: item.utm, trackedUrl: item.trackedUrl, mediaIds: item.mediaIds, scheduledAt: item.scheduledAt,
    contentHash: item.contentHash, approvalState: item.approvalState, approvedAt: item.approvedAt,
    status: item.status
  };
}

function validationContext({ db, registry, mediaDirectory }) {
  return { campaign: null, registry, db, mediaDirectory, repositoryRoot: REPOSITORY_ROOT };
}

function evaluate(db, item, campaign, registry, mediaDirectory) {
  const result = validateItemData(item, { ...validationContext({ db, registry, mediaDirectory }), campaign });
  item.utm = result.utm ?? item.utm;
  item.trackedUrl = result.trackedUrl;
  const media = mediaForItem(db, item);
  item.contentHash = buildContentHash(item, campaign ?? { id: item.campaignId, slug: '' }, media);
  item.duplicateKey = JSON.stringify([item.campaignId, item.platform, item.channel, item.variant, item.contentHash]);
  return { ...result, mediaRows: media, contentHash: item.contentHash, duplicateKey: item.duplicateKey };
}

function persistItem(db, item, validation, state, timestamp = now()) {
  db.prepare(`INSERT INTO publication_items (
      id, campaign_id, platform, channel, content_type, variant, title, body, purpose, factual_claims,
      sources_json, unresolved_claims_json, target_url, target_reason, utm_json, tracked_url, media_ids_json,
      scheduled_at, validation_json, content_hash, duplicate_key, approval_state, approved_hash, approved_at,
      status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(item.id, item.campaignId, item.platform, item.channel, item.contentType, item.variant, item.title, item.body,
      item.purpose, item.factualClaims ? 1 : 0, JSON.stringify(item.sources), JSON.stringify(item.unresolvedClaims),
      item.targetUrl, item.targetReason, JSON.stringify(item.utm), item.trackedUrl, JSON.stringify(item.mediaIds),
      item.scheduledAt, JSON.stringify({ ok: validation.ok, errors: validation.errors, warnings: validation.warnings }),
      item.contentHash, item.duplicateKey, state.approvalState, state.approvedHash ?? null, state.approvedAt ?? null,
      state.status, timestamp, timestamp);
}

export function createItem(db, { campaignId, input, registry, mediaDirectory }) {
  const campaign = getCampaign(db, campaignId);
  if (!campaign) throw new Error(`Campaign not found: ${campaignId}`);
  const item = normalizeItem(input, campaignId);
  const validation = evaluate(db, item, campaign, registry, mediaDirectory);
  const duplicate = db.prepare(`SELECT id FROM publication_items WHERE campaign_id = ? AND platform = ? AND channel = ? AND variant = ? AND content_hash = ?`)
    .get(item.campaignId, item.platform, item.channel, item.variant, item.contentHash);
  if (duplicate) throw new Error(`Duplicate item already exists (${duplicate.id}); change the variant or content intentionally.`);
  db.exec('BEGIN IMMEDIATE;');
  try {
    persistItem(db, item, validation, { approvalState: 'not_approved', status: validation.ok ? 'validated' : 'draft' });
    db.prepare(`INSERT INTO publication_events (id, item_id, event_type, occurred_at, details_json) VALUES (?, ?, ?, ?, ?)`)
      .run(id(), item.id, 'draft_created', now(), JSON.stringify({ contentHash: item.contentHash, validationOk: validation.ok }));
    db.exec('COMMIT;');
  } catch (error) {
    try { db.exec('ROLLBACK;'); } catch {}
    if (String(error.message).includes('UNIQUE')) throw new Error('Duplicate item: same campaign, platform, channel, variant, and content hash already exists.');
    throw error;
  }
  return { item: getItem(db, item.id), validation };
}

export function getItem(db, itemId) {
  const row = db.prepare('SELECT * FROM publication_items WHERE id = ?').get(itemId);
  return row ? itemFromRow(row) : null;
}

export function listItems(db, campaignId = null) {
  const rows = campaignId
    ? db.prepare('SELECT * FROM publication_items WHERE campaign_id = ? ORDER BY created_at, id').all(campaignId)
    : db.prepare('SELECT * FROM publication_items ORDER BY created_at, id').all();
  return rows.map(itemFromRow);
}

export function validateItem(db, itemId, { registry, mediaDirectory }) {
  const item = getItem(db, itemId);
  if (!item) throw new Error(`Publication item not found: ${itemId}`);
  const campaign = getCampaign(db, item.campaignId);
  const oldHash = item.contentHash;
  const result = evaluate(db, item, campaign, registry, mediaDirectory);
  const duplicate = db.prepare(`SELECT id FROM publication_items WHERE campaign_id = ? AND platform = ? AND channel = ? AND variant = ? AND content_hash = ? AND id <> ?`)
    .get(item.campaignId, item.platform, item.channel, item.variant, item.contentHash, item.id);
  if (duplicate) result.errors.push(`Duplicate publication item exists: ${duplicate.id}.`);
  result.ok = result.errors.length === 0;
  const state = item.approvalState === 'approved' && item.approvedHash === result.contentHash
    ? { approvalState: 'approved', approvedHash: item.approvedHash, approvedAt: item.approvedAt, status: 'approved' }
    : item.approvalState === 'approved' || item.approvalState === 'invalidated'
      ? { approvalState: 'invalidated', approvedHash: null, approvedAt: null, status: 'invalidated' }
      : { approvalState: 'not_approved', approvedHash: null, approvedAt: null, status: result.ok ? 'validated' : 'draft' };
  db.prepare(`UPDATE publication_items SET utm_json = ?, tracked_url = ?, validation_json = ?, content_hash = ?, duplicate_key = ?,
      approval_state = ?, approved_hash = ?, approved_at = ?, status = ?, updated_at = ? WHERE id = ?`)
    .run(JSON.stringify(item.utm), item.trackedUrl, JSON.stringify({ ok: result.ok, errors: result.errors, warnings: result.warnings }),
      result.contentHash, result.duplicateKey, state.approvalState, state.approvedHash, state.approvedAt, state.status, now(), itemId);
  result.previousHash = oldHash;
  return result;
}

export function updateItem(db, itemId, { input, registry, mediaDirectory }) {
  const previous = getItem(db, itemId);
  if (!previous) throw new Error(`Publication item not found: ${itemId}`);
  const campaign = getCampaign(db, previous.campaignId);
  const replacement = normalizeItem(input, previous.campaignId, previous.id);
  const result = evaluate(db, replacement, campaign, registry, mediaDirectory);
  const changed = replacement.contentHash !== previous.contentHash;
  const state = changed && ['approved', 'invalidated'].includes(previous.approvalState)
    ? { approvalState: 'invalidated', approvedHash: null, approvedAt: null, status: 'invalidated' }
    : previous.approvalState === 'approved'
      ? { approvalState: 'approved', approvedHash: previous.approvedHash, approvedAt: previous.approvedAt, status: 'approved' }
      : { approvalState: previous.approvalState, approvedHash: previous.approvedHash, approvedAt: previous.approvedAt, status: previous.approvalState === 'invalidated' ? 'invalidated' : result.ok ? 'validated' : 'draft' };
  if (changed) {
    const duplicate = db.prepare(`SELECT id FROM publication_items WHERE campaign_id = ? AND platform = ? AND channel = ? AND variant = ? AND content_hash = ? AND id <> ?`)
      .get(replacement.campaignId, replacement.platform, replacement.channel, replacement.variant, replacement.contentHash, replacement.id);
    if (duplicate) throw new Error(`Duplicate item already exists (${duplicate.id}); change the variant or content intentionally.`);
  }
  const timestamp = now();
  db.exec('BEGIN IMMEDIATE;');
  try {
    db.prepare(`UPDATE publication_items SET platform = ?, channel = ?, content_type = ?, variant = ?, title = ?, body = ?, purpose = ?, factual_claims = ?,
      sources_json = ?, unresolved_claims_json = ?, target_url = ?, target_reason = ?, utm_json = ?, tracked_url = ?, media_ids_json = ?, scheduled_at = ?,
      validation_json = ?, content_hash = ?, duplicate_key = ?, approval_state = ?, approved_hash = ?, approved_at = ?, status = ?, updated_at = ? WHERE id = ?`)
      .run(replacement.platform, replacement.channel, replacement.contentType, replacement.variant, replacement.title, replacement.body,
        replacement.purpose, replacement.factualClaims ? 1 : 0, JSON.stringify(replacement.sources), JSON.stringify(replacement.unresolvedClaims),
        replacement.targetUrl, replacement.targetReason, JSON.stringify(replacement.utm), replacement.trackedUrl, JSON.stringify(replacement.mediaIds),
        replacement.scheduledAt, JSON.stringify({ ok: result.ok, errors: result.errors, warnings: result.warnings }), replacement.contentHash,
        replacement.duplicateKey, state.approvalState, state.approvedHash, state.approvedAt, state.status, timestamp, itemId);
    if (changed && previous.approvalState === 'approved') {
      db.prepare(`INSERT INTO publication_events (id, item_id, event_type, occurred_at, details_json) VALUES (?, ?, ?, ?, ?)`)
        .run(id(), itemId, 'approval_invalidated', timestamp, JSON.stringify({ previousApprovedHash: previous.approvedHash, replacementHash: replacement.contentHash }));
    }
    db.prepare(`INSERT INTO publication_events (id, item_id, event_type, occurred_at, details_json) VALUES (?, ?, ?, ?, ?)`)
      .run(id(), itemId, 'draft_updated', timestamp, JSON.stringify({ contentHash: replacement.contentHash, validationOk: result.ok, approvalInvalidated: changed && previous.approvalState === 'approved' }));
    db.exec('COMMIT;');
  } catch (error) {
    try { db.exec('ROLLBACK;'); } catch {}
    throw error;
  }
  return { item: getItem(db, itemId), validation: result, approvalInvalidated: changed && previous.approvalState === 'approved' };
}

function mediaDetails(db, mediaIds) {
  return mediaIds.map(mediaId => db.prepare('SELECT * FROM media_assets WHERE id = ?').get(mediaId)).filter(Boolean);
}

export function renderBatchPreview(db, campaignId, { registry, mediaDirectory }) {
  const campaign = getCampaign(db, campaignId);
  if (!campaign) throw new Error(`Campaign not found: ${campaignId}`);
  const items = listItems(db, campaignId);
  const lines = [`# Publication batch preview: ${campaign.name}`, '', `- Campaign ID: ${campaign.id}`, `- Topic: ${campaign.topic || 'Not specified'}`, `- Objective: ${campaign.objective || 'Not specified'}`, `- Items: ${items.length}`, '- External publishing: disabled in Phase 1', ''];
  for (const item of items) {
    const result = validateItemData(item, { campaign, registry, db, mediaDirectory, repositoryRoot: REPOSITORY_ROOT });
    const currentHash = buildContentHash({ ...item, utm: result.utm ?? item.utm, trackedUrl: result.trackedUrl }, campaign, mediaDetails(db, item.mediaIds));
    const duplicate = db.prepare(`SELECT id FROM publication_items WHERE campaign_id = ? AND platform = ? AND channel = ? AND variant = ? AND content_hash = ? AND id <> ?`)
      .get(item.campaignId, item.platform, item.channel, item.variant, currentHash, item.id);
    if (duplicate) result.errors.push(`Duplicate publication item exists: ${duplicate.id}.`);
    lines.push(`## ${item.title || '(untitled)'}`, '', `- Item: ${item.id}`, `- Platform: ${item.platform || 'Missing'}`, `- Channel: ${item.channel || 'Missing'}`, `- Content type: ${item.contentType || 'Missing'}`, `- Variant: ${item.variant || 'Missing'}`, `- Purpose: ${item.purpose || 'Missing'}`, `- Base target URL: ${item.targetUrl || 'Missing'}`, `- Target reason: ${item.targetReason || 'Not specified'}`, `- Tracked URL: ${result.trackedUrl || 'Unavailable'}`, `- Scheduled time: ${item.scheduledAt || 'Not scheduled'}`, `- Approval: ${item.approvalState}${item.approvedHash ? ` (${item.approvedHash.slice(0, 12)})` : ''}`, `- Current content hash: ${currentHash}`, '', '### Publication text', '', item.body || '(empty)', '', '### Media');
    const assets = mediaDetails(db, item.mediaIds);
    if (assets.length === 0) lines.push('', '- No media attached.');
    for (const asset of assets) lines.push('', `- ${asset.local_path}`, `  - Dimensions: ${asset.width} × ${asset.height}`, `  - File type: ${asset.file_type} (${asset.mime_type})`, `  - Alt text: ${asset.alt_text}`, `  - Source: ${asset.source_url}`, `  - Creator: ${asset.creator}`, `  - Rights: ${asset.rights_status}; ${asset.license}`, `  - Attribution: ${asset.attribution}`);
    lines.push('', '### Sources');
    if (!item.sources.length) lines.push('', '- No sources recorded.');
    for (const source of item.sources) lines.push('', `- ${source.title} — ${source.url} (checked ${source.checkedOn}; supports: ${source.supports}; verified: ${source.verified === true ? 'yes' : 'no'})`);
    lines.push('', '### Validation');
    lines.push('', result.errors.length ? result.errors.map(error => `- ERROR: ${error}`).join('\n') : '- No validation errors.');
    if (result.warnings.length) lines.push('', result.warnings.map(warning => `- NOTE: ${warning}`).join('\n'));
    lines.push('');
  }
  return lines.join('\n');
}

export function approveBatch(db, campaignId, { registry, mediaDirectory }) {
  const campaign = getCampaign(db, campaignId);
  if (!campaign) throw new Error(`Campaign not found: ${campaignId}`);
  const items = listItems(db, campaignId);
  if (items.length === 0) throw new Error('Cannot approve an empty batch.');
  const checks = items.map(item => {
    const validation = evaluate(db, item, campaign, registry, mediaDirectory);
    const duplicate = db.prepare(`SELECT id FROM publication_items WHERE campaign_id = ? AND platform = ? AND channel = ? AND variant = ? AND content_hash = ? AND id <> ?`)
      .get(item.campaignId, item.platform, item.channel, item.variant, validation.contentHash, item.id);
    if (duplicate) validation.errors.push(`Duplicate publication item exists: ${duplicate.id}.`);
    validation.ok = validation.errors.length === 0;
    return { item, validation };
  });
  const failures = checks.filter(({ validation }) => !validation.ok);
  if (failures.length) throw new Error(`Batch approval rejected; ${failures.length} item(s) failed validation. Run batch preview and item validate for details.`);

  db.exec('BEGIN IMMEDIATE;');
  try {
    const approved = [];
    for (const { item, validation: checked } of checks) {
      const current = getItem(db, item.id);
      const validation = evaluate(db, current, campaign, registry, mediaDirectory);
      const media = mediaDetails(db, current.mediaIds);
      if (!validation.ok || validation.contentHash !== checked.contentHash || validation.contentHash !== current.contentHash) throw new Error(`Item ${current.id} changed or is no longer valid; batch approval cancelled.`);
      const approvedAt = now();
      db.prepare(`UPDATE publication_items SET utm_json = ?, tracked_url = ?, validation_json = ?, content_hash = ?, duplicate_key = ?, approval_state = 'approved', approved_hash = ?, approved_at = ?, status = 'approved', updated_at = ? WHERE id = ?`)
        .run(JSON.stringify(current.utm), current.trackedUrl, JSON.stringify({ ok: validation.ok, errors: validation.errors, warnings: validation.warnings }),
          validation.contentHash, validation.duplicateKey, validation.contentHash, approvedAt, approvedAt, current.id);
      db.prepare(`INSERT INTO publication_events (id, item_id, event_type, occurred_at, details_json) VALUES (?, ?, ?, ?, ?)`)
        .run(id(), current.id, 'approved', approvedAt, JSON.stringify({ contentHash: validation.contentHash, snapshot: serializeItem({ ...current, contentHash: validation.contentHash, trackedUrl: current.trackedUrl, utm: current.utm, approvalState: 'approved', approvedHash: validation.contentHash, approvedAt, status: 'approved' }) }));
      approved.push({ id: current.id, contentHash: validation.contentHash, approvedAt });
    }
    db.exec('COMMIT;');
    return approved;
  } catch (error) {
    try { db.exec('ROLLBACK;'); } catch {}
    throw error;
  }
}

export function exportBatch(db, campaignId, { registry, mediaDirectory, exportDirectory, outputPath = null }) {
  const campaign = getCampaign(db, campaignId);
  if (!campaign) throw new Error(`Campaign not found: ${campaignId}`);
  const items = listItems(db, campaignId);
  if (items.length === 0) throw new Error('There are no items to export.');
  const packageItems = [];
  for (const item of items) {
    if (item.approvalState !== 'approved' || !item.approvedHash || item.status !== 'approved') throw new Error(`Item ${item.id} is not currently approved.`);
    const result = validateItemData(item, { campaign, registry, db, mediaDirectory, repositoryRoot: REPOSITORY_ROOT });
    if (!result.ok) throw new Error(`Item ${item.id} no longer passes validation; export refused.`);
    const assets = mediaDetails(db, item.mediaIds);
    for (const asset of assets) {
      if (!fs.existsSync(asset.local_path) || fileSha256(asset.local_path) !== asset.sha256) throw new Error(`Media asset ${asset.id} has changed or is missing; export refused.`);
    }
    const currentHash = buildContentHash({ ...item, utm: result.utm ?? item.utm, trackedUrl: result.trackedUrl }, campaign, assets);
    if (currentHash !== item.approvedHash) throw new Error(`Item ${item.id} has changed since approval; export refused.`);
    packageItems.push({
      ...serializeItem({ ...item, utm: result.utm ?? item.utm, trackedUrl: result.trackedUrl }),
      mode: PLATFORM_RULES[item.platform]?.mode ?? 'manual_draft',
      media: assets.map(asset => ({ path: asset.local_path, width: asset.width, height: asset.height, fileType: asset.file_type, mimeType: asset.mime_type, altText: asset.alt_text, sourceUrl: asset.source_url, creator: asset.creator, rightsStatus: asset.rights_status, license: asset.license, attribution: asset.attribution, sha256: asset.sha256 }))
    });
  }
  const payload = { exportedAt: now(), campaign: { id: campaign.id, name: campaign.name, slug: campaign.slug, topic: campaign.topic, objective: campaign.objective }, externalPublicationEnabled: false, items: packageItems };
  const destination = outputPath ? path.resolve(outputPath) : path.join(exportDirectory, `${campaign.slug}-${new Date().toISOString().replaceAll(':', '').replaceAll('.', '-')}.json`);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const realParent = fs.realpathSync(path.dirname(destination));
  if (isPathInside(REPOSITORY_ROOT, realParent)) throw new Error('Exports must resolve outside the Git repository.');
  const safeDestination = path.join(realParent, path.basename(destination));
  if (fs.existsSync(safeDestination) && fs.lstatSync(safeDestination).isSymbolicLink()) throw new Error('Export destination must not be a symbolic link.');
  fs.writeFileSync(safeDestination, JSON.stringify(payload, null, 2) + '\n', { flag: 'wx' });
  return { path: safeDestination, count: packageItems.length };
}

export function getQueueStatus(db, targetCount) {
  const campaigns = Number(db.prepare('SELECT COUNT(*) AS n FROM campaigns').get().n);
  const items = Number(db.prepare('SELECT COUNT(*) AS n FROM publication_items').get().n);
  const approved = Number(db.prepare("SELECT COUNT(*) AS n FROM publication_items WHERE approval_state = 'approved' AND status = 'approved'").get().n);
  const media = Number(db.prepare('SELECT COUNT(*) AS n FROM media_assets').get().n);
  const accounts = Number(db.prepare('SELECT COUNT(*) AS n FROM platform_accounts').get().n);
  return { campaigns, items, approved, media, accounts, targetCount, externalPublishingEnabled: false };
}

export function listMedia(db) {
  return db.prepare('SELECT id, local_path, source_url, creator, rights_status, license, attribution, width, height, mime_type, file_type, media_kind, alt_text, sha256, file_size, platform_ready, created_at FROM media_assets ORDER BY created_at').all();
}

export function inspectApprovalSnapshot(db, itemId) {
  const event = db.prepare("SELECT details_json FROM publication_events WHERE item_id = ? AND event_type = 'approved' ORDER BY occurred_at DESC LIMIT 1").get(itemId);
  if (!event) return null;
  try { return JSON.parse(event.details_json); } catch { return null; }
}
