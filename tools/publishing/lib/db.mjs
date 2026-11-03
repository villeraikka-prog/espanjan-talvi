import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { ensureDataDirectory, isPathInside, REPOSITORY_ROOT } from './config.mjs';

const schemaPath = fileURLToPath(new URL('../schema.sql', import.meta.url));
export const SCHEMA_VERSION = 1;

export function migrateDatabase(db, schema = fs.readFileSync(schemaPath, 'utf8')) {
  db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  const current = Number(db.prepare('PRAGMA user_version').get().user_version);
  if (current > SCHEMA_VERSION) {
    throw new Error('Database schema is newer than this CLI supports.');
  }
  if (current === SCHEMA_VERSION) return;
  db.exec('BEGIN EXCLUSIVE;');
  try {
    if (current === 0) db.exec(schema);
    db.exec('PRAGMA user_version = ' + SCHEMA_VERSION + ';');
    db.exec('COMMIT;');
  } catch (error) {
    try { db.exec('ROLLBACK;'); } catch {}
    throw error;
  }
}

export function openDatabase(databasePath, options = {}) {
  const dataRoot = ensureDataDirectory(path.dirname(databasePath));
  const safeDatabasePath = path.join(dataRoot, path.basename(databasePath));
  if (fs.existsSync(safeDatabasePath) && fs.lstatSync(safeDatabasePath).isSymbolicLink()) {
    throw new Error('Publishing database must not be a symbolic link.');
  }
  if (isPathInside(REPOSITORY_ROOT, safeDatabasePath)) throw new Error('Publishing database must be outside the Git repository.');
  const db = new DatabaseSync(safeDatabasePath);
  try {
    migrateDatabase(db, options.schema);
    db.exec('PRAGMA journal_mode = WAL;');
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}

export function createQueueDirectories(dataDirectory) {
  const root = ensureDataDirectory(dataDirectory);
  for (const name of ['media', 'exports']) {
    const directory = path.join(root, name);
    if (fs.existsSync(directory) && fs.lstatSync(directory).isSymbolicLink()) throw new Error(`Publishing ${name} directory must not be a symbolic link.`);
    fs.mkdirSync(directory, { recursive: true });
    if (!isPathInside(root, fs.realpathSync(directory))) throw new Error(`Publishing ${name} directory resolves outside the user data directory.`);
  }
}
