import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
export const REPOSITORY_ROOT = path.resolve(moduleDirectory, '../../..');
export const PUBLIC_DIRECTORY = path.join(REPOSITORY_ROOT, 'public');
export const SITEMAP_PATH = path.join(PUBLIC_DIRECTORY, 'sitemap.xml');

export function isPathInside(parentPath, candidatePath) {
  const parent = path.resolve(parentPath);
  const candidate = path.resolve(candidatePath);
  const relative = path.relative(parent, candidate);
  return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative));
}

export function getDataDirectory(env = process.env) {
  const configured = env.ESPANJAN_TALVIARKI_PUBLISHING_DATA_DIR;
  const base = configured
    ? path.resolve(configured)
    : env.LOCALAPPDATA
      ? path.join(env.LOCALAPPDATA, 'EspanjanTalviarki', 'publishing-queue')
      : path.join(os.homedir(), '.local', 'share', 'espanjan-talviarki', 'publishing-queue');
  if (isPathInside(REPOSITORY_ROOT, base)) {
    throw new Error('Publishing data directory must be outside the Git repository.');
  }
  return base;
}

export function ensureDataDirectory(dataDirectory = getDataDirectory()) {
  fs.mkdirSync(dataDirectory, { recursive: true });
  const realRepository = fs.realpathSync(REPOSITORY_ROOT);
  const realDataDirectory = fs.realpathSync(dataDirectory);
  if (isPathInside(realRepository, realDataDirectory)) {
    throw new Error('Publishing data directory resolves inside the Git repository. Choose an external user data directory.');
  }
  return realDataDirectory;
}

export function getStoragePaths(dataDirectory = getDataDirectory()) {
  const root = ensureDataDirectory(dataDirectory);
  return {
    root,
    database: path.join(root, 'publishing-queue.sqlite'),
    media: path.join(root, 'media'),
    exports: path.join(root, 'exports')
  };
}
