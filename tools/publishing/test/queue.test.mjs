import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createQueueDirectories, openDatabase } from '../lib/db.mjs';
import { getDataDirectory, isPathInside, REPOSITORY_ROOT } from '../lib/config.mjs';
import { loadTargetRegistry, validateTargetUrl, VERIFIED_ORIGIN } from '../lib/targets.mjs';
import { importMediaManifest } from '../lib/media.mjs';
import { buildContentHash, createUtm, makeTrackedUrl } from '../lib/content.mjs';
import { validateItemData } from '../lib/validation.mjs';
import { approveBatch, createCampaign, createItem, exportBatch, getItem, listCampaigns, listItems, renderBatchPreview, updateItem, validateItem } from '../lib/service.mjs';

const png1x1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lXcAAAAASUVORK5CYII=', 'base64');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'espanjan-talviarki-queue-test-'));
  const paths = { root, database: path.join(root, 'publishing-queue.sqlite'), media: path.join(root, 'media'), exports: path.join(root, 'exports'), source: path.join(root, 'source.png') };
  createQueueDirectories(root);
  fs.mkdirSync(paths.exports, { recursive: true });
  fs.writeFileSync(paths.source, png1x1);
  const db = openDatabase(paths.database);
  const registry = loadTargetRegistry();
  t.after(() => {
    db.close();
    fs.rmSync(root, { recursive: true, force: true });
  });
  return { db, registry, paths };
}

function campaign(db) {
  return createCampaign(db, { name: 'Winter guide distribution', topic: 'Torrevieja', objective: 'Help readers compare winter stays' });
}

function sourceMetadata() {
  return [{ title: 'MAPA household food consumption panel', url: 'https://www.mapa.gob.es/es/alimentacion/temas/consumo-tendencias/panel-de-consumo-alimentario/', checkedOn: '2026-11-03', supports: 'The source context used in the publication draft', verified: true }];
}

function itemInput(mediaIds = []) {
  return {
    platform: 'pinterest', channel: 'Pinterest Business (intended; not connected)', contentType: 'pin_image',
    variant: 'torrevieja-winter-guide-a', title: 'A practical winter guide to Torrevieja',
    body: 'Compare the setting, everyday services and winter considerations before choosing a stay.',
    purpose: 'Help Finnish readers assess a winter stay.', factualClaims: true,
    sources: sourceMetadata(), unresolvedClaims: [], targetUrl: `${VERIFIED_ORIGIN}/kohteet/torrevieja/`,
    targetReason: 'Relevant destination profile.', utm: {}, mediaIds, scheduledAt: null
  };
}

function importPng(db, paths, overrides = {}) {
  return importMediaManifest({ db, mediaDirectory: paths.media, manifest: { assets: [{
    file: paths.source, sourceUrl: 'https://www.pexels.com/license/', creator: 'Example Author',
    rightsStatus: 'licensed', license: 'CC BY 4.0', attribution: 'Credit Example Author; modified by cropping.',
    altText: 'Illustration for a winter destination guide', ...overrides
  }] } })[0];
}

test('database initializes schema v1, supports repeat initialization, and rejects future schema versions', t => {
  const { db, paths } = fixture(t);
  assert.equal(db.prepare('PRAGMA user_version').get().user_version, 1);
  const tableNames = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map(row => row.name);
  for (const name of ['campaigns', 'publication_items', 'media_assets', 'platform_accounts', 'publication_events', 'performance_snapshots', 'link_checks']) assert.ok(tableNames.includes(name));
  assert.equal(listCampaigns(db).length, 0);
  const reopened = openDatabase(paths.database);
  assert.equal(reopened.prepare('PRAGMA user_version').get().user_version, 1);
  reopened.close();
  // Update the still-open fixture connection to make the future-version case deterministic.
  db.prepare('PRAGMA user_version = 77').run();
  assert.throws(() => openDatabase(paths.database), /newer than this CLI supports/);
});

test('user storage configuration rejects paths inside the repository', () => {
  assert.equal(isPathInside(REPOSITORY_ROOT, path.join(REPOSITORY_ROOT, 'tools')) , true);
  assert.throws(() => getDataDirectory({ ESPANJAN_TALVIARKI_PUBLISHING_DATA_DIR: path.join(REPOSITORY_ROOT, 'private-data') }), /outside the Git repository/);
});

