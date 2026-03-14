'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ── Data ─────────────────────────────────────────────────────────────────────

const EPICS = [
  { id: 'EP-01', name: 'Data Integrity & Timezone',      color: '#3b82f6', icon: 'fa-database' },
  { id: 'EP-02', name: 'Notifications & Alerting',       color: '#f97316', icon: 'fa-bell' },
  { id: 'EP-03', name: 'Dashboard & Analytics',          color: '#8b5cf6', icon: 'fa-chart-bar' },
  { id: 'EP-04', name: 'Security & Authentication',      color: '#ef4444', icon: 'fa-shield-halved' },
  { id: 'EP-05', name: 'API Hardening',                  color: '#14b8a6', icon: 'fa-terminal' },
  { id: 'EP-06', name: 'Audit & Compliance',             color: '#eab308', icon: 'fa-scale-balanced' },
  { id: 'EP-07', name: 'Search & Discovery',             color: '#06b6d4', icon: 'fa-magnifying-glass' },
  { id: 'EP-08', name: 'Mobile & UX',                    color: '#ec4899', icon: 'fa-mobile-screen' },
  { id: 'EP-09', name: 'Automation & Scheduling',        color: '#22c55e', icon: 'fa-robot' },
  { id: 'EP-10', name: 'Testing & Quality',              color: '#6366f1', icon: 'fa-flask' },
]

