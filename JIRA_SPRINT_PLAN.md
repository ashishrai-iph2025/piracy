# JIRA Sprint Plan — Piracy Monitoring System

**Project Key:** PMS
**Document Version:** 1.0
**Created:** 2026-03-14
**Platform:** Next.js 14 Web Application
**Sprint Duration:** 2 weeks per sprint
**Total Planned Sprints:** 5 (active) + Backlog

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Epics](#epics)
3. [Sprint 1 — Stability & Critical Bug Fixes](#sprint-1)
4. [Sprint 2 — Data Integrity & Core Enhancements](#sprint-2)
5. [Sprint 3 — Notifications & Advanced Filtering](#sprint-3)
6. [Sprint 4 — Security, Access & API Hardening](#sprint-4)
7. [Sprint 5 — Mobile, UX Polish & Automation](#sprint-5)
8. [Backlog (Post Sprint 5)](#backlog)
9. [Definition of Done](#definition-of-done)

---

## Project Overview

The **Piracy Monitoring System (PMS)** is a Next.js 14 web application designed for tracking, reporting, and managing online piracy incidents across 11 content categories. The system enables authorized staff to ingest piracy data via bulk Excel uploads, manage case records through a full CRUD interface, generate analytical reports, and export data — all while enforcing role-based access controls per module and per user.

### Modules Covered

| # | Module Name |
|---|-------------|
| 1 | Social Media |
| 2 | Marketplace |
| 3 | Unauthorized Search |
| 4 | Ads Tutorials |
| 5 | Password Sharing Social |
| 6 | Password Sharing Marketplace |
| 7 | IPTV Internet |
| 8 | IPTV Apps |
| 9 | IPTV Social Media |
| 10 | IPTV Marketplace |
| 11 | IPTV Meta Ads |

### Technology Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes (REST API v1, JWT Bearer)
- **Database:** MySQL (UTC storage, IST display/export)
- **Auth:** SHA-256 passwords, 30-min cookie sessions
- **Timezone:** All DB writes in UTC; all display/export in IST (Asia/Kolkata, UTC+5:30)

### Completed Features (Baseline)

- Login / Register / Session authentication
- Full CRUD across all 11 modules (view, upload Excel, edit, delete, bulk update, export CSV)
- Per-module role-based permissions (superadmin, admin, user)
- Dashboard with aggregate analytics (removal stats by country / platform / module)
- Admin panel: user management, permission toggles, API playground, DB optimize (indexes)
- Bulk Excel upload with IST→UTC conversion and `ON DUPLICATE KEY UPDATE`
- CSV export with UTC→IST conversion
- Bulk status update page
- REST API v1 with JWT bearer tokens
- Per-user theme system (12 accent colors, dark/light mode, custom color picker)
- User activity log
- Global timezone strategy: UTC in DB, IST in UI/exports

### Recently Fixed Bugs

- MySQL too-many-connections resolved via global pool singleton
- Hydration error on login page fixed with `ssr:false` dynamic import
- Theme bleed between users resolved with per-user localStorage keys + server authority
- Missing modules in permissions auto-inserted from `SHEET_NAV`
- No-view-permission still showed module content — fixed with proper 403 handling
- Sr.No column removed from all module tables
- Login page now correctly renders in light mode regardless of active user theme

---

## Epics

| Epic ID | Epic Name | Description |
|---------|-----------|-------------|
| EP-01 | Data Integrity & Timezone | Ensure all data paths (upload, edit, bulk update, export) handle UTC↔IST conversion correctly and consistently |
| EP-02 | Notifications & Alerting | Email and in-app notifications triggered by record status changes and report generation |
| EP-03 | Dashboard & Analytics | Advanced filtering, drill-down views, and real-time analytics across all 11 modules |
| EP-04 | Security & Authentication | Harden authentication flows: password reset, 2FA/OTP, rate limiting, session hardening |
| EP-05 | API Hardening | Rate limiting, versioning, documentation, and stability improvements for REST API v1 |
| EP-06 | Audit & Compliance | Audit trail, record history, data retention, and archival policy |
| EP-07 | Search & Discovery | Global search across all modules with filters, pagination, and relevance ranking |
| EP-08 | Mobile & UX | Responsive design improvements, UX polish, and accessibility compliance |
| EP-09 | Automation & Scheduling | Scheduled report exports, automated email delivery, and CI/CD pipeline |
| EP-10 | Testing & Quality | Unit tests, integration tests, end-to-end tests, and production deployment checklist |

---

## Sprint 1

**Sprint Name:** PMS Sprint 1 — Stability & Critical Fixes
**Sprint Dates:** 2026-03-16 → 2026-03-27
**Sprint Goal:** Eliminate all known data-path bugs introduced by the IST→UTC conversion gap in bulk update, shore up permission edge cases, and ensure the activity log is usable at scale.

**Epics Referenced:** EP-01, EP-06, EP-07

---

### US-001 — Fix Bulk Update Route: IST→UTC Conversion

**Epic:** EP-01 — Data Integrity & Timezone
**Story Points:** 5
**Priority:** Critical
**Assignee:** Backend Developer

**User Story:**
As a data analyst, I want bulk status updates to correctly convert IST timestamps to UTC before writing to the database, so that records remain temporally consistent with data uploaded via the Excel import flow.

**Acceptance Criteria:**
- Bulk update API route reads all incoming date/time fields as IST and converts to UTC before DB write
- Existing records updated via bulk update show correct IST time when exported to CSV
- Conversion logic is extracted into a shared utility (no duplication with upload route)
- Unit test added for the IST→UTC conversion utility function

**Subtasks:**
- [ ] ST-001-1: Audit the bulk update API route for all date/time field writes
- [ ] ST-001-2: Implement IST→UTC conversion in bulk update handler using shared `tzUtils` module
- [ ] ST-001-3: Verify conversion parity with the existing Excel upload route
- [ ] ST-001-4: Write unit test for `convertISTtoUTC()` with edge cases (DST boundary, midnight, end-of-month)
- [ ] ST-001-5: QA: spot-check 5 records updated via bulk update and verify DB UTC value vs. CSV IST export

---

### US-002 — Pagination on Activity Log Page

**Epic:** EP-06 — Audit & Compliance
**Story Points:** 3
**Priority:** High
**Assignee:** Full-Stack Developer

**User Story:**
As a superadmin, I want the activity log page to be paginated, so that it remains performant and usable as log volume grows beyond thousands of entries.

**Acceptance Criteria:**
- Activity log page renders with configurable page size (default 25, options: 25, 50, 100)
- Page navigation controls (first, prev, next, last, page number input) are functional
- Total record count and current range displayed (e.g., "Showing 26–50 of 1,240 entries")
- URL query params (`?page=2&limit=50`) reflect current pagination state for shareability
- Page reloads at the correct offset when navigated to via URL directly

**Subtasks:**
- [ ] ST-002-1: Add `page` and `limit` query params to the activity log API endpoint
- [ ] ST-002-2: Add `LIMIT` / `OFFSET` to the DB query for activity logs
- [ ] ST-002-3: Build `<Pagination>` reusable component with first/prev/next/last controls
- [ ] ST-002-4: Integrate pagination component into the activity log page
- [ ] ST-002-5: Add page-size selector dropdown
- [ ] ST-002-6: QA test with 500+ log entries in staging DB

---

### US-003 — Global Search Across All Modules (Phase 1: Infrastructure)

**Epic:** EP-07 — Search & Discovery
**Story Points:** 8
**Priority:** High
**Assignee:** Backend Developer

**User Story:**
As an analyst, I want a global search bar that queries across all 11 modules simultaneously, so that I can locate a specific URL, domain, or platform entry without knowing which module it belongs to.

**Acceptance Criteria:**
- Global search API endpoint `/api/v1/search?q=<term>` returns results from all 11 module tables
- Results are grouped by module with a count per module
- Each result row includes: module name, record ID, matched field, matched value, status, created_at (IST)
- Search is scoped to fields: URL, Platform, Country, Status, Notes (configurable)
- Only modules for which the requesting user has at least `view` permission are included in results
- Minimum query length: 3 characters; returns HTTP 400 for shorter queries
- Response time under 2 seconds for up to 500k total records

**Subtasks:**
- [ ] ST-003-1: Design unified search API response schema
- [ ] ST-003-2: Implement parallel DB queries across all 11 module tables with `LIKE` on indexed fields
- [ ] ST-003-3: Add full-text indexes on searchable columns for each module table (migration script)
- [ ] ST-003-4: Enforce per-user module permission filter in search results
- [ ] ST-003-5: Build global search UI component (search bar in top nav)
- [ ] ST-003-6: Build search results page with module-grouped result cards
- [ ] ST-003-7: Add loading skeleton and empty-state UI
- [ ] ST-003-8: Performance test with simulated 500k rows across modules

---

### US-004 — Harden 403 / Permission Edge Cases on Module Pages

**Epic:** EP-04 — Security & Authentication
**Story Points:** 3
**Priority:** High
**Assignee:** Full-Stack Developer

**User Story:**
As a security-conscious admin, I want all module page routes to consistently redirect or display a 403 error when the user lacks view permission, so that no partial data is ever rendered to unauthorized users.

**Acceptance Criteria:**
- All 11 module list pages perform server-side permission check before rendering any data
- Users without view permission see a consistent 403 page (not an empty table or a flash of content)
- Upload, edit, delete, and bulk update actions each return HTTP 403 with descriptive JSON when permission is absent
- Permission checks use a single shared `withPermission()` middleware (no duplication)
- Superadmin always bypasses module-level permission checks

**Subtasks:**
- [ ] ST-004-1: Create `withPermission(module, action)` server-side middleware helper
- [ ] ST-004-2: Apply middleware to all 11 module API routes (view, create, update, delete)
- [ ] ST-004-3: Apply server-side permission check to all 11 module Next.js page components
- [ ] ST-004-4: Design and build reusable `<PermissionDenied403>` page component
- [ ] ST-004-5: Write integration test: user with no-view permission cannot fetch module data via API or UI

---

### Sprint 1 Summary

| Story | Title | Points |
|-------|-------|--------|
| US-001 | Fix Bulk Update Route: IST→UTC Conversion | 5 |
| US-002 | Pagination on Activity Log Page | 3 |
| US-003 | Global Search — Phase 1: Infrastructure | 8 |
| US-004 | Harden 403 / Permission Edge Cases | 3 |
| **Total** | | **19** |

---

## Sprint 2

**Sprint Name:** PMS Sprint 2 — Data Integrity & Core Enhancements
**Sprint Dates:** 2026-03-30 → 2026-04-10
**Sprint Goal:** Deliver audit trail functionality for record changes, complete global search with a polished UI, and introduce advanced dashboard filtering by removal status and platform.

**Epics Referenced:** EP-01, EP-03, EP-06, EP-07

---

### US-005 — Audit Trail: Record Change History

**Epic:** EP-06 — Audit & Compliance
**Story Points:** 8
**Priority:** High
**Assignee:** Backend Developer

**User Story:**
As a compliance officer, I want every change to a record (create, edit, delete, bulk update) to be logged with the previous and new values, so that I can audit who changed what and when.

**Acceptance Criteria:**
- A new `record_audit_log` table captures: record_id, module, action (CREATE/UPDATE/DELETE), changed_by (user_id), changed_at (UTC), field_name, old_value, new_value
- All CRUD API routes write to the audit log within the same DB transaction as the data change
- Superadmin and admin roles can view the audit history for any individual record via a "History" side panel
- Audit log entries display timestamps in IST
- Bulk operations log each affected record individually
- Audit log is append-only (no DELETE or UPDATE on audit rows)

**Subtasks:**
- [ ] ST-005-1: Design and create `record_audit_log` DB table with appropriate indexes
- [ ] ST-005-2: Create `writeAuditLog(params)` utility that inserts within the caller's DB transaction
- [ ] ST-005-3: Instrument the Create record API route
- [ ] ST-005-4: Instrument the Edit/Update record API route
- [ ] ST-005-5: Instrument the Delete record API route
- [ ] ST-005-6: Instrument the Bulk Update API route (per-record logging)
- [ ] ST-005-7: Build "Record History" side panel UI component
- [ ] ST-005-8: Add "History" button/icon to each record row in module tables

---

### US-006 — Advanced Dashboard Filters: Removal Status & Platform

**Epic:** EP-03 — Dashboard & Analytics
**Story Points:** 5
**Priority:** High
**Assignee:** Full-Stack Developer

**User Story:**
As an analyst, I want to filter the dashboard analytics by removal status (e.g., Removed, Pending, In Progress) and by platform (e.g., YouTube, Facebook, TikTok), so that I can quickly understand performance metrics for a specific subset of the data.

**Acceptance Criteria:**
- Dashboard filter bar includes: Module (multi-select), Platform (multi-select), Removal Status (multi-select), Date Range (start/end, IST)
- All dashboard charts and KPI counters update reactively when filters change
- Active filters are reflected in the URL query string for shareability
- "Clear All Filters" button resets to default view
- Filter state persists across page refresh via URL params
- Dashboard API endpoints accept and apply filter params with SQL WHERE clauses

**Subtasks:**
- [ ] ST-006-1: Audit current dashboard API queries and identify filter injection points
- [ ] ST-006-2: Extend dashboard API routes to accept `module[]`, `platform[]`, `status[]`, `dateFrom`, `dateTo` params
- [ ] ST-006-3: Build `<DashboardFilterBar>` UI component with multi-select dropdowns and date range picker
- [ ] ST-006-4: Wire filter state to dashboard API calls using React Query / SWR
- [ ] ST-006-5: Sync filter state to URL query params (`useSearchParams`)
- [ ] ST-006-6: Update all chart components to re-render on filter change
- [ ] ST-006-7: QA: verify filter combinations return correct record counts vs. direct DB query

---

### US-007 — Global Search Phase 2: UI Polish & Filters

**Epic:** EP-07 — Search & Discovery
**Story Points:** 5
**Priority:** Medium
**Assignee:** Frontend Developer

**User Story:**
As an analyst, I want to filter global search results by module, status, and date range, and be able to click a result to navigate directly to the record's edit view, so that search is a productive tool for daily workflows.

**Acceptance Criteria:**
- Search results page has sidebar filters: Module, Status, Date Range
- Clicking a result row navigates to the relevant module's edit page pre-populated with that record
- Search term is highlighted within matched field values in the results list
- Keyboard shortcut (Ctrl+K / Cmd+K) opens the global search modal from any page
- "No results found" state shows suggestions (check spelling, try broader terms)
- Search results are paginated (25 per page)

**Subtasks:**
- [ ] ST-007-1: Add filter params (`module`, `status`, `dateFrom`, `dateTo`) to search API
- [ ] ST-007-2: Build sidebar filter panel on search results page
- [ ] ST-007-3: Implement result-row click navigation to module edit page
- [ ] ST-007-4: Implement search term highlight utility (`<Highlight term={q}>`)
- [ ] ST-007-5: Register global keyboard shortcut for search modal
- [ ] ST-007-6: Add pagination to search results page (reuse `<Pagination>` from US-002)
- [ ] ST-007-7: Design and implement empty/no-results state

---

### US-008 — Data Export: Add Audit Filters to CSV Export

**Epic:** EP-01 — Data Integrity & Timezone
**Story Points:** 3
**Priority:** Medium
**Assignee:** Backend Developer

**User Story:**
As a data analyst, I want to export CSV with the same filters active on the module view (status, date range, platform), so that exports reflect exactly what I see on screen rather than always dumping the full dataset.

**Acceptance Criteria:**
- CSV export API route accepts the same filter params as the module list view API
- Exported CSV filename includes the active filters in a human-readable suffix (e.g., `social_media_removed_2026-03.csv`)
- All timestamps in exported CSV are in IST
- Export is limited to records the user has permission to view
- Maximum export size: 50,000 rows; returns HTTP 413 with message if exceeded

**Subtasks:**
- [ ] ST-008-1: Extend CSV export API route to accept filter query params
- [ ] ST-008-2: Apply the same filter logic used in list view to export query
- [ ] ST-008-3: Generate dynamic filename from active filters
- [ ] ST-008-4: Add row-count guard (HTTP 413 if >50k rows)
- [ ] ST-008-5: QA: export filtered results and verify against UI list view counts

---

### Sprint 2 Summary

| Story | Title | Points |
|-------|-------|--------|
| US-005 | Audit Trail: Record Change History | 8 |
| US-006 | Advanced Dashboard Filters | 5 |
| US-007 | Global Search Phase 2: UI Polish | 5 |
| US-008 | Data Export: Add Audit Filters to CSV | 3 |
| **Total** | | **21** |

---

## Sprint 3

**Sprint Name:** PMS Sprint 3 — Notifications & Alerting
**Sprint Dates:** 2026-04-13 → 2026-04-24
**Sprint Goal:** Deliver email notifications for record removal events, build the password reset flow, and introduce in-app notification infrastructure.

**Epics Referenced:** EP-02, EP-04

---

### US-009 — Email Notifications on Record Removal

**Epic:** EP-02 — Notifications & Alerting
**Story Points:** 8
**Priority:** High
**Assignee:** Backend Developer

**User Story:**
As a monitoring analyst, I want to receive an email notification when a record's status is updated to "Removed," so that I am immediately informed about enforcement progress without checking the dashboard manually.

**Acceptance Criteria:**
- Notification email is sent when any record's status transitions to "Removed" (single edit or bulk update)
- Email template includes: Module name, Record URL/identifier, Platform, Country, Updated by, Timestamp (IST), link to record in system
- Email recipients are configurable per module (admin panel setting)
- Email sending is async (does not block the API response)
- Failed email delivery is logged to `notification_error_log` table but does not cause the record update to fail
- Email sending uses a configurable SMTP provider (env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`)

**Subtasks:**
- [ ] ST-009-1: Set up transactional email service integration (Nodemailer with SMTP env config)
- [ ] ST-009-2: Design HTML/text email template for removal notification
- [ ] ST-009-3: Create `sendNotificationEmail(payload)` async utility
- [ ] ST-009-4: Hook notification trigger into single-record update API route (status → Removed)
- [ ] ST-009-5: Hook notification trigger into bulk update API route (status → Removed)
- [ ] ST-009-6: Create `notification_recipients` config table (module_id, email, active)
- [ ] ST-009-7: Build admin panel UI for managing notification recipient emails per module
- [ ] ST-009-8: Implement `notification_error_log` table and error capture
- [ ] ST-009-9: QA end-to-end: update record to Removed, verify email receipt and DB error log on SMTP failure

---

### US-010 — Password Reset / Forgot Password Flow

**Epic:** EP-04 — Security & Authentication
**Story Points:** 5
**Priority:** High
**Assignee:** Full-Stack Developer

**User Story:**
As a registered user, I want to reset my forgotten password via a secure email link, so that I can regain account access without requiring admin intervention.

**Acceptance Criteria:**
- "Forgot Password" link on the login page navigates to a request form (email input)
- System sends a password reset email containing a single-use token link (expires in 1 hour)
- Reset token is stored hashed (SHA-256) in the DB with expiry timestamp
- Reset link navigates to a "Set New Password" page; password and confirm-password fields required
- Password must meet minimum policy: 8+ characters, at least one number
- After successful reset, all existing sessions for that user are invalidated
- Used or expired tokens return a clear error page ("This link has expired")
- Reset email uses the same SMTP config as notification emails (EP-02)

**Subtasks:**
- [ ] ST-010-1: Create `password_reset_tokens` DB table (user_id, token_hash, expires_at, used_at)
- [ ] ST-010-2: Build "Forgot Password" page (email request form)
- [ ] ST-010-3: Implement `/api/auth/forgot-password` route (generate token, send email)
- [ ] ST-010-4: Design password reset email template
- [ ] ST-010-5: Build "Set New Password" page (token from URL query param)
- [ ] ST-010-6: Implement `/api/auth/reset-password` route (validate token, update password hash, invalidate sessions)
- [ ] ST-010-7: Add session invalidation logic to clear all active cookies for user on password reset
- [ ] ST-010-8: QA: full flow test including expired token, reused token, and valid reset

---

### US-011 — In-App Notification Bell (Infrastructure)

**Epic:** EP-02 — Notifications & Alerting
**Story Points:** 5
**Priority:** Medium
**Assignee:** Full-Stack Developer

**User Story:**
As a user, I want an in-app notification bell in the top navigation that shows me recent system events relevant to my modules, so that I can stay informed without leaving the application.

**Acceptance Criteria:**
- Notification bell icon in top nav shows unread count badge (capped at "99+")
- Clicking the bell opens a dropdown with the last 20 notifications for the current user
- Notifications are generated for: record removed in user's module, bulk upload completed, permission change affecting user
- Each notification shows: icon (type), message, module, timestamp (IST, relative e.g. "2h ago")
- "Mark all as read" button clears the unread badge
- Individual notification click navigates to the relevant record/page
- Notifications are fetched via polling every 30 seconds (WebSocket upgrade deferred to backlog)

**Subtasks:**
- [ ] ST-011-1: Create `user_notifications` DB table (id, user_id, type, title, body, link, module, read_at, created_at)
- [ ] ST-011-2: Implement `createNotification(userId, payload)` utility
- [ ] ST-011-3: Hook notification creation into removal event (reuse trigger from US-009)
- [ ] ST-011-4: Hook notification creation into bulk upload completion
- [ ] ST-011-5: Hook notification creation into permission change events (admin panel)
- [ ] ST-011-6: Build `/api/notifications` GET (last 20, unread count) and PATCH (mark read) routes
- [ ] ST-011-7: Build `<NotificationBell>` top-nav component with dropdown and badge
- [ ] ST-011-8: Implement 30-second polling with SWR `refreshInterval`

---

### US-012 — Admin Panel: SMTP Configuration UI

**Epic:** EP-02 — Notifications & Alerting
**Story Points:** 3
**Priority:** Medium
**Assignee:** Full-Stack Developer

**User Story:**
As a superadmin, I want to configure and test SMTP settings from the admin panel UI, so that email notifications can be set up without modifying server environment variables manually.

**Acceptance Criteria:**
- Admin panel has a new "Email Settings" section with fields for SMTP host, port, username, password (masked), from address
- "Send Test Email" button sends a test email to the currently logged-in superadmin's address
- Settings are saved to the DB (encrypted at rest) and override env vars at runtime
- Success/failure feedback shown immediately after test send
- Only superadmin role can access this section

**Subtasks:**
- [ ] ST-012-1: Create `system_config` DB table for key-value settings with optional encryption flag
- [ ] ST-012-2: Implement encrypt/decrypt utility for sensitive config values (AES-256 with `CONFIG_SECRET` env var)
- [ ] ST-012-3: Build admin panel "Email Settings" form component
- [ ] ST-012-4: Implement API routes: GET and PUT `/api/admin/config/smtp`
- [ ] ST-012-5: Implement "Send Test Email" API route and UI button with feedback toast
- [ ] ST-012-6: Update `sendNotificationEmail()` to prefer DB config over env vars

---

### Sprint 3 Summary

| Story | Title | Points |
|-------|-------|--------|
| US-009 | Email Notifications on Record Removal | 8 |
| US-010 | Password Reset / Forgot Password Flow | 5 |
| US-011 | In-App Notification Bell (Infrastructure) | 5 |
| US-012 | Admin Panel: SMTP Configuration UI | 3 |
| **Total** | | **21** |

---

## Sprint 4

**Sprint Name:** PMS Sprint 4 — Security, Access Hardening & API Quality
**Sprint Dates:** 2026-04-27 → 2026-05-08
**Sprint Goal:** Harden the system against abuse via API rate limiting, introduce 2FA/OTP login, implement data retention policies, and begin the automated test suite.

**Epics Referenced:** EP-04, EP-05, EP-06, EP-10

---

### US-013 — Rate Limiting on REST API v1

**Epic:** EP-05 — API Hardening
**Story Points:** 5
**Priority:** High
**Assignee:** Backend Developer

**User Story:**
As a system administrator, I want the REST API v1 to enforce rate limits per API key, so that abusive or runaway scripts cannot degrade system performance for all users.

**Acceptance Criteria:**
- Rate limit applied per JWT bearer token: 100 requests per minute (configurable via env)
- Requests exceeding the limit receive HTTP 429 with `Retry-After` header
- Rate limit headers included on all API v1 responses: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Superadmin tokens have a separate, higher limit (1,000 req/min) or can be exempted
- Rate limit state stored in Redis or in-memory (fallback to in-memory if Redis not configured)
- Rate limit middleware applied globally to `/api/v1/*` routes

**Subtasks:**
- [ ] ST-013-1: Select and install rate-limiting library (e.g., `upstash/ratelimit` or custom sliding-window)
- [ ] ST-013-2: Implement `rateLimitMiddleware(req, res)` function
- [ ] ST-013-3: Apply middleware to all `/api/v1/*` Next.js route handlers
- [ ] ST-013-4: Configure per-role rate limit tiers (user, admin, superadmin)
- [ ] ST-013-5: Add `X-RateLimit-*` response headers
- [ ] ST-013-6: Write integration test: exceed rate limit, verify 429 and `Retry-After`
- [ ] ST-013-7: Document rate limits in the API Playground admin panel section

---

### US-014 — Two-Factor Authentication (TOTP/OTP)

**Epic:** EP-04 — Security & Authentication
**Story Points:** 13
**Priority:** High
**Assignee:** Full-Stack Developer

**User Story:**
As a security-conscious user, I want to enable time-based one-time password (TOTP) two-factor authentication on my account, so that my account remains secure even if my password is compromised.

**Acceptance Criteria:**
- 2FA setup available in user profile settings (optional, not mandatory by default)
- Setup flow: display QR code for authenticator app (Google Authenticator, Authy), prompt for 6-digit verification to confirm setup
- After 2FA is enabled, login flow prompts for OTP code after correct password
- 10 single-use backup codes generated and shown once at setup time; stored hashed in DB
- If a user loses their authenticator, backup codes allow login and 2FA reset
- Superadmin can disable 2FA for any user from admin panel (emergency recovery)
- 2FA secret stored encrypted at rest (same `CONFIG_SECRET` mechanism as US-012)
- OTP verification window: ±1 time step (30s) tolerance for clock skew

**Subtasks:**
- [ ] ST-014-1: Install TOTP library (`otpauth` or `speakeasy`)
- [ ] ST-014-2: Create `user_2fa` DB table (user_id, secret_encrypted, backup_codes_hash[], enabled_at)
- [ ] ST-014-3: Build 2FA setup page: generate secret, render QR code, verify-then-activate flow
- [ ] ST-014-4: Implement `/api/auth/2fa/setup` POST and `/api/auth/2fa/verify-setup` POST routes
- [ ] ST-014-5: Modify login API to check if user has 2FA enabled; return `requires_otp` flag
- [ ] ST-014-6: Build OTP challenge page/modal shown after successful password entry
- [ ] ST-014-7: Implement `/api/auth/2fa/verify-login` POST route
- [ ] ST-014-8: Generate, hash, and store 10 backup codes at setup time
- [ ] ST-014-9: Build backup code entry UI (alternative to TOTP code)
- [ ] ST-014-10: Build admin panel "Disable 2FA" action for a user
- [ ] ST-014-11: QA: full 2FA setup, login, backup code usage, and admin-disable flow

---

### US-015 — Data Retention & Archival Policy

**Epic:** EP-06 — Audit & Compliance
**Story Points:** 8
**Priority:** Medium
**Assignee:** Backend Developer

**User Story:**
As a data governance officer, I want a configurable data retention policy that automatically archives or flags records older than a defined threshold, so that the system complies with data management requirements and remains performant.

**Acceptance Criteria:**
- Superadmin can configure retention period per module (e.g., 24 months) from the admin panel
- A scheduled job (cron) runs nightly to identify records exceeding the retention period
- Records past retention are moved to an `archived_records` table (not deleted), with archive timestamp and source module
- Archived records are excluded from normal module list views and searches by default
- Superadmin can view, restore, or permanently delete archived records from an "Archive" admin panel section
- Archival job run logs (records processed, records archived, errors) stored in `archival_job_log` table

**Subtasks:**
- [ ] ST-015-1: Create `archived_records` table with module discriminator column and all original fields
- [ ] ST-015-2: Create `archival_job_log` table
- [ ] ST-015-3: Implement `runArchivalJob(module, retentionMonths)` function
- [ ] ST-015-4: Build cron trigger for nightly archival job (via Next.js cron route or external scheduler)
- [ ] ST-015-5: Add per-module retention config to `system_config` table and admin panel UI
- [ ] ST-015-6: Exclude archived records from module list view queries
- [ ] ST-015-7: Build "Archive" section in admin panel (view, restore, delete)
- [ ] ST-015-8: QA: run archival job manually on test data, verify records move and are restorable

---

### US-016 — Unit & Integration Test Suite: Phase 1 (Core API Routes)

**Epic:** EP-10 — Testing & Quality
**Story Points:** 8
**Priority:** Medium
**Assignee:** Backend Developer

**User Story:**
As a developer, I want a foundational automated test suite covering the most critical API routes, so that regressions are caught before they reach production.

**Acceptance Criteria:**
- Testing framework configured (Jest + Supertest for API routes)
- Test coverage for: auth (login, logout, session), CRUD for 2 representative modules, permission enforcement (403 scenarios), IST↔UTC conversion utilities
- Tests run in CI on every PR (GitHub Actions or equivalent)
- Minimum 70% code coverage on `lib/` and `app/api/` directories
- Test database uses a separate MySQL schema (`pms_test`) seeded via migration scripts

**Subtasks:**
- [ ] ST-016-1: Install and configure Jest, Supertest, and test DB connection
- [ ] ST-016-2: Create test DB seed scripts (users, permissions, sample records for 2 modules)
- [ ] ST-016-3: Write tests for `/api/auth/login` and `/api/auth/logout`
- [ ] ST-016-4: Write tests for module CRUD routes (create, read, update, delete) for Social Media module
- [ ] ST-016-5: Write tests for permission enforcement (403 on missing permissions)
- [ ] ST-016-6: Write unit tests for `tzUtils` (IST↔UTC conversions)
- [ ] ST-016-7: Write unit tests for `withPermission()` middleware
- [ ] ST-016-8: Configure GitHub Actions workflow to run tests on PR to `main`
- [ ] ST-016-9: Add coverage report artifact to CI output

---

### Sprint 4 Summary

| Story | Title | Points |
|-------|-------|--------|
| US-013 | Rate Limiting on REST API v1 | 5 |
| US-014 | Two-Factor Authentication (TOTP/OTP) | 13 |
| US-015 | Data Retention & Archival Policy | 8 |
| US-016 | Unit & Integration Test Suite: Phase 1 | 8 |
| **Total** | | **34** |

---

## Sprint 5

**Sprint Name:** PMS Sprint 5 — Mobile, UX Polish & Automation
**Sprint Dates:** 2026-05-11 → 2026-05-22
**Sprint Goal:** Achieve full mobile responsiveness across all modules and the dashboard, deliver scheduled automated report exports, and complete the production deployment checklist.

**Epics Referenced:** EP-08, EP-09, EP-10

---

### US-017 — Mobile Responsive Design: All Module Pages

**Epic:** EP-08 — Mobile & UX
**Story Points:** 8
**Priority:** High
**Assignee:** Frontend Developer

**User Story:**
As a field analyst using a mobile device, I want all 11 module pages to be fully usable on a smartphone, so that I can check and update records while away from a desktop.

**Acceptance Criteria:**
- All 11 module list/table views are horizontally scrollable on screens <768px, with sticky first column (URL/identifier)
- Upload, edit, delete, and bulk update actions are accessible and functional on mobile
- All form inputs, dropdowns, and buttons meet minimum touch target size (44×44px per WCAG 2.1)
- Navigation (sidebar/top-nav) collapses to a hamburger menu on mobile
- Dashboard charts reflow to single-column stacked layout on mobile
- No horizontal page overflow on any module page at 375px viewport width
- Tested on: iOS Safari 17, Android Chrome 120

**Subtasks:**
- [ ] ST-017-1: Audit all 11 module table components for mobile breakpoints; create remediation list
- [ ] ST-017-2: Implement horizontal scroll wrapper with sticky first column for all module tables
- [ ] ST-017-3: Convert sidebar navigation to collapsible hamburger menu for mobile
- [ ] ST-017-4: Audit and fix all form page layouts for <768px viewports
- [ ] ST-017-5: Reflow dashboard chart grid to single column on mobile
- [ ] ST-017-6: Fix all touch target sizes failing WCAG 44px minimum
- [ ] ST-017-7: QA pass on iPhone 14 Pro (iOS Safari) and Pixel 7 (Chrome) using BrowserStack or physical devices
- [ ] ST-017-8: Fix any overflow/clipping issues found during QA pass

---

### US-018 — Scheduled Automated Report Export (Email Delivery)

**Epic:** EP-09 — Automation & Scheduling
**Story Points:** 8
**Priority:** High
**Assignee:** Full-Stack Developer

**User Story:**
As a team lead, I want to schedule automatic CSV report exports for specific modules to be emailed to me on a daily or weekly basis, so that I receive consistent reporting without manual intervention.

**Acceptance Criteria:**
- Superadmin and admin can create a scheduled report: module(s), filters (status, date range), frequency (daily/weekly), recipient email list, day/time (IST)
- Scheduled reports are stored in `scheduled_reports` DB table
- A cron job evaluates due reports and triggers CSV generation + email delivery
- Email contains: summary stats (record count, removal count), CSV file attached
- Schedule can be paused, edited, or deleted from admin panel
- Cron job run log stored in `report_job_log` table (report_id, run_at, status, records_exported, error)
- CSV attachment uses same IST conversion as manual exports

**Subtasks:**
- [ ] ST-018-1: Design and create `scheduled_reports` DB table (id, name, modules[], filters_json, frequency, day_of_week, time_ist, recipients[], active, created_by)
- [ ] ST-018-2: Create `report_job_log` DB table
- [ ] ST-018-3: Build admin panel "Scheduled Reports" management page (list, create, edit, pause, delete)
- [ ] ST-018-4: Implement `/api/admin/scheduled-reports` CRUD routes
- [ ] ST-018-5: Implement `generateScheduledReport(reportId)` function (reuse CSV export logic from US-008)
- [ ] ST-018-6: Implement cron trigger (Next.js cron route, checked every 15 min)
- [ ] ST-018-7: Design and implement scheduled report email template with CSV attachment
- [ ] ST-018-8: QA: create a 1-minute interval test report, verify email receipt, attachment content, and job log entry

---

### US-019 — CI/CD Pipeline Setup

**Epic:** EP-09 — Automation & Scheduling
**Story Points:** 5
**Priority:** High
**Assignee:** DevOps / Full-Stack Developer

**User Story:**
As a developer, I want a CI/CD pipeline that automatically tests and builds the application on every pull request and deploys to staging on merge to `main`, so that code quality is enforced and deployments are repeatable.

**Acceptance Criteria:**
- GitHub Actions workflow runs on every PR to `main`: lint (ESLint), type-check (tsc), and unit/integration tests
- Build step (`next build`) runs and fails the pipeline if it errors
- Merge to `main` triggers automatic deployment to staging environment
- Deployment secrets (DB credentials, SMTP, JWT secret) managed via GitHub Secrets / environment variables
- Pipeline badge visible on repository README
- Total pipeline runtime under 10 minutes for PR checks

**Subtasks:**
- [ ] ST-019-1: Create `.github/workflows/ci.yml` for PR checks (lint, type-check, test, build)
- [ ] ST-019-2: Create `.github/workflows/deploy-staging.yml` for staging deploy on merge to `main`
- [ ] ST-019-3: Configure GitHub Secrets for all environment variables
- [ ] ST-019-4: Ensure test DB is provisioned in CI environment (GitHub Actions service container for MySQL)
- [ ] ST-019-5: Add pipeline status badge to README
- [ ] ST-019-6: Document deployment process in `DEPLOYMENT.md`

---

### US-020 — Production Deployment Checklist & Hardening

**Epic:** EP-10 — Testing & Quality
**Story Points:** 5
**Priority:** High
**Assignee:** Full-Stack Developer + DevOps

**User Story:**
As a project manager, I want a verified production deployment checklist completed before go-live, so that the system launches securely, reliably, and with a clear rollback plan.

**Acceptance Criteria:**
- All checklist items documented and signed off in `DEPLOYMENT.md`
- Production environment variables documented (no secrets committed to repo)
- DB migration scripts tested on production-equivalent dataset
- SSL/TLS enforced on all routes (HTTP redirects to HTTPS)
- Security headers configured (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- Health check endpoint `/api/health` returns 200 with DB connectivity status
- Rollback procedure documented and tested (previous build re-deploy)
- Load test conducted: 50 concurrent users, <2s p95 response on module list pages

**Subtasks:**
- [ ] ST-020-1: Create `/api/health` endpoint (DB ping, returns version, uptime, db_status)
- [ ] ST-020-2: Configure Next.js security headers in `next.config.js`
- [ ] ST-020-3: Verify all env vars are documented in `.env.example` (no defaults with real secrets)
- [ ] ST-020-4: Run DB migration scripts on staging with production-scale data snapshot
- [ ] ST-020-5: Conduct load test (k6 or Artillery): 50 VU, 5-min soak, record p95/p99
- [ ] ST-020-6: Document and rehearse rollback procedure
- [ ] ST-020-7: SSL/TLS configuration verification (A+ on SSL Labs)
- [ ] ST-020-8: Write and publish `DEPLOYMENT.md` production checklist document

---

### US-021 — UX Polish: Consistent Loading States & Error Boundaries

**Epic:** EP-08 — Mobile & UX
**Story Points:** 3
**Priority:** Medium
**Assignee:** Frontend Developer

**User Story:**
As any user, I want consistent loading skeletons and meaningful error messages throughout the application, so that the app feels polished and I always understand what is happening.

**Acceptance Criteria:**
- All data-fetching pages show a loading skeleton (not a blank screen or spinner-only) while data loads
- All API errors display a user-friendly toast notification with the error message and a retry option
- React Error Boundaries wrap all major page sections; unhandled errors show a recoverable error card (not a blank page)
- 404 page is custom-branded and includes a link back to the dashboard
- Form validation errors appear inline beneath the relevant field (not only as alert dialogs)

**Subtasks:**
- [ ] ST-021-1: Create `<SkeletonTable>` and `<SkeletonCard>` reusable components
- [ ] ST-021-2: Replace all loading spinners in module list pages with skeleton tables
- [ ] ST-021-3: Implement global `<ErrorToast>` system using React context
- [ ] ST-021-4: Wrap all major page sections in `<ErrorBoundary>` components with fallback UI
- [ ] ST-021-5: Build custom 404 page
- [ ] ST-021-6: Audit all forms and add inline validation error messages

---

### Sprint 5 Summary

| Story | Title | Points |
|-------|-------|--------|
| US-017 | Mobile Responsive Design: All Module Pages | 8 |
| US-018 | Scheduled Automated Report Export | 8 |
| US-019 | CI/CD Pipeline Setup | 5 |
| US-020 | Production Deployment Checklist | 5 |
| US-021 | UX Polish: Loading States & Error Boundaries | 3 |
| **Total** | | **29** |

---

## Backlog

> Items below are captured for future planning beyond Sprint 5. They are prioritized relative to each other but have not been assigned to a sprint. Story points are estimated for planning purposes.

| ID | Title | Epic | Est. Points | Priority |
|----|-------|------|-------------|----------|
| US-022 | WebSocket-based real-time notifications (upgrade from polling) | EP-02 | 8 | Medium |
| US-023 | Global search: Elasticsearch/OpenSearch integration for full-text search at scale | EP-07 | 13 | Medium |
| US-024 | Advanced audit trail: diff viewer (side-by-side old vs. new values) | EP-06 | 5 | Medium |
| US-025 | Unit & Integration Test Suite Phase 2: remaining 9 modules + notification routes | EP-10 | 8 | High |
| US-026 | End-to-end test suite (Playwright): login, upload, bulk update, export flows | EP-10 | 8 | High |
| US-027 | API v1 documentation: auto-generated OpenAPI 3.0 spec from route annotations | EP-05 | 5 | Medium |
| US-028 | API v2 planning: GraphQL exploration for dashboard analytics queries | EP-05 | 3 | Low |
| US-029 | Accessibility audit & remediation (WCAG 2.1 AA full compliance) | EP-08 | 8 | Medium |
| US-030 | Dark mode refinement: review all components for insufficient contrast in dark theme | EP-08 | 3 | Low |
| US-031 | Multi-language / i18n support (English + one additional language TBD) | EP-08 | 13 | Low |
| US-032 | Advanced permission model: field-level visibility permissions per role | EP-04 | 13 | Low |
| US-033 | Mandatory 2FA policy: superadmin can force-enable 2FA for admin/user roles | EP-04 | 3 | Medium |
| US-034 | IP allowlist / denylist for admin panel access | EP-04 | 5 | Medium |
| US-035 | Data import: support Google Sheets direct sync (OAuth2) | EP-01 | 13 | Low |
| US-036 | Dashboard: exportable PDF report (charts + KPI summary) | EP-03 | 8 | Medium |
| US-037 | Dashboard: comparison view (current period vs. previous period) | EP-03 | 5 | Medium |
| US-038 | Bulk delete with confirmation modal and audit log entry | EP-06 | 3 | Medium |
| US-039 | Record tagging / labelling system (custom tags per record, cross-module) | EP-07 | 8 | Low |
| US-040 | Performance monitoring integration (e.g., Sentry, Datadog) | EP-10 | 5 | Medium |

---

## Definition of Done

The following criteria must be met for any User Story to be considered **Done**:

### Code Quality
- [ ] Code reviewed and approved by at least one peer (GitHub PR review)
- [ ] No ESLint errors or TypeScript type errors
- [ ] No `console.log` or debug code left in production paths
- [ ] No hardcoded credentials, secrets, or environment-specific values in source code

### Functionality
- [ ] All Acceptance Criteria verified by the developer and confirmed by QA
- [ ] Feature works correctly in both dark and light mode across all 12 accent color themes
- [ ] All 11 module contexts tested if the change is cross-cutting
- [ ] Edge cases documented and tested (empty state, max data, invalid input)

### Data & Timezone
- [ ] All new DB writes store dates in UTC
- [ ] All new UI displays and CSV exports present dates in IST (Asia/Kolkata)
- [ ] No raw UTC timestamps exposed in the user interface

### Security
- [ ] New routes apply appropriate permission checks via `withPermission()` middleware
- [ ] No user input is passed directly to SQL queries (parameterized queries only)
- [ ] Sensitive data (passwords, tokens, secrets) stored hashed or encrypted, never plain text
- [ ] New API routes included in rate limiting scope (if under `/api/v1/`)

### Testing
- [ ] Unit tests written for new utility functions
- [ ] Integration test written for new API routes (at minimum: happy path + 403 unauthorized)
- [ ] All existing tests continue to pass (no regressions in CI)

### Documentation & Deployment
- [ ] API Playground in admin panel updated if new API routes are added
- [ ] `.env.example` updated if new environment variables are introduced
- [ ] Feature branch merged to `main` via PR (no direct commits to `main`)
- [ ] Staging deployment verified post-merge

---

## Sprint Points Summary

| Sprint | Focus | Total Story Points |
|--------|-------|--------------------|
| Sprint 1 | Stability & Critical Fixes | 19 |
| Sprint 2 | Data Integrity & Core Enhancements | 21 |
| Sprint 3 | Notifications & Alerting | 21 |
| Sprint 4 | Security, Access Hardening & API Quality | 34 |
| Sprint 5 | Mobile, UX Polish & Automation | 29 |
| **Grand Total (Sprints 1–5)** | | **124** |

---

*Document maintained by: Project Lead / Scrum Master*
*Last updated: 2026-03-14*
*Next review: End of Sprint 1 (2026-03-27)*
