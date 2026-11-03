import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { isPathInside, PUBLIC_DIRECTORY, REPOSITORY_ROOT } from './config.mjs';
import { validatePublicSourceUrl } from './validation.mjs';

const MIME_BY_EXTENSION = new Map([
  ['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg'], ['.png', 'image/png'], ['.webp', 'image/webp'],
  ['.svg', 'image/svg+xml'], ['.html', 'text/html'], ['.htm', 'text/html'], ['.mp4', 'video/mp4']
]);

function positiveDimension(value) { return Number.isInteger(Number(value)) && Number(value) > 0 && Number(value) <= 20000; }

function jpegDimensions(buffer) {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) throw new Error('File extension says JPEG but the file signature is invalid.');
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) { offset++; continue; }
    let marker = buffer[offset + 1];
    while (marker === 0xff) marker = buffer[++offset + 1];
    offset += 2;
    if ([0xd8, 0xd9, 0x01].includes(marker) || (marker >= 0xd0 && marker <= 0xd7)) continue;
    const size = buffer.readUInt16BE(offset);
    if (size < 2 || offset + size > buffer.length) break;
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { height: buffer.readUInt16BE(offset + 3), width: buffer.readUInt16BE(offset + 5) };
    }
    offset += size;
  }
  throw new Error('Could not read JPEG dimensions.');
}

