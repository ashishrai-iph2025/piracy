-- Migration 003: Convert all primary keys from INT AUTO_INCREMENT to CHAR(36) UUID
-- Requires MySQL 8.0.13+ for DEFAULT (UUID())
--
-- BACKUP YOUR DATABASE BEFORE RUNNING THIS MIGRATION.
-- Run: mysql -u piracy_user -p piracy_reporting < migrations/003_uuid_primary_keys.sql
--
-- For a clean install (no existing data), use database/schema.sql instead.
--
-- Strategy (executed with FK checks off):
--   Phase 1 – Add _id CHAR(36) to every table, populate with UUID()
--   Phase 2 – Add _<fk> CHAR(36) to every child table, populate via JOIN while old INT ids still exist
--   Phase 3 – Drop old FK constraints
--   Phase 4 – Swap every old INT PK / FK column with the new CHAR(36) counterpart
--   Phase 5 – Re-add FK constraints with new CHAR(36) types

SET FOREIGN_KEY_CHECKS = 0;

-- ════════════════════════════════════════════════════════════
-- PHASE 1 — Add _id UUID column to every table
-- ════════════════════════════════════════════════════════════

-- users
ALTER TABLE users MODIFY COLUMN id INT UNSIGNED NOT NULL;
ALTER TABLE users ADD COLUMN _id CHAR(36) NOT NULL DEFAULT '';
UPDATE users SET _id = UUID();

-- modules
ALTER TABLE modules MODIFY COLUMN id INT UNSIGNED NOT NULL;
ALTER TABLE modules ADD COLUMN _id CHAR(36) NOT NULL DEFAULT '';
UPDATE modules SET _id = UUID();

-- user_module_permissions
ALTER TABLE user_module_permissions MODIFY COLUMN id INT UNSIGNED NOT NULL;
ALTER TABLE user_module_permissions ADD COLUMN _id CHAR(36) NOT NULL DEFAULT '';
UPDATE user_module_permissions SET _id = UUID();

-- user_activity
ALTER TABLE user_activity MODIFY COLUMN id INT UNSIGNED NOT NULL;
ALTER TABLE user_activity ADD COLUMN _id CHAR(36) NOT NULL DEFAULT '';
UPDATE user_activity SET _id = UUID();

-- removal_status_history
ALTER TABLE removal_status_history MODIFY COLUMN id INT UNSIGNED NOT NULL;
ALTER TABLE removal_status_history ADD COLUMN _id CHAR(36) NOT NULL DEFAULT '';
UPDATE removal_status_history SET _id = UUID();

-- email_config
ALTER TABLE email_config MODIFY COLUMN id INT NOT NULL;
ALTER TABLE email_config ADD COLUMN _id CHAR(36) NOT NULL DEFAULT '';
UPDATE email_config SET _id = UUID();

-- api_tokens
ALTER TABLE api_tokens MODIFY COLUMN id INT UNSIGNED NOT NULL;
ALTER TABLE api_tokens ADD COLUMN _id CHAR(36) NOT NULL DEFAULT '';
UPDATE api_tokens SET _id = UUID();

-- api_token_usage
ALTER TABLE api_token_usage MODIFY COLUMN id INT UNSIGNED NOT NULL;
ALTER TABLE api_token_usage ADD COLUMN _id CHAR(36) NOT NULL DEFAULT '';
UPDATE api_token_usage SET _id = UUID();

-- module tables
ALTER TABLE unauthorized_search_result MODIFY COLUMN id INT UNSIGNED NOT NULL;
ALTER TABLE unauthorized_search_result ADD COLUMN _id CHAR(36) NOT NULL DEFAULT '';
UPDATE unauthorized_search_result SET _id = UUID();

ALTER TABLE ads_tutorials_social_media MODIFY COLUMN id INT UNSIGNED NOT NULL;
ALTER TABLE ads_tutorials_social_media ADD COLUMN _id CHAR(36) NOT NULL DEFAULT '';
UPDATE ads_tutorials_social_media SET _id = UUID();

ALTER TABLE password_sharing_social_media MODIFY COLUMN id INT UNSIGNED NOT NULL;
ALTER TABLE password_sharing_social_media ADD COLUMN _id CHAR(36) NOT NULL DEFAULT '';
UPDATE password_sharing_social_media SET _id = UUID();