test('target allowlist is derived from the actual sitemap and rejects unsafe or unknown URLs', t => {
  const { registry } = fixture(t);
  assert.equal(registry.size, 33);
  assert.equal(validateTargetUrl(`${VERIFIED_ORIGIN}/kohteet/torrevieja/`, registry).ok, true);
  for (const url of [
    'https://attacker.example/kohteet/torrevieja/',
    `${VERIFIED_ORIGIN}/not-in-sitemap/`,
    `${VERIFIED_ORIGIN}/kohteet/torrevieja/?x=1`,
    'https://user:pass@espanjan-talvi.netlify.app/',
    'http://127.0.0.1/private/',
    'not a url'
  ]) assert.equal(validateTargetUrl(url, registry).ok, false, url);
  assert.equal(validateItemData({ factualClaims: true, sources: [{ title: 'placeholder', url: 'https://example.com', supports: 'claim', checkedOn: '2026-11-03', verified: true }] }, { registry, campaign: null }).errors.some(error => /URL is invalid/.test(error)), true);
});

test('media import verifies file content and rejects unclear or non-commercial rights without storing media', t => {
  const { db, paths } = fixture(t);
  assert.throws(() => importPng(db, paths, { rightsStatus: 'unknown', license: 'unknown' }), /rightsStatus/);
  assert.throws(() => importPng(db, paths, { license: 'CC BY-NC 4.0' }), /Non-commercial/);
  assert.throws(() => importPng(db, paths, { license: 'Usage rights unclear' }), /Unclear usage rights/);
  assert.throws(() => importPng(db, paths, { attribution: '' }), /creator, license\/basis, and explicit attribution/);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM media_assets').get().n, 0);
  const imported = importPng(db, paths);
  assert.equal(imported.width, 1);
  assert.equal(imported.height, 1);
  assert.equal(imported.mediaKind, 'raster_image');
  assert.equal(imported.platformReady, true);
  assert.ok(fs.existsSync(imported.path));
});

test('missing and unverified factual sources prevent item validation', t => {
  const { db, registry, paths } = fixture(t);
  const c = campaign(db);
  const without = createItem(db, { campaignId: c.id, input: { ...itemInput(), platform: 'linkedin', contentType: 'post', sources: [] }, registry, mediaDirectory: paths.media });
  assert.equal(without.validation.ok, false);
  assert.match(without.validation.errors.join('\n'), /Factual claims require at least one verified source/);
  const unverified = createItem(db, { campaignId: c.id, input: { ...itemInput(), platform: 'linkedin', contentType: 'post', sources: [{ ...sourceMetadata()[0], verified: false }] }, registry, mediaDirectory: paths.media });
  assert.equal(unverified.validation.ok, false);
  assert.match(unverified.validation.errors.join('\n'), /not marked as verified/);
  const unresolved = createItem(db, { campaignId: c.id, input: { ...itemInput(), platform: 'linkedin', contentType: 'post', unresolvedClaims: ['Unverified distance'] }, registry, mediaDirectory: paths.media });
  assert.match(unresolved.validation.errors.join('\n'), /Unresolved factual claims/);
});