const SPRINTS = [
  {
    id: 1, name: 'Sprint 1 — Stability & Critical Fixes',
    dates: '16 Mar → 27 Mar 2026', points: 32,
    goal: 'Eliminate all known data-path bugs in bulk update, shore up permission edge cases, ensure activity log is usable at scale, and implement the full user registration approval workflow with email notifications.',
    epics: ['EP-01', 'EP-04', 'EP-06', 'EP-07'],
    stories: [
      {
        id: 'US-001', title: 'Fix Bulk Update Route: IST→UTC Conversion',
        epic: 'EP-01', points: 5, priority: 'Critical', type: 'bug',
        story: 'As a data analyst, I want bulk status updates to correctly convert IST timestamps to UTC before writing to the database, so that records remain temporally consistent with data uploaded via the Excel import flow.',
        ac: [
          'Bulk update API route reads all incoming date/time fields as IST and converts to UTC before DB write',
          'Existing records updated via bulk update show correct IST time when exported to CSV',
          'Conversion logic is extracted into a shared utility (no duplication with upload route)',
          'Unit test added for the IST→UTC conversion utility function',
        ],
        subtasks: [
          'ST-001-1: Audit the bulk update API route for all date/time field writes',
          'ST-001-2: Implement IST→UTC conversion using shared lib/timezone.js',
          'ST-001-3: Verify conversion parity with the existing Excel upload route',
          'ST-001-4: Write unit test for convertISTtoUTC() with edge cases',
          'ST-001-5: QA: spot-check 5 records and verify DB UTC value vs. CSV IST export',
        ],
      },
      {
        id: 'US-002', title: 'Pagination on Activity Log Page',
        epic: 'EP-06', points: 3, priority: 'High', type: 'story',
        story: 'As a superadmin, I want the activity log page to be paginated so that it remains performant and usable as log volume grows.',
        ac: [
          'Page size configurable: default 25, options 25/50/100',
          'Page navigation controls: first, prev, next, last',
          'Total record count and range displayed (e.g. "Showing 26–50 of 1,240")',
          'URL query params (?page=2&limit=50) reflect pagination state',
        ],
        subtasks: [
          'ST-002-1: Add page and limit params to the activity log API',
          'ST-002-2: Add LIMIT/OFFSET to the DB query',
          'ST-002-3: Build reusable <Pagination> component',
          'ST-002-4: Integrate pagination into activity log page',
          'ST-002-5: Add page-size selector dropdown',
          'ST-002-6: QA test with 500+ log entries in staging DB',
        ],
      },
      {
        id: 'US-003', title: 'Global Search — Phase 1: Infrastructure',
        epic: 'EP-07', points: 8, priority: 'High', type: 'story',
        story: 'As an analyst, I want a global search bar that queries across all 11 modules simultaneously, so I can locate any entry without knowing which module it belongs to.',
        ac: [
          'GET /api/v1/search?q=<term> returns results from all 11 module tables',
          'Results grouped by module with count per module',
          'Each result includes: module, record ID, matched field, value, status, created_at IST',
          'Only modules the user has view permission for are included',
          'Minimum query length 3 characters; HTTP 400 for shorter',
        ],
        subtasks: [
          'ST-003-1: Design unified search API response schema',
          'ST-003-2: Implement parallel DB queries across 11 tables',
          'ST-003-3: Add full-text indexes on searchable columns (migration)',
          'ST-003-4: Enforce per-user module permission filter',
          'ST-003-5: Build global search UI component in top nav',
          'ST-003-6: Build search results page with grouped result cards',
          'ST-003-7: Add loading skeleton and empty-state UI',
          'ST-003-8: Performance test with 500k simulated rows',
        ],
      },
      {
        id: 'US-004', title: 'Harden 403 / Permission Edge Cases',
        epic: 'EP-04', points: 3, priority: 'High', type: 'story',
        story: 'As a security-conscious admin, I want all module pages to consistently show a 403 error when the user lacks view permission, so that no partial data is ever rendered to unauthorized users.',
        ac: [
          'All 11 module pages perform server-side permission check before rendering',
          'Users without view permission see a consistent 403 page, not an empty table',
          'Upload, edit, delete, bulk update each return HTTP 403 with descriptive JSON',
          'Superadmin always bypasses module-level permission checks',
        ],
        subtasks: [
          'ST-004-1: Create withPermission(module, action) server-side middleware helper',
          'ST-004-2: Apply middleware to all 11 module API routes',
          'ST-004-3: Apply server-side permission check to all 11 page components',
          'ST-004-4: Design and build reusable <PermissionDenied403> component',
          'ST-004-5: Integration test: no-view user cannot fetch module data',
        ],
      },
      {
        id: 'US-020', title: 'User Registration Approval Workflow',
        epic: 'EP-04', points: 8, priority: 'Critical', type: 'story',
        story: 'As an admin, I want new registrations to require my approval before the account is activated, so that only authorised users gain access to the system.',
        ac: [
          'New registrations are stored with status=pending and is_active=0',
          'Admin panel shows a "Pending Approvals" tab with a red badge count',
          'Approve action: sets status=active, generates a new secure password, sends approval email with credentials',
          'Reject action: sets status=rejected, sends rejection email with optional reason',
          'Login returns a user-friendly "pending approval" banner (not "invalid credentials")',
          'Register form shows a confirmation panel after submit explaining email notification',
        ],
        subtasks: [
          'ST-020-1: DB migration — add status column to users table (pending/active/rejected)',
          'ST-020-2: Update register API to set status=pending, is_active=0',
          'ST-020-3: Update login API to handle pending and rejected status messages',
          'ST-020-4: Build Pending Approvals tab in admin panel with approve/reject buttons',
          'ST-020-5: Build approve API route — generate password, update DB, send email',
          'ST-020-6: Build reject API route — update DB, send rejection email',
          'ST-020-7: Update registration form to show pending confirmation message',
          'ST-020-8: Update login form to show yellow pending banner',
          'ST-020-9: Show pending/rejected status badge in Users table',
        ],
      },
      {
        id: 'US-021', title: 'Dynamic Email Configuration Management',
        epic: 'EP-04', points: 5, priority: 'High', type: 'story',
        story: 'As a superadmin, I want to manage SMTP email configurations from the admin panel without redeploying, so I can update credentials and add new notification channels easily.',
        ac: [
          'email_config table stores SMTP settings per purpose (notification, alert, report, digest)',
          'Admin panel Email Config tab: add, edit, delete, and test SMTP connections',
          'Purpose dropdown maps to specific notification use cases',
          'Test Connection button verifies SMTP credentials before saving',
          'Email service dynamically loads the active config for the requested purpose at send time',
          'Password field masked; leave blank when editing to keep existing password',
        ],
        subtasks: [
          'ST-021-1: DB migration — create email_config table with purpose/SMTP fields',
          'ST-021-2: Create lib/email.js with nodemailer + dynamic DB config loader',
          'ST-021-3: Build GET/POST /api/admin/email-config route (CRUD + test)',
          'ST-021-4: Build Email Config tab UI in admin panel',
          'ST-021-5: Implement Test Connection action in UI and API',
          'ST-021-6: Seed Gmail Workspace default config via migration',
          'ST-021-7: Wire approval/rejection emails to use dynamic email service',
        ],
      },
    ],
  },
  {
    id: 2, name: 'Sprint 2 — Data Integrity & Core Enhancements',
    dates: '30 Mar → 10 Apr 2026', points: 21,
    goal: 'Deliver audit trail for record changes, complete global search with polished UI, and introduce advanced dashboard filtering by removal status and platform.',
    epics: ['EP-01', 'EP-03', 'EP-06', 'EP-07'],
    stories: [
      {
        id: 'US-005', title: 'Audit Trail: Record Change History',
        epic: 'EP-06', points: 8, priority: 'High', type: 'story',
        story: 'As a compliance officer, I want every change to a record to be logged with old and new values, so I can audit who changed what and when.',
        ac: [
          'record_audit_log table captures: record_id, module, action, changed_by, changed_at, field_name, old_value, new_value',
          'All CRUD routes write to the audit log within the same DB transaction',
          'Admins can view audit history for any record via a "History" side panel',
          'Audit log is append-only (no DELETE or UPDATE on audit rows)',
        ],
        subtasks: [
          'ST-005-1: Design and create record_audit_log DB table with indexes',
          'ST-005-2: Create writeAuditLog(params) utility',
          'ST-005-3: Instrument Create record API route',
          'ST-005-4: Instrument Edit/Update record API route',
          'ST-005-5: Instrument Delete record API route',
          'ST-005-6: Instrument Bulk Update route (per-record logging)',
          'ST-005-7: Build "Record History" side panel UI',
          'ST-005-8: Add History button/icon to each record row',
        ],
      },
      {
        id: 'US-006', title: 'Advanced Dashboard Filters: Status & Platform',
        epic: 'EP-03', points: 5, priority: 'High', type: 'story',
        story: 'As an analyst, I want to filter dashboard analytics by removal status and platform so I can understand performance metrics for a specific subset of data.',
        ac: [
          'Filter bar includes: Module (multi-select), Platform (multi-select), Removal Status (multi-select), Date Range',
          'All dashboard charts update reactively when filters change',
          'Active filters reflected in URL query string for shareability',
          '"Clear All Filters" resets to default view',
        ],
        subtasks: [
          'ST-006-1: Audit dashboard API queries and identify filter injection points',
          'ST-006-2: Extend dashboard APIs to accept module[], platform[], status[] params',
          'ST-006-3: Build <DashboardFilterBar> UI with multi-select dropdowns',
          'ST-006-4: Wire filter state to dashboard API calls',
          'ST-006-5: Sync filter state to URL query params',
          'ST-006-6: Update all chart components to re-render on filter change',
          'ST-006-7: QA: verify filter combinations match direct DB counts',
        ],
      },
      {
        id: 'US-007', title: 'Global Search Phase 2: UI Polish & Filters',
        epic: 'EP-07', points: 5, priority: 'Medium', type: 'story',
        story: 'As an analyst, I want search results to be filterable by module, date range, and status so I can narrow down results quickly.',
        ac: [
          'Search results page has filter sidebar: Module, Date Range, Status',
          'Filters apply without full page reload',
          'Keyboard shortcut (Ctrl+K or Cmd+K) opens global search bar',
          'Recent searches stored in localStorage (last 10)',
        ],
        subtasks: [
          'ST-007-1: Add filter params to search API',
          'ST-007-2: Build filter sidebar on search results page',
          'ST-007-3: Implement keyboard shortcut for search bar',
          'ST-007-4: Implement recent searches with localStorage',
          'ST-007-5: Add result highlight for matched search term',
        ],
      },
      {
        id: 'US-008', title: 'Password Reset / Forgot Password Flow',
        epic: 'EP-04', points: 3, priority: 'Medium', type: 'story',
        story: 'As a user, I want a "Forgot Password" link on the login page that lets me reset my password via a secure token sent by an admin, so I can regain access if I forget my password.',
        ac: [
          'Admin can generate a one-time password reset link for any user from the Admin Panel',
          'Reset token expires after 1 hour',
          'Password reset page validates token and allows user to set new password',
          'New password must be at least 8 characters with complexity requirements',
        ],
        subtasks: [
          'ST-008-1: Add password_reset_tokens table to DB schema',
          'ST-008-2: Create admin API endpoint to generate reset token',
          'ST-008-3: Build password reset page /reset-password?token=...',
          'ST-008-4: Add "Generate Reset Link" button in Admin Panel user list',
          'ST-008-5: QA: verify token expiry and single-use enforcement',
        ],
      },
    ],
  },
  {
    id: 3, name: 'Sprint 3 — Notifications & Advanced Filtering',
    dates: '13 Apr → 24 Apr 2026', points: 21,
    goal: 'Build the notification foundation (email on status change), add record-level comments, and complete the password reset flow.',
    epics: ['EP-02', 'EP-06', 'EP-08'],
    stories: [
      {
        id: 'US-009', title: 'Email Notification on Record Status Change',
        epic: 'EP-02', points: 8, priority: 'High', type: 'story',
        story: 'As a team lead, I want to receive an email notification when a piracy record status changes to "Removed", so I can track takedown effectiveness in real time.',
        ac: [
          'Email sent within 60 seconds of status change to "Removed" or "Enforced"',
          'Email includes: record ID, module, URL, old status, new status, changed by, timestamp IST',
          'Admin can configure which status transitions trigger notifications',
          'Notification preferences configurable per user (opt-in/opt-out)',
        ],
        subtasks: [
          'ST-009-1: Integrate email provider (SMTP / SendGrid / SES)',
          'ST-009-2: Create email template for status change notifications',
          'ST-009-3: Build notification trigger in bulk update and edit routes',
          'ST-009-4: Create user_notification_preferences table',
          'ST-009-5: Build notification settings UI in user profile page',
          'ST-009-6: QA: verify email delivery and content accuracy',
        ],
      },
      {
        id: 'US-010', title: 'Record-Level Comments / Notes',
        epic: 'EP-06', points: 5, priority: 'Medium', type: 'story',
        story: 'As an analyst, I want to add comments to individual records so my team can leave context notes without overwriting structured data fields.',
        ac: [
          'Any user with edit permission can add a comment to any record',
          'Comments display author name, timestamp (IST), and text',
          'Comments are visible in the record edit modal and the record history panel',
          'Comments are immutable once saved (append-only)',
        ],
        subtasks: [
          'ST-010-1: Create record_comments table (record_id, module, user_id, body, created_at)',
          'ST-010-2: Create GET/POST /api/comments?sheet=&record_id= endpoints',
          'ST-010-3: Add comments thread component to edit modal',
          'ST-010-4: Add comment count badge to record rows in module tables',
          'ST-010-5: QA: verify comment visibility and permission enforcement',
        ],
      },
      {
        id: 'US-011', title: 'Mobile Responsive Layout Improvements',
        epic: 'EP-08', points: 8, priority: 'Medium', type: 'story',
        story: 'As a mobile user, I want the application to be fully usable on a phone or tablet so I can review and update records while away from my desk.',
        ac: [
          'All module table pages render usably on screens 375px wide and above',
          'Sidebar collapses to a drawer on mobile with overlay backdrop',
          'Modal dialogs do not overflow viewport on small screens',
          'Edit and upload forms are scrollable with sticky action buttons',
          'Touch targets meet WCAG minimum 44×44px',
        ],
        subtasks: [
          'ST-011-1: Audit all pages on 375px viewport using Chrome DevTools',
          'ST-011-2: Fix table overflow — add horizontal scroll or column hiding',
          'ST-011-3: Fix modal overflow on small screens',
          'ST-011-4: Fix form input tap targets and label spacing',
          'ST-011-5: Test on real iOS Safari and Android Chrome',
        ],
      },
    ],
  },
  {
    id: 4, name: 'Sprint 4 — Security, Access & API Hardening',
    dates: '27 Apr → 8 May 2026', points: 34,
    goal: 'Introduce 2FA, API rate limiting, OpenAPI documentation, and data retention policy tooling to prepare the system for production sign-off.',
    epics: ['EP-04', 'EP-05', 'EP-06'],
    stories: [
      {
        id: 'US-012', title: 'API v1 Rate Limiting',
        epic: 'EP-05', points: 5, priority: 'High', type: 'story',
        story: 'As a platform owner, I want the REST API to enforce rate limits so that abusive clients cannot degrade service for all users.',
        ac: [
          'Default limit: 100 requests per minute per API token',
          'Exceeding limit returns HTTP 429 with Retry-After header',
          'Rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset) on every API response',
          'Admin can configure per-token rate limits in the Admin Panel',
        ],
        subtasks: [
          'ST-012-1: Choose rate limiter approach (in-memory sliding window or Redis)',
          'ST-012-2: Implement rate limiter middleware in /api/v1/ routes',
          'ST-012-3: Add rate limit headers to all API v1 responses',
          'ST-012-4: Add per-token limit configuration to token management UI',
          'ST-012-5: Write load test to verify 429 triggers at correct threshold',
        ],
      },
      {
        id: 'US-013', title: 'OpenAPI / Swagger Documentation for API v1',
        epic: 'EP-05', points: 8, priority: 'Medium', type: 'story',
        story: 'As an integration developer, I want interactive API documentation at /api/docs so I can explore available endpoints, parameters, and response schemas without reading source code.',
        ac: [
          'All /api/v1/ endpoints documented with request/response schemas',
          'Interactive "Try it out" UI available at /api/docs',
          'Authentication flow documented with example cURL commands',
          'OpenAPI 3.0 spec exported as downloadable JSON/YAML',
        ],
        subtasks: [
          'ST-013-1: Install swagger-ui-express or next-swagger-doc',
          'ST-013-2: Write OpenAPI spec for /api/v1/auth/login',
          'ST-013-3: Write OpenAPI spec for all 11 /api/v1/[table] endpoints',
          'ST-013-4: Write OpenAPI spec for /api/v1/search',
          'ST-013-5: Add /api/docs page with embedded Swagger UI',
          'ST-013-6: QA: verify all example requests return documented responses',
        ],
      },
      {
        id: 'US-014', title: '2FA / OTP Login Option',
        epic: 'EP-04', points: 13, priority: 'High', type: 'story',
        story: 'As a superadmin, I want to enforce two-factor authentication for admin and superadmin accounts so that stolen passwords alone cannot grant elevated access.',
        ac: [
          'Admin and superadmin accounts can enrol in TOTP-based 2FA (e.g. Google Authenticator)',
          'After correct password, user is prompted for 6-digit OTP',
          'Superadmin can enforce 2FA for all admin/superadmin users',
          'Backup recovery codes generated at enrolment (10 codes, each single-use)',
          '2FA status visible in Admin Panel user list',
        ],
        subtasks: [
          'ST-014-1: Add 2fa_secret and 2fa_enabled columns to users table',
          'ST-014-2: Integrate speakeasy or otplib for TOTP generation/verification',
          'ST-014-3: Build 2FA enrolment page (show QR code, verify first OTP)',
          'ST-014-4: Build 2FA verification step in login flow',
          'ST-014-5: Generate and store hashed backup recovery codes',
          'ST-014-6: Add 2FA management UI to Admin Panel user list',
          'ST-014-7: Build "Disable 2FA" flow with re-authentication',
          'ST-014-8: QA: full enrol → login → backup code flow end-to-end',
        ],
      },
      {
        id: 'US-015', title: 'Data Retention & Archival Policy',
        epic: 'EP-06', points: 8, priority: 'Medium', type: 'story',
        story: 'As a compliance officer, I want records older than a configurable period to be automatically archived (not deleted) so the live DB stays performant and we remain compliant with data retention policies.',
        ac: [
          'Admin can configure retention period per module (default 24 months)',
          'Records beyond the retention period are moved to an _archive table, not deleted',
          'Archival job runs on a configurable schedule (default: daily at 02:00 UTC)',
          'Archived records are searchable by superadmin only via a separate Archive view',
          'Archival action is logged in the audit trail',
        ],
        subtasks: [
          'ST-015-1: Create <table>_archive tables mirroring all 11 module schemas',
          'ST-015-2: Build archival script using INSERT INTO archive SELECT + DELETE',
          'ST-015-3: Add retention policy configuration to Admin Panel (DB settings tab)',
          'ST-015-4: Create /api/admin/archive endpoint to trigger manual archival',
          'ST-015-5: Build Archive view page in Admin Panel',
          'ST-015-6: Schedule archival job (node-cron or DB event)',
        ],
      },
    ],
  },
  {
    id: 5, name: 'Sprint 5 — Mobile, UX Polish & Automation',
    dates: '11 May → 22 May 2026', points: 29,
    goal: 'Complete mobile responsiveness, automate scheduled CSV report emails, and build the CI/CD pipeline for production deployments.',
    epics: ['EP-08', 'EP-09', 'EP-10'],
    stories: [
      {
        id: 'US-016', title: 'Scheduled Automated Report Export via Email',
        epic: 'EP-09', points: 8, priority: 'High', type: 'story',
        story: 'As a team lead, I want weekly CSV summary reports emailed to me automatically so I don\'t have to log in just to download the same report every Monday.',
        ac: [
          'Admin can configure scheduled reports: module, filters, frequency (daily/weekly/monthly), recipients',
          'Report is generated as CSV and attached to email',
          'Schedule stored in DB; runs via cron job',
          'Admin can pause or delete a scheduled report',
          'Failed deliveries are retried up to 3 times and logged',
        ],
        subtasks: [
          'ST-016-1: Create scheduled_reports table (module, filters_json, cron_expr, recipients, is_active)',
          'ST-016-2: Build scheduled report configuration UI in Admin Panel',
          'ST-016-3: Implement cron runner that executes due reports',
          'ST-016-4: Reuse CSV export logic from /api/download for report generation',
          'ST-016-5: Send report as email attachment via configured email provider',
          'ST-016-6: Add delivery log and retry mechanism',
        ],
      },
      {
        id: 'US-017', title: 'CI/CD Pipeline Setup',
        epic: 'EP-09', points: 8, priority: 'High', type: 'story',
        story: 'As a developer, I want automated CI/CD so that every merge to main triggers linting, tests, and a staging deployment, reducing manual deployment errors.',
        ac: [
          'GitHub Actions workflow on PR: run ESLint, run Jest unit tests',
          'Merge to main triggers automatic deployment to staging server',
          'Deployment to production requires manual approval gate',
          'Build failure blocks merge to main',
          'Environment variables managed via GitHub Secrets (never in code)',
        ],
        subtasks: [
          'ST-017-1: Create .github/workflows/ci.yml for lint + test on PR',
          'ST-017-2: Create .github/workflows/deploy-staging.yml on push to main',
          'ST-017-3: Create .github/workflows/deploy-prod.yml with manual approval',
          'ST-017-4: Configure GitHub Secrets for DB, email, and JWT env vars',
          'ST-017-5: Write deployment runbook in DEPLOYMENT.md',
          'ST-017-6: Test full pipeline with a dummy PR',
        ],
      },
      {
        id: 'US-018', title: 'Unit & Integration Test Suite',
        epic: 'EP-10', points: 8, priority: 'High', type: 'story',
        story: 'As a developer, I want a test suite covering critical business logic so that regressions are caught automatically before reaching production.',
        ac: [
          'Unit tests for all lib/ utilities: timezone, validation, session, sheetConfig',
          'Integration tests for auth API (login, logout, session check)',
          'Integration tests for upload API (UTC conversion, duplicate detection)',
          'Integration tests for permissions API (403 enforcement)',
          'Test coverage > 70% for lib/ and api/ directories',
        ],
        subtasks: [
          'ST-018-1: Install Jest + Testing Library + supertest',
          'ST-018-2: Unit tests for lib/timezone.js (istToUtc, utcToIst edge cases)',
          'ST-018-3: Unit tests for lib/validation.js (future date, URL format)',
          'ST-018-4: Integration test: POST /api/auth/login with valid and invalid credentials',
          'ST-018-5: Integration test: POST /api/upload with mock Excel file',
          'ST-018-6: Integration test: 403 on module data access without permission',
          'ST-018-7: Set up Jest coverage report and threshold enforcement',
        ],
      },
      {
        id: 'US-019', title: 'Production Deployment Checklist & Hardening',
        epic: 'EP-10', points: 5, priority: 'Critical', type: 'task',
        story: 'As a project owner, I want a production deployment checklist completed and signed off before going live, so that security, performance, and reliability are verified.',
        ac: [
          'All environment variables documented and confirmed set in production',
          'MySQL max_connections tuned for production load',
          'HTTPS enforced; HTTP redirects to HTTPS',
          'Error pages (404, 500) implemented and styled',
          'Performance audit: Lighthouse score > 80 on dashboard and upload pages',
        ],
        subtasks: [
          'ST-019-1: Document all required environment variables in .env.example',
          'ST-019-2: Configure MySQL max_connections and connection pool size',
          'ST-019-3: Enforce HTTPS via Next.js config or reverse proxy (nginx)',
          'ST-019-4: Build custom 404 and 500 error pages',
          'ST-019-5: Run Lighthouse audit and fix performance issues',
          'ST-019-6: Final stakeholder sign-off walkthrough',
        ],
      },
    ],
  },
]

