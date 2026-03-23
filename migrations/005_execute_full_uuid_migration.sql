-- Migration 005: Execute Full UUID Migration
-- Converts all primary keys to CHAR(36) UUID and fixes all FK columns
-- Run: mysql -u root piracy_reporting < migrations/005_execute_full_uuid_migration.sql

SET FOREIGN_KEY_CHECKS = 0;

-- ═══════════════════════════════════════════════════════════════════════
-- PHASE 1: Fix FK string values while old INT PKs still exist
-- user_module_permissions, user_preferences, user_activity have
-- CHAR(36) columns that still hold old integer strings ("1","2","92")
-- ═══════════════════════════════════════════════════════════════════════

-- Fix user_module_permissions.user_id
UPDATE user_module_permissions p
JOIN users u ON u.id = CAST(p.user_id AS UNSIGNED)
SET p.user_id = u.uuid_id
WHERE p.user_id REGEXP '^[0-9]+$';

-- Fix user_module_permissions.module_id
UPDATE user_module_permissions p
JOIN modules m ON m.id = CAST(p.module_id AS UNSIGNED)
SET p.module_id = m.uuid_id
WHERE p.module_id REGEXP '^[0-9]+$';

-- Fix user_preferences.user_id
UPDATE user_preferences p
JOIN users u ON u.id = CAST(p.user_id AS UNSIGNED)
SET p.user_id = u.uuid_id
WHERE p.user_id REGEXP '^[0-9]+$';

-- Fix user_activity.user_id (best-effort; non-matching rows stay as-is)
UPDATE user_activity a
JOIN users u ON u.id = CAST(a.user_id AS UNSIGNED)
SET a.user_id = u.uuid_id
WHERE a.user_id REGEXP '^[0-9]+$';

-- ═══════════════════════════════════════════════════════════════════════
-- PHASE 2: Fix uploaded_by INT -> CHAR(36) in all module data tables
-- (do this while users.id is still INT so JOIN works)
-- ═══════════════════════════════════════════════════════════════════════

-- unauthorized_search_result
ALTER TABLE unauthorized_search_result ADD COLUMN uploader_uuid CHAR(36) DEFAULT NULL;
UPDATE unauthorized_search_result r JOIN users u ON u.id = r.uploaded_by SET r.uploader_uuid = u.uuid_id;
ALTER TABLE unauthorized_search_result DROP COLUMN uploaded_by;
ALTER TABLE unauthorized_search_result CHANGE uploader_uuid uploaded_by CHAR(36) DEFAULT NULL;

-- ads_tutorials_social_media
ALTER TABLE ads_tutorials_social_media ADD COLUMN uploader_uuid CHAR(36) DEFAULT NULL;
UPDATE ads_tutorials_social_media r JOIN users u ON u.id = r.uploaded_by SET r.uploader_uuid = u.uuid_id;
ALTER TABLE ads_tutorials_social_media DROP COLUMN uploaded_by;
ALTER TABLE ads_tutorials_social_media CHANGE uploader_uuid uploaded_by CHAR(36) DEFAULT NULL;

-- password_sharing_social_media
ALTER TABLE password_sharing_social_media ADD COLUMN uploader_uuid CHAR(36) DEFAULT NULL;
UPDATE password_sharing_social_media r JOIN users u ON u.id = r.uploaded_by SET r.uploader_uuid = u.uuid_id;
ALTER TABLE password_sharing_social_media DROP COLUMN uploaded_by;
ALTER TABLE password_sharing_social_media CHANGE uploader_uuid uploaded_by CHAR(36) DEFAULT NULL;

-- password_sharing_marketplace
ALTER TABLE password_sharing_marketplace ADD COLUMN uploader_uuid CHAR(36) DEFAULT NULL;
UPDATE password_sharing_marketplace r JOIN users u ON u.id = r.uploaded_by SET r.uploader_uuid = u.uuid_id;
ALTER TABLE password_sharing_marketplace DROP COLUMN uploaded_by;
ALTER TABLE password_sharing_marketplace CHANGE uploader_uuid uploaded_by CHAR(36) DEFAULT NULL;

-- iptv_apps_internet
ALTER TABLE iptv_apps_internet ADD COLUMN uploader_uuid CHAR(36) DEFAULT NULL;
UPDATE iptv_apps_internet r JOIN users u ON u.id = r.uploaded_by SET r.uploader_uuid = u.uuid_id;
ALTER TABLE iptv_apps_internet DROP COLUMN uploaded_by;
ALTER TABLE iptv_apps_internet CHANGE uploader_uuid uploaded_by CHAR(36) DEFAULT NULL;

