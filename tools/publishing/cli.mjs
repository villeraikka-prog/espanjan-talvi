#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createQueueDirectories, openDatabase } from './lib/db.mjs';
import { getStoragePaths, REPOSITORY_ROOT, isPathInside } from './lib/config.mjs';
import { loadTargetRegistry } from './lib/targets.mjs';
import { importMediaManifest } from './lib/media.mjs';
import { approveBatch, createCampaign, createItem, exportBatch, getQueueStatus, listCampaigns, listItems, listMedia, renderBatchPreview, updateItem, validateItem } from './lib/service.mjs';

const helpText = `Espanjan Talviarki local publishing queue (Phase 1: no external publishing)

Usage:
  node tools/publishing/cli.mjs init
  node tools/publishing/cli.mjs status
  node tools/publishing/cli.mjs targets list
  node tools/publishing/cli.mjs campaign create --name NAME [--slug SLUG] [--topic TEXT] [--objective TEXT]
  node tools/publishing/cli.mjs campaign list
  node tools/publishing/cli.mjs media import --file MANIFEST.json
  node tools/publishing/cli.mjs media list
  node tools/publishing/cli.mjs item create --campaign ID --file ITEM.json
  node tools/publishing/cli.mjs item update ITEM_ID --file ITEM.json
  node tools/publishing/cli.mjs item list [CAMPAIGN_ID]
  node tools/publishing/cli.mjs item validate ITEM_ID
  node tools/publishing/cli.mjs batch preview CAMPAIGN_ID
  node tools/publishing/cli.mjs batch approve CAMPAIGN_ID
  node tools/publishing/cli.mjs batch export CAMPAIGN_ID [--out PATH]

Data lives outside the repository in the current user's application-data directory.
Set ESPANJAN_TALVIARKI_PUBLISHING_DATA_DIR to select another external local directory.
No network, platform API, account connection, scheduling, or publishing command exists.
`;

function parseArgs(args) {
  const positionals = [];
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    const token = args[i];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      if (!key || i + 1 >= args.length || args[i + 1].startsWith('--')) throw new Error(`Flag ${token} requires a value.`);
      if (Object.hasOwn(flags, key)) throw new Error(`Flag --${key} was supplied more than once.`);
      flags[key] = args[++i];
    } else positionals.push(token);
  }
  return { positionals, flags };
}

function readJson(filePath) {
  const absolute = path.resolve(filePath);
  const value = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  return { absolute, value };
}

function loadItemInput(filePath) {
  return readJson(filePath).value;
}

function loadMediaInput(filePath) {
  const { absolute, value } = readJson(filePath);
  if (!Array.isArray(value.assets)) throw new Error('Media manifest must contain an assets array.');
  const manifestDirectory = path.dirname(absolute);
  for (const asset of value.assets) {
    if (typeof asset.file !== 'string' || !asset.file.trim()) throw new Error('Every media asset needs a file path.');
    if (!path.isAbsolute(asset.file)) asset.file = path.resolve(manifestDirectory, asset.file);
  }
  return value;
}

function printJson(value) { process.stdout.write(JSON.stringify(value, null, 2) + '\n'); }

function ensureOutputPath(pathValue) {
  if (!pathValue) return null;
  const absolute = path.resolve(pathValue);
  if (isPathInside(REPOSITORY_ROOT, absolute)) throw new Error('Exports must be outside the Git repository.');
  return absolute;
}

function run() {
  const { positionals, flags } = parseArgs(process.argv.slice(2));
  const [rootCommand, subcommand, ...rest] = positionals;
  if (!rootCommand || rootCommand === 'help' || rootCommand === '--help' || rootCommand === '-h') {
    process.stdout.write(helpText);
    return;
  }
  const paths = getStoragePaths();
  createQueueDirectories(paths.root);
  const db = openDatabase(paths.database);
  try {
    const registry = loadTargetRegistry();
    if (rootCommand === 'init') {
      printJson({ initialized: true, database: paths.database, mediaDirectory: paths.media, exportDirectory: paths.exports, sitemapTargets: registry.size });
      return;
    }
    if (rootCommand === 'status') {
      printJson({ dataDirectory: paths.root, ...getQueueStatus(db, registry.size) });
      return;
    }
    if (rootCommand === 'targets' && subcommand === 'list') {
      for (const target of registry.values()) process.stdout.write(`${target.url}\t${target.titlePath}\n`);
      return;
    }
    if (rootCommand === 'campaign' && subcommand === 'create') {
      const campaign = createCampaign(db, { name: flags.name, slug: flags.slug, topic: flags.topic, objective: flags.objective });
      printJson(campaign);
      return;
    }
    if (rootCommand === 'campaign' && subcommand === 'list') {
      printJson(listCampaigns(db));
      return;
    }
    if (rootCommand === 'media' && subcommand === 'import') {
      if (!flags.file) throw new Error('media import requires --file MANIFEST.json.');
      printJson(importMediaManifest({ db, manifest: loadMediaInput(flags.file), mediaDirectory: paths.media }));
      return;
    }
    if (rootCommand === 'media' && subcommand === 'list') {
      printJson(listMedia(db));
      return;
    }
    if (rootCommand === 'item' && subcommand === 'create') {
      if (!flags.campaign || !flags.file) throw new Error('item create requires --campaign ID and --file ITEM.json.');
      printJson(createItem(db, { campaignId: flags.campaign, input: loadItemInput(flags.file), registry, mediaDirectory: paths.media }));
      return;
    }
    if (rootCommand === 'item' && subcommand === 'update') {
      const itemId = rest[0];
      if (!itemId || !flags.file) throw new Error('item update requires ITEM_ID and --file ITEM.json.');
      printJson(updateItem(db, itemId, { input: loadItemInput(flags.file), registry, mediaDirectory: paths.media }));
      return;
    }
    if (rootCommand === 'item' && subcommand === 'list') {
      printJson(listItems(db, rest[0] ?? null));
      return;
    }
    if (rootCommand === 'item' && subcommand === 'validate') {
      const itemId = rest[0];
      if (!itemId) throw new Error('item validate requires ITEM_ID.');
      const result = validateItem(db, itemId, { registry, mediaDirectory: paths.media });
      printJson(result);
      if (!result.ok) process.exitCode = 2;
      return;
    }
    if (rootCommand === 'batch' && subcommand === 'preview') {
      if (!rest[0]) throw new Error('batch preview requires CAMPAIGN_ID.');
      process.stdout.write(renderBatchPreview(db, rest[0], { registry, mediaDirectory: paths.media }));
      return;
    }
    if (rootCommand === 'batch' && subcommand === 'approve') {
      if (!rest[0]) throw new Error('batch approve requires CAMPAIGN_ID.');
      printJson(approveBatch(db, rest[0], { registry, mediaDirectory: paths.media }));
      return;
    }
    if (rootCommand === 'batch' && subcommand === 'export') {
      if (!rest[0]) throw new Error('batch export requires CAMPAIGN_ID.');
      printJson(exportBatch(db, rest[0], { registry, mediaDirectory: paths.media, exportDirectory: paths.exports, outputPath: ensureOutputPath(flags.out) }));
      return;
    }
    throw new Error(`Unknown command: ${positionals.join(' ')}. Run with help to see commands.`);
  } finally {
    db.close();
  }
}

try { run(); }
catch (error) {
  process.stderr.write(`Error: ${error.message}\nRun node tools/publishing/cli.mjs help for usage.\n`);
  process.exitCode = process.exitCode || 1;
}