ALTER TABLE password_sharing_marketplace MODIFY COLUMN id INT UNSIGNED NOT NULL;
ALTER TABLE password_sharing_marketplace ADD COLUMN _id CHAR(36) NOT NULL DEFAULT '';
UPDATE password_sharing_marketplace SET _id = UUID();

ALTER TABLE iptv_apps_internet MODIFY COLUMN id INT UNSIGNED NOT NULL;
ALTER TABLE iptv_apps_internet ADD COLUMN _id CHAR(36) NOT NULL DEFAULT '';
UPDATE iptv_apps_internet SET _id = UUID();

ALTER TABLE iptv_apps_apps MODIFY COLUMN id INT UNSIGNED NOT NULL;
ALTER TABLE iptv_apps_apps ADD COLUMN _id CHAR(36) NOT NULL DEFAULT '';
UPDATE iptv_apps_apps SET _id = UUID();

ALTER TABLE iptv_apps_social_media MODIFY COLUMN id INT UNSIGNED NOT NULL;
ALTER TABLE iptv_apps_social_media ADD COLUMN _id CHAR(36) NOT NULL DEFAULT '';
UPDATE iptv_apps_social_media SET _id = UUID();

ALTER TABLE iptv_apps_marketplace MODIFY COLUMN id INT UNSIGNED NOT NULL;
ALTER TABLE iptv_apps_marketplace ADD COLUMN _id CHAR(36) NOT NULL DEFAULT '';
UPDATE iptv_apps_marketplace SET _id = UUID();

ALTER TABLE iptv_apps_meta_ads MODIFY COLUMN id INT UNSIGNED NOT NULL;
ALTER TABLE iptv_apps_meta_ads ADD COLUMN _id CHAR(36) NOT NULL DEFAULT '';
UPDATE iptv_apps_meta_ads SET _id = UUID();

-- ════════════════════════════════════════════════════════════
-- PHASE 2 — Add new CHAR(36) FK columns and populate via JOIN
--           (JOINs use old INT IDs which are still in place)
-- ════════════════════════════════════════════════════════════

-- ── user_module_permissions: user_id, module_id, granted_by ──
ALTER TABLE user_module_permissions
  ADD COLUMN _user_id    CHAR(36) NOT NULL DEFAULT '',
  ADD COLUMN _module_id  CHAR(36) NOT NULL DEFAULT '',
  ADD COLUMN _granted_by CHAR(36) DEFAULT NULL;

UPDATE user_module_permissions p
  JOIN users u ON u.id = p.user_id
  SET p._user_id = u._id;

UPDATE user_module_permissions p
  JOIN modules m ON m.id = p.module_id
  SET p._module_id = m._id;

UPDATE user_module_permissions p
  JOIN users u ON u.id = p.granted_by
  SET p._granted_by = u._id
  WHERE p.granted_by IS NOT NULL;

-- ── user_activity: user_id ──
ALTER TABLE user_activity ADD COLUMN _user_id CHAR(36) NOT NULL DEFAULT '';
UPDATE user_activity a
  JOIN users u ON u.id = a.user_id
  SET a._user_id = u._id;

-- ── removal_status_history: updated_by ──
ALTER TABLE removal_status_history ADD COLUMN _updated_by CHAR(36) DEFAULT NULL;
UPDATE removal_status_history h
  JOIN users u ON u.id = h.updated_by
  SET h._updated_by = u._id
  WHERE h.updated_by IS NOT NULL;

-- ── api_tokens: user_id ──
ALTER TABLE api_tokens ADD COLUMN _user_id CHAR(36) NOT NULL DEFAULT '';
UPDATE api_tokens t
  JOIN users u ON u.id = t.user_id
  SET t._user_id = u._id;

-- ── api_token_usage: token_id ──
ALTER TABLE api_token_usage ADD COLUMN _token_id CHAR(36) NOT NULL DEFAULT '';
UPDATE api_token_usage u
  JOIN api_tokens t ON t.id = u.token_id
  SET u._token_id = t._id;

-- ── user_preferences: user_id (also the PK) ──
ALTER TABLE user_preferences ADD COLUMN _user_id CHAR(36) NOT NULL DEFAULT '';
UPDATE user_preferences p
  JOIN users u ON u.id = p.user_id
  SET p._user_id = u._id;