-- iptv_apps_apps
ALTER TABLE iptv_apps_apps ADD COLUMN uploader_uuid CHAR(36) DEFAULT NULL;
UPDATE iptv_apps_apps r JOIN users u ON u.id = r.uploaded_by SET r.uploader_uuid = u.uuid_id;
ALTER TABLE iptv_apps_apps DROP COLUMN uploaded_by;
ALTER TABLE iptv_apps_apps CHANGE uploader_uuid uploaded_by CHAR(36) DEFAULT NULL;

-- iptv_apps_social_media
ALTER TABLE iptv_apps_social_media ADD COLUMN uploader_uuid CHAR(36) DEFAULT NULL;
UPDATE iptv_apps_social_media r JOIN users u ON u.id = r.uploaded_by SET r.uploader_uuid = u.uuid_id;
ALTER TABLE iptv_apps_social_media DROP COLUMN uploaded_by;
ALTER TABLE iptv_apps_social_media CHANGE uploader_uuid uploaded_by CHAR(36) DEFAULT NULL;

-- iptv_apps_marketplace
ALTER TABLE iptv_apps_marketplace ADD COLUMN uploader_uuid CHAR(36) DEFAULT NULL;
UPDATE iptv_apps_marketplace r JOIN users u ON u.id = r.uploaded_by SET r.uploader_uuid = u.uuid_id;
ALTER TABLE iptv_apps_marketplace DROP COLUMN uploaded_by;
ALTER TABLE iptv_apps_marketplace CHANGE uploader_uuid uploaded_by CHAR(36) DEFAULT NULL;

-- iptv_apps_meta_ads
ALTER TABLE iptv_apps_meta_ads ADD COLUMN uploader_uuid CHAR(36) DEFAULT NULL;
UPDATE iptv_apps_meta_ads r JOIN users u ON u.id = r.uploaded_by SET r.uploader_uuid = u.uuid_id;
ALTER TABLE iptv_apps_meta_ads DROP COLUMN uploaded_by;
ALTER TABLE iptv_apps_meta_ads CHANGE uploader_uuid uploaded_by CHAR(36) DEFAULT NULL;

-- api_tokens: fix user_id INT -> CHAR(36)
ALTER TABLE api_tokens ADD COLUMN user_uuid CHAR(36) DEFAULT NULL;
UPDATE api_tokens t JOIN users u ON u.id = t.user_id SET t.user_uuid = u.uuid_id;
ALTER TABLE api_tokens DROP COLUMN user_id;
ALTER TABLE api_tokens CHANGE user_uuid user_id CHAR(36) DEFAULT NULL;

-- ═══════════════════════════════════════════════════════════════════════
-- PHASE 3: Fix users table -- drop old INT id, rename uuid_id -> id
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE users DROP PRIMARY KEY, DROP COLUMN id, CHANGE uuid_id id CHAR(36) NOT NULL;
ALTER TABLE users ADD PRIMARY KEY (id);
ALTER TABLE users ALTER COLUMN id SET DEFAULT (UUID());

-- ═══════════════════════════════════════════════════════════════════════
-- PHASE 4: Fix modules table -- drop old INT id, rename uuid_id -> id
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE modules DROP PRIMARY KEY, DROP COLUMN id, CHANGE uuid_id id CHAR(36) NOT NULL;
ALTER TABLE modules ADD PRIMARY KEY (id);
ALTER TABLE modules ALTER COLUMN id SET DEFAULT (UUID());

-- ═══════════════════════════════════════════════════════════════════════
-- PHASE 5: Add id CHAR(36) PK to tables that have no id column
-- ═══════════════════════════════════════════════════════════════════════

-- unauthorized_search_result (6144 rows)
ALTER TABLE unauthorized_search_result ADD COLUMN id CHAR(36) DEFAULT NULL FIRST;
UPDATE unauthorized_search_result SET id = UUID();
ALTER TABLE unauthorized_search_result MODIFY COLUMN id CHAR(36) NOT NULL;
ALTER TABLE unauthorized_search_result ADD PRIMARY KEY (id);
ALTER TABLE unauthorized_search_result ALTER COLUMN id SET DEFAULT (UUID());

