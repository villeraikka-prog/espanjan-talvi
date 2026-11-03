import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { isPathInside } from './config.mjs';
import { createUtm, makeTrackedUrl, PLATFORM_RULES } from './content.mjs';
import { validateTargetUrl } from './targets.mjs';
import { createHash } from 'node:crypto';

function isPrivateIp(hostname) {
  const ipVersion = net.isIP(hostname);
  if (ipVersion === 4) {
    const octets = hostname.split('.').map(Number);
    return octets[0] === 0 || octets[0] === 10 || octets[0] === 127 ||
      (octets[0] === 169 && octets[1] === 254) ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && [0, 2, 168].includes(octets[1])) ||
      (octets[0] === 198 && [18, 19, 51].includes(octets[1])) ||
      (octets[0] === 203 && octets[1] === 0) ||
      (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127) || octets[0] >= 224;
  }
  if (ipVersion === 6) {
    const lower = hostname.toLowerCase();
    if (lower.startsWith('::ffff:')) return isPrivateIp(lower.slice(7));
    return lower === '::' || lower === '::1' || lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80:');
  }
  return ['localhost', 'localhost.localdomain'].includes(hostname.toLowerCase()) ||
    hostname.toLowerCase().endsWith('.local') || hostname.toLowerCase().endsWith('.internal');
}

export function validatePublicSourceUrl(value) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || isPrivateIp(url.hostname)) return false;
    const hostname = url.hostname.toLowerCase();
    if (['example.com', 'example.net', 'example.org', 'example.edu', 'example', 'invalid', 'test'].includes(hostname) ||
      hostname.endsWith('.example') || hostname.endsWith('.invalid') || hostname.endsWith('.test')) return false;
    return Boolean(hostname.includes('.') || net.isIP(hostname));
  } catch { return false; }
}