-- ── module tables: uploaded_by ──
ALTER TABLE unauthorized_search_result ADD COLUMN _uploaded_by CHAR(36) DEFAULT NULL;
UPDATE unauthorized_search_result r
  JOIN users u ON u.id = r.uploaded_by
  SET r._uploaded_by = u._id
  WHERE r.uploaded_by IS NOT NULL;

ALTER TABLE ads_tutorials_social_media ADD COLUMN _uploaded_by CHAR(36) DEFAULT NULL;
UPDATE ads_tutorials_social_media r
  JOIN users u ON u.id = r.uploaded_by
  SET r._uploaded_by = u._id
  WHERE r.uploaded_by IS NOT NULL;

ALTER TABLE password_sharing_social_media ADD COLUMN _uploaded_by CHAR(36) DEFAULT NULL;
UPDATE password_sharing_social_media r
  JOIN users u ON u.id = r.uploaded_by
  SET r._uploaded_by = u._id
  WHERE r.uploaded_by IS NOT NULL;

ALTER TABLE password_sharing_marketplace ADD COLUMN _uploaded_by CHAR(36) DEFAULT NULL;
UPDATE password_sharing_marketplace r
  JOIN users u ON u.id = r.uploaded_by
  SET r._uploaded_by = u._id
  WHERE r.uploaded_by IS NOT NULL;

ALTER TABLE iptv_apps_internet ADD COLUMN _uploaded_by CHAR(36) DEFAULT NULL;
UPDATE iptv_apps_internet r
  JOIN users u ON u.id = r.uploaded_by
  SET r._uploaded_by = u._id
  WHERE r.uploaded_by IS NOT NULL;

ALTER TABLE iptv_apps_apps ADD COLUMN _uploaded_by CHAR(36) DEFAULT NULL;
UPDATE iptv_apps_apps r
  JOIN users u ON u.id = r.uploaded_by
  SET r._uploaded_by = u._id
  WHERE r.uploaded_by IS NOT NULL;

ALTER TABLE iptv_apps_social_media ADD COLUMN _uploaded_by CHAR(36) DEFAULT NULL;
UPDATE iptv_apps_social_media r
  JOIN users u ON u.id = r.uploaded_by
  SET r._uploaded_by = u._id
  WHERE r.uploaded_by IS NOT NULL;

ALTER TABLE iptv_apps_marketplace ADD COLUMN _uploaded_by CHAR(36) DEFAULT NULL;
UPDATE iptv_apps_marketplace r
  JOIN users u ON u.id = r.uploaded_by
  SET r._uploaded_by = u._id
  WHERE r.uploaded_by IS NOT NULL;

ALTER TABLE iptv_apps_meta_ads ADD COLUMN _uploaded_by CHAR(36) DEFAULT NULL;
UPDATE iptv_apps_meta_ads r
  JOIN users u ON u.id = r.uploaded_by
  SET r._uploaded_by = u._id
  WHERE r.uploaded_by IS NOT NULL;

-- ════════════════════════════════════════════════════════════
-- PHASE 3 — Drop old FK constraints
-- ════════════════════════════════════════════════════════════

ALTER TABLE user_module_permissions
  DROP FOREIGN KEY user_module_permissions_ibfk_1,
  DROP FOREIGN KEY user_module_permissions_ibfk_2;

ALTER TABLE api_token_usage
  DROP FOREIGN KEY api_token_usage_ibfk_1;

-- ════════════════════════════════════════════════════════════
-- PHASE 4 — Swap old INT PK/FK columns with new CHAR(36) ones
-- ════════════════════════════════════════════════════════════

-- ── users ──
ALTER TABLE users DROP PRIMARY KEY, DROP COLUMN id;
ALTER TABLE users CHANGE _id id CHAR(36) NOT NULL;
ALTER TABLE users ADD PRIMARY KEY (id);
ALTER TABLE users ALTER COLUMN id SET DEFAULT (UUID());

-- ── modules ──
ALTER TABLE modules DROP PRIMARY KEY, DROP COLUMN id;
ALTER TABLE modules CHANGE _id id CHAR(36) NOT NULL;
ALTER TABLE modules ADD PRIMARY KEY (id);
ALTER TABLE modules ALTER COLUMN id SET DEFAULT (UUID());