test('duplicate detection, UTM, content hash, preview, batch approval, invalidation, and export work locally', t => {
  const { db, registry, paths } = fixture(t);
  const c = campaign(db);
  const media = importPng(db, paths);
  const first = createItem(db, { campaignId: c.id, input: itemInput([media.id]), registry, mediaDirectory: paths.media });
  assert.equal(first.validation.ok, true);
  assert.equal(first.item.utm.source, 'pinterest');
  assert.equal(first.item.utm.medium, 'organic-social');
  assert.equal(first.item.utm.campaign, 'winter-guide-distribution');
  assert.equal(first.item.utm.content, 'torrevieja-winter-guide-a');
  assert.equal(first.item.trackedUrl, makeTrackedUrl(first.item.targetUrl, first.item.utm));
  assert.match(first.item.contentHash, /^[a-f0-9]{64}$/);
  assert.throws(() => createItem(db, { campaignId: c.id, input: itemInput([media.id]), registry, mediaDirectory: paths.media }), /Duplicate item/);
  const duplicateCopy = importPng(db, paths);
  assert.throws(() => createItem(db, { campaignId: c.id, input: itemInput([duplicateCopy.id]), registry, mediaDirectory: paths.media }), /Duplicate item/);
  const preview = renderBatchPreview(db, c.id, { registry, mediaDirectory: paths.media });
  for (const text of ['Winter guide distribution', first.item.title, first.item.body, first.item.targetUrl, first.item.trackedUrl, media.path, '1 × 1', 'Credit Example Author', 'MAPA household food consumption panel', 'Current content hash']) assert.ok(preview.includes(text), text);

  const approved = approveBatch(db, c.id, { registry, mediaDirectory: paths.media });
  assert.equal(approved.length, 1);
  const approvedItem = getItem(db, first.item.id);
  assert.equal(approvedItem.approvalState, 'approved');
  assert.equal(approvedItem.approvedHash, approvedItem.contentHash);
  const exportResult = exportBatch(db, c.id, { registry, mediaDirectory: paths.media, exportDirectory: paths.exports });
  const exported = JSON.parse(fs.readFileSync(exportResult.path, 'utf8'));
  assert.equal(exported.externalPublicationEnabled, false);
  assert.equal(exported.items[0].mode, 'buffer_candidate');
  assert.equal(exported.items.length, 1);
  assert.throws(() => exportBatch(db, c.id, { registry, mediaDirectory: paths.media, exportDirectory: paths.exports, outputPath: exportResult.path }), /EEXIST|already exists/i);

  const updated = updateItem(db, first.item.id, { input: { ...itemInput([media.id]), title: 'Updated approved title' }, registry, mediaDirectory: paths.media });
  assert.equal(updated.approvalInvalidated, true);
  assert.equal(updated.item.approvalState, 'invalidated');
  assert.equal(updated.item.approvedHash, null);
  assert.throws(() => exportBatch(db, c.id, { registry, mediaDirectory: paths.media, exportDirectory: paths.exports }), /not currently approved/);
  assert.equal(validateItem(db, first.item.id, { registry, mediaDirectory: paths.media }).ok, true);
  assert.equal(getItem(db, first.item.id).approvalState, 'invalidated');
});

test('platform media requirements and post-import media tampering are rejected', t => {
  const { db, registry, paths } = fixture(t);
  const c = campaign(db);
  const noMedia = createItem(db, { campaignId: c.id, input: itemInput([]), registry, mediaDirectory: paths.media });
  assert.match(noMedia.validation.errors.join('\n'), /requires compatible media/);
  const media = importPng(db, paths);
  fs.writeFileSync(media.path, Buffer.concat([png1x1, Buffer.from('changed')]));
  const tampered = createItem(db, { campaignId: c.id, input: itemInput([media.id]), registry, mediaDirectory: paths.media });
  assert.match(tampered.validation.errors.join('\n'), /content has changed since import/);
});

test('batch approval is all-or-nothing when any campaign item fails validation', t => {
  const { db, registry, paths } = fixture(t);
  const c = campaign(db);
  const valid = createItem(db, { campaignId: c.id, input: { ...itemInput(), platform: 'linkedin', contentType: 'post', factualClaims: false, sources: [] }, registry, mediaDirectory: paths.media });
  const invalid = createItem(db, { campaignId: c.id, input: { ...itemInput(), variant: 'missing-image', mediaIds: [] }, registry, mediaDirectory: paths.media });
  assert.equal(valid.validation.ok, true);
  assert.equal(invalid.validation.ok, false);
  assert.throws(() => approveBatch(db, c.id, { registry, mediaDirectory: paths.media }), /Batch approval rejected/);
  assert.equal(getItem(db, valid.item.id).approvalState, 'not_approved');
  assert.equal(getItem(db, invalid.item.id).approvalState, 'not_approved');
});

test('local queue operations make no network requests', async t => {
  const { db, registry, paths } = fixture(t);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('Unexpected network request in local-only Phase 1.'); };
  try {
    const c = campaign(db);
    const media = importPng(db, paths);
    const created = createItem(db, { campaignId: c.id, input: itemInput([media.id]), registry, mediaDirectory: paths.media });
    assert.equal(validateItem(db, created.item.id, { registry, mediaDirectory: paths.media }).ok, true);
    assert.ok(renderBatchPreview(db, c.id, { registry, mediaDirectory: paths.media }).length > 0);
    assert.equal(approveBatch(db, c.id, { registry, mediaDirectory: paths.media }).length, 1);
    assert.equal(exportBatch(db, c.id, { registry, mediaDirectory: paths.media, exportDirectory: paths.exports }).count, 1);
  } finally { globalThis.fetch = originalFetch; }
});