function webpDimensions(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') throw new Error('File extension says WebP but the file signature is invalid.');
  const kind = buffer.toString('ascii', 12, 16);
  if (kind === 'VP8X' && buffer.length >= 30) return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
  if (kind === 'VP8 ' && buffer.length >= 30) return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  if (kind === 'VP8L' && buffer.length >= 25) {
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  throw new Error('Could not read WebP dimensions.');
}

function textDimensions(text, extension, supplied) {
  if (extension === '.svg') {
    if (/<\s*(?:script|foreignObject|image|feImage)\b|<!DOCTYPE|\bon[a-z]+\s*=|javascript:|@import|url\s*\(\s*['"]?(?!#)[^)]/i.test(text) ||
      /(?:href|src)\s*=\s*['"]\s*(?!#)[^'"]+/i.test(text) || /<!ENTITY/i.test(text)) {
      throw new Error('SVG contains active content or an external resource reference.');
    }
    if (!/<svg(?:\s|>)/i.test(text)) throw new Error('SVG root element was not found.');
    const widthText = text.match(/\bwidth\s*=\s*['"]([\d.]+)(?:px)?['"]/i)?.[1];
    const heightText = text.match(/\bheight\s*=\s*['"]([\d.]+)(?:px)?['"]/i)?.[1];
    const viewBox = text.match(/\bviewBox\s*=\s*['"][\d.\s,-]+['"]/i)?.[0]?.match(/[\d.]+/g)?.map(Number);
    return {
      width: Number(widthText) || (viewBox?.length === 4 ? Math.round(viewBox[2]) : Number(supplied?.width)),
      height: Number(heightText) || (viewBox?.length === 4 ? Math.round(viewBox[3]) : Number(supplied?.height))
    };
  }
  if (/<\s*(?:script|iframe|object|embed|form|base)\b|\bon[a-z]+\s*=|@import|url\s*\(\s*['"]?(?:https?:|\/\/|data:|file:)|(?:src|href|poster|action|formaction)\s*=\s*['"]\s*(?:https?:|\/\/|data:|file:)/i.test(text)) {
    throw new Error('HTML graphic source must not contain scripts, active handlers, forms, embeds, or external resources.');
  }
  if (/<\s*(?:img|video|audio|source|link)\b|(?:src|poster|action|formaction)\s*=|url\s*\(\s*(?!['"]?#)[^)]/i.test(text)) {
    throw new Error('HTML graphic source must be self-contained and must not reference linked assets.');
  }
  return { width: Number(supplied?.width), height: Number(supplied?.height) };
}

function inspectFile(sourcePath, metadata) {
  const extension = path.extname(sourcePath).toLowerCase();
  const mimeType = MIME_BY_EXTENSION.get(extension);
  if (!mimeType) throw new Error(`Unsupported media type: ${extension || '(no extension)'}.`);
  const stat = fs.statSync(sourcePath);
  if (!stat.isFile() || stat.size > 250 * 1024 * 1024) throw new Error('Media must be a regular file no larger than 250 MiB.');
  const buffer = fs.readFileSync(sourcePath);
  if (buffer.length === 0) throw new Error('Media file is empty.');
  let width = null;
  let height = null;
  let mediaKind;
  let platformReady = false;
  if (extension === '.png') {
    if (buffer.length < 24 || !buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) || buffer.toString('ascii', 12, 16) !== 'IHDR') throw new Error('File extension says PNG but the file signature is invalid.');
    width = buffer.readUInt32BE(16); height = buffer.readUInt32BE(20); mediaKind = 'raster_image'; platformReady = true;
  } else if (extension === '.jpg' || extension === '.jpeg') {
    ({ width, height } = jpegDimensions(buffer)); mediaKind = 'raster_image'; platformReady = true;
  } else if (extension === '.webp') {
    ({ width, height } = webpDimensions(buffer)); mediaKind = 'raster_image'; platformReady = true;
  } else if (extension === '.svg' || extension === '.html' || extension === '.htm') {
    const text = buffer.toString('utf8');
    ({ width, height } = textDimensions(text, extension, metadata));
    mediaKind = extension === '.svg' ? 'svg_graphic' : 'html_graphic_source';
  } else if (extension === '.mp4') {
    if (buffer.length < 12 || buffer.toString('ascii', 4, 8) !== 'ftyp') throw new Error('File extension says MP4 but the file signature is invalid.');
    width = Number(metadata.width); height = Number(metadata.height); mediaKind = 'video'; platformReady = true;
  }
  if (!positiveDimension(width) || !positiveDimension(height)) throw new Error('Media dimensions are missing, invalid, or exceed the 20,000 px safety limit.');
  return { buffer, extension, mimeType, width, height, mediaKind, platformReady, sha256: crypto.createHash('sha256').update(buffer).digest('hex') };
}

function sourceIsAllowed(sourcePath) {
  const real = fs.realpathSync(sourcePath);
  if (!isPathInside(REPOSITORY_ROOT, real)) return real;
  if (!isPathInside(PUBLIC_DIRECTORY, real)) throw new Error('Repository media imports are limited to public/assets; other repo files are not accepted.');
  const relative = path.relative(REPOSITORY_ROOT, real).replaceAll(path.sep, '/');
  const tracked = spawnSync('git', ['ls-files', '--error-unmatch', '--', relative], { cwd: REPOSITORY_ROOT, encoding: 'utf8', windowsHide: true });
  if (tracked.status !== 0) throw new Error('A repository asset must already be tracked before it can be imported from public/assets.');
  return real;
}

function validRights(asset) {
  const allowed = ['owned', 'permission_granted', 'public_domain', 'licensed'];
  if (!allowed.includes(asset.rightsStatus)) throw new Error('Media rightsStatus must be owned, permission_granted, public_domain, or licensed.');
  if (typeof asset.creator !== 'string' || !asset.creator.trim() || typeof asset.license !== 'string' || !asset.license.trim() || typeof asset.attribution !== 'string' || !asset.attribution.trim()) throw new Error('Media needs creator, license/basis, and explicit attribution instructions.');
  if (/\b(non.?commercial|\bNC\b)/i.test(asset.license)) throw new Error('Non-commercial licenses are not accepted for this potentially monetized project.');
  if (/\b(unknown|unclear|unspecified|undetermined|pending|n\/a)\b/i.test(asset.license.trim())) throw new Error('Unclear usage rights are not accepted.');
  if (typeof asset.sourceUrl !== 'string' || asset.sourceUrl.trim() !== asset.sourceUrl || !(asset.sourceUrl.startsWith('local:') && asset.rightsStatus === 'owned') && !validatePublicSourceUrl(asset.sourceUrl)) {
    throw new Error('Provide a public source URL, or a local: source for media marked owned.');
  }
}

export function importMediaManifest({ db, manifest, mediaDirectory, repositoryRoot = REPOSITORY_ROOT }) {
  if (!manifest || !Array.isArray(manifest.assets) || manifest.assets.length === 0) throw new Error('Media manifest must contain a non-empty assets array.');
  fs.mkdirSync(mediaDirectory, { recursive: true });
  if (fs.lstatSync(mediaDirectory).isSymbolicLink()) throw new Error('Managed media directory must not be a symbolic link.');
  mediaDirectory = fs.realpathSync(mediaDirectory);
  if (isPathInside(repositoryRoot, mediaDirectory)) throw new Error('Managed media storage must be outside the Git repository.');
  const imported = [];
  const copyPaths = [];
  try {
    db.exec('BEGIN IMMEDIATE;');
    for (const asset of manifest.assets) {
      validRights(asset);
      if (typeof asset.file !== 'string' || !asset.file.trim()) throw new Error('Every media asset needs a local file path.');
      if (typeof asset.altText !== 'string' || !asset.altText.trim()) throw new Error('Every media item needs descriptive altText.');
      const sourcePath = sourceIsAllowed(path.resolve(asset.file));
      const inspected = inspectFile(sourcePath, asset);
      const id = crypto.randomUUID();
      const base = path.basename(sourcePath).replace(/[^a-zA-Z0-9._-]+/g, '-');
      const destination = path.join(mediaDirectory, `${id}-${base}`);
      fs.copyFileSync(sourcePath, destination, fs.constants.COPYFILE_EXCL);
      copyPaths.push(destination);
      const sourceUrl = asset.sourceUrl.trim();
      db.prepare(`INSERT INTO media_assets
        (id, local_path, source_url, creator, rights_status, license, attribution, width, height, mime_type, file_type, media_kind, alt_text, sha256, file_size, platform_ready, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(id, destination, sourceUrl, asset.creator.trim(), asset.rightsStatus, asset.license.trim(), asset.attribution.trim(),
          inspected.width, inspected.height, inspected.mimeType, inspected.extension.slice(1), inspected.mediaKind,
          asset.altText.trim(), inspected.sha256, inspected.buffer.length, inspected.platformReady ? 1 : 0, new Date().toISOString());
      imported.push({ id, path: destination, width: inspected.width, height: inspected.height, fileType: inspected.extension.slice(1), mediaKind: inspected.mediaKind, platformReady: inspected.platformReady, sha256: inspected.sha256 });
    }
    db.exec('COMMIT;');
    return imported;
  } catch (error) {
    try { db.exec('ROLLBACK;'); } catch {}
    for (const copyPath of copyPaths) { try { fs.unlinkSync(copyPath); } catch {} }
    throw error;
  }
}

export function fileSha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}