const BACKLOG = [
  { id: 'BL-001', title: 'WebSocket real-time updates for status changes', epic: 'EP-02', points: 13 },
  { id: 'BL-002', title: 'Elasticsearch integration for sub-second search', epic: 'EP-07', points: 13 },
  { id: 'BL-003', title: 'PDF dashboard export (charts + KPIs)', epic: 'EP-03', points: 8 },
  { id: 'BL-004', title: 'Playwright end-to-end test suite', epic: 'EP-10', points: 13 },
  { id: 'BL-005', title: 'Multi-language / i18n support', epic: 'EP-08', points: 8 },
  { id: 'BL-006', title: 'Bulk delete with soft-delete + restore', epic: 'EP-01', points: 5 },
  { id: 'BL-007', title: 'SSO / OAuth login (Google, Microsoft)', epic: 'EP-04', points: 13 },
  { id: 'BL-008', title: 'Record duplicate detection on upload (fuzzy URL matching)', epic: 'EP-01', points: 8 },
  { id: 'BL-009', title: 'Dashboard: chart drill-down to record list', epic: 'EP-03', points: 8 },
  { id: 'BL-010', title: 'Dark mode dashboard chart theme fix', epic: 'EP-08', points: 2 },
]

// ── Helper components ─────────────────────────────────────────────────────────

