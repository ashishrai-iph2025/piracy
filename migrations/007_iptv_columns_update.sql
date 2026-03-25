-- ============================================================
-- Migration 007: IPTV Column Updates
-- Adds missing columns to all 5 IPTV tables to match
-- the updated template headers.
-- Run: mysql -u piracy_user -p piracy_reporting < migrations/007_iptv_columns_update.sql
-- ============================================================

-- Helper procedure for safe (idempotent) column addition
DROP PROCEDURE IF EXISTS _safe_add_col;
DELIMITER $$
CREATE PROCEDURE _safe_add_col(
  IN p_table VARCHAR(64),
  IN p_col   VARCHAR(64),
  IN p_def   TEXT,
  IN p_after VARCHAR(64)
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = p_table
      AND COLUMN_NAME  = p_col
  ) THEN
    SET @sql = CONCAT(
      'ALTER TABLE `', p_table, '` ADD COLUMN `', p_col, '` ', p_def,
      IF(p_after IS NOT NULL AND p_after != '', CONCAT(' AFTER `', p_after, '`'), '')
    );
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END $$
DELIMITER ;

-- ────────────────────────────────────────────────────────────
-- 1. iptv_apps_internet
--    New: category, tcrp_case_id_bing, tcrp_case_id_yandex,
--         delisting_timestamp_google, delisting_timestamp_bing,
--         delisting_timestamp_yandex
-- ────────────────────────────────────────────────────────────
CALL _safe_add_col('iptv_apps_internet', 'category',                   'VARCHAR(255)',  'trademark_wordmark');
CALL _safe_add_col('iptv_apps_internet', 'delisting_timestamp_google',  'DATETIME',     'tcrp_case_id');
CALL _safe_add_col('iptv_apps_internet', 'tcrp_case_id_bing',           'VARCHAR(255)',  'tat_bing');
CALL _safe_add_col('iptv_apps_internet', 'delisting_timestamp_bing',    'DATETIME',     'tcrp_case_id_bing');
CALL _safe_add_col('iptv_apps_internet', 'tcrp_case_id_yandex',         'VARCHAR(255)',  'tat_yandex');
CALL _safe_add_col('iptv_apps_internet', 'delisting_timestamp_yandex',  'DATETIME',     'tcrp_case_id_yandex');

-- ────────────────────────────────────────────────────────────
-- 2. iptv_apps_apps
--    New: trademark_wordmark, category
-- ────────────────────────────────────────────────────────────
CALL _safe_add_col('iptv_apps_apps', 'trademark_wordmark', 'VARCHAR(255)', 'content_owner');
CALL _safe_add_col('iptv_apps_apps', 'category',           'VARCHAR(255)', 'trademark_wordmark');

-- ────────────────────────────────────────────────────────────
-- 3. iptv_apps_marketplace
--    New: trademark_wordmark, category
-- ────────────────────────────────────────────────────────────
CALL _safe_add_col('iptv_apps_marketplace', 'trademark_wordmark', 'VARCHAR(255)', 'copyright_owner');
CALL _safe_add_col('iptv_apps_marketplace', 'category',           'VARCHAR(255)', 'trademark_wordmark');

-- ────────────────────────────────────────────────────────────
-- 4. iptv_apps_social_media
--    New: trademark_wordmark, category
-- ────────────────────────────────────────────────────────────
CALL _safe_add_col('iptv_apps_social_media', 'trademark_wordmark', 'VARCHAR(255)', 'copyright_owner');
CALL _safe_add_col('iptv_apps_social_media', 'category',           'VARCHAR(255)', 'trademark_wordmark');

-- ────────────────────────────────────────────────────────────
-- 5. iptv_apps_meta_ads
--    New: trademark_wordmark, category
-- ────────────────────────────────────────────────────────────
CALL _safe_add_col('iptv_apps_meta_ads', 'trademark_wordmark', 'VARCHAR(255)', 'copyright_owner');
CALL _safe_add_col('iptv_apps_meta_ads', 'category',           'VARCHAR(255)', 'trademark_wordmark');

-- Cleanup helper procedure
DROP PROCEDURE IF EXISTS _safe_add_col;
