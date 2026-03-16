-- Migration 002: User approval flow + email configuration
-- Run this once against your MySQL database

-- 1. Add status column to users (pending | active | rejected)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS status ENUM('pending','active','rejected') NOT NULL DEFAULT 'active'
  AFTER is_active;

-- 2. Mark all existing active users as approved (don't lock out existing accounts)
UPDATE users SET status = 'active' WHERE is_active = 1;
UPDATE users SET status = 'rejected' WHERE is_active = 0;

-- 3. Email configuration table
CREATE TABLE IF NOT EXISTS email_config (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  purpose       VARCHAR(64)  NOT NULL DEFAULT 'notification',
  label         VARCHAR(128) NOT NULL DEFAULT 'Default',
  smtp_host     VARCHAR(255) NOT NULL DEFAULT 'smtp.gmail.com',
  smtp_port     INT          NOT NULL DEFAULT 587,
  smtp_secure   TINYINT(1)   NOT NULL DEFAULT 0,
  smtp_user     VARCHAR(255) NOT NULL,
  smtp_pass     VARCHAR(255) NOT NULL,
  from_name     VARCHAR(128) NOT NULL DEFAULT 'API Monitoring System',
  from_email    VARCHAR(255) NOT NULL,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Seed the Gmail workspace config (update password after running)
INSERT INTO email_config (purpose, label, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass, from_name, from_email)
VALUES (
  'notification',
  'Gmail Workspace – Notifications',
  'smtp.gmail.com',
  587,
  0,
  'noreply@markscan.in',
  'REPLACE_WITH_APP_PASSWORD',
  'MarkScan Piracy System',
  'noreply@markscan.in'
)
ON DUPLICATE KEY UPDATE id = id;
