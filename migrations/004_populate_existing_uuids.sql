-- Migration 004: Add UUID `id` column to existing data
--
-- Run this when the `id` column is completely missing from tables
-- (i.e., neither uuid_id, _id, nor id exists in the table).
--
-- Safe to run multiple times — uses IF NOT EXISTS checks via stored procedure.
-- Requires MySQL 8.0.13+ for DEFAULT (UUID())
--
-- Run: mysql -u piracy_user -p piracy_reporting < migrations/004_populate_existing_uuids.sql

SET FOREIGN_KEY_CHECKS = 0;

DROP PROCEDURE IF EXISTS add_uuid_id;

DELIMITER $$
CREATE PROCEDURE add_uuid_id(IN tbl VARCHAR(100))
BEGIN
  -- Check if `id` column already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tbl AND COLUMN_NAME = 'id'
  ) THEN
    -- Add column as nullable first (allows populating existing rows)
    SET @sql = CONCAT('ALTER TABLE `', tbl, '` ADD COLUMN `id` CHAR(36) DEFAULT NULL FIRST');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    -- Populate every existing row with a unique UUID
    SET @sql = CONCAT('UPDATE `', tbl, '` SET `id` = UUID()');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    -- Make it NOT NULL
    SET @sql = CONCAT('ALTER TABLE `', tbl, '` MODIFY COLUMN `id` CHAR(36) NOT NULL');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    -- Add primary key
    SET @sql = CONCAT('ALTER TABLE `', tbl, '` ADD PRIMARY KEY (`id`)');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    -- Set DEFAULT (UUID()) for future inserts
    SET @sql = CONCAT('ALTER TABLE `', tbl, '` ALTER COLUMN `id` SET DEFAULT (UUID())');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    SELECT CONCAT('✓ Added UUID id to: ', tbl) AS result;
  ELSE
    SELECT CONCAT('⏩ Skipped (id exists): ', tbl) AS result;
  END IF;
END$$
DELIMITER ;

-- ── Run for every table ──────────────────────────────────────────────────────

CALL add_uuid_id('users');
CALL add_uuid_id('modules');
CALL add_uuid_id('user_module_permissions');
CALL add_uuid_id('user_activity');
CALL add_uuid_id('user_preferences');
CALL add_uuid_id('removal_status_history');
CALL add_uuid_id('email_config');
CALL add_uuid_id('api_tokens');
CALL add_uuid_id('api_token_usage');

-- Module data tables
CALL add_uuid_id('unauthorized_search_result');
CALL add_uuid_id('ads_tutorials_social_media');
CALL add_uuid_id('password_sharing_social_media');
CALL add_uuid_id('password_sharing_marketplace');
CALL add_uuid_id('iptv_apps_internet');
CALL add_uuid_id('iptv_apps_apps');
CALL add_uuid_id('iptv_apps_social_media');
CALL add_uuid_id('iptv_apps_marketplace');
CALL add_uuid_id('iptv_apps_meta_ads');

-- Also ensure FK columns that should be CHAR(36) are updated
-- (user_id, uploaded_by, etc. — only if they still hold old integer values as strings)

DROP PROCEDURE IF EXISTS add_uuid_id;

SET FOREIGN_KEY_CHECKS = 1;
