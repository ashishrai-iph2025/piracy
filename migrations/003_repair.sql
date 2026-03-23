-- Migration 003 Repair — run this if migration 003 left tables without an `id` column.
--
-- This script handles two broken states:
--   State A: Column is named `uuid_id`  (old broken migration Phase 4 dropped `id` but didn't rename `uuid_id`)
--   State B: Column is named `_id`      (new phase-based migration Phase 1 ran but Phase 4 did not)
--
-- HOW TO CHECK YOUR STATE — run this in MySQL:
--   SELECT TABLE_NAME, COLUMN_NAME
--   FROM information_schema.COLUMNS
--   WHERE TABLE_SCHEMA = 'piracy_reporting'
--     AND COLUMN_NAME IN ('id','uuid_id','_id')
--   ORDER BY TABLE_NAME, COLUMN_NAME;
--
-- If you see `uuid_id` but no `id`  → you are in State A → uncomment the STATE A block below
-- If you see `_id` but no `id`      → you are in State B → uncomment the STATE B block below
-- If you see `id` already            → table is fine, skip it

SET FOREIGN_KEY_CHECKS = 0;

-- ════════════════════════════════════════════════════════════
-- STATE A REPAIR: uuid_id exists, id is missing
-- Uncomment and run if SHOW COLUMNS shows `uuid_id` instead of `id`
-- ════════════════════════════════════════════════════════════

/*
-- users
ALTER TABLE users CHANGE uuid_id id CHAR(36) NOT NULL;
ALTER TABLE users ADD PRIMARY KEY (id);
ALTER TABLE users ALTER COLUMN id SET DEFAULT (UUID());

-- modules
ALTER TABLE modules CHANGE uuid_id id CHAR(36) NOT NULL;
ALTER TABLE modules ADD PRIMARY KEY (id);
ALTER TABLE modules ALTER COLUMN id SET DEFAULT (UUID());

-- user_module_permissions
ALTER TABLE user_module_permissions CHANGE uuid_id id CHAR(36) NOT NULL;
ALTER TABLE user_module_permissions ADD PRIMARY KEY (id);
ALTER TABLE user_module_permissions ALTER COLUMN id SET DEFAULT (UUID());

-- user_activity
ALTER TABLE user_activity CHANGE uuid_id id CHAR(36) NOT NULL;
ALTER TABLE user_activity ADD PRIMARY KEY (id);
ALTER TABLE user_activity ALTER COLUMN id SET DEFAULT (UUID());

-- removal_status_history
ALTER TABLE removal_status_history CHANGE uuid_id id CHAR(36) NOT NULL;
ALTER TABLE removal_status_history ADD PRIMARY KEY (id);
ALTER TABLE removal_status_history ALTER COLUMN id SET DEFAULT (UUID());

-- email_config
ALTER TABLE email_config CHANGE uuid_id id CHAR(36) NOT NULL;
ALTER TABLE email_config ADD PRIMARY KEY (id);
ALTER TABLE email_config ALTER COLUMN id SET DEFAULT (UUID());

-- api_tokens
ALTER TABLE api_tokens CHANGE uuid_id id CHAR(36) NOT NULL;
ALTER TABLE api_tokens ADD PRIMARY KEY (id);
ALTER TABLE api_tokens ALTER COLUMN id SET DEFAULT (UUID());

-- api_token_usage
ALTER TABLE api_token_usage CHANGE uuid_id id CHAR(36) NOT NULL;
ALTER TABLE api_token_usage ADD PRIMARY KEY (id);
ALTER TABLE api_token_usage ALTER COLUMN id SET DEFAULT (UUID());

-- module tables
ALTER TABLE unauthorized_search_result CHANGE uuid_id id CHAR(36) NOT NULL;
ALTER TABLE unauthorized_search_result ADD PRIMARY KEY (id);
ALTER TABLE unauthorized_search_result ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE ads_tutorials_social_media CHANGE uuid_id id CHAR(36) NOT NULL;
ALTER TABLE ads_tutorials_social_media ADD PRIMARY KEY (id);
ALTER TABLE ads_tutorials_social_media ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE password_sharing_social_media CHANGE uuid_id id CHAR(36) NOT NULL;
ALTER TABLE password_sharing_social_media ADD PRIMARY KEY (id);
ALTER TABLE password_sharing_social_media ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE password_sharing_marketplace CHANGE uuid_id id CHAR(36) NOT NULL;
ALTER TABLE password_sharing_marketplace ADD PRIMARY KEY (id);
ALTER TABLE password_sharing_marketplace ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE iptv_apps_internet CHANGE uuid_id id CHAR(36) NOT NULL;
ALTER TABLE iptv_apps_internet ADD PRIMARY KEY (id);
ALTER TABLE iptv_apps_internet ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE iptv_apps_apps CHANGE uuid_id id CHAR(36) NOT NULL;
ALTER TABLE iptv_apps_apps ADD PRIMARY KEY (id);
ALTER TABLE iptv_apps_apps ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE iptv_apps_social_media CHANGE uuid_id id CHAR(36) NOT NULL;
ALTER TABLE iptv_apps_social_media ADD PRIMARY KEY (id);
ALTER TABLE iptv_apps_social_media ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE iptv_apps_marketplace CHANGE uuid_id id CHAR(36) NOT NULL;
ALTER TABLE iptv_apps_marketplace ADD PRIMARY KEY (id);
ALTER TABLE iptv_apps_marketplace ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE iptv_apps_meta_ads CHANGE uuid_id id CHAR(36) NOT NULL;
ALTER TABLE iptv_apps_meta_ads ADD PRIMARY KEY (id);
ALTER TABLE iptv_apps_meta_ads ALTER COLUMN id SET DEFAULT (UUID());
*/

-- ════════════════════════════════════════════════════════════
-- STATE B REPAIR: _id exists, id is missing
-- Uncomment and run if SHOW COLUMNS shows `_id` instead of `id`
-- ════════════════════════════════════════════════════════════

/*
-- users
ALTER TABLE users CHANGE _id id CHAR(36) NOT NULL;
ALTER TABLE users ADD PRIMARY KEY (id);
ALTER TABLE users ALTER COLUMN id SET DEFAULT (UUID());

-- modules
ALTER TABLE modules CHANGE _id id CHAR(36) NOT NULL;
ALTER TABLE modules ADD PRIMARY KEY (id);
ALTER TABLE modules ALTER COLUMN id SET DEFAULT (UUID());

-- user_module_permissions
ALTER TABLE user_module_permissions CHANGE _id id CHAR(36) NOT NULL;
ALTER TABLE user_module_permissions ADD PRIMARY KEY (id);
ALTER TABLE user_module_permissions ALTER COLUMN id SET DEFAULT (UUID());

-- user_activity
ALTER TABLE user_activity CHANGE _id id CHAR(36) NOT NULL;
ALTER TABLE user_activity ADD PRIMARY KEY (id);
ALTER TABLE user_activity ALTER COLUMN id SET DEFAULT (UUID());

-- removal_status_history
ALTER TABLE removal_status_history CHANGE _id id CHAR(36) NOT NULL;
ALTER TABLE removal_status_history ADD PRIMARY KEY (id);
ALTER TABLE removal_status_history ALTER COLUMN id SET DEFAULT (UUID());

-- email_config
ALTER TABLE email_config CHANGE _id id CHAR(36) NOT NULL;
ALTER TABLE email_config ADD PRIMARY KEY (id);
ALTER TABLE email_config ALTER COLUMN id SET DEFAULT (UUID());

-- api_tokens
ALTER TABLE api_tokens CHANGE _id id CHAR(36) NOT NULL;
ALTER TABLE api_tokens ADD PRIMARY KEY (id);
ALTER TABLE api_tokens ALTER COLUMN id SET DEFAULT (UUID());

-- api_token_usage
ALTER TABLE api_token_usage CHANGE _id id CHAR(36) NOT NULL;
ALTER TABLE api_token_usage ADD PRIMARY KEY (id);
ALTER TABLE api_token_usage ALTER COLUMN id SET DEFAULT (UUID());

-- module tables
ALTER TABLE unauthorized_search_result CHANGE _id id CHAR(36) NOT NULL;
ALTER TABLE unauthorized_search_result ADD PRIMARY KEY (id);
ALTER TABLE unauthorized_search_result ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE ads_tutorials_social_media CHANGE _id id CHAR(36) NOT NULL;
ALTER TABLE ads_tutorials_social_media ADD PRIMARY KEY (id);
ALTER TABLE ads_tutorials_social_media ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE password_sharing_social_media CHANGE _id id CHAR(36) NOT NULL;
ALTER TABLE password_sharing_social_media ADD PRIMARY KEY (id);
ALTER TABLE password_sharing_social_media ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE password_sharing_marketplace CHANGE _id id CHAR(36) NOT NULL;
ALTER TABLE password_sharing_marketplace ADD PRIMARY KEY (id);
ALTER TABLE password_sharing_marketplace ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE iptv_apps_internet CHANGE _id id CHAR(36) NOT NULL;
ALTER TABLE iptv_apps_internet ADD PRIMARY KEY (id);
ALTER TABLE iptv_apps_internet ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE iptv_apps_apps CHANGE _id id CHAR(36) NOT NULL;
ALTER TABLE iptv_apps_apps ADD PRIMARY KEY (id);
ALTER TABLE iptv_apps_apps ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE iptv_apps_social_media CHANGE _id id CHAR(36) NOT NULL;
ALTER TABLE iptv_apps_social_media ADD PRIMARY KEY (id);
ALTER TABLE iptv_apps_social_media ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE iptv_apps_marketplace CHANGE _id id CHAR(36) NOT NULL;
ALTER TABLE iptv_apps_marketplace ADD PRIMARY KEY (id);
ALTER TABLE iptv_apps_marketplace ALTER COLUMN id SET DEFAULT (UUID());

ALTER TABLE iptv_apps_meta_ads CHANGE _id id CHAR(36) NOT NULL;
ALTER TABLE iptv_apps_meta_ads ADD PRIMARY KEY (id);
ALTER TABLE iptv_apps_meta_ads ALTER COLUMN id SET DEFAULT (UUID());
*/

SET FOREIGN_KEY_CHECKS = 1;