-- ── user_module_permissions ──
ALTER TABLE user_module_permissions
  DROP COLUMN user_id,
  DROP COLUMN module_id,
  DROP COLUMN granted_by,
  DROP PRIMARY KEY,
  DROP COLUMN id;
ALTER TABLE user_module_permissions
  CHANGE _id         id         CHAR(36) NOT NULL,
  CHANGE _user_id    user_id    CHAR(36) NOT NULL,
  CHANGE _module_id  module_id  CHAR(36) NOT NULL,
  CHANGE _granted_by granted_by CHAR(36) DEFAULT NULL;
ALTER TABLE user_module_permissions ADD PRIMARY KEY (id);
ALTER TABLE user_module_permissions ALTER COLUMN id SET DEFAULT (UUID());

-- ── user_activity ──
ALTER TABLE user_activity DROP COLUMN user_id, DROP PRIMARY KEY, DROP COLUMN id;
ALTER TABLE user_activity CHANGE _id id CHAR(36) NOT NULL, CHANGE _user_id user_id CHAR(36) NOT NULL;
ALTER TABLE user_activity ADD PRIMARY KEY (id);
ALTER TABLE user_activity ALTER COLUMN id SET DEFAULT (UUID());

-- ── removal_status_history ──
ALTER TABLE removal_status_history DROP COLUMN updated_by, DROP PRIMARY KEY, DROP COLUMN id;
ALTER TABLE removal_status_history
  CHANGE _id         id         CHAR(36) NOT NULL,
  CHANGE _updated_by updated_by CHAR(36) DEFAULT NULL;
ALTER TABLE removal_status_history ADD PRIMARY KEY (id);
ALTER TABLE removal_status_history ALTER COLUMN id SET DEFAULT (UUID());

-- ── email_config ──
ALTER TABLE email_config DROP PRIMARY KEY, DROP COLUMN id;
ALTER TABLE email_config CHANGE _id id CHAR(36) NOT NULL;
ALTER TABLE email_config ADD PRIMARY KEY (id);
ALTER TABLE email_config ALTER COLUMN id SET DEFAULT (UUID());

-- ── api_tokens ──
ALTER TABLE api_tokens DROP COLUMN user_id, DROP PRIMARY KEY, DROP COLUMN id;
ALTER TABLE api_tokens CHANGE _id id CHAR(36) NOT NULL, CHANGE _user_id user_id CHAR(36) NOT NULL;
ALTER TABLE api_tokens ADD PRIMARY KEY (id);
ALTER TABLE api_tokens ALTER COLUMN id SET DEFAULT (UUID());

-- ── api_token_usage ──
ALTER TABLE api_token_usage DROP COLUMN token_id, DROP PRIMARY KEY, DROP COLUMN id;
ALTER TABLE api_token_usage CHANGE _id id CHAR(36) NOT NULL, CHANGE _token_id token_id CHAR(36) NOT NULL;
ALTER TABLE api_token_usage ADD PRIMARY KEY (id);
ALTER TABLE api_token_usage ALTER COLUMN id SET DEFAULT (UUID());

-- ── user_preferences ──
ALTER TABLE user_preferences DROP PRIMARY KEY, DROP COLUMN user_id;
ALTER TABLE user_preferences CHANGE _user_id user_id CHAR(36) NOT NULL;
ALTER TABLE user_preferences ADD PRIMARY KEY (user_id);

-- ── module tables ──
ALTER TABLE unauthorized_search_result DROP COLUMN uploaded_by, DROP PRIMARY KEY, DROP COLUMN id;
ALTER TABLE unauthorized_search_result
  CHANGE _id id CHAR(36) NOT NULL, CHANGE _uploaded_by uploaded_by CHAR(36) DEFAULT NULL;
ALTER TABLE unauthorized_search_result ADD PRIMARY KEY (id);
ALTER TABLE unauthorized_search_result ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE ads_tutorials_social_media DROP COLUMN uploaded_by, DROP PRIMARY KEY, DROP COLUMN id;
ALTER TABLE ads_tutorials_social_media
  CHANGE _id id CHAR(36) NOT NULL, CHANGE _uploaded_by uploaded_by CHAR(36) DEFAULT NULL;