const PRIORITY_COLORS = { Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Low: '#22c55e' }
const TYPE_ICONS = { bug: 'fa-bug', story: 'fa-bookmark', task: 'fa-check-square', subtask: 'fa-angles-right' }
const TYPE_COLORS = { bug: '#ef4444', story: '#3b82f6', task: '#22c55e', subtask: '#8b5cf6' }
const FIB_COLOR = p => p >= 13 ? '#ef4444' : p >= 8 ? '#f97316' : p >= 5 ? '#eab308' : '#22c55e'

function epicFor(id) { return EPICS.find(e => e.id === id) }

function Badge({ label, color, bg }) {
  return (
    <span style={{
      fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '20px',
      background: bg || color + '20', color: color, border: `1px solid ${color}40`,
      whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

function StoryCard({ story, epicColor }) {
  const [open, setOpen] = useState(false)
  const [doneMap, setDoneMap] = useState({})
  const doneCount = Object.values(doneMap).filter(Boolean).length

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderLeft: `4px solid ${epicColor}`, borderRadius: '10px', marginBottom: '10px',
      overflow: 'hidden',
    }}>
      {/* Header row */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', cursor: 'pointer' }}
      >
        <i className={`fas ${TYPE_ICONS[story.type]}`} style={{ color: TYPE_COLORS[story.type], fontSize: '13px', flexShrink: 0 }} />
        <code style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', flexShrink: 0 }}>{story.id}</code>
        <span style={{ flex: 1, fontWeight: '600', fontSize: '13px' }}>{story.title}</span>
        <Badge label={story.priority} color={PRIORITY_COLORS[story.priority]} />
        <span style={{
          fontSize: '11px', fontWeight: '800', width: '24px', height: '24px', borderRadius: '50%',
          background: FIB_COLOR(story.points) + '20', color: FIB_COLOR(story.points),
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>{story.points}</span>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }} />
      </div>

      {/* Expanded body */}
      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
          {/* Epic tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', marginBottom: '12px' }}>
            <i className={`fas ${epicFor(story.epic)?.icon}`} style={{ color: epicFor(story.epic)?.color, fontSize: '11px' }} />
            <span style={{ fontSize: '11px', color: epicFor(story.epic)?.color, fontWeight: '700' }}>{story.epic} — {epicFor(story.epic)?.name}</span>
          </div>

          {/* User Story */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>User Story</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>"{story.story}"</p>
          </div>

          {/* Acceptance Criteria */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Acceptance Criteria</div>
            <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {story.ac.map((a, i) => (
                <li key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{a}</li>
              ))}
            </ul>
          </div>

          {/* Subtasks */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Subtasks
              </div>
              <span style={{ fontSize: '11px', color: doneCount === story.subtasks.length ? 'var(--green)' : 'var(--text-muted)' }}>
                {doneCount}/{story.subtasks.length} done
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {story.subtasks.map((st, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', padding: '5px 8px', borderRadius: '6px', background: doneMap[i] ? 'rgba(34,197,94,.08)' : 'var(--bg-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={!!doneMap[i]}
                    onChange={() => setDoneMap(p => ({ ...p, [i]: !p[i] }))}
                    style={{ marginTop: '2px', flexShrink: 0, accentColor: 'var(--accent)' }}
                  />
                  <span style={{ fontSize: '12px', color: doneMap[i] ? 'var(--text-muted)' : 'var(--text-secondary)', textDecoration: doneMap[i] ? 'line-through' : 'none' }}>
                    {st}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── JIRA How-To Section ───────────────────────────────────────────────────────

const JIRA_STEPS = [
  {
    type: 'Epic',
    icon: 'fa-layer-group',
    color: '#8b5cf6',
    what: 'A large body of work that can be broken down into stories and tasks. Epics span multiple sprints.',
    example: 'EP-04 — Security & Authentication',
    steps: [
      'Open your JIRA project → click Backlog or Board',
      'Click Create at the top navigation bar',
      'Set Issue Type to Epic',
      'Enter Epic Name (e.g. "Security & Authentication")',
      'Set Epic Colour for visual identification on the board',
      'Add Description — list the high-level goal',
      'Set Priority and assign to an Owner',
      'Click Create — Epic now appears in the Epics panel on Backlog view',
    ],
  },
  {
    type: 'Story',
    icon: 'fa-bookmark',
    color: '#3b82f6',
    what: 'A user-facing feature described from the user\'s perspective. Stories must fit within one sprint and belong to an Epic.',
    example: 'US-014 — 2FA / OTP Login Option',
    steps: [
      'Click Create → set Issue Type to Story',
      'Enter Summary: the story title (e.g. "2FA / OTP Login Option")',
      'In Description, write the User Story in format: "As a [role], I want [goal] so that [reason]"',
      'Link to Epic: In the Epic Link field, select the parent Epic',
      'Add Acceptance Criteria in the Description or a dedicated field',
      'Set Story Points (Fibonacci: 1, 2, 3, 5, 8, 13) in the Story Points field',
      'Set Sprint: assign to the target sprint from the Sprint dropdown',
      'Set Priority (Critical / High / Medium / Low)',
      'Assign to a Developer',
      'Click Create — Story appears in the Sprint on the Backlog',
    ],
  },
  {
    type: 'Task',
    icon: 'fa-check-square',
    color: '#22c55e',
    what: 'A technical work item that is not user-facing. Used for infrastructure, configuration, and DevOps work.',
    example: 'US-019 — Production Deployment Checklist',
    steps: [
      'Click Create → set Issue Type to Task',
      'Enter Summary: the task title',
      'Add technical details in Description',
      'Link to Epic if applicable',
      'Set Story Points and Priority',
      'Assign to a Developer or DevOps engineer',
      'Add to Sprint',
      'Click Create',
    ],
  },
  {
    type: 'Subtask',
    icon: 'fa-angles-right',
    color: '#f97316',
    what: 'A child of a Story or Task. Represents a specific piece of implementation work. Progress of subtasks rolls up to the parent.',
    example: 'ST-014-3 — Build 2FA enrolment page (QR code + OTP verify)',
    steps: [
      'Open the parent Story or Task',
      'Scroll to the Child Issues or Subtasks section',
      'Click Create subtask (or Create child issue)',
      'Set Issue Type to Sub-task',
      'Enter Summary: the specific deliverable (e.g. "Build 2FA enrolment page")',
      'Assign to a Developer',
      'Set Story Points (subtasks often use smaller values: 1–3)',
      'Click Create — subtask is now linked under the parent',
      'Subtask status updates reflect on the parent story\'s progress bar',
    ],
  },
  {
    type: 'Bug',
    icon: 'fa-bug',
    color: '#ef4444',
    what: 'A defect or unintended behaviour found during testing or production. Bugs can be added to sprints or the backlog.',
    example: 'US-001 — Fix Bulk Update Route: IST→UTC Conversion',
    steps: [
      'Click Create → set Issue Type to Bug',
      'Enter Summary: describe the bug concisely',
      'In Description add: Steps to Reproduce, Expected Behaviour, Actual Behaviour, Environment',
      'Set Priority (Critical bugs go straight into the active sprint)',
      'Add screenshots or logs in Attachments',
      'Link to the Epic it belongs to',
      'Assign to the developer responsible for that area',
      'Set Story Points based on investigation + fix effort',
      'Add to Sprint',
    ],
  },
]

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SprintPage() {
  const [activeTab, setActiveTab]       = useState('guide')
  const [activeSprint, setActiveSprint] = useState(1)
  const [expandedEpic, setExpandedEpic] = useState(null)
  const [authorized, setAuthorized]     = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/check')
      .then(r => r.json())
      .then(d => {
        if (d.authenticated && d.role === 'superadmin') {
          setAuthorized(true)
        } else {
          setAuthorized(false)
        }
      })
      .catch(() => setAuthorized(false))
  }, [])

  if (authorized === null) return null // loading

  if (!authorized) return (
    <div className="page-content">
      <div className="main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
        <i className="fas fa-lock" style={{ fontSize: '48px', color: 'var(--text-muted)' }} />
        <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>Access Denied</div>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>This page is restricted to Super Admins only.</div>
        <button onClick={() => router.push('/dashboard')} style={{ marginTop: '8px', padding: '10px 24px', borderRadius: '8px', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  )

  const sprint = SPRINTS.find(s => s.id === activeSprint)

  return (
    <div className="page-content">
      <div className="main">

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fas fa-rocket" style={{ color: 'var(--accent)' }} />
                PMS Sprint Plan
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Piracy Monitoring System — JIRA Epics, Stories & Subtasks
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: '20px' }}>
                <i className="fas fa-calendar" style={{ marginRight: '5px' }} />5 Sprints
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: '20px' }}>
                <i className="fas fa-list-check" style={{ marginRight: '5px' }} />19 Stories
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: '20px' }}>
                <i className="fas fa-fire" style={{ marginRight: '5px' }} />124 Points
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-bar" style={{ marginBottom: '24px' }}>
          {[
            { id: 'guide',   icon: 'fa-book',         label: 'JIRA How-To Guide' },
            { id: 'epics',   icon: 'fa-layer-group',  label: 'Epics' },
            { id: 'sprints', icon: 'fa-table-columns', label: 'Sprint Board' },
            { id: 'backlog', icon: 'fa-inbox',         label: 'Backlog' },
          ].map(t => (
            <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              <i className={`fas ${t.icon}`} style={{ marginRight: '6px' }} />{t.label}
            </button>
          ))}
        </div>

        {/* ── JIRA How-To Guide ── */}
        {activeTab === 'guide' && (
          <div>
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-title"><i className="fas fa-sitemap" />JIRA Issue Hierarchy</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0', flexWrap: 'wrap', marginTop: '8px' }}>
                {[
                  { label: 'Epic', color: '#8b5cf6', icon: 'fa-layer-group', desc: 'Theme / Goal' },
                  { label: '→', color: 'var(--text-muted)', icon: null, desc: '' },
                  { label: 'Story / Bug / Task', color: '#3b82f6', icon: 'fa-bookmark', desc: 'Feature / Fix' },
                  { label: '→', color: 'var(--text-muted)', icon: null, desc: '' },
                  { label: 'Subtask', color: '#f97316', icon: 'fa-angles-right', desc: 'Implementation step' },
                ].map((item, i) => item.icon ? (
                  <div key={i} style={{ textAlign: 'center', padding: '12px 20px', background: 'var(--bg-secondary)', borderRadius: '10px', margin: '4px' }}>
                    <i className={`fas ${item.icon}`} style={{ color: item.color, fontSize: '20px', display: 'block', marginBottom: '6px' }} />
                    <div style={{ fontSize: '12px', fontWeight: '700', color: item.color }}>{item.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                ) : (
                  <i key={i} className="fas fa-arrow-right" style={{ color: 'var(--text-muted)', margin: '0 4px' }} />
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '20px' }}>
              {JIRA_STEPS.map(section => (
                <div key={section.type} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: section.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`fas ${section.icon}`} style={{ color: section.color, fontSize: '16px' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '15px', color: section.color }}>{section.type}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{section.what}</div>
                    </div>
                  </div>

                  <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '14px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <i className="fas fa-circle-info" style={{ marginRight: '6px', color: section.color }} />
                    <strong>Example:</strong> {section.example}
                  </div>

                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    Steps in JIRA
                  </div>
                  <ol style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {section.steps.map((step, i) => (
                      <li key={i} style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.55' }}>{step}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Epics ── */}
        {activeTab === 'epics' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
              {EPICS.map(ep => {
                const storyCount = SPRINTS.flatMap(s => s.stories).filter(s => s.epic === ep.id).length
                const totalPts = SPRINTS.flatMap(s => s.stories).filter(s => s.epic === ep.id).reduce((a, s) => a + s.points, 0)
                return (
                  <div
                    key={ep.id}
                    className="card"
                    style={{ borderLeft: `4px solid ${ep.color}`, cursor: 'pointer', transition: 'transform 0.15s', transform: expandedEpic === ep.id ? 'scale(1.01)' : 'scale(1)' }}
                    onClick={() => setExpandedEpic(expandedEpic === ep.id ? null : ep.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: ep.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className={`fas ${ep.icon}`} style={{ color: ep.color, fontSize: '16px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: ep.color, marginBottom: '2px' }}>{ep.id}</div>
                        <div style={{ fontWeight: '700', fontSize: '14px' }}>{ep.name}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: ep.color }}>{totalPts}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{storyCount} stories</div>
                      </div>
                    </div>
                    {expandedEpic === ep.id && (
                      <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                        {SPRINTS.flatMap(s => s.stories).filter(s => s.epic === ep.id).map(st => (
                          <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid var(--border2)' }}>
                            <i className={`fas ${TYPE_ICONS[st.type]}`} style={{ color: TYPE_COLORS[st.type], fontSize: '11px', flexShrink: 0 }} />
                            <code style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>{st.id}</code>
                            <span style={{ fontSize: '12px', flex: 1 }}>{st.title}</span>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: FIB_COLOR(st.points) }}>{st.points}pt</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Sprint Board ── */}
        {activeTab === 'sprints' && (
          <div>
            {/* Sprint selector */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {SPRINTS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSprint(s.id)}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s',
                    background: activeSprint === s.id ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: activeSprint === s.id ? '#fff' : 'var(--text-secondary)',
                    border: activeSprint === s.id ? 'none' : '1px solid var(--border)',
                  }}
                >
                  Sprint {s.id}
                  <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.8 }}>{s.points}pt</span>
                </button>
              ))}
            </div>

            {sprint && (
              <>
                {/* Sprint header */}
                <div className="card" style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h2 style={{ fontWeight: '800', fontSize: '16px', marginBottom: '6px' }}>{sprint.name}</h2>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        <i className="fas fa-calendar" style={{ marginRight: '5px' }} />{sprint.dates}
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '700px', lineHeight: '1.6' }}>
                        <strong>Goal:</strong> {sprint.goal}
                      </p>
                    </div>
                    <div style={{ textAlign: 'center', background: 'var(--bg-secondary)', padding: '12px 24px', borderRadius: '12px' }}>
                      <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--accent)' }}>{sprint.points}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Story Points</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {sprint.epics.map(eid => {
                      const ep = epicFor(eid)
                      return ep ? (
                        <span key={eid} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: ep.color + '15', color: ep.color, fontWeight: '600' }}>
                          <i className={`fas ${ep.icon}`} style={{ marginRight: '4px' }} />{eid}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>

                {/* Stories */}
                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    {sprint.stories.length} Issues
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click a story to expand subtasks</div>
                </div>
                {sprint.stories.map(story => {
                  const ep = epicFor(story.epic)
                  return <StoryCard key={story.id} story={story} epicColor={ep?.color || 'var(--accent)'} />
                })}

                {/* Sprint summary table */}
                <div className="card" style={{ marginTop: '20px' }}>
                  <div className="card-title"><i className="fas fa-table" />Sprint Summary</div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th><th>Title</th><th>Epic</th><th>Type</th><th>Priority</th><th style={{ textAlign: 'center' }}>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sprint.stories.map(st => {
                        const ep = epicFor(st.epic)
                        return (
                          <tr key={st.id}>
                            <td style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)' }}>{st.id}</td>
                            <td style={{ fontWeight: '600', fontSize: '13px' }}>{st.title}</td>
                            <td>
                              <span style={{ fontSize: '11px', color: ep?.color, fontWeight: '600' }}>
                                <i className={`fas ${ep?.icon}`} style={{ marginRight: '4px' }} />{st.epic}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '11px', color: TYPE_COLORS[st.type] }}>
                                <i className={`fas ${TYPE_ICONS[st.type]}`} style={{ marginRight: '4px' }} />{st.type}
                              </span>
                            </td>
                            <td><Badge label={st.priority} color={PRIORITY_COLORS[st.priority]} /></td>
                            <td style={{ textAlign: 'center', fontWeight: '800', color: FIB_COLOR(st.points) }}>{st.points}</td>
                          </tr>
                        )
                      })}
                      <tr style={{ background: 'var(--bg-secondary)' }}>
                        <td colSpan={5} style={{ textAlign: 'right', fontWeight: '700', fontSize: '13px' }}>Total</td>
                        <td style={{ textAlign: 'center', fontWeight: '900', fontSize: '16px', color: 'var(--accent)' }}>{sprint.points}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Backlog ── */}
        {activeTab === 'backlog' && (
          <div>
            <div className="card" style={{ marginBottom: '16px', padding: '14px 18px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                <i className="fas fa-inbox" style={{ color: 'var(--accent)', marginRight: '8px' }} />
                Items below are scoped for <strong>post-Sprint 5</strong> (beyond May 2026). They are estimated and prioritised but not yet assigned to a sprint. Add them to future sprints as capacity allows.
              </div>
            </div>
            <div className="table-wrapper">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Title</th><th>Epic</th><th style={{ textAlign: 'center' }}>Est. Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BACKLOG.map(item => {
                      const ep = epicFor(item.epic)
                      return (
                        <tr key={item.id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)' }}>{item.id}</td>
                          <td style={{ fontWeight: '600', fontSize: '13px' }}>{item.title}</td>
                          <td>
                            <span style={{ fontSize: '11px', color: ep?.color, fontWeight: '600' }}>
                              <i className={`fas ${ep?.icon}`} style={{ marginRight: '4px' }} />{item.epic} — {ep?.name}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: '800', color: FIB_COLOR(item.points) }}>{item.points}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Definition of Done */}
            <div className="card" style={{ marginTop: '20px' }}>
              <div className="card-title"><i className="fas fa-circle-check" />Definition of Done</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px', marginTop: '8px' }}>
                {[
                  { icon: 'fa-code', label: 'Code', items: ['Feature code committed and PR reviewed', 'No ESLint errors or warnings', 'No console.log left in production code'] },
                  { icon: 'fa-flask', label: 'Testing', items: ['Unit tests written and passing', 'Integration test covering happy path + error path', 'Manual QA completed on staging'] },
                  { icon: 'fa-clock', label: 'Timezone', items: ['All DB writes in UTC verified', 'All UI/CSV display in IST verified', 'Edge case: midnight IST = 18:30 UTC previous day tested'] },
                  { icon: 'fa-shield-halved', label: 'Security', items: ['API endpoint has auth + permission check', 'No raw SQL injection vectors', 'Sensitive data not logged or exposed in API response'] },
                  { icon: 'fa-book', label: 'Documentation', items: ['JIRA ticket updated with resolution notes', 'API changes reflected in OpenAPI spec', 'README updated if new env var added'] },
                  { icon: 'fa-rocket', label: 'Deployment', items: ['Deployed to staging and smoke tested', 'No regression in existing features', 'Production deployment approved by tech lead'] },
                ].map(section => (
                  <div key={section.label} style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className={`fas ${section.icon}`} style={{ color: 'var(--accent)' }} />{section.label}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {section.items.map((item, i) => (
                        <li key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
