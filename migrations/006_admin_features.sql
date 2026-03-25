-- ============================================================
-- Migration 006: Admin Panel Permissions + Custom Columns
-- ============================================================

-- Admin Panel Tab Permissions
-- Allows granting specific admin panel tabs to non-admin users.
-- Users with only panel access (not admin role) can only use
-- their own credentials to generate API tokens.
CREATE TABLE IF NOT EXISTS admin_panel_permissions (
  id         CHAR(36)    NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  user_id    CHAR(36)    NOT NULL,
  tab_key    VARCHAR(50) NOT NULL,
  can_access TINYINT(1)  NOT NULL DEFAULT 0,
  granted_by CHAR(36),
  granted_at DATETIME    DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_tab (user_id, tab_key),
  INDEX idx_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Custom Columns
-- Stores admin-defined extra columns for any module table.
-- A corresponding ALTER TABLE is run when the column is created.
CREATE TABLE IF NOT EXISTS custom_columns (
  id           CHAR(36)     NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  sheet_name   VARCHAR(150) NOT NULL,
  column_key   VARCHAR(100) NOT NULL,
  column_label VARCHAR(255) NOT NULL,
  column_type  VARCHAR(50)  NOT NULL DEFAULT 'VARCHAR(512)',
  sort_order   INT          DEFAULT 999,
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  created_by   CHAR(36),
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_sheet_col (sheet_name, column_key),
  INDEX idx_sheet (sheet_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