export function validateItemData(item, { campaign, registry, db, mediaDirectory, repositoryRoot }) {
  const errors = [];
  const warnings = [];
  if (!item.title?.trim()) errors.push('A title is required.');
  if (!item.body?.trim()) errors.push('Publication text is required.');
  if (!item.platform || !PLATFORM_RULES[item.platform]) errors.push('Choose a supported platform.');
  if (!item.channel?.trim()) errors.push('Specify the intended channel; this does not mean the account is connected.');
  if (!item.purpose?.trim()) errors.push('Record the publication purpose.');
  if (!item.variant?.trim()) errors.push('Specify a variant for duplicate prevention.');
  if (!campaign) errors.push('Campaign does not exist.');

  const targetResult = registry ? validateTargetUrl(item.targetUrl, registry) : { ok: false, error: 'Target allowlist is unavailable.' };
  if (!targetResult.ok) errors.push(targetResult.error);

  const sources = Array.isArray(item.sources) ? item.sources : [];
  const unresolved = Array.isArray(item.unresolvedClaims) ? item.unresolvedClaims : [];
  if (item.factualClaims !== false && sources.length === 0) errors.push('Factual claims require at least one verified source.');
  if (unresolved.length > 0) errors.push('Unresolved factual claims must be resolved before approval.');
  for (const [index, source] of sources.entries()) {
    const sourceObject = source && typeof source === 'object' && !Array.isArray(source) ? source : {};
    const checkedOn = typeof sourceObject.checkedOn === 'string' ? sourceObject.checkedOn : '';
    const checkedDate = /^\d{4}-\d{2}-\d{2}$/.test(checkedOn) ? new Date(`${checkedOn}T00:00:00Z`) : null;
    if (typeof sourceObject.title !== 'string' || !sourceObject.title.trim() || typeof sourceObject.supports !== 'string' || !sourceObject.supports.trim() ||
      !checkedDate || Number.isNaN(checkedDate.getTime()) || checkedDate.toISOString().slice(0, 10) !== checkedOn) {
      errors.push(`Source ${index + 1} needs a title, supported claim, and YYYY-MM-DD check date.`);
    }
    if (typeof sourceObject.url !== 'string' || !validatePublicSourceUrl(sourceObject.url)) errors.push(`Source ${index + 1} URL is invalid, private, or unsupported.`);
    if (sourceObject.verified !== true) errors.push(`Source ${index + 1} is not marked as verified.`);
  }

  if (item.scheduledAt != null && item.scheduledAt !== '') {
    if (typeof item.scheduledAt !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d(?:\.\d{1,3})?)?(?:Z|[+-]\d\d:\d\d)$/.test(item.scheduledAt) || Number.isNaN(Date.parse(item.scheduledAt))) {
      errors.push('Scheduled time must be an ISO 8601 timestamp with a timezone.');
    }
  }

  let utm = null;
  let trackedUrl = '';
  if (item.platform && campaign && item.variant) {
    try {
      utm = createUtm(item.platform, campaign.slug, item.variant, item.utm ?? {});
      if (targetResult.ok) trackedUrl = makeTrackedUrl(item.targetUrl, utm);
    } catch (error) { errors.push(error.message); }
  } else {
    errors.push('UTM values cannot be generated until platform, campaign, variant, and target are valid.');
  }

  const mediaIds = Array.isArray(item.mediaIds) ? item.mediaIds : [];
  const mediaRows = [];
  if (mediaIds.some(id => typeof id !== 'string' || !id.trim())) errors.push('Media IDs must be non-empty strings.');
  if (new Set(mediaIds).size !== mediaIds.length) errors.push('The same media asset cannot be attached more than once.');
  if (db && mediaIds.length) {
    for (const id of mediaIds) {
      const asset = db.prepare('SELECT * FROM media_assets WHERE id = ?').get(id);
      if (!asset) { errors.push(`Media asset ${id} was not found.`); continue; }
      if (!['owned', 'permission_granted', 'public_domain', 'licensed'].includes(asset.rights_status) || !asset.license?.trim() || !asset.creator?.trim() || !asset.attribution?.trim()) {
        errors.push(`Media asset ${id} has incomplete rights or attribution metadata.`);
      }
      if (/\b(non.?commercial|\bNC\b)/i.test(asset.license)) errors.push(`Media asset ${id} has a non-commercial license unsuitable for this project.`);
      const absolute = path.resolve(asset.local_path);
      if (!mediaDirectory || !isPathInside(mediaDirectory, absolute)) errors.push(`Media asset ${id} resolves outside managed media storage.`);
      else if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) errors.push(`Media asset ${id} file is missing.`);
      else {
        const digest = createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
        if (digest !== asset.sha256) errors.push(`Media asset ${id} content has changed since import.`);
        mediaRows.push(asset);
      }
    }
  }

  const rule = PLATFORM_RULES[item.platform];
  const compatible = rule?.mediaTypes?.[item.contentType];
  if (!rule || !compatible) errors.push('Content type is not supported by the selected platform.');
  else if (compatible.length > 0) {
    if (mediaRows.length === 0) errors.push(`${item.contentType} requires compatible media.`);
    for (const kind of compatible) {
      if (!mediaRows.some(asset => asset.media_kind === kind && asset.platform_ready)) {
        errors.push(`${item.contentType} requires platform-ready ${kind.replace('_', ' ')} media.`);
      }
    }
  }

  if (item.platform === 'youtube') warnings.push('YouTube is draft-only in Phase 1; no upload, scheduling, or account connection is implemented.');
  if (['medium', 'reddit'].includes(item.platform)) warnings.push(`${item.platform} is a manual draft only in Phase 1.`);
  if (item.platform === 'pinterest') warnings.push('Pinterest is only a future Buffer candidate; Phase 1 has no publishing adapter.');
  warnings.push('UTM values are generated, but analytics collection and campaign attribution have not been verified.');

  return { ok: errors.length === 0, errors, warnings, utm, trackedUrl, mediaRows, target: targetResult.ok ? targetResult.target : null };
}
