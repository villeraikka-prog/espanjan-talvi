CREATE TABLE campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  topic TEXT NOT NULL DEFAULT '',
  objective TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE media_assets (
  id TEXT PRIMARY KEY,
  local_path TEXT NOT NULL UNIQUE,
  source_url TEXT NOT NULL,
  creator TEXT NOT NULL,
  rights_status TEXT NOT NULL CHECK (rights_status IN ('owned', 'permission_granted', 'public_domain', 'licensed')),
  license TEXT NOT NULL,
  attribution TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  mime_type TEXT NOT NULL,
  file_type TEXT NOT NULL,
  media_kind TEXT NOT NULL CHECK (media_kind IN ('raster_image', 'svg_graphic', 'html_graphic_source', 'video')),
  alt_text TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  platform_ready INTEGER NOT NULL CHECK (platform_ready IN (0, 1)),
  created_at TEXT NOT NULL
);

CREATE TABLE platform_accounts (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  auth_state TEXT NOT NULL DEFAULT 'not_connected' CHECK (auth_state IN ('not_connected', 'connected', 'needs_auth', 'disabled')),
  token_reference TEXT,
  last_verified_at TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(platform, channel_id)
);

CREATE TABLE publication_items (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE RESTRICT,
  platform TEXT NOT NULL DEFAULT '',
  channel TEXT NOT NULL DEFAULT '',
  content_type TEXT NOT NULL DEFAULT '',
  variant TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  purpose TEXT NOT NULL DEFAULT '',
  factual_claims INTEGER NOT NULL DEFAULT 1 CHECK (factual_claims IN (0, 1)),
  sources_json TEXT NOT NULL DEFAULT '[]',
  unresolved_claims_json TEXT NOT NULL DEFAULT '[]',
  target_url TEXT NOT NULL DEFAULT '',
  target_reason TEXT NOT NULL DEFAULT '',
  utm_json TEXT NOT NULL DEFAULT '{}',
  tracked_url TEXT NOT NULL DEFAULT '',
  media_ids_json TEXT NOT NULL DEFAULT '[]',
  scheduled_at TEXT,
  validation_json TEXT NOT NULL DEFAULT '{}',
  content_hash TEXT NOT NULL DEFAULT '',
  duplicate_key TEXT NOT NULL DEFAULT '',
  approval_state TEXT NOT NULL DEFAULT 'not_approved' CHECK (approval_state IN ('not_approved', 'approved', 'invalidated')),
  approved_hash TEXT,
  approved_at TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'validated', 'approved', 'manual_draft', 'future_draft', 'invalidated')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(campaign_id, platform, channel, variant, content_hash)
);

CREATE INDEX publication_items_campaign_idx ON publication_items(campaign_id, created_at);
CREATE INDEX publication_items_status_idx ON publication_items(status, approval_state);

CREATE TABLE publication_events (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES publication_items(id) ON DELETE RESTRICT,
  event_type TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  platform_post_id TEXT,
  published_url TEXT,
  response_code TEXT,
  safe_error_summary TEXT,
  details_json TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE performance_snapshots (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES publication_items(id) ON DELETE RESTRICT,
  captured_at TEXT NOT NULL,
  metrics_json TEXT NOT NULL DEFAULT '{}',
  source TEXT NOT NULL DEFAULT ''
);

CREATE TABLE link_checks (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES publication_items(id) ON DELETE RESTRICT,
  checked_at TEXT NOT NULL,
  target_status TEXT NOT NULL DEFAULT 'not_checked',
  public_status TEXT NOT NULL DEFAULT 'not_checked',
  href_verified INTEGER CHECK (href_verified IN (0, 1)),
  rel_value TEXT,
  indexability_note TEXT NOT NULL DEFAULT ''
);
