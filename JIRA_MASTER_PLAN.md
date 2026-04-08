# JIRA Master Plan — Piracy Monitoring System (PMS)

**Project Key:** PMS
**Document Version:** 1.0
**Created:** 2026-03-28
**Based On:** Live codebase analysis (actual code, not documentation)
**Work Types:** EPIC · FEATURE · TASK · SUBTASK · BUG
**Platform:** Next.js 14 · React 18 · MySQL 8 · pnpm

---

## Table of Contents

1. [EPIC EP-01 — Foundation & Design System](#epic-ep-01--foundation--design-system)
2. [EPIC EP-02 — Authentication & User Management](#epic-ep-02--authentication--user-management)
3. [EPIC EP-03 — Module Data Pages (11 Modules)](#epic-ep-03--module-data-pages-11-modules)
4. [EPIC EP-04 — Admin Panel UI](#epic-ep-04--admin-panel-ui)
5. [EPIC EP-05 — Data Integrity & Backend Fixes](#epic-ep-05--data-integrity--backend-fixes)
6. [EPIC EP-06 — Dashboard & Analytics](#epic-ep-06--dashboard--analytics)
7. [EPIC EP-07 — Search & Discovery](#epic-ep-07--search--discovery)
8. [EPIC EP-08 — Notifications & Email System](#epic-ep-08--notifications--email-system)
9. [EPIC EP-09 — Security Hardening](#epic-ep-09--security-hardening)
10. [EPIC EP-10 — API Hardening & Documentation](#epic-ep-10--api-hardening--documentation)
11. [EPIC EP-11 — Audit & Compliance](#epic-ep-11--audit--compliance)
12. [EPIC EP-12 — Mobile & Accessibility](#epic-ep-12--mobile--accessibility)
13. [EPIC EP-13 — Automation & Scheduling](#epic-ep-13--automation--scheduling)
14. [EPIC EP-14 — Testing & Quality](#epic-ep-14--testing--quality)
15. [Summary Table](#summary-table)

---

> **Analysis Note:** This plan is derived from direct code inspection of the live codebase.
> All bugs listed are confirmed from source files, not assumed from documentation.
> Completion status reflects actual implemented code, not planned features.

---

---

## EPIC EP-01 — Foundation & Design System

**EPIC ID:** EP-01
**Summary:** Establish the complete design token system, wireframes, and reusable component library that all 11 module pages and the admin panel will be built on.
**Priority:** Critical
**Sprint:** Sprint 1
**Status:** Partially Done
**Current Code State:** `globals.css` has CSS variables and accent color system. `components/Sidebar.js`, `Topbar.js`, `ClientLayout.js` exist. No dedicated component library. No style guide page. No wireframe artefacts in repo.

---

### FEATURE EP-01-F01 — Design Token Audit & Style Guide

**Summary:** Document and formalise every CSS custom property, spacing scale, and typography role in the existing `globals.css` so all future components use named tokens, not magic values.
**Priority:** Critical | **Story Points:** 8

#### TASK EP-01-F01-T01 — Audit existing CSS tokens in `globals.css`

**Story Points:** 2 | **Assignee:** UI Lead

##### SUBTASK EP-01-F01-T01-S01
Export all CSS custom properties from `globals.css` into a reference table: token name, dark-mode value, light-mode value, usage context.

##### SUBTASK EP-01-F01-T01-S02
Identify all hardcoded `#hex`, raw `px` values not on the 4px grid — log each with file + line reference.

##### SUBTASK EP-01-F01-T01-S03
Verify all 12 accent color variants (blue, purple, green, rose, teal, orange, cyan + 5 more) are tokenised across both dark and light mode in `globals.css`.

---

#### TASK EP-01-F01-T02 — Define typography & spacing scale

**Story Points:** 2 | **Assignee:** UI Lead

##### SUBTASK EP-01-F01-T02-S01
Define typography scale — roles: `page-title`, `section-heading`, `body`, `label`, `caption`, `monospace` — with font-size (rem), weight, and line-height.

##### SUBTASK EP-01-F01-T02-S02
Define spacing scale on 4px base grid — steps: 4, 8, 12, 16, 20, 24, 32, 48 px — assign token names.

##### SUBTASK EP-01-F01-T02-S03
Define border-radius scale: `sm` (6px), `md` (10px), `lg` (14px), `xl` (20px), `pill` (9999px). Define shadow/elevation scale: card, modal, dropdown.

---

#### TASK EP-01-F01-T03 — Produce living `/style-guide` page

**Story Points:** 4 | **Assignee:** Frontend Dev

##### SUBTASK EP-01-F01-T03-S01
Render all color swatches — background, text, border, semantic (success/warning/error/info) — with token names and hex values.

##### SUBTASK EP-01-F01-T03-S02
Render typography specimens for every role in both dark and light mode.

##### SUBTASK EP-01-F01-T03-S03
Render interactive component states: Button (default/hover/active/disabled/loading), Input (empty/filled/focused/error), Badge (all 8 status variants).

---

#### BUG EP-01-F01-B01 — Accent color bleeds between user sessions via shared localStorage key

**Summary:** `localStorage.setItem('theme-accent', color)` uses a shared key — User B inherits User A's accent after logout/login cycle.
**Priority:** High | **Severity:** Major
**Confirmed In:** `components/ThemeProvider.js` (localStorage key not scoped to user ID)
**Steps to Reproduce:**
1. Login as User A → set accent to Purple.
2. Logout → login as User B.
3. User B's accent is Purple instead of their saved preference.

**Acceptance Criteria:**
- [ ] localStorage key format: `theme-accent-{userId}`.
- [ ] Server-authoritative theme value applied before client hydration.
- [ ] No hydration mismatch in console.

---

#### BUG EP-01-F01-B02 — Light mode reverts to dark after hard refresh

**Summary:** Theme mode saved in localStorage only — not persisted to `users` table; server renders dark mode on every fresh load.
**Priority:** Medium | **Severity:** Minor
**Confirmed In:** `app/api/preferences/route.js` exists but frontend ThemeProvider reads localStorage first.

**Acceptance Criteria:**
- [ ] Theme mode persisted to `users.theme_mode` via `/api/preferences` on every toggle.
- [ ] Server-rendered HTML applies correct mode class before JS runs.

---

### FEATURE EP-01-F02 — Wireframes for All Pages

**Summary:** Produce annotated low-fidelity wireframes for every page before any new implementation begins.
**Priority:** High | **Story Points:** 13

#### TASK EP-01-F02-T01 — Wireframe: Auth pages

**Story Points:** 2 | **Assignee:** UI Designer

##### SUBTASK EP-01-F02-T01-S01
Login page wireframe — logo, email + password fields, submit CTA, error state banner, "Forgot password?" link.

##### SUBTASK EP-01-F02-T01-S02
Register page wireframe — name, email, password, confirm-password, role (hidden for non-superadmin), submit CTA, pending-approval message.

##### SUBTASK EP-01-F02-T01-S03
Forgot Password request page + Reset Password token page wireframes.

---

#### TASK EP-01-F02-T02 — Wireframe: Dashboard page

**Story Points:** 3 | **Assignee:** UI Designer

##### SUBTASK EP-01-F02-T02-S01
KPI row wireframe — Total Identified, Total Actioned, Action Rate %, module selector.

##### SUBTASK EP-01-F02-T02-S02
Chart area wireframe — trend line chart, date range picker, module multi-select dropdown.

##### SUBTASK EP-01-F02-T02-S03
Country + platform breakdown tables wireframe — sorted rows, action rate badge, expandable view.

---

#### TASK EP-01-F02-T03 — Wireframe: Module data table pages (all 11 modules)

**Story Points:** 3 | **Assignee:** UI Designer

##### SUBTASK EP-01-F02-T03-S01
Toolbar wireframe — search input, date range filter, status dropdown, page-size selector, Bulk Update, Download Template, Upload buttons.

##### SUBTASK EP-01-F02-T03-S02
Data table wireframe — checkbox column, data columns, action column (Edit/Delete), sticky header, pagination bar, filter row below headers.

##### SUBTASK EP-01-F02-T03-S03
Modals wireframe — Edit Record (2-col form, flatpickr dates), Delete confirmation, Bulk Status Update, Bulk Update via Excel (2-step: download template → upload).

---

#### TASK EP-01-F02-T04 — Wireframe: Admin Panel pages

**Story Points:** 3 | **Assignee:** UI Designer

##### SUBTASK EP-01-F02-T04-S01
User Management wireframe — pending users list (approve/reject), active users list, Create User drawer, Edit User drawer, deactivate toggle.

##### SUBTASK EP-01-F02-T04-S02
Module Permissions matrix wireframe — users × modules grid with can_view/can_upload/can_edit/can_delete/can_bulk_update/can_export toggles.

##### SUBTASK EP-01-F02-T04-S03
API Token Management wireframe — token list (name, expiry, last-used, usage count), Generate Token modal, copy icon, revoke CTA.

##### SUBTASK EP-01-F02-T04-S04
Email Config + Activity Log + Custom Columns + DB Optimize wireframes.

---

#### TASK EP-01-F02-T05 — Wireframe: API Docs & Playground

**Story Points:** 2 | **Assignee:** UI Designer

##### SUBTASK EP-01-F02-T05-S01
`/api-docs` wireframe — endpoint card layout, parameter table, response schema, auth instructions panel.

##### SUBTASK EP-01-F02-T05-S02
API Playground wireframe — request builder (method + URL + params), response panel (Table/JSON toggle), Field Reference side panel.

---

### FEATURE EP-01-F03 — Reusable Component Library

**Summary:** Build all reusable React components in isolation that every page will consume.
**Priority:** High | **Story Points:** 21

#### TASK EP-01-F03-T01 — Core interactive components

**Story Points:** 6 | **Assignee:** Frontend Dev

##### SUBTASK EP-01-F03-T01-S01
`Button` — variants: primary, secondary, danger, ghost; sizes: sm/md/lg; states: default/hover/active/disabled/loading spinner.

##### SUBTASK EP-01-F03-T01-S02
`Input` + `Select` + `Textarea` — controlled + uncontrolled, error state, helper text, label, required indicator.

##### SUBTASK EP-01-F03-T01-S03
`DatePicker` — flatpickr 4.6 wrapper, IST-aware config, dark/light theme sync, range mode.

##### SUBTASK EP-01-F03-T01-S04
`Modal` — focus-trap (Tab cycles within modal), ESC close, backdrop click close, size variants (sm/md/lg/fullscreen), confirm variant.

##### SUBTASK EP-01-F03-T01-S05
`Badge` — 8 status variants: Pending (blue), Removed (green), Enforced (teal), Not Removed (red), Under Review (yellow), Down (orange), Suspended (grey), Approved (emerald).

##### SUBTASK EP-01-F03-T01-S06
`Toast` — stack management, auto-dismiss (3 s), manual dismiss, icon per type (success/error/info/warning).

---

#### TASK EP-01-F03-T02 — DataTable component

**Story Points:** 6 | **Assignee:** Frontend Dev

##### SUBTASK EP-01-F03-T02-S01
Column definition API — `{ key, label, sortable, filterable, width, type, render }` per column built from `sheetConfig`.

##### SUBTASK EP-01-F03-T02-S02
Checkbox selection — individual row, select-all-on-page, cross-page counter, indeterminate header state.

##### SUBTASK EP-01-F03-T02-S03
Client-side sort + server-side sort toggle; sort indicator arrow in column header.

##### SUBTASK EP-01-F03-T02-S04
Per-column text filter row below headers with debounce (300ms) and clear (×) icon.

##### SUBTASK EP-01-F03-T02-S05
Pagination bar — numbered pages with ellipsis, page-size selector (15/25/50/100), total count label.

##### SUBTASK EP-01-F03-T02-S06
Empty state (3 variants: no data, no permission, filtered-empty), skeleton loading rows.

---

#### TASK EP-01-F03-T03 — Layout & navigation components

**Story Points:** 5 | **Assignee:** Frontend Dev

##### SUBTASK EP-01-F03-T03-S01
Enhance existing `Sidebar.js` — permission-filtered nav items (hide modules user cannot view), active-link highlight with left border + tint, module group expand/collapse, collapsed (icon-only) mode.

##### SUBTASK EP-01-F03-T03-S02
Enhance existing `Topbar.js` — breadcrumb from route segments, notification bell placeholder with badge, theme switcher popover (dark/light/auto + 12 accent swatches + custom hex input).

##### SUBTASK EP-01-F03-T03-S03
`PageHeader` — page title, optional subtitle, action button slot. `SectionCard` — card wrapper with heading, optional toolbar.

##### SUBTASK EP-01-F03-T03-S04
`ConfirmDialog` — generic confirmation modal used by delete, deactivate, revoke actions across all pages.

##### SUBTASK EP-01-F03-T03-S05
`Drawer` — side drawer component used by create/edit forms in admin panel.

---

#### TASK EP-01-F03-T04 — Form components for Edit modals

**Story Points:** 4 | **Assignee:** Frontend Dev

##### SUBTASK EP-01-F03-T04-S01
`DynamicForm` — reads column definitions from `sheetConfig`, renders correct input type per column (text/url/date/datetime/select/textarea).

##### SUBTASK EP-01-F03-T04-S02
`UploadModal` — drag-and-drop zone, file type validation (.xlsx), progress bar, result summary card (inserted/updated/skipped/errors).

##### SUBTASK EP-01-F03-T04-S03
`BulkStatusModal` — selected count display, status dropdown, Apply/Cancel, confirmation step with affected record count.

---

#### BUG EP-01-F03-B01 — Modal does not trap focus — screen-reader users can Tab outside

**Summary:** Keyboard Tab in any modal dialog passes focus out of the modal to background page content.
**Priority:** High | **Severity:** Major
**Confirmed In:** No focus trap found in any existing modal implementation.

**Acceptance Criteria:**
- [ ] Focus cycles within modal while open.
- [ ] Focus returns to triggering element on close.
- [ ] Tested with keyboard navigation on all modals.

---

---

## EPIC EP-02 — Authentication & User Management

**EPIC ID:** EP-02
**Summary:** Complete the authentication flows (login, register, forgot/reset password), harden session security, and build the user management lifecycle (pending → active → deactivated).
**Priority:** Critical
**Sprint:** Sprint 2
**Status:** Partially Done
**Current Code State:** `app/api/auth/login/route.js` works (SHA256, cookie, 30-min session). `app/api/auth/register/route.js` creates users in `pending` state but sends NO email and has NO notification to admin. `app/api/auth/logout/route.js` clears cookie. NO forgot-password or reset-password endpoints exist. NO brute-force protection. Session cookie missing `Secure` flag.

---

### FEATURE EP-02-F01 — Forgot Password & Reset Flow

**Summary:** Implement the complete forgot-password and reset-password flow using email token.
**Priority:** Critical | **Story Points:** 8

#### TASK EP-02-F01-T01 — Backend: Token generation & validation

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-02-F01-T01-S01
Create `password_resets` table: `id, user_id, token_hash VARCHAR(64), expires_at DATETIME, used_at DATETIME`.

##### SUBTASK EP-02-F01-T01-S02
`POST /api/auth/forgot-password` — generate secure random token, store SHA-256 hash, send reset email (60-min TTL), always return `200 { message: "If this email is registered, a reset link has been sent." }` regardless of whether email exists.

##### SUBTASK EP-02-F01-T01-S03
`POST /api/auth/reset-password` — validate token hash + expiry, update `users.password_hash`, mark token `used_at`, invalidate all active sessions for that user.

---

#### TASK EP-02-F01-T02 — Frontend: Forgot password UI

**Story Points:** 3 | **Assignee:** Frontend Dev

##### SUBTASK EP-02-F01-T02-S01
Add "Forgot password?" link to existing `LoginClient.js` login form.

##### SUBTASK EP-02-F01-T02-S02
`/forgot-password` page — email input form, submit → success message, back to login link.

##### SUBTASK EP-02-F01-T02-S03
`/reset-password?token=` page — new password + confirm password form, token read from URL param, success → redirect to login.

---

#### TASK EP-02-F01-T03 — Email template: Password reset

**Story Points:** 2 | **Assignee:** Frontend Dev

##### SUBTASK EP-02-F01-T03-S01
Add `sendPasswordResetEmail(email, resetLink, expiryIST)` to `lib/email.js` — HTML template: IPHouse branding, reset CTA button, expiry timestamp in IST, security notice.

##### SUBTASK EP-02-F01-T03-S02
Test email delivery via existing SMTP config from `email_config` table using `purpose='notification'`.

---

#### BUG EP-02-F01-B01 — Forgot-password endpoint not implemented — currently returns 404

**Summary:** No `/api/auth/forgot-password` or `/api/auth/reset-password` endpoints exist. Any password recovery attempt fails silently.
**Priority:** Critical | **Severity:** Critical
**Confirmed In:** `find d:/VM/piracy/app/api/auth -type f` — only login, logout, register, check routes exist.

**Acceptance Criteria:**
- [ ] Both endpoints created and functional.
- [ ] Reset email received within 60 seconds.
- [ ] Token is single-use and expires in 60 minutes.

---

### FEATURE EP-02-F02 — User Approval Workflow

**Summary:** Complete the pending → active user lifecycle: admin sees pending users, approves/rejects with email notification, user gets notified.
**Priority:** Critical | **Story Points:** 8

#### TASK EP-02-F02-T01 — Backend: Approval / rejection actions

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-02-F02-T01-S01
`POST /api/admin/users/approve` endpoint exists but check if it sends email — confirm `sendApprovalEmail()` from `lib/email.js` is called on approval.

##### SUBTASK EP-02-F02-T01-S02
`POST /api/admin/users/reject` — set `users.status = 'rejected'`, call `sendRejectionEmail(email, reason)` from `lib/email.js`, log activity.

##### SUBTASK EP-02-F02-T01-S03
`GET /api/admin/users?status=pending` filter — return only pending users for admin review queue.

---

#### TASK EP-02-F02-T02 — Backend: Notify admin on new registration

**Story Points:** 2 | **Assignee:** Backend Dev

##### SUBTASK EP-02-F02-T02-S01
On `POST /api/auth/register` success: query all active superadmin + admin users, send notification email `"New registration pending approval: {name} ({email})"`.

##### SUBTASK EP-02-F02-T02-S02
Add `sendAdminRegistrationAlert(adminEmails[], newUserName, newUserEmail)` to `lib/email.js`.

---

#### TASK EP-02-F02-T03 — Frontend: Pending users queue in admin

**Story Points:** 3 | **Assignee:** Frontend Dev

##### SUBTASK EP-02-F02-T03-S01
Pending Users tab in Admin Panel — table with name, email, role, registered-at columns.

##### SUBTASK EP-02-F02-T03-S02
Approve button → confirmation modal → calls approve endpoint → row removed from pending queue.

##### SUBTASK EP-02-F02-T03-S03
Reject button → rejection reason textarea modal → calls reject endpoint → row removed.

---

#### BUG EP-02-F02-B01 — User approval never sends email notification

**Summary:** `app/api/admin/users/approve/route.js` exists but does not call `sendApprovalEmail()`. Newly approved users receive no email. Rejected users also receive no notification.
**Priority:** Critical | **Severity:** Critical
**Confirmed In:** `lib/email.js` defines `sendApprovalEmail()` and `sendRejectionEmail()` but no caller exists in the approval route.

**Acceptance Criteria:**
- [ ] Approved user receives HTML approval email with login credentials.
- [ ] Rejected user receives HTML rejection email with optional reason.
- [ ] Email confirmed delivered in test environment.

---

#### BUG EP-02-F02-B02 — Admin has no visibility of pending registrations

**Summary:** No admin UI exists to list or action pending users. Admin must directly query the database to find and approve new registrations.
**Priority:** Critical | **Severity:** Critical
**Confirmed In:** `app/admin/page.js` — admin panel UI stub; no pending user workflow visible in any frontend file.

**Acceptance Criteria:**
- [ ] Admin Panel shows pending users count badge in navigation.
- [ ] Pending Users tab renders list with approve/reject actions.

---

### FEATURE EP-02-F03 — Session Hardening

**Summary:** Add missing security attributes to session cookie and implement proper logout + session invalidation.
**Priority:** Critical | **Story Points:** 5

#### TASK EP-02-F03-T01 — Session cookie security attributes

**Story Points:** 2 | **Assignee:** Backend Dev

##### SUBTASK EP-02-F03-T01-S01
Add `secure: process.env.NODE_ENV === 'production'` to session cookie in `app/api/auth/login/route.js` line 41.

##### SUBTASK EP-02-F03-T01-S02
Change `sameSite: 'lax'` to `sameSite: 'strict'` on session cookie.

##### SUBTASK EP-02-F03-T01-S03
Verify `httpOnly: true` is set — confirmed in code, document as passing.

---

#### TASK EP-02-F03-T02 — Logout & session invalidation

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-02-F03-T02-S01
Verify `app/api/auth/logout/route.js` clears cookie with `maxAge: 0` and logs activity.

##### SUBTASK EP-02-F03-T02-S02
On password change (reset or admin-forced), expire all existing sessions for that user ID.

##### SUBTASK EP-02-F03-T02-S03
Add `GET /api/auth/check` response to include session expiry remaining time (seconds) — used by frontend auto-logout warning.

---

#### BUG EP-02-F03-B01 — Session cookie missing `Secure` flag in production

**Summary:** Cookie options in `app/api/auth/login/route.js` line 41: `{ httpOnly: true, sameSite: 'lax', maxAge: 1800, path: '/' }` — no `secure: true`.
**Priority:** Critical | **Severity:** Critical
**Confirmed In:** `app/api/auth/login/route.js` line 41.

**Acceptance Criteria:**
- [ ] `secure: true` set when `NODE_ENV === 'production'`.
- [ ] `sameSite: 'strict'` applied in all environments.

---

### FEATURE EP-02-F04 — Brute-Force & Rate Limiting on Auth

**Summary:** Protect login and password-reset endpoints from automated attacks.
**Priority:** Critical | **Story Points:** 5

#### TASK EP-02-F04-T01 — Login rate limiter

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-02-F04-T01-S01
Implement in-memory sliding-window rate limiter — 5 failed login attempts per IP per 10 minutes → `429 Too Many Requests` with `Retry-After` header.

##### SUBTASK EP-02-F04-T01-S02
Log failed attempts to `user_activity` with action `'login_failed'` and IP address.

##### SUBTASK EP-02-F04-T01-S03
Show lockout message on login page: `"Too many failed attempts. Please wait X minutes."`.

---

#### TASK EP-02-F04-T02 — Forgot-password rate limiter

**Story Points:** 2 | **Assignee:** Backend Dev

##### SUBTASK EP-02-F04-T02-S01
Rate limit `POST /api/auth/forgot-password` — 3 requests per email per hour.

##### SUBTASK EP-02-F04-T02-S02
Rate limit same endpoint per IP — 10 requests per hour regardless of email.

---

#### BUG EP-02-F04-B01 — No brute-force protection on login endpoint

**Summary:** `app/api/auth/login/route.js` has no rate limiting. Attacker can attempt unlimited passwords against any account.
**Priority:** Critical | **Severity:** Critical
**Confirmed In:** Login route has no middleware, no counter, no lockout logic.

**Acceptance Criteria:**
- [ ] 429 returned after 5 failed attempts from same IP within 10 minutes.
- [ ] Login form shows retry countdown timer.

---

---

## EPIC EP-03 — Module Data Pages (11 Modules)

**EPIC ID:** EP-03
**Summary:** Build the complete data table UI for all 11 piracy modules — the core operational interface of the entire system.
**Priority:** Critical
**Sprint:** Sprint 3
**Status:** NOT STARTED
**Current Code State:** All backend APIs exist (`/api/data`, `/api/upload`, `/api/edit`, `/api/download`, `/api/bulk-update`, `/api/template`). NO frontend data-table pages exist for any module. `app/upload/page.js` is a stub. There is no `/modules/[table]` route.

---

### FEATURE EP-03-F01 — Module Data Table Pages

**Summary:** Create the `app/modules/[table]/page.js` dynamic route that renders all 11 module views using the DataTable component and sheetConfig column definitions.
**Priority:** Critical | **Story Points:** 21

#### TASK EP-03-F01-T01 — Dynamic module page route

**Story Points:** 5 | **Assignee:** Frontend Dev

##### SUBTASK EP-03-F01-T01-S01
Create `app/modules/[table]/page.js` — validate `table` param against `SHEET_CONFIG` keys; redirect to `/` if invalid; check `can_view` permission before rendering.

##### SUBTASK EP-03-F01-T01-S02
Build column definitions from `sheetConfig[table].columns` — map each column to DataTable column spec `{ key, label, type, sortable, filterable, render }`.

##### SUBTASK EP-03-F01-T01-S03
Wire `GET /api/data?table=&page=&limit=&sortCol=&sortDir=&search=&status=&from=&to=` to DataTable data source; handle loading, empty, and error states.

##### SUBTASK EP-03-F01-T01-S04
Module tabs at top — tabs for all accessible modules; active tab highlights; switching tab navigates to `/modules/[table]`.

##### SUBTASK EP-03-F01-T01-S05
Persist all filter state (search, status, date range, page, page-size, sort) in URL query params so links are shareable and back-navigation restores state.

---

#### TASK EP-03-F01-T02 — Toolbar actions

**Story Points:** 4 | **Assignee:** Frontend Dev

##### SUBTASK EP-03-F01-T02-S01
Record count display: `Showing X–Y of Z records` updated on every filter change.

##### SUBTASK EP-03-F01-T02-S02
Status filter dropdown — all 8 status values + "All" option.

##### SUBTASK EP-03-F01-T02-S03
Date range picker — from/to using flatpickr; clear button resets both dates.

##### SUBTASK EP-03-F01-T02-S04
Page-size selector: 15 / 25 / 50 / 100 — changes limit param and resets to page 1.

##### SUBTASK EP-03-F01-T02-S05
Active filter count badge on filter icon when any filter is applied. "Clear all filters" button resets everything.

---

#### TASK EP-03-F01-T03 — Upload Excel modal

**Story Points:** 4 | **Assignee:** Frontend Dev

##### SUBTASK EP-03-F01-T03-S01
Upload button (respects `can_upload` permission) — opens UploadModal component.

##### SUBTASK EP-03-F01-T03-S02
UploadModal: drag-and-drop file zone + browse button, `.xlsx` type validation, file name + size display.

##### SUBTASK EP-03-F01-T03-S03
Submit → `POST /api/upload?table=` → progress indicator → result summary: `{inserted} added, {updated} updated, {skipped} skipped`, error list for failed rows.

##### SUBTASK EP-03-F01-T03-S04
"Download Template" button — calls `GET /api/template?table=&type=upload` → triggers file download.

---

#### TASK EP-03-F01-T04 — Edit record modal

**Story Points:** 4 | **Assignee:** Frontend Dev

##### SUBTASK EP-03-F01-T04-S01
Edit icon in each row (respects `can_edit` permission) — fetches `GET /api/edit?table=&id=` → opens DynamicForm modal pre-filled with UTC→IST converted values.

##### SUBTASK EP-03-F01-T04-S02
DynamicForm renders correct input per column type: `text`, `url`, `date` (flatpickr), `datetime` (flatpickr with time), `select` (status field with 8 options), `textarea`.

##### SUBTASK EP-03-F01-T04-S03
Submit `PUT /api/edit` → IST values sent to API (conversion done in API) → success toast + table row refresh.

##### SUBTASK EP-03-F01-T04-S04
Field-level validation display — URL format, required fields, date range — show error message below each invalid field.

---

#### TASK EP-03-F01-T05 — Delete record modal

**Story Points:** 2 | **Assignee:** Frontend Dev

##### SUBTASK EP-03-F01-T05-S01
Delete icon in each row (respects `can_delete` permission) — opens ConfirmDialog: `"Delete record {URL}? This action cannot be undone."`.

##### SUBTASK EP-03-F01-T05-S02
Confirm → `DELETE /api/data?table=&id=` → success toast + row removed from table.

---

#### TASK EP-03-F01-T06 — Bulk operations panel

**Story Points:** 2 | **Assignee:** Frontend Dev

##### SUBTASK EP-03-F01-T06-S01
Bulk Status Update: check N rows → bulk action bar appears → status dropdown → Apply → `POST /api/bulk-update` JSON mode → success/error toast.

##### SUBTASK EP-03-F01-T06-S02
Bulk Update via Excel (respects `can_bulk_update` permission): opens 2-step modal — Step 1: download bulk-update template (`GET /api/template?type=update`), Step 2: upload filled template → `POST /api/bulk-update` Excel mode.

---

#### BUG EP-03-F01-B01 — No module data pages exist — system is not usable without them

**Summary:** There is no `app/modules/` directory and no dynamic route for module data tables. The entire operational workflow (view/edit/upload/export records) is inaccessible to end users.
**Priority:** Critical | **Severity:** Critical
**Confirmed In:** `find d:/VM/piracy/app -type d` — no `modules` directory found.

**Acceptance Criteria:**
- [ ] `/modules/social_media` through `/modules/iptv_apps_meta_ads` all render data tables.
- [ ] All CRUD operations functional.
- [ ] Permissions correctly block or allow each action.

---

#### BUG EP-03-F01-B02 — Filter state lost on browser back navigation

**Summary:** React state-only filter storage means all table filters reset when navigating back from edit modal.
**Priority:** Medium | **Severity:** Minor

**Acceptance Criteria:**
- [ ] Search, status, date range, page, page-size stored in URL query params.
- [ ] Browser back restores exact filter state.

---

### FEATURE EP-03-F02 — CSV Export UI

**Summary:** Surface the existing `/api/download` endpoint through a user-friendly export dialog.
**Priority:** High | **Story Points:** 5

#### TASK EP-03-F02-T01 — Export dialog

**Story Points:** 3 | **Assignee:** Frontend Dev

##### SUBTASK EP-03-F02-T01-S01
"Export CSV" button in toolbar (respects `can_export` permission) — opens Export Dialog.

##### SUBTASK EP-03-F02-T01-S02
Export Dialog: date range selector (pre-filled with current table filter dates), optional title filter, optional owner filter, Export button.

##### SUBTASK EP-03-F02-T01-S03
Submit → `GET /api/download?table=&from=&to=&title=&owner=` → triggers browser file download, dismiss dialog.

---

#### TASK EP-03-F02-T02 — Download options persistence

**Story Points:** 2 | **Assignee:** Frontend Dev

##### SUBTASK EP-03-F02-T02-S01
Wire `GET /api/download/options` to populate export dialog filter suggestions (unique title/owner values for autocomplete).

##### SUBTASK EP-03-F02-T02-S02
Show record count estimate in dialog: `"~{N} records will be exported"` using current filter state.

---

---

## EPIC EP-04 — Admin Panel UI

**EPIC ID:** EP-04
**Summary:** Build the complete Admin Panel UI — the entire admin panel backend exists but has zero frontend. Admins currently have no way to manage users, permissions, tokens, or configuration through the application.
**Priority:** Critical
**Sprint:** Sprint 3 & Sprint 4
**Status:** NOT STARTED (backends complete, UI missing entirely)
**Current Code State:** All admin API routes exist and function. `app/admin/page.js` is a stub with no real content.

---

### FEATURE EP-04-F01 — User Management UI

**Summary:** Build the complete user management interface — list, create, edit, deactivate, and handle pending users.
**Priority:** Critical | **Story Points:** 13

#### TASK EP-04-F01-T01 — User list page

**Story Points:** 4 | **Assignee:** Frontend Dev

##### SUBTASK EP-04-F01-T01-S01
Admin Panel → Users tab — fetch `GET /api/admin/users` → render table: name, email, role badge, status badge, last-login (IST), created-at (IST).

##### SUBTASK EP-04-F01-T01-S02
Status tabs: All / Active / Pending / Rejected / Deactivated — filter user list on tab switch.

##### SUBTASK EP-04-F01-T01-S03
Search users by name or email — debounced client-side filter.

---

#### TASK EP-04-F01-T02 — Create & Edit user drawer

**Story Points:** 5 | **Assignee:** Frontend Dev

##### SUBTASK EP-04-F01-T02-S01
"Create User" button → opens side Drawer: name, email, password, role select (superadmin/admin/user), is_active toggle.

##### SUBTASK EP-04-F01-T02-S02
Submit `POST /api/admin/users` → validate required fields client-side → success toast + user added to list.

##### SUBTASK EP-04-F01-T02-S03
Edit icon on user row → opens same Drawer pre-filled → submit `PUT /api/admin/users` → row updated.

##### SUBTASK EP-04-F01-T02-S04
"Reset Password" action in edit drawer → admin sets a new temporary password → `PUT /api/admin/users` with `password` field → success toast.

---

#### TASK EP-04-F01-T03 — Approve/reject pending users

**Story Points:** 4 | **Assignee:** Frontend Dev

##### SUBTASK EP-04-F01-T03-S01
Pending tab shows count badge on Users nav item when pending > 0.

##### SUBTASK EP-04-F01-T03-S02
Approve button per pending user → ConfirmDialog → `POST /api/admin/users/approve` → email sent → user moved to Active tab.

##### SUBTASK EP-04-F01-T03-S03
Reject button → Rejection Reason textarea modal → `POST /api/admin/users` with `status: 'rejected', rejection_reason` → email sent → user moved to Rejected tab.

---

### FEATURE EP-04-F02 — Module Permissions Matrix UI

**Summary:** Build the permission matrix editor where admins assign per-user, per-module access controls.
**Priority:** Critical | **Story Points:** 8

#### TASK EP-04-F02-T01 — Permission matrix table

**Story Points:** 5 | **Assignee:** Frontend Dev

##### SUBTASK EP-04-F02-T01-S01
Admin Panel → Permissions tab — user selector dropdown (left) × module rows (table) × permission columns (can_view/can_upload/can_edit/can_delete/can_bulk_update/can_export).

##### SUBTASK EP-04-F02-T01-S02
Fetch `GET /api/admin/permissions?userId=` → render matrix with toggle switches per cell.

##### SUBTASK EP-04-F02-T01-S03
Toggle switch: optimistic UI update → debounced `POST /api/admin/permissions` → on failure, rollback toggle + show error toast.

---

#### TASK EP-04-F02-T02 — Admin panel tab permissions

**Story Points:** 3 | **Assignee:** Frontend Dev

##### SUBTASK EP-04-F02-T02-S01
Admin Panel → Panel Permissions tab — same matrix style but rows = admin panel tabs × columns = per-user access toggles.

##### SUBTASK EP-04-F02-T02-S02
Wire to `GET/POST /api/admin/panel-permissions`.

---

### FEATURE EP-04-F03 — API Token Management UI

**Summary:** Build the token creation, listing, and revocation interface.
**Priority:** High | **Story Points:** 8

#### TASK EP-04-F03-T01 — Token list & generation

**Story Points:** 5 | **Assignee:** Frontend Dev

##### SUBTASK EP-04-F03-T01-S01
Admin Panel → API Tokens tab — fetch `GET /api/admin/tokens` → table: token name, created-by, expires-at, last-used-at (IST), total-uses badge, status (active/expired/revoked).

##### SUBTASK EP-04-F03-T01-S02
"Generate Token" button → modal: token name input, expiry date picker (optional), Generate → displays full token once (copy-to-clipboard icon) with warning `"Store this token — it will not be shown again."`.

##### SUBTASK EP-04-F03-T01-S03
Wire `POST /api/admin/tokens` for token creation (this endpoint may need to be created — verify current `admin/tokens/route.js` supports POST).

---

#### TASK EP-04-F03-T02 — Token revocation & usage

**Story Points:** 3 | **Assignee:** Frontend Dev

##### SUBTASK EP-04-F03-T02-S01
Revoke button per token → ConfirmDialog → `DELETE /api/admin/tokens` → token row shows "Revoked" badge.

##### SUBTASK EP-04-F03-T02-S02
Usage count badge per token; click to expand last 10 usage log entries (endpoint, timestamp, IP, response code).

---

#### BUG EP-04-F03-B01 — No API token creation endpoint exists

**Summary:** `GET /api/admin/tokens` lists tokens and `DELETE` revokes — but no `POST` to create a new token exists in the route handler.
**Priority:** High | **Severity:** Major
**Confirmed In:** `app/api/admin/tokens/route.js` — verify if POST handler is present. If missing, add it.

**Acceptance Criteria:**
- [ ] `POST /api/admin/tokens` accepts `{ name, expires_at }`, generates secure random token, stores SHA-256 hash, returns plain token once.
- [ ] Token can immediately be used for API calls.

---

### FEATURE EP-04-F04 — Email Config & Other Admin Sections UI

**Summary:** Build UI for email SMTP config, custom columns, DB optimize, and activity log.
**Priority:** Medium | **Story Points:** 10

#### TASK EP-04-F04-T01 — Email configuration UI

**Story Points:** 3 | **Assignee:** Frontend Dev

##### SUBTASK EP-04-F04-T01-S01
Admin Panel → Email Config tab — list email configs `GET /api/admin/email-config` → table: purpose, host, port, from address, status.

##### SUBTASK EP-04-F04-T01-S02
Create/Edit config form — host, port, user, password (masked), from, purpose select, secure toggle, Test Connection button.

##### SUBTASK EP-04-F04-T01-S03
Test Connection → `POST /api/admin/email-config` with `action: 'test'` → success/failure badge on the config row.

---

#### TASK EP-04-F04-T02 — Custom columns UI

**Story Points:** 3 | **Assignee:** Frontend Dev

##### SUBTASK EP-04-F04-T02-S01
Admin Panel → Custom Columns tab — module selector → fetch `GET /api/admin/custom-columns?sheet=` → list existing custom columns.

##### SUBTASK EP-04-F04-T02-S02
Add Column form: column key (auto-lowercase), display label, type select (VARCHAR/TEXT/INT/DECIMAL/DATE/DATETIME), required toggle → `POST /api/admin/custom-columns`.

##### SUBTASK EP-04-F04-T02-S03
Delete icon per custom column → `DELETE /api/admin/custom-columns` with confirmation.

---

#### TASK EP-04-F04-T03 — DB Optimize & Activity Log UI

**Story Points:** 4 | **Assignee:** Frontend Dev

##### SUBTASK EP-04-F04-T03-S01
Admin Panel → DB Optimize tab — fetch `GET /api/admin/db-optimize` → table of existing vs. missing indexes with module and column info.

##### SUBTASK EP-04-F04-T03-S02
"Create Missing Indexes" button → `POST /api/admin/db-optimize` → progress indicator → results (created/skipped per index).

##### SUBTASK EP-04-F04-T03-S03
Admin Panel → Activity Log tab — fetch `GET /api/activity?page=&limit=` → paginated table: timestamp (IST), user, action, module, details.

##### SUBTASK EP-04-F04-T03-S04
Activity Log filters: user select, action type select, date range picker — all applied client-side or via API params.

---

---

## EPIC EP-05 — Data Integrity & Backend Fixes

**EPIC ID:** EP-05
**Summary:** Fix all confirmed data integrity bugs: IST→UTC conversion gaps in bulk-update, null overwrites on upload, CSV export timezone errors, and missing transaction support.
**Priority:** Critical
**Sprint:** Sprint 2
**Status:** Partially Done (upload + single edit correct; bulk-update and CSV export have confirmed bugs)
**Current Code State:** `lib/timezone.js` is complete and correct. `app/api/upload/route.js` calls `istToUtc()` correctly. `app/api/bulk-update/route.js` uses a `parseDate()` helper that does NOT call `istToUtc()`. `app/api/download/route.js` uses `utcToIst()` but at least one module path skips it.

---

### FEATURE EP-05-F01 — UTC↔IST Conversion Hardening

**Summary:** Ensure every data path that writes or reads datetime fields uses the shared timezone utilities in `lib/timezone.js`.
**Priority:** Critical | **Story Points:** 8

#### TASK EP-05-F01-T01 — Fix bulk-update IST→UTC conversion

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-05-F01-T01-S01
In `app/api/bulk-update/route.js`, replace inline `parseDate(val)` with `istToUtc(val)` from `lib/timezone.js` for all `type === 'datetime'` and `type === 'date'` columns.

##### SUBTASK EP-05-F01-T01-S02
Add the same fix to JSON-mode bulk status update path where `removal_timestamp` is processed.

##### SUBTASK EP-05-F01-T01-S03
Write integration test: upload via bulk-update Excel with known IST datetime → verify UTC stored in DB equals IST − 5:30.

---

#### TASK EP-05-F01-T02 — Fix CSV export UTC→IST conversion for all modules

**Story Points:** 2 | **Assignee:** Backend Dev

##### SUBTASK EP-05-F01-T02-S01
Audit `app/api/download/route.js` — trace which column types call `utcToIst()` and which are passed raw; fix all datetime + date columns to convert.

##### SUBTASK EP-05-F01-T02-S02
Add `(IST)` suffix to all datetime/date column headers in exported CSV.

---

#### TASK EP-05-F01-T03 — Audit all 11 upload handlers for consistency

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-05-F01-T03-S01
For each of the 11 modules' sheetConfig column definitions, verify `date` and `datetime` columns all flow through `istToUtc()` in the upload route. Document any that are skipped.

##### SUBTASK EP-05-F01-T03-S02
Create shared `parseDateField(value, type)` utility that dispatches to `istToUtc()` or `utcToIstDate()` based on type — replace all ad-hoc date parsing inline code.

---

#### BUG EP-05-F01-B01 — Bulk Update skips IST→UTC conversion for `datetime` columns

**Summary:** `app/api/bulk-update/route.js` line 84–85: `if (colDef?.type === 'datetime') { val = parseDate(val) }` — `parseDate()` extracts a date string but does not apply the 5:30-hour offset, storing IST time as UTC in DB.
**Priority:** Critical | **Severity:** Critical
**Confirmed In:** `app/api/bulk-update/route.js` — parseDate function vs. `lib/timezone.js` istToUtc comparison.

**Example:** User submits `2026-03-01 14:30 IST` → stored as `2026-03-01 14:30 UTC` (should be `2026-03-01 09:00 UTC`).

**Acceptance Criteria:**
- [ ] `istToUtc()` from `lib/timezone.js` applied to all datetime fields in bulk-update handler.
- [ ] Integration test verifies correct UTC value in DB.

---

#### BUG EP-05-F01-B02 — CSV export shows UTC datetimes instead of IST for at least one module

**Summary:** Exported CSV for `ads_tutorials_social_media` shows raw UTC datetime in `removal_timestamp` column.
**Priority:** High | **Severity:** Major
**Confirmed In:** Download route analysis shows potential path where utcToIst() is bypassed.

**Acceptance Criteria:**
- [ ] All datetime columns in all 11 module CSV exports show IST values.
- [ ] Column headers include `(IST)` suffix.

---

### FEATURE EP-05-F02 — Upload & Upsert Improvements

**Summary:** Fix null-overwrite on upsert, add dry-run mode, and return cleaner upload summaries.
**Priority:** High | **Story Points:** 5

#### TASK EP-05-F02-T01 — Null-guard on upsert

**Story Points:** 2 | **Assignee:** Backend Dev

##### SUBTASK EP-05-F02-T01-S01
In `app/api/upload/route.js`, update `ON DUPLICATE KEY UPDATE` clause so blank/null incoming values do not overwrite existing DB values — use `COALESCE(VALUES(col), col)` pattern.

##### SUBTASK EP-05-F02-T01-S02
Add `updated_at = NOW()` to every `ON DUPLICATE KEY UPDATE` clause to track last-modification time accurately.

---

#### TASK EP-05-F02-T02 — Dry-run upload preview

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-05-F02-T02-S01
Add `?dryRun=true` mode to `POST /api/upload` — parse Excel, compute insert/update/skip/error counts, return preview JSON without touching DB.

##### SUBTASK EP-05-F02-T02-S02
Show dry-run preview summary in UploadModal before final submit: `"This file will add {X} records and update {Y} existing records. Proceed?"`.

---

#### BUG EP-05-F02-B01 — Upload overwrites existing `status` with NULL when cell is blank

**Summary:** Excel row with blank `status` cell triggers `ON DUPLICATE KEY UPDATE status = NULL` — existing record's status is destroyed.
**Priority:** High | **Severity:** Major
**Confirmed In:** Upload route `ON DUPLICATE KEY UPDATE` builds SET clause from all columns including blank ones.

**Acceptance Criteria:**
- [ ] Null/empty value for any column in upsert does NOT overwrite the existing value.
- [ ] Test: upload file with blank status cell → verify DB status unchanged.

---

### FEATURE EP-05-F03 — Transaction Support for Multi-Step Operations

**Summary:** Wrap all multi-step database operations in transactions to prevent partial-failure data inconsistency.
**Priority:** High | **Story Points:** 5

#### TASK EP-05-F03-T01 — Transaction wrappers

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-05-F03-T01-S01
Add `withTransaction(pool, async (conn) => {...})` utility to `lib/db.js` — handles `BEGIN`, `COMMIT`, `ROLLBACK`.

##### SUBTASK EP-05-F03-T01-S02
Wrap bulk-update handler in a single transaction — all rows succeed or all roll back.

##### SUBTASK EP-05-F03-T01-S03
Wrap upload handler batch insert in a transaction per upload batch ID.

---

#### TASK EP-05-F03-T02 — File upload size limit

**Story Points:** 2 | **Assignee:** Backend Dev

##### SUBTASK EP-05-F03-T02-S01
Add `Content-Length` check at start of `app/api/upload/route.js` — reject files larger than 10 MB with `413 Payload Too Large`.

##### SUBTASK EP-05-F03-T02-S02
Add file type check — reject non-`.xlsx` MIME types with `400 Bad Request`.

---

---

## EPIC EP-06 — Dashboard & Analytics

**EPIC ID:** EP-06
**Summary:** Fix the permission bug on the dashboard API, enhance the existing dashboard UI with better drill-down, and build per-module analytics.
**Priority:** High
**Sprint:** Sprint 4
**Status:** Partially Done
**Current Code State:** `app/api/dashboard/route.js` returns stats for all modules but does NOT filter by the requesting user's `can_view` permissions. `app/dashboard/page.js` is implemented with Chart.js, date picker, module selector, KPI cards, country/platform breakdowns.

---

### FEATURE EP-06-F01 — Dashboard Permission & UX Fixes

**Summary:** Fix the critical permission bypass on dashboard KPIs and improve existing dashboard UX.
**Priority:** High | **Story Points:** 8

#### TASK EP-06-F01-T01 — Enforce module permissions on dashboard API

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-06-F01-T01-S01
In `app/api/dashboard/route.js`, join `user_module_permissions` for requesting user and filter the module list to only `can_view = 1` modules before running aggregation queries.

##### SUBTASK EP-06-F01-T01-S02
Superadmin bypass — if `role === 'superadmin'`, include all modules (no permission join needed).

##### SUBTASK EP-06-F01-T01-S03
Return `accessible_modules[]` array in response so UI knows which module tabs to render.

---

#### TASK EP-06-F01-T02 — Dashboard UI improvements

**Story Points:** 5 | **Assignee:** Frontend Dev

##### SUBTASK EP-06-F01-T02-S01
KPI cards: add delta badge vs. previous period — requires `comparison_from`/`comparison_to` params in dashboard API.

##### SUBTASK EP-06-F01-T02-S02
Module breakdown cards: add click-through — clicking a module card navigates to `/modules/[table]` with current date filter applied.

##### SUBTASK EP-06-F01-T02-S03
Add "Refresh" button to dashboard — re-fetches data without page reload; shows last-updated timestamp.

##### SUBTASK EP-06-F01-T02-S04
Empty state for module cards with no data in the selected date range — show placeholder card with message.

---

#### BUG EP-06-F01-B01 — Dashboard KPI totals include modules user cannot view

**Summary:** `app/api/dashboard/route.js` queries all modules with `SELECT * FROM modules` without checking `user_module_permissions`. A user with `can_view = 0` on Social Media still sees Social Media counts in the totals.
**Priority:** High | **Severity:** Major
**Confirmed In:** `app/api/dashboard/route.js` — module list retrieval does not join permissions table.

**Acceptance Criteria:**
- [ ] Users only see KPI data for their permitted modules.
- [ ] Superadmin sees all modules.

---

### FEATURE EP-06-F02 — Per-Module Analytics Drill-Down

**Summary:** Add a per-module analytics page with status breakdown donut, weekly trend, and top pirate entities.
**Priority:** Medium | **Story Points:** 8

#### TASK EP-06-F02-T01 — Per-module analytics API

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-06-F02-T01-S01
`GET /api/analytics/[table]?from=&to=` — return: status distribution counts, weekly trend (last 12 weeks), top 5 URLs/channels by occurrence, removal TAT average.

##### SUBTASK EP-06-F02-T01-S02
All date grouping done server-side in UTC; client renders labels converted to IST — prevents DST boundary bugs.

---

#### TASK EP-06-F02-T02 — Analytics UI page

**Story Points:** 5 | **Assignee:** Frontend Dev

##### SUBTASK EP-06-F02-T02-S01
`/modules/[table]/analytics` — status donut chart (Chart.js); click slice → navigate to module table pre-filtered by that status.

##### SUBTASK EP-06-F02-T02-S02
Weekly trend grouped bar chart — last 12 weeks, grouped by status, responsive, dark/light theme.

##### SUBTASK EP-06-F02-T02-S03
Top 5 pirate URLs/channels table — click row → opens module table filtered to that URL/channel.

---

---

## EPIC EP-07 — Search & Discovery

**EPIC ID:** EP-07
**Summary:** Build a global cross-module search page and enhance the per-module column filter UX.
**Priority:** High
**Sprint:** Sprint 4
**Status:** Backend partially exists (`/api/data` supports per-column search per module; no cross-module search endpoint)
**Current Code State:** `/api/data?table=&search=` supports keyword search per module. No global cross-module search endpoint exists. No dedicated search UI page.

---

### FEATURE EP-07-F01 — Global Cross-Module Search

**Summary:** Single search interface to query all accessible modules simultaneously.
**Priority:** High | **Story Points:** 8

#### TASK EP-07-F01-T01 — Global search API

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-07-F01-T01-S01
`GET /api/search?q=&modules[]=&status=&from=&to=&page=&limit=` — queries `titleCols` (from `sheetConfig`) across user's accessible modules; respects `can_view` permissions.

##### SUBTASK EP-07-F01-T01-S02
Add MySQL FULLTEXT indexes to `titleCols` for all 11 modules; fall back to `LIKE '%q%'` if FULLTEXT unavailable.

##### SUBTASK EP-07-F01-T01-S03
Results format: `{ module, table, id, matched_field, matched_value, status, identified_date_IST }` grouped by module.

---

#### TASK EP-07-F01-T02 — Global search UI

**Story Points:** 5 | **Assignee:** Frontend Dev

##### SUBTASK EP-07-F01-T02-S01
Global search bar in `Topbar.js` — `Ctrl+K` shortcut to focus; `Esc` to close; placeholder `"Search across all modules..."`.

##### SUBTASK EP-07-F01-T02-S02
`/search?q=` results page — results grouped by module, matched term highlighted, click result navigates to `/modules/[table]` with record pre-selected/scrolled-to.

##### SUBTASK EP-07-F01-T02-S03
Filter sidebar — module multi-select, status filter, date range — live results update with debounce (500ms).

---

#### BUG EP-07-F01-B01 — No global search endpoint exists

**Summary:** No `/api/search` endpoint. The Topbar search bar (if built) would have no backend to call.
**Priority:** High | **Severity:** Major

**Acceptance Criteria:**
- [ ] `/api/search` endpoint functional with cross-module queries.
- [ ] Returns only results from modules the user can view.

---

### FEATURE EP-07-F02 — Per-Column Filter UX Improvements

**Summary:** Enhance the existing debounced column filters with clear-all, persistence, and keyboard shortcuts.
**Priority:** Medium | **Story Points:** 5

#### TASK EP-07-F02-T01 — Filter UX polish

**Story Points:** 3 | **Assignee:** Frontend Dev

##### SUBTASK EP-07-F02-T01-S01
Add clear (×) button to every active column filter input — click clears that column filter and re-fetches.

##### SUBTASK EP-07-F02-T01-S02
"Clear all filters" button in toolbar — resets search, status, date range, all column filters simultaneously.

##### SUBTASK EP-07-F02-T01-S03
Active-filter count badge on toolbar filter button when any filters are applied — `Filters (3)`.

---

#### TASK EP-07-F02-T02 — Server-side sort & filter API improvements

**Story Points:** 2 | **Assignee:** Backend Dev

##### SUBTASK EP-07-F02-T02-S01
Verify `app/api/data/route.js` supports `sort_by` and `sort_dir` query params — if missing, add them.

##### SUBTASK EP-07-F02-T02-S02
Return `applied_filters` object in list API response so UI can reconcile its displayed filter state with what the server applied.

---

#### BUG EP-07-F02-B01 — Column filter ignores records with NULL in that column

**Summary:** Applying a column filter via `LIKE '%term%'` misses rows where the column is NULL (MySQL NULL comparisons always false).
**Priority:** Low | **Severity:** Minor

**Acceptance Criteria:**
- [ ] Filter query uses `IFNULL(col, '') LIKE '%term%'` or equivalent.
- [ ] Empty-string filter shows all records including NULL-column rows.

---

---

## EPIC EP-08 — Notifications & Email System

**EPIC ID:** EP-08
**Summary:** Complete the email notification system (templates + triggers) and build in-app notification centre.
**Priority:** Medium
**Sprint:** Sprint 5
**Status:** NOT STARTED
**Current Code State:** `lib/email.js` defines `sendApprovalEmail()` and `sendRejectionEmail()` but neither is called from any route. `/api/admin/email-config` manages SMTP configs. No in-app notification tables, endpoints, or UI exist.

---

### FEATURE EP-08-F01 — In-App Notification Centre

**Summary:** Bell icon notification centre in Topbar showing system events for the logged-in user.
**Priority:** High | **Story Points:** 8

#### TASK EP-08-F01-T01 — Notifications data model & API

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-08-F01-T01-S01
Create `notifications` table: `id INT AUTO_INCREMENT, user_id INT, type VARCHAR(50), title VARCHAR(255), body TEXT, link VARCHAR(512), is_read TINYINT(1) DEFAULT 0, created_at DATETIME DEFAULT NOW()`.

##### SUBTASK EP-08-F01-T01-S02
`GET /api/notifications` — returns unread + last 20 read notifications for requesting user; ordered by `created_at DESC`.

##### SUBTASK EP-08-F01-T01-S03
`PATCH /api/notifications/:id/read` and `PATCH /api/notifications/read-all` — mark one or all notifications as read.

---

#### TASK EP-08-F01-T02 — Notification triggers

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-08-F01-T02-S01
Trigger on `POST /api/upload` complete — notify uploader: `"Upload complete — {N} inserted, {M} updated in {Module}"` with link to module page.

##### SUBTASK EP-08-F01-T02-S02
Trigger on `POST /api/bulk-update` complete — notify user: `"Status updated to {Status} for {N} records in {Module}"`.

##### SUBTASK EP-08-F01-T02-S03
Trigger on user account approved — notify the newly approved user.

---

#### TASK EP-08-F01-T03 — Notification centre UI

**Story Points:** 2 | **Assignee:** Frontend Dev

##### SUBTASK EP-08-F01-T03-S01
Bell icon in `Topbar.js` with unread count badge — poll `GET /api/notifications` every 60 seconds.

##### SUBTASK EP-08-F01-T03-S02
Dropdown panel — notification list, unread highlighted with left border, click → navigate to linked page + mark read.

##### SUBTASK EP-08-F01-T03-S03
"Mark all as read" button; empty state illustration when no notifications.

---

#### BUG EP-08-F01-B01 — No notification infrastructure exists despite being referenced in UI

**Summary:** Topbar has a notification bell placeholder (per design) but no `notifications` table, no API endpoints, and no notification-triggering code exists anywhere.
**Priority:** Medium | **Severity:** Major

**Acceptance Criteria:**
- [ ] Notifications table created via migration.
- [ ] At minimum upload-complete notification works end-to-end.

---

### FEATURE EP-08-F02 — Email Notification Triggers

**Summary:** Wire the existing email templates to the events that should trigger them; add missing templates.
**Priority:** High | **Story Points:** 8

#### TASK EP-08-F02-T01 — Wire approval/rejection email triggers

**Story Points:** 2 | **Assignee:** Backend Dev

##### SUBTASK EP-08-F02-T01-S01
In `app/api/admin/users/approve/route.js` — add `await sendApprovalEmail(user.email, user.name)` after updating user status to active.

##### SUBTASK EP-08-F02-T01-S02
In user reject flow — add `await sendRejectionEmail(user.email, user.name, reason)` after updating status to rejected.

---

#### TASK EP-08-F02-T02 — Add missing email templates

**Story Points:** 3 | **Assignee:** Frontend Dev

##### SUBTASK EP-08-F02-T02-S01
Add `sendPasswordResetEmail(email, resetLink, expiryIST)` — HTML template: reset CTA button, expiry in IST, security disclaimer.

##### SUBTASK EP-08-F02-T02-S02
Add `sendUploadSummaryEmail(email, moduleName, inserted, updated, errors[])` — HTML template: summary table, error list, link to module page.

##### SUBTASK EP-08-F02-T02-S03
Add `sendWeeklyDigestEmail(email, stats[])` — HTML template: per-module weekly totals table, action rate, link to dashboard.

---

#### TASK EP-08-F02-T03 — User email preferences

**Story Points:** 3 | **Assignee:** Full Stack Dev

##### SUBTASK EP-08-F02-T03-S01
Add `email_preferences` JSON column to `users` table (or `user_preferences` table): `{ upload_complete, status_change, weekly_digest }`.

##### SUBTASK EP-08-F02-T03-S02
Settings page → Email Notifications section — toggle per event type, save via `POST /api/preferences`.

##### SUBTASK EP-08-F02-T03-S03
All email-sending functions check user's email preference before dispatching.

---

#### BUG EP-08-F02-B01 — Approval/rejection email functions defined but never called

**Summary:** `lib/email.js` exports `sendApprovalEmail` and `sendRejectionEmail`. Neither function is imported or called in any route handler. New users are approved/rejected silently with no email sent.
**Priority:** Critical | **Severity:** Critical
**Confirmed In:** `grep -r "sendApprovalEmail\|sendRejectionEmail" d:/VM/piracy/app/api` — zero results.

**Acceptance Criteria:**
- [ ] `sendApprovalEmail()` called in approval route.
- [ ] `sendRejectionEmail()` called in rejection route.
- [ ] Test: approve a user → verify email received at user's address.

---

---

## EPIC EP-09 — Security Hardening

**EPIC ID:** EP-09
**Summary:** Fix critical security vulnerabilities: hardcoded database credentials, insecure cookie flags, SQL injection risks, unvalidated admin inputs, and missing HTTPS enforcement.
**Priority:** Critical
**Sprint:** Sprint 2 (critical fixes) + Sprint 6 (hardening)
**Status:** Multiple confirmed critical vulnerabilities
**Current Code State:** `lib/db.js` has hardcoded DB password fallback. Login cookie missing `Secure` flag. No input validation on admin routes. API token expiry check may have timezone bug.

---

### FEATURE EP-09-F01 — Remove Hardcoded Credentials & Secrets

**Summary:** Eliminate all hardcoded secrets from source code; enforce env-var-only configuration.
**Priority:** Critical | **Story Points:** 5

#### TASK EP-09-F01-T01 — Remove hardcoded DB password

**Story Points:** 2 | **Assignee:** Backend Dev

##### SUBTASK EP-09-F01-T01-S01
In `lib/db.js`, remove fallback: `password: process.env.DB_PASS || 'Support@22$#'` → change to `password: process.env.DB_PASS` (no fallback). App should fail fast on startup if `DB_PASS` is not set.

##### SUBTASK EP-09-F01-T01-S02
Audit all env var reads in `lib/db.js`, `lib/email.js`, and all route handlers — remove any remaining hardcoded fallback values for sensitive fields.

---

#### TASK EP-09-F01-T02 — Startup env var validation

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-09-F01-T02-S01
Add `lib/config.js` that reads and validates all required env vars on startup: `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `SESSION_SECRET` — throw `Error("Missing required env var: X")` for any missing.

##### SUBTASK EP-09-F01-T02-S02
Import `lib/config.js` in `lib/db.js` so validation runs before any DB connection is attempted.

##### SUBTASK EP-09-F01-T02-S03
Create `.env.example` in repo root with all required env var names and placeholder values (no real values).

---

#### BUG EP-09-F01-B01 — Hardcoded database password in `lib/db.js`

**Summary:** `lib/db.js` line 7: `password: process.env.DB_PASS || 'Support@22$#'`. If `DB_PASS` env var is not set, the hardcoded password is used. This password is committed to the repo and visible to anyone with code access.
**Priority:** Critical | **Severity:** Critical
**Confirmed In:** `lib/db.js` line ~7.

**Acceptance Criteria:**
- [ ] Hardcoded password removed.
- [ ] App throws clear error on startup if `DB_PASS` not set.
- [ ] Old password rotated in production immediately after fix deployed.

---

### FEATURE EP-09-F02 — Input Validation on All API Routes

**Summary:** Add server-side input validation to every API route that accepts user input.
**Priority:** Critical | **Story Points:** 8

#### TASK EP-09-F02-T01 — Validate admin API inputs

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-09-F02-T01-S01
`/api/admin/users` POST/PUT — validate: name (non-empty, max 100), email (valid format), role (must be in ['superadmin','admin','user']), password (min 8 chars if provided).

##### SUBTASK EP-09-F02-T01-S02
`/api/admin/permissions` POST — validate: userId (integer), moduleName (in known modules list), permission key (in allowed list), value (0 or 1).

##### SUBTASK EP-09-F02-T01-S03
`/api/admin/tokens` POST — validate: name (non-empty, max 100), expires_at (valid future date if provided).

---

#### TASK EP-09-F02-T02 — Validate dynamic table names against whitelist

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-09-F02-T02-S01
Create a `ALLOWED_TABLES` whitelist in `lib/sheetConfig.js` — all 11 module table names. Use this in every route that accepts a `table` param before building SQL queries.

##### SUBTASK EP-09-F02-T02-S02
Create `ALLOWED_SORT_COLUMNS[table]` whitelist from sheetConfig keys — validate `sortCol` param against this list in `app/api/data/route.js`.

##### SUBTASK EP-09-F02-T02-S03
Audit all routes that construct SQL with user-supplied column or table names — replace any unvalidated usage with whitelist check.

---

#### TASK EP-09-F02-T03 — Add CSRF protection

**Story Points:** 2 | **Assignee:** Backend Dev

##### SUBTASK EP-09-F02-T03-S01
Implement CSRF token generation on session creation — store token in session, return as `X-CSRF-Token` response header on auth check.

##### SUBTASK EP-09-F02-T03-S02
Require `X-CSRF-Token` header on all state-mutating routes (POST/PUT/PATCH/DELETE) — reject without it.

---

### FEATURE EP-09-F03 — API Token Security Fixes

**Summary:** Fix confirmed bugs in API token validation logic.
**Priority:** High | **Story Points:** 5

#### TASK EP-09-F03-T01 — Fix expired token returning 200

**Story Points:** 2 | **Assignee:** Backend Dev

##### SUBTASK EP-09-F03-T01-S01
In `app/api/v1/[table]/route.js` token validation: change comparison to `WHERE token_hash = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())` using a server-side DB comparison — avoids JS timezone issues.

##### SUBTASK EP-09-F03-T01-S02
Return `401 { error: "Token expired" }` for expired tokens (distinguish from `"Invalid token"`).

---

#### TASK EP-09-F03-T02 — Fix unknown table returning 500

**Story Points:** 2 | **Assignee:** Backend Dev

##### SUBTASK EP-09-F03-T02-S01
In `app/api/v1/[table]/route.js`, add check: if `table` param is not in `ALLOWED_TABLES` whitelist or is not API-accessible per modules config → return `404 { error: "Module not found or not API-accessible" }`.

##### SUBTASK EP-09-F03-T02-S02
Verify no stack trace is leaked in any error response — all unhandled errors return `500 { error: "Internal server error" }` without details.

---

#### TASK EP-09-F03-T03 — Encrypt SMTP passwords at rest

**Story Points:** 1 | **Assignee:** Backend Dev

##### SUBTASK EP-09-F03-T03-S01
Add `ENCRYPTION_KEY` env var. When saving `smtp_pass` to `email_config` table, encrypt using AES-256 with this key. Decrypt on read in `lib/email.js`.

---

#### BUG EP-09-F03-B01 — Expired API token returns 200 instead of 401

**Summary:** `app/api/v1/[table]/route.js` token check: `if (t.expires_at && new Date(t.expires_at) < new Date())` — JS Date parsing of MySQL datetime string without explicit timezone may produce wrong comparison. Token works past expiry.
**Priority:** Critical | **Severity:** Critical
**Confirmed In:** `app/api/v1/[table]/route.js` token validation logic.

**Acceptance Criteria:**
- [ ] Expired token returns `401 { error: "Token expired" }`.
- [ ] DB-level comparison `expires_at > NOW()` used to avoid timezone ambiguity.

---

#### BUG EP-09-F03-B02 — SMTP passwords stored in plaintext in `email_config` table

**Summary:** `email_config.smtp_pass` column stores plain-text SMTP passwords in MySQL. If DB is compromised, all configured SMTP accounts are exposed.
**Priority:** High | **Severity:** Major
**Confirmed In:** `database/schema.sql` — `smtp_pass VARCHAR(255)` with no encryption.

**Acceptance Criteria:**
- [ ] SMTP passwords encrypted with AES-256 before storage.
- [ ] Existing passwords migrated (re-enter in admin UI after fix).

---

---

## EPIC EP-10 — API Hardening & Documentation

**EPIC ID:** EP-10
**Summary:** Add rate limiting to the public V1 API, build the `/api-docs` documentation page, add the API Playground, and complete the versioning strategy.
**Priority:** High
**Sprint:** Sprint 6
**Status:** Partially Done (API functional, no rate limiting, no docs page, no playground, token generation missing)
**Current Code State:** `/api/v1/[table]` and `/api/v1/modules` work. No rate limiting. `app/api-docs/page.js` exists as a stub. No API Playground UI exists.

---

### FEATURE EP-10-F01 — API Rate Limiting

**Summary:** Protect the public REST API from abuse with per-token rate limits.
**Priority:** Critical | **Story Points:** 5

#### TASK EP-10-F01-T01 — Per-token rate limiting middleware

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-10-F01-T01-S01
Implement sliding-window rate limiter — 1000 requests per token per hour. Store counters in-memory with sliding window (or Redis for multi-instance).

##### SUBTASK EP-10-F01-T01-S02
Return `429 Too Many Requests` with headers: `X-RateLimit-Limit: 1000`, `X-RateLimit-Remaining: 0`, `X-RateLimit-Reset: {unix_timestamp}`.

##### SUBTASK EP-10-F01-T01-S03
Apply rate limiter middleware to all `/api/v1/*` routes.

---

#### TASK EP-10-F01-T02 — API usage analytics

**Story Points:** 2 | **Assignee:** Backend Dev

##### SUBTASK EP-10-F01-T02-S01
Add `response_time_ms INT` and `status_code SMALLINT` columns to `api_token_usage` table via migration.

##### SUBTASK EP-10-F01-T02-S02
Record response time and status code in the usage log on every API call.

---

### FEATURE EP-10-F02 — API Documentation Page

**Summary:** Build the complete `/api-docs` page documenting all API-accessible modules.
**Priority:** High | **Story Points:** 8

#### TASK EP-10-F02-T01 — API docs content

**Story Points:** 3 | **Assignee:** Tech Writer / Dev

##### SUBTASK EP-10-F02-T01-S01
Document `GET /api/v1/modules` — authentication, response schema, example response JSON.

##### SUBTASK EP-10-F02-T01-S02
Document `GET /api/v1/[table]` for all 9 API-accessible modules — parameters table (date_from, date_to, title, page, limit), response schema, field reference table (all returned columns with types), example request + response.

##### SUBTASK EP-10-F02-T01-S03
Add error response section — 400/401/404/429/500 examples for every endpoint card.

---

#### TASK EP-10-F02-T02 — API docs UI implementation

**Story Points:** 5 | **Assignee:** Frontend Dev

##### SUBTASK EP-10-F02-T02-S01
Build `app/api-docs/page.js` (currently stub) — endpoint card component: method badge, path, description, collapsible parameters table, response schema block.

##### SUBTASK EP-10-F02-T02-S02
Authentication instructions panel — how to generate a token (link to admin), how to pass Bearer token in header.

##### SUBTASK EP-10-F02-T02-S03
Field Reference panel per module — auto-generated from `sheetConfig[table].columns` — column name, type, description.

---

### FEATURE EP-10-F03 — API Playground

**Summary:** Interactive request builder embedded in the admin panel for testing API endpoints.
**Priority:** Medium | **Story Points:** 8

#### TASK EP-10-F03-T01 — Playground UI

**Story Points:** 5 | **Assignee:** Frontend Dev

##### SUBTASK EP-10-F03-T01-S01
Admin Panel → API Playground tab — endpoint selector (module dropdown), parameter form (from/to dates, title, page, limit), active token selector.

##### SUBTASK EP-10-F03-T01-S02
"Send Request" button — calls selected endpoint with parameters via browser fetch using selected token → displays raw JSON response in code block.

##### SUBTASK EP-10-F03-T01-S03
Response panel: Table view (formatted DataTable) / JSON view (syntax-highlighted) toggle.

---

#### TASK EP-10-F03-T02 — Versioning & health endpoint

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-10-F03-T02-S01
Add `GET /api/v1/health` endpoint: `{ status: "ok", version: "1.0", uptime_s: N }`.

##### SUBTASK EP-10-F03-T02-S02
Add `X-API-Version: 1.0` response header to all `/api/v1/*` responses.

##### SUBTASK EP-10-F03-T02-S03
Document deprecation policy in `/api-docs` — 6-month notice period, `Deprecation` and `Sunset` headers will be added to deprecated endpoints.

---

---

## EPIC EP-11 — Audit & Compliance

**EPIC ID:** EP-11
**Summary:** Build record change history (before/after diff), fix missing delete audit entries, fix truncated log details, and implement data retention policy.
**Priority:** High
**Sprint:** Sprint 4 & Sprint 5
**Status:** Partially Done — `user_activity` logging works for most actions; delete handler does NOT log; column truncates at 255 chars; no record-level change history.

---

### FEATURE EP-11-F01 — Record Change History

**Summary:** Log before/after field values for every edit, status change, and delete — viewable per record.
**Priority:** High | **Story Points:** 8

#### TASK EP-11-F01-T01 — Change history data model

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-11-F01-T01-S01
Create `record_change_history` table: `id INT AUTO_INCREMENT, module_table VARCHAR(100), record_uuid VARCHAR(36), user_id INT, action ENUM('edit','status','delete'), changed_fields JSON, changed_at DATETIME DEFAULT NOW()`.

##### SUBTASK EP-11-F01-T01-S02
`changed_fields` structure: `{ "field_name": { "before": value, "after": value } }` — only include actually-changed fields.

##### SUBTASK EP-11-F01-T01-S03
Write to `record_change_history` in: `PUT /api/edit`, `POST /api/bulk-update` (per row), `POST /api/removal-status`, `DELETE /api/data`.

---

#### TASK EP-11-F01-T02 — Change history UI

**Story Points:** 5 | **Assignee:** Frontend Dev

##### SUBTASK EP-11-F01-T02-S01
History icon button in each table row → opens History side Drawer.

##### SUBTASK EP-11-F01-T02-S02
History Drawer — chronological list: timestamp (IST), user name, action badge, changed fields list (field: before → after).

##### SUBTASK EP-11-F01-T02-S03
Link from Admin Activity Log entry → the specific record's history drawer.

---

#### BUG EP-11-F01-B01 — Hard-delete does not write to activity log

**Summary:** `DELETE` action in data route removes the DB row but does not call `logActivity()`. No audit record of who deleted what.
**Priority:** High | **Severity:** Major
**Confirmed In:** Check `app/api/data/route.js` DELETE handler for `logActivity()` call — if missing, confirmed bug.

**Acceptance Criteria:**
- [ ] Every DELETE logs: user, module, record UUID, action `"delete"`, timestamp.
- [ ] Confirmed for all 11 module delete paths.

---

#### BUG EP-11-F01-B02 — Activity log `details` column truncates at 255 characters

**Summary:** `user_activity.details` is `VARCHAR(255)` in schema. Bulk upload summaries with many rows produce JSON details longer than 255 chars — silently truncated, data lost.
**Priority:** Medium | **Severity:** Minor
**Confirmed In:** `database/schema.sql` — check `user_activity` table column definition.

**Acceptance Criteria:**
- [ ] `details` column changed to `TEXT` via migration.
- [ ] Migration script that preserves existing truncated rows.

---

### FEATURE EP-11-F02 — Data Retention & Archival Policy

**Summary:** Implement configurable per-module data retention and an archival export.
**Priority:** Medium | **Story Points:** 5

#### TASK EP-11-F02-T01 — Retention configuration

**Story Points:** 2 | **Assignee:** Backend Dev

##### SUBTASK EP-11-F02-T01-S01
Admin Panel → Data Retention section: per-module retention period input (months), archival action select (archive to `{table}_archive` / hard-delete).

##### SUBTASK EP-11-F02-T01-S02
Store retention config in `system_settings` table as JSON: `{ table_name: { retain_months: N, action: "archive"|"delete" } }`.

---

#### TASK EP-11-F02-T02 — Archival execution

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-11-F02-T02-S01
Admin Panel → "Run Archive Now" button with confirmation modal — calls `POST /api/admin/archive` → moves records older than retention period to `{table}_archive` tables.

##### SUBTASK EP-11-F02-T02-S02
Archived records excluded from all module list queries by default — add `AND is_archived = 0` (or use archived tables) to data queries.

##### SUBTASK EP-11-F02-T02-S03
Admin toggle "Include archived records" on module pages for superadmin/admin users.

---

---

## EPIC EP-12 — Mobile & Accessibility

**EPIC ID:** EP-12
**Summary:** Make all pages fully functional on tablet (768px) and mobile (375px), fix modal overflow, and achieve WCAG 2.1 AA compliance.
**Priority:** Medium
**Sprint:** Sprint 7
**Status:** Partial — Sidebar partially responsive; data tables not mobile-optimised; confirmed accessibility failures.

---

### FEATURE EP-12-F01 — Responsive Layout

**Summary:** Full responsive design for all pages at 768px and 375px breakpoints.
**Priority:** High | **Story Points:** 8

#### TASK EP-12-F01-T01 — Responsive sidebar & topbar

**Story Points:** 3 | **Assignee:** Frontend Dev

##### SUBTASK EP-12-F01-T01-S01
`Sidebar.js` — collapse to off-canvas drawer on screens < 768px; hamburger icon in Topbar toggles drawer; overlay backdrop closes it.

##### SUBTASK EP-12-F01-T01-S02
`Topbar.js` — hide non-critical items (breadcrumb label) below 480px; notification bell and theme toggle remain visible.

---

#### TASK EP-12-F01-T02 — Responsive data table

**Story Points:** 5 | **Assignee:** Frontend Dev

##### SUBTASK EP-12-F01-T02-S01
Horizontal scroll wrapper on DataTable below 768px — sticky first two columns (checkbox + title column).

##### SUBTASK EP-12-F01-T02-S02
Card view toggle for mobile — each record rendered as a card (key fields only) below 480px; all details shown in Edit modal.

##### SUBTASK EP-12-F01-T02-S03
Touch-friendly row actions — swipe-left reveals Edit/Delete action buttons on mobile.

---

#### BUG EP-12-F01-B01 — Edit modal overflows viewport on mobile

**Summary:** Edit modal uses fixed px widths; on 375px viewport horizontal scroll appears inside modal.
**Priority:** High | **Severity:** Major

**Acceptance Criteria:**
- [ ] Modal max-width: `min(720px, 100vw - 32px)`.
- [ ] All form fields stack single-column on < 480px.

---

### FEATURE EP-12-F02 — WCAG 2.1 AA Accessibility

**Summary:** Meet WCAG 2.1 AA — keyboard navigation, colour contrast, ARIA roles.
**Priority:** Medium | **Story Points:** 8

#### TASK EP-12-F02-T01 — Colour contrast audit & fixes

**Story Points:** 3 | **Assignee:** UI Lead

##### SUBTASK EP-12-F02-T01-S01
Run axe-core audit on all pages in dark and light mode — export report of all contrast failures.

##### SUBTASK EP-12-F02-T01-S02
Fix all contrast failures: minimum 4.5:1 for body text, 3:1 for UI components and large text.

##### SUBTASK EP-12-F02-T01-S03
Document final contrast ratios for all colour pairs in the style guide.

---

#### TASK EP-12-F02-T02 — Keyboard navigation & ARIA

**Story Points:** 5 | **Assignee:** Frontend Dev

##### SUBTASK EP-12-F02-T02-S01
All interactive elements keyboard-reachable; visible focus ring on all focusable elements (`:focus-visible` ring, not outline: none).

##### SUBTASK EP-12-F02-T02-S02
DataTable: `role="grid"`, `aria-sort` on sorted columns, `aria-label` on icon-only buttons (Edit, Delete, History).

##### SUBTASK EP-12-F02-T02-S03
Modals: `role="dialog"`, `aria-labelledby`, `aria-describedby`, focus-trap implemented (see EP-01-F03-B01).

##### SUBTASK EP-12-F02-T02-S04
Forms: `aria-required`, `aria-invalid`, `aria-describedby` linking field to its error message.

---

#### BUG EP-12-F02-B01 — Status badge colours fail AA contrast in light mode

**Summary:** "Open" (yellow text on near-white background) and "Pending" (blue on light-grey) badge variants fail 4.5:1 contrast ratio in light mode.
**Priority:** High | **Severity:** Major

**Acceptance Criteria:**
- [ ] All 8 status badge variants pass 4.5:1 in both dark and light mode.
- [ ] Contrast values documented in style guide.

---

---

## EPIC EP-13 — Automation & Scheduling

**EPIC ID:** EP-13
**Summary:** Implement scheduled CSV exports with email delivery, build the CI/CD pipeline, and configure PM2 production process management.
**Priority:** Medium
**Sprint:** Sprint 7
**Status:** NOT STARTED
**Current Code State:** Email infrastructure exists. No `node-cron` or scheduling logic anywhere. No GitHub Actions workflows. `package.json` shows PM2 is not yet a dev-dependency.

---

### FEATURE EP-13-F01 — Scheduled CSV Exports

**Summary:** Users schedule recurring CSV exports (daily/weekly/monthly) delivered to their email.
**Priority:** Medium | **Story Points:** 8

#### TASK EP-13-F01-T01 — Schedule configuration

**Story Points:** 3 | **Assignee:** Frontend Dev

##### SUBTASK EP-13-F01-T01-S01
Module toolbar → "Schedule Export" button → drawer: frequency (daily/weekly/monthly), time (IST hour), recipient emails (comma-separated), active toggle.

##### SUBTASK EP-13-F01-T01-S02
`GET/POST/DELETE /api/admin/export-schedules` — CRUD for schedule configs; tied to user + module.

##### SUBTASK EP-13-F01-T01-S03
Admin Panel → Scheduled Exports section — list all active schedules with last-run and next-run timestamps.

---

#### TASK EP-13-F01-T02 — Schedule execution engine

**Story Points:** 5 | **Assignee:** Backend Dev

##### SUBTASK EP-13-F01-T02-S01
Create `export_schedules` table: `id, user_id, module_table, frequency ENUM('daily','weekly','monthly'), run_at_hour TINYINT, last_run_at DATETIME, next_run_at DATETIME, recipients JSON, is_active TINYINT, is_running TINYINT`.

##### SUBTASK EP-13-F01-T02-S02
Add `node-cron` dependency; register a job that runs every minute, checks `export_schedules` where `next_run_at <= NOW() AND is_active = 1 AND is_running = 0`, executes due exports using `is_running = 1` as a distributed lock.

##### SUBTASK EP-13-F01-T02-S03
Execution: reuse `/api/download` CSV generation logic → attach to Nodemailer email → send to recipients → update `last_run_at` + compute `next_run_at` → set `is_running = 0`.

---

#### BUG EP-13-F01-B01 — No scheduled export engine exists

**Summary:** The feature is entirely absent — no `export_schedules` table, no cron job, no scheduler entry point.
**Priority:** Medium | **Severity:** Major

**Acceptance Criteria:**
- [ ] At least one scheduled daily export runs and email is delivered in staging environment.
- [ ] Duplicate execution prevented when PM2 cluster has 2+ instances.

---

### FEATURE EP-13-F02 — CI/CD Pipeline

**Summary:** GitHub Actions CI (lint + build + test on PR) and CD (deploy to Ubuntu on merge to main).
**Priority:** High | **Story Points:** 5

#### TASK EP-13-F02-T01 — GitHub Actions workflows

**Story Points:** 3 | **Assignee:** DevOps

##### SUBTASK EP-13-F02-T01-S01
`.github/workflows/ci.yml` — triggers on PR to `main`: `pnpm install`, ESLint, `next build`, Jest unit tests. Fail PR if any step fails.

##### SUBTASK EP-13-F02-T01-S02
`.github/workflows/deploy.yml` — triggers on push to `main`: SSH to Ubuntu server, `git pull`, `pnpm install --frozen-lockfile`, `pnpm build`, `pm2 reload pms`.

##### SUBTASK EP-13-F02-T01-S03
Add env var validation step before `next build` in CI — check all required vars are set (using `.env.example` as reference).

---

#### TASK EP-13-F02-T02 — PM2 production config

**Story Points:** 2 | **Assignee:** DevOps

##### SUBTASK EP-13-F02-T02-S01
Create `ecosystem.config.js` — app name `pms`, `exec_mode: 'cluster'`, `instances: 2`, env vars loaded from `.env.local`, restart policy: `max_memory_restart: '512M'`.

##### SUBTASK EP-13-F02-T02-S02
Add `pm2-logrotate` configuration — daily rotation, keep last 30 days, compress old logs.

---

#### BUG EP-13-F02-B01 — `pnpm build` succeeds in CI with missing DB env vars — app crashes on first request

**Summary:** Next.js build is lazy — DB connection is not attempted at build time. Build exits 0 with no DB vars set, but the deployed app crashes on first DB-touching request.
**Priority:** High | **Severity:** Major

**Acceptance Criteria:**
- [ ] CI `ci.yml` includes a pre-build step that validates all required env vars.
- [ ] Build fails with clear error message if any required var is missing.

---

---

## EPIC EP-14 — Testing & Quality

**EPIC ID:** EP-14
**Summary:** Establish test infrastructure (Jest + Playwright), write unit tests for utilities, integration tests for critical API routes, E2E tests for key user journeys, and define the pre-launch production checklist.
**Priority:** High
**Sprint:** Sprint 6 & Sprint 7
**Status:** NOT STARTED — zero test files in repo, no Jest config, no Playwright config.

---

### FEATURE EP-14-F01 — Unit & Integration Test Infrastructure

**Summary:** Set up Jest, configure a test database, and write tests for all utility functions and critical API routes.
**Priority:** High | **Story Points:** 13

#### TASK EP-14-F01-T01 — Test infrastructure setup

**Story Points:** 2 | **Assignee:** QA / Dev

##### SUBTASK EP-14-F01-T01-S01
Add `jest` + `@testing-library/react` + `jest-environment-jsdom` to `devDependencies` in `package.json`. Create `jest.config.js` for Next.js App Router (`testEnvironment: 'node'` for API tests, `jsdom` for component tests).

##### SUBTASK EP-14-F01-T01-S02
Add `xlsx` to Jest `transformIgnorePatterns` exception — prevents `SyntaxError: Cannot use import statement` crash when upload handler tests run.

##### SUBTASK EP-14-F01-T01-S03
Create `pms_test` MySQL database; add `DB_NAME_TEST` env var. Add `test:setup` script to create schema in test DB.

---

#### TASK EP-14-F01-T02 — Unit tests for `lib/timezone.js`

**Story Points:** 3 | **Assignee:** Dev

##### SUBTASK EP-14-F01-T02-S01
`istToUtc()` — test cases: normal datetime, date-only, null/empty, invalid string, midnight boundary, +5:30 offset verification.

##### SUBTASK EP-14-F01-T02-S02
`utcToIst()` — test same cases; verify +5:30 displayed offset.

##### SUBTASK EP-14-F01-T02-S03
`utcToIstForInput()` — verify returns `YYYY-MM-DDThh:mm` format for datetime-local inputs.

---

#### TASK EP-14-F01-T03 — Unit tests for `lib/validation.js`

**Story Points:** 2 | **Assignee:** Dev

##### SUBTASK EP-14-F01-T03-S01
`validateUrl()` — valid HTTP/HTTPS URLs pass, non-URL strings fail, null/empty returns required error.

##### SUBTASK EP-14-F01-T03-S02
`validateDate()` — valid dates pass, future dates rejected (configurable), invalid strings fail.

---

#### TASK EP-14-F01-T04 — Integration tests for critical API routes

**Story Points:** 6 | **Assignee:** Dev

##### SUBTASK EP-14-F01-T04-S01
`POST /api/auth/login` — correct credentials → 200 + session cookie; wrong password → 401; inactive user → 403.

##### SUBTASK EP-14-F01-T04-S02
`POST /api/upload?table=social_media` — valid Excel → 200 with inserted count; re-upload → updated count (not duplicate); datetime field stored as UTC in DB.

##### SUBTASK EP-14-F01-T04-S03
`GET /api/v1/social_media` — valid Bearer token → 200 with data; expired token → 401; missing token → 401; unknown table → 404.

##### SUBTASK EP-14-F01-T04-S04
`PUT /api/edit` — valid edit saves IST→UTC correctly; duplicate URL rejected; unauthorized user → 403.

---

#### BUG EP-14-F01-B01 — Jest config crashes on `xlsx` ESM import

**Summary:** SheetJS `xlsx` package uses ESM — Jest's default CommonJS transform chokes on `import * as XLSX from 'xlsx'` in upload route, making any upload-handler test impossible to run.
**Priority:** Medium | **Severity:** Minor
**Confirmed By:** `package.json` — `xlsx` is a dependency but `jest.config.js` does not exist yet.

**Acceptance Criteria:**
- [ ] `jest.config.js` has `transformIgnorePatterns` exclusion for `xlsx`.
- [ ] Upload handler unit test runs without syntax errors.

---

### FEATURE EP-14-F02 — End-to-End Tests (Playwright)

**Summary:** Automate the 5 critical user journeys via Playwright.
**Priority:** High | **Story Points:** 10

#### TASK EP-14-F02-T01 — Playwright setup

**Story Points:** 2 | **Assignee:** QA

##### SUBTASK EP-14-F02-T01-S01
Install `@playwright/test`; create `playwright.config.ts` — baseURL, test user credentials from env, screenshot + video on failure, 2 retries on CI.

##### SUBTASK EP-14-F02-T01-S02
Seed script — creates test admin user, test module records (5 rows per module), test API token before each test suite run.

---

#### TASK EP-14-F02-T02 — Critical journey E2E tests

**Story Points:** 8 | **Assignee:** QA

##### SUBTASK EP-14-F02-T02-S01
**Journey 1 — Login:** `/ → /login` redirect → enter credentials → dashboard renders KPI cards.

##### SUBTASK EP-14-F02-T02-S02
**Journey 2 — Upload:** `/modules/social_media` → Upload button → select valid `.xlsx` → success toast → row count increased.

##### SUBTASK EP-14-F02-T02-S03
**Journey 3 — Edit record:** Click Edit on first row → change status → Save → updated status badge visible in table.

##### SUBTASK EP-14-F02-T02-S04
**Journey 4 — CSV Export:** Apply date filter → Export CSV → downloaded file has correct IST datetime headers and values.

##### SUBTASK EP-14-F02-T02-S05
**Journey 5 — API token flow:** Admin → API Tokens → Generate → copy token → `fetch('/api/v1/modules', { headers: { Authorization: 'Bearer {token}' }})` → 200.

---

#### BUG EP-14-F02-B01 — Playwright toast assertion intermittently fails on CI

**Summary:** Upload success toast auto-dismisses in 3 seconds. On slow CI machines, `waitForSelector('.toast-success')` fires after dismissal → test fails ~20% of runs.
**Priority:** Medium | **Severity:** Minor

**Acceptance Criteria:**
- [ ] Use `page.waitForSelector('.toast-success', { timeout: 8000 })`.
- [ ] Or: add `PMS_TOAST_DURATION_MS=8000` env flag used in test environment.

---

### FEATURE EP-14-F03 — Pre-Launch Deployment Checklist

**Summary:** Define and execute a tracked production-readiness checklist before go-live.
**Priority:** Critical | **Story Points:** 3

#### TASK EP-14-F03-T01 — Production readiness checklist

**Story Points:** 3 | **Assignee:** Tech Lead

##### SUBTASK EP-14-F03-T01-S01
**Security:** No hardcoded credentials; HTTPS enforced (nginx/reverse proxy); session cookie `Secure + HttpOnly + SameSite=Strict`; rate limiting active; no stack traces in API error responses; source maps disabled (`productionBrowserSourceMaps: false` in `next.config.js`).

##### SUBTASK EP-14-F03-T01-S02
**Environment:** All required env vars set; `.env` not in repo; `NODE_ENV=production`; `ENCRYPTION_KEY` set for SMTP password encryption.

##### SUBTASK EP-14-F03-T01-S03
**Database:** All 31 recommended indexes applied (via DB Optimize tool); connection pool size tuned (`connectionLimit: 20` for prod); DB backup cron active (daily).

##### SUBTASK EP-14-F03-T01-S04
**Performance:** `pnpm build` output < 500 KB per page; no console errors in production build; dashboard API response < 2 s under load.

##### SUBTASK EP-14-F03-T01-S05
**Monitoring:** PM2 `ecosystem.config.js` with restart policy; error logging to file; uptime check via external monitor; PM2 log rotation configured.

---

#### BUG EP-14-F03-B01 — Production build ships source maps — internal paths exposed

**Summary:** `next build` outputs `.js.map` files to `.next/static/chunks/` that expose internal file paths and source code structure.
**Priority:** High | **Severity:** Major

**Acceptance Criteria:**
- [ ] `productionBrowserSourceMaps: false` added to `next.config.js`.
- [ ] Verified no `.map` files in production build output.

---

---

## Summary Table

| EPIC | Title | Features | Tasks | Subtasks | Bugs | Sprint |
|------|-------|----------|-------|----------|------|--------|
| EP-01 | Foundation & Design System | 3 | 12 | 35 | 3 | Sprint 1 |
| EP-02 | Authentication & User Management | 4 | 11 | 27 | 5 | Sprint 2 |
| EP-03 | Module Data Pages (11 Modules) | 2 | 8 | 24 | 2 | Sprint 3 |
| EP-04 | Admin Panel UI | 4 | 11 | 29 | 1 | Sprint 3–4 |
| EP-05 | Data Integrity & Backend Fixes | 3 | 7 | 19 | 3 | Sprint 2 |
| EP-06 | Dashboard & Analytics | 2 | 4 | 12 | 1 | Sprint 4 |
| EP-07 | Search & Discovery | 2 | 4 | 10 | 2 | Sprint 4 |
| EP-08 | Notifications & Email System | 2 | 6 | 16 | 2 | Sprint 5 |
| EP-09 | Security Hardening | 3 | 7 | 18 | 4 | Sprint 2+6 |
| EP-10 | API Hardening & Documentation | 3 | 6 | 15 | 0 | Sprint 6 |
| EP-11 | Audit & Compliance | 2 | 4 | 10 | 2 | Sprint 4–5 |
| EP-12 | Mobile & Accessibility | 2 | 4 | 10 | 2 | Sprint 7 |
| EP-13 | Automation & Scheduling | 2 | 4 | 10 | 2 | Sprint 7 |
| EP-14 | Testing & Quality | 3 | 8 | 22 | 3 | Sprint 6–7 |
| **TOTAL** | | **37** | **96** | **257** | **32** | |

---

## Current Completion Assessment

| Category | Complete | Risk | Key Gaps |
|----------|----------|------|----------|
| Database schema | 95% | LOW | Retention tables, notifications table missing |
| Authentication | 55% | CRITICAL | No forgot-password, no brute-force protection, insecure cookie |
| Data upload/edit/bulk | 85% | HIGH | Timezone bug in bulk-update, null-overwrite bug |
| Module data pages UI | 0% | CRITICAL | Entire feature missing — not usable without this |
| Admin panel UI | 0% | CRITICAL | All backends exist, zero UI |
| Dashboard | 60% | MEDIUM | Permission bug, no drill-down |
| Search | 20% | MEDIUM | No global search, per-column filters need polish |
| Notifications | 0% | MEDIUM | No in-app or email triggers wired |
| Security | 30% | CRITICAL | Hardcoded creds, insecure session, no validation |
| API (V1) | 70% | HIGH | No rate limiting, no docs page, token creation missing |
| Testing | 0% | CRITICAL | Zero test coverage |
| CI/CD | 0% | HIGH | No pipelines, no deployment automation |

---

*End of JIRA Master Plan — Piracy Monitoring System (PMS)*
*Generated from live codebase analysis — 2026-03-28*