test('CLI supports an end-to-end local campaign, validation, approval, and export workflow', t => {
  const dataDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'espanjan-talviarki-cli-test-'));
  t.after(() => fs.rmSync(dataDirectory, { recursive: true, force: true }));
  const cliPath = path.join(REPOSITORY_ROOT, 'tools', 'publishing', 'cli.mjs');
  const runCli = (...args) => {
    const result = spawnSync(process.execPath, [cliPath, ...args], {
      cwd: REPOSITORY_ROOT,
      encoding: 'utf8',
      windowsHide: true,
      env: { ...process.env, ESPANJAN_TALVIARKI_PUBLISHING_DATA_DIR: dataDirectory }
    });
    assert.equal(result.status, 0, `${args.join(' ')} failed: ${result.stderr}`);
    return result.stdout;
  };
  const initialized = JSON.parse(runCli('init'));
  assert.equal(initialized.sitemapTargets, 33);
  assert.equal(isPathInside(REPOSITORY_ROOT, initialized.database), false);
  const createdCampaign = JSON.parse(runCli('campaign', 'create', '--name', 'CLI smoke test', '--objective', 'Verify local workflow'));
  const itemPath = path.join(dataDirectory, 'item.json');
  fs.writeFileSync(itemPath, JSON.stringify({
    platform: 'linkedin', channel: 'LinkedIn profile (intended; not connected)', contentType: 'post', variant: 'cli-smoke-01',
    title: 'A practical winter stay comparison', body: 'Choose a destination by comparing the information that matters to your own stay.',
    purpose: 'Help readers make a considered choice.', factualClaims: false, sources: [], unresolvedClaims: [],
    targetUrl: `${VERIFIED_ORIGIN}/kohteet/`, targetReason: 'The directory supports direct comparison.', utm: {}, mediaIds: [], scheduledAt: null
  }, null, 2));
  const createdItem = JSON.parse(runCli('item', 'create', '--campaign', createdCampaign.id, '--file', itemPath));
  assert.equal(createdItem.validation.ok, true);
  assert.equal(JSON.parse(runCli('item', 'validate', createdItem.item.id)).ok, true);
  assert.match(runCli('batch', 'preview', createdCampaign.id), /External publishing: disabled in Phase 1/);
  assert.equal(JSON.parse(runCli('batch', 'approve', createdCampaign.id)).length, 1);
  const exported = JSON.parse(runCli('batch', 'export', createdCampaign.id));
  assert.equal(exported.count, 1);
  assert.equal(fs.existsSync(exported.path), true);
  assert.equal(JSON.parse(fs.readFileSync(exported.path, 'utf8')).externalPublicationEnabled, false);
});

test('stable hashing changes when approved fields change and UTM generation stays canonical', t => {
  const { db, registry, paths } = fixture(t);
  const c = campaign(db);
  const media = importPng(db, paths);
  const base = itemInput([media.id]);
  const created = createItem(db, { campaignId: c.id, input: base, registry, mediaDirectory: paths.media });
  const mediaRow = db.prepare('SELECT * FROM media_assets WHERE id = ?').get(media.id);
  const changes = [
    { title: 'Different title' }, { body: 'Different body' }, { platform: 'linkedin' }, { channel: 'Different channel' },
    { contentType: 'post' }, { variant: 'another-variant' }, { purpose: 'Different purpose' }, { factualClaims: false },
    { sources: [] }, { unresolvedClaims: ['Review needed'] }, { targetUrl: `${VERIFIED_ORIGIN}/kohteet/alicante/` },
    { targetReason: 'Different target rationale' }, { utm: { source: 'other-source' } }, { trackedUrl: `${VERIFIED_ORIGIN}/?utm_source=other` },
    { scheduledAt: '2026-12-01T10:00:00Z' }
  ];
  for (const change of changes) assert.notEqual(buildContentHash({ ...created.item, ...change }, c, [mediaRow]), created.item.contentHash, Object.keys(change)[0]);
  assert.notEqual(buildContentHash(created.item, c, [{ ...mediaRow, creator: 'Changed creator' }]), created.item.contentHash);
  assert.deepEqual(createUtm('pinterest', c.slug, base.variant, { source: 'Pin_Test', medium: 'organic social' }), {
    source: 'pin-test', medium: 'organic-social', campaign: c.slug, content: base.variant
  });
  assert.equal(new URL(created.item.trackedUrl).searchParams.getAll('utm_source').length, 1);
});
