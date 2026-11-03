import fs from 'node:fs';
import path from 'node:path';
import { PUBLIC_DIRECTORY, SITEMAP_PATH, REPOSITORY_ROOT } from './config.mjs';

export const VERIFIED_ORIGIN = 'https://espanjan-talvi.netlify.app';

function decodeXmlText(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

export function loadTargetRegistry(options = {}) {
  const sitemapPath = options.sitemapPath ?? SITEMAP_PATH;
  const publicDirectory = options.publicDirectory ?? PUBLIC_DIRECTORY;
  const repositoryRoot = options.repositoryRoot ?? REPOSITORY_ROOT;
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  if (!/<urlset(?:\s|>)/i.test(xml)) throw new Error('Expected a sitemap urlset in public/sitemap.xml.');
  const locations = [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map(match => decodeXmlText(match[1].trim()));
  if (locations.length === 0) throw new Error('Sitemap contains no URL locations.');
  const targets = new Map();
  const seenPaths = new Set();

  for (const value of locations) {
    let url;
    try { url = new URL(value); } catch { throw new Error('Sitemap contains a malformed URL.'); }
    if (url.protocol !== 'https:' || url.origin !== VERIFIED_ORIGIN || url.username || url.password || url.port) {
      throw new Error('Sitemap contains a non-canonical or untrusted host.');
    }
    if (url.search || url.hash || value !== url.href) {
      throw new Error('Sitemap URLs must be canonical paths without query strings or fragments.');
    }
    if (url.pathname.includes('%') || url.pathname.includes('\\') || url.pathname.split('/').includes('..')) {
      throw new Error('Sitemap contains an encoded or unsafe path.');
    }
    if (!url.pathname.endsWith('/')) throw new Error('Sitemap page paths must end with a slash.');
    if (targets.has(url.href) || seenPaths.has(url.pathname)) throw new Error('Sitemap contains a duplicate URL.');

    const relative = url.pathname.replace(/^\/+/, '');
    const targetFile = path.resolve(publicDirectory, relative, 'index.html');
    const root = path.resolve(publicDirectory);
    const rel = path.relative(root, targetFile);
    if (rel.startsWith('..' + path.sep) || rel === '..' || path.isAbsolute(rel)) {
      throw new Error('Sitemap URL resolves outside the public directory.');
    }
    if (!fs.existsSync(targetFile) || !fs.statSync(targetFile).isFile()) {
      throw new Error('Sitemap URL has no matching local public page: ' + url.pathname);
    }
    const repoRelative = path.relative(repositoryRoot, targetFile);
    targets.set(url.href, {
      url: url.href,
      pathname: url.pathname,
      titlePath: repoRelative.replaceAll(path.sep, '/'),
      localPath: targetFile
    });
    seenPaths.add(url.pathname);
  }
  return targets;
}

export function validateTargetUrl(value, registry) {
  if (typeof value !== 'string' || value.trim() !== value || value.length === 0) {
    return { ok: false, error: 'Choose a canonical URL from the current site sitemap.' };
  }
  let parsed;
  try { parsed = new URL(value); } catch { return { ok: false, error: 'Target URL is malformed.' }; }
  if (parsed.username || parsed.password || parsed.protocol !== 'https:' || parsed.origin !== VERIFIED_ORIGIN) {
    return { ok: false, error: 'Target URL must use the verified public Espanjan Talviarki host.' };
  }
  if (parsed.search || parsed.hash) {
    return { ok: false, error: 'Choose the clean canonical URL; tracking parameters are generated separately.' };
  }
  if (!registry.has(parsed.href)) return { ok: false, error: 'Target path is not in the current sitemap allowlist.' };
  return { ok: true, target: registry.get(parsed.href) };
}