ALTER TABLE ads_tutorials_social_media ADD PRIMARY KEY (id);
ALTER TABLE ads_tutorials_social_media ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE password_sharing_social_media DROP COLUMN uploaded_by, DROP PRIMARY KEY, DROP COLUMN id;
ALTER TABLE password_sharing_social_media
  CHANGE _id id CHAR(36) NOT NULL, CHANGE _uploaded_by uploaded_by CHAR(36) DEFAULT NULL;
ALTER TABLE password_sharing_social_media ADD PRIMARY KEY (id);
ALTER TABLE password_sharing_social_media ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE password_sharing_marketplace DROP COLUMN uploaded_by, DROP PRIMARY KEY, DROP COLUMN id;
ALTER TABLE password_sharing_marketplace
  CHANGE _id id CHAR(36) NOT NULL, CHANGE _uploaded_by uploaded_by CHAR(36) DEFAULT NULL;
ALTER TABLE password_sharing_marketplace ADD PRIMARY KEY (id);
ALTER TABLE password_sharing_marketplace ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE iptv_apps_internet DROP COLUMN uploaded_by, DROP PRIMARY KEY, DROP COLUMN id;
ALTER TABLE iptv_apps_internet
  CHANGE _id id CHAR(36) NOT NULL, CHANGE _uploaded_by uploaded_by CHAR(36) DEFAULT NULL;
ALTER TABLE iptv_apps_internet ADD PRIMARY KEY (id);
ALTER TABLE iptv_apps_internet ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE iptv_apps_apps DROP COLUMN uploaded_by, DROP PRIMARY KEY, DROP COLUMN id;
ALTER TABLE iptv_apps_apps
  CHANGE _id id CHAR(36) NOT NULL, CHANGE _uploaded_by uploaded_by CHAR(36) DEFAULT NULL;
ALTER TABLE iptv_apps_apps ADD PRIMARY KEY (id);
ALTER TABLE iptv_apps_apps ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE iptv_apps_social_media DROP COLUMN uploaded_by, DROP PRIMARY KEY, DROP COLUMN id;
ALTER TABLE iptv_apps_social_media
  CHANGE _id id CHAR(36) NOT NULL, CHANGE _uploaded_by uploaded_by CHAR(36) DEFAULT NULL;
ALTER TABLE iptv_apps_social_media ADD PRIMARY KEY (id);
ALTER TABLE iptv_apps_social_media ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE iptv_apps_marketplace DROP COLUMN uploaded_by, DROP PRIMARY KEY, DROP COLUMN id;
ALTER TABLE iptv_apps_marketplace
  CHANGE _id id CHAR(36) NOT NULL, CHANGE _uploaded_by uploaded_by CHAR(36) DEFAULT NULL;
ALTER TABLE iptv_apps_marketplace ADD PRIMARY KEY (id);
ALTER TABLE iptv_apps_marketplace ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE iptv_apps_meta_ads DROP COLUMN uploaded_by, DROP PRIMARY KEY, DROP COLUMN id;
ALTER TABLE iptv_apps_meta_ads
  CHANGE _id id CHAR(36) NOT NULL, CHANGE _uploaded_by uploaded_by CHAR(36) DEFAULT NULL;
ALTER TABLE iptv_apps_meta_ads ADD PRIMARY KEY (id);
ALTER TABLE iptv_apps_meta_ads ALTER COLUMN id SET DEFAULT (UUID());

-- ════════════════════════════════════════════════════════════
-- PHASE 5 — Re-add FK constraints with CHAR(36) types
-- ════════════════════════════════════════════════════════════

ALTER TABLE user_module_permissions
  ADD FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  ADD FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE;

ALTER TABLE api_token_usage
  ADD FOREIGN KEY (token_id) REFERENCES api_tokens(id) ON DELETE CASCADE;

-- Rebuild indexes on updated FK columns
ALTER TABLE user_module_permissions ADD UNIQUE KEY uq_user_module (user_id, module_id);
ALTER TABLE user_module_permissions ADD INDEX idx_user_id (user_id);
ALTER TABLE user_module_permissions ADD INDEX idx_module_id (module_id);
ALTER TABLE user_activity ADD INDEX idx_user (user_id);

SET FOREIGN_KEY_CHECKS = 1;