-- ads_tutorials_social_media
ALTER TABLE ads_tutorials_social_media ADD COLUMN id CHAR(36) DEFAULT NULL FIRST;
UPDATE ads_tutorials_social_media SET id = UUID();
ALTER TABLE ads_tutorials_social_media MODIFY COLUMN id CHAR(36) NOT NULL;
ALTER TABLE ads_tutorials_social_media ADD PRIMARY KEY (id);
ALTER TABLE ads_tutorials_social_media ALTER COLUMN id SET DEFAULT (UUID());

-- password_sharing_social_media
ALTER TABLE password_sharing_social_media ADD COLUMN id CHAR(36) DEFAULT NULL FIRST;
UPDATE password_sharing_social_media SET id = UUID();
ALTER TABLE password_sharing_social_media MODIFY COLUMN id CHAR(36) NOT NULL;
ALTER TABLE password_sharing_social_media ADD PRIMARY KEY (id);
ALTER TABLE password_sharing_social_media ALTER COLUMN id SET DEFAULT (UUID());

-- password_sharing_marketplace
ALTER TABLE password_sharing_marketplace ADD COLUMN id CHAR(36) DEFAULT NULL FIRST;
UPDATE password_sharing_marketplace SET id = UUID();
ALTER TABLE password_sharing_marketplace MODIFY COLUMN id CHAR(36) NOT NULL;
ALTER TABLE password_sharing_marketplace ADD PRIMARY KEY (id);
ALTER TABLE password_sharing_marketplace ALTER COLUMN id SET DEFAULT (UUID());

-- iptv_apps_internet
ALTER TABLE iptv_apps_internet ADD COLUMN id CHAR(36) DEFAULT NULL FIRST;
UPDATE iptv_apps_internet SET id = UUID();
ALTER TABLE iptv_apps_internet MODIFY COLUMN id CHAR(36) NOT NULL;
ALTER TABLE iptv_apps_internet ADD PRIMARY KEY (id);
ALTER TABLE iptv_apps_internet ALTER COLUMN id SET DEFAULT (UUID());

-- iptv_apps_apps
ALTER TABLE iptv_apps_apps ADD COLUMN id CHAR(36) DEFAULT NULL FIRST;
UPDATE iptv_apps_apps SET id = UUID();
ALTER TABLE iptv_apps_apps MODIFY COLUMN id CHAR(36) NOT NULL;
ALTER TABLE iptv_apps_apps ADD PRIMARY KEY (id);
ALTER TABLE iptv_apps_apps ALTER COLUMN id SET DEFAULT (UUID());

-- iptv_apps_social_media
ALTER TABLE iptv_apps_social_media ADD COLUMN id CHAR(36) DEFAULT NULL FIRST;
UPDATE iptv_apps_social_media SET id = UUID();
ALTER TABLE iptv_apps_social_media MODIFY COLUMN id CHAR(36) NOT NULL;
ALTER TABLE iptv_apps_social_media ADD PRIMARY KEY (id);
ALTER TABLE iptv_apps_social_media ALTER COLUMN id SET DEFAULT (UUID());

-- iptv_apps_marketplace
ALTER TABLE iptv_apps_marketplace ADD COLUMN id CHAR(36) DEFAULT NULL FIRST;
UPDATE iptv_apps_marketplace SET id = UUID();
ALTER TABLE iptv_apps_marketplace MODIFY COLUMN id CHAR(36) NOT NULL;
ALTER TABLE iptv_apps_marketplace ADD PRIMARY KEY (id);
ALTER TABLE iptv_apps_marketplace ALTER COLUMN id SET DEFAULT (UUID());

-- user_activity (add id PK)
ALTER TABLE user_activity ADD COLUMN id CHAR(36) DEFAULT NULL FIRST;
UPDATE user_activity SET id = UUID();
ALTER TABLE user_activity MODIFY COLUMN id CHAR(36) NOT NULL;
ALTER TABLE user_activity ADD PRIMARY KEY (id);
ALTER TABLE user_activity ALTER COLUMN id SET DEFAULT (UUID());

-- user_module_permissions (add separate id column alongside composite unique key)
ALTER TABLE user_module_permissions ADD COLUMN id CHAR(36) DEFAULT NULL;
UPDATE user_module_permissions SET id = UUID();
ALTER TABLE user_module_permissions MODIFY COLUMN id CHAR(36) NOT NULL UNIQUE;

-- api_tokens (add id CHAR(36) as new PK, token stays as UNIQUE)
ALTER TABLE api_tokens ADD COLUMN id CHAR(36) DEFAULT NULL FIRST;
UPDATE api_tokens SET id = UUID();
ALTER TABLE api_tokens MODIFY COLUMN id CHAR(36) NOT NULL;
ALTER TABLE api_tokens DROP KEY `token`;
ALTER TABLE api_tokens ADD PRIMARY KEY (id);
ALTER TABLE api_tokens ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE api_tokens ADD UNIQUE KEY `uq_token` (`token`);

