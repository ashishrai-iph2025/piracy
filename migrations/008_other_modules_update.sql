-- ============================================================
-- Migration 008: Non-IPTV Module Column Updates
-- Adds missing columns to Unauthorized Search, Ads Tutorials,
-- PW Sharing Social, and PW Sharing Marketplace tables.
-- Run: mysql -u piracy_user -p piracy_reporting < migrations/008_other_modules_update.sql
-- ============================================================

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
-- 1. unauthorized_search_result
--    New: tat_google
-- ────────────────────────────────────────────────────────────
CALL _safe_add_col('unauthorized_search_result', 'tat_google', 'VARCHAR(100)', 'url_status_yandex');

-- ────────────────────────────────────────────────────────────
-- 2. ads_tutorials_social_media
--    New: tat
-- ────────────────────────────────────────────────────────────
CALL _safe_add_col('ads_tutorials_social_media', 'tat', 'VARCHAR(100)', 'url_removal_date');

-- ────────────────────────────────────────────────────────────
-- 3. password_sharing_social_media
--    New: credentials_available, notes, tat
-- ────────────────────────────────────────────────────────────
CALL _safe_add_col('password_sharing_social_media', 'credentials_available', 'VARCHAR(20)',  'linking_url');
CALL _safe_add_col('password_sharing_social_media', 'notes',                 'TEXT',         'market_scanned');
CALL _safe_add_col('password_sharing_social_media', 'tat',                   'VARCHAR(100)', 'removal_date');

-- ────────────────────────────────────────────────────────────
-- 4. password_sharing_marketplace
--    New: notes, tat
-- ────────────────────────────────────────────────────────────
CALL _safe_add_col('password_sharing_marketplace', 'notes', 'TEXT',         'no_of_buys');
CALL _safe_add_col('password_sharing_marketplace', 'tat',   'VARCHAR(100)', 'removal_date');

DROP PROCEDURE IF EXISTS _safe_add_col;