-- api_token_usage: add id PK + change token_id INT -> CHAR(36)
ALTER TABLE api_token_usage ADD COLUMN id CHAR(36) DEFAULT NULL FIRST;
UPDATE api_token_usage SET id = UUID();
ALTER TABLE api_token_usage MODIFY COLUMN id CHAR(36) NOT NULL;
ALTER TABLE api_token_usage ADD PRIMARY KEY (id);
ALTER TABLE api_token_usage ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE api_token_usage ADD COLUMN token_uuid CHAR(36) DEFAULT NULL;
ALTER TABLE api_token_usage DROP COLUMN token_id;
ALTER TABLE api_token_usage CHANGE token_uuid token_id CHAR(36) DEFAULT NULL;
ALTER TABLE api_token_usage ADD KEY `idx_token_id` (`token_id`);

-- ═══════════════════════════════════════════════════════════════════════
-- PHASE 6: Fix tables with INT AUTO_INCREMENT id -> CHAR(36)
-- (iptv_apps_meta_ads, marketplace, social_media, removal_status_history)
-- ═══════════════════════════════════════════════════════════════════════

-- iptv_apps_meta_ads
ALTER TABLE iptv_apps_meta_ads DROP PRIMARY KEY, MODIFY COLUMN id INT NOT NULL;
ALTER TABLE iptv_apps_meta_ads CHANGE id id_old INT NOT NULL;
ALTER TABLE iptv_apps_meta_ads ADD COLUMN id CHAR(36) DEFAULT NULL FIRST;
UPDATE iptv_apps_meta_ads SET id = UUID();
ALTER TABLE iptv_apps_meta_ads MODIFY COLUMN id CHAR(36) NOT NULL;
ALTER TABLE iptv_apps_meta_ads ADD PRIMARY KEY (id);
ALTER TABLE iptv_apps_meta_ads ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE iptv_apps_meta_ads DROP COLUMN id_old;

-- marketplace
ALTER TABLE marketplace DROP PRIMARY KEY, MODIFY COLUMN id INT NOT NULL;
ALTER TABLE marketplace CHANGE id id_old INT NOT NULL;
ALTER TABLE marketplace ADD COLUMN id CHAR(36) DEFAULT NULL FIRST;
UPDATE marketplace SET id = UUID();
ALTER TABLE marketplace MODIFY COLUMN id CHAR(36) NOT NULL;
ALTER TABLE marketplace ADD PRIMARY KEY (id);
ALTER TABLE marketplace ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE marketplace DROP COLUMN id_old;

-- social_media
ALTER TABLE social_media DROP PRIMARY KEY, MODIFY COLUMN id INT NOT NULL;
ALTER TABLE social_media CHANGE id id_old INT NOT NULL;
ALTER TABLE social_media ADD COLUMN id CHAR(36) DEFAULT NULL FIRST;
UPDATE social_media SET id = UUID();
ALTER TABLE social_media MODIFY COLUMN id CHAR(36) NOT NULL;
ALTER TABLE social_media ADD PRIMARY KEY (id);
ALTER TABLE social_media ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE social_media DROP COLUMN id_old;

-- removal_status_history
ALTER TABLE removal_status_history DROP PRIMARY KEY, MODIFY COLUMN id INT NOT NULL;
ALTER TABLE removal_status_history CHANGE id id_old INT NOT NULL;
ALTER TABLE removal_status_history ADD COLUMN id CHAR(36) DEFAULT NULL FIRST;
UPDATE removal_status_history SET id = UUID();
ALTER TABLE removal_status_history MODIFY COLUMN id CHAR(36) NOT NULL;
ALTER TABLE removal_status_history ADD PRIMARY KEY (id);
ALTER TABLE removal_status_history ALTER COLUMN id SET DEFAULT (UUID());
ALTER TABLE removal_status_history DROP COLUMN id_old;

SET FOREIGN_KEY_CHECKS = 1;

-- ═══════════════════════════════════════════════════════════════════════
-- VERIFICATION: Show all id columns across all tables
-- ═══════════════════════════════════════════════════════════════════════
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_KEY, COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'piracy_reporting' AND COLUMN_NAME = 'id'
ORDER BY TABLE_NAME;
