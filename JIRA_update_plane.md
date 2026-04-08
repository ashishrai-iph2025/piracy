# JIRA Update Plan — Piracy Monitoring System (PMS)

**Project Key:** PMS
**Document Version:** 1.0
**Created:** 2026-03-27
**Work Types Used:** EPIC · FEATURE · TASK · SUBTASK · BUG
**Flow:** UI Design → Backend → Integration → Security → Testing → Launch

---

## Table of Contents

1. [EPIC EP-11 — Design UI for the PMS](#epic-ep-11--design-ui-for-the-pms)
2. [EPIC EP-01 — Data Integrity & Timezone](#epic-ep-01--data-integrity--timezone)
3. [EPIC EP-03 — Dashboard & Analytics](#epic-ep-03--dashboard--analytics)
4. [EPIC EP-07 — Search & Discovery](#epic-ep-07--search--discovery)
5. [EPIC EP-02 — Notifications & Alerting](#epic-ep-02--notifications--alerting)
6. [EPIC EP-04 — Security & Authentication](#epic-ep-04--security--authentication)
7. [EPIC EP-05 — API Hardening](#epic-ep-05--api-hardening)
8. [EPIC EP-06 — Audit & Compliance](#epic-ep-06--audit--compliance)
9. [EPIC EP-08 — Mobile & UX](#epic-ep-08--mobile--ux)
10. [EPIC EP-09 — Automation & Scheduling](#epic-ep-09--automation--scheduling)
11. [EPIC EP-10 — Testing & Quality](#epic-ep-10--testing--quality)

---

---

## EPIC EP-11 — Design UI for the PMS

**EPIC ID:** EP-11
**Summary:** Design system, wireframes, component library, and full UI implementation for all pages
**Priority:** Critical
**Sprint:** Sprint 1 & Sprint 3
**Status:** In Progress

> Covers everything from design tokens and style guide through wireframes, component specs, and final pixel-perfect implementation of every screen in the application.

---

### FEATURE EP-11-F01 — Design Token System & Style Guide

**Summary:** Establish the complete design token system (colors, typography, spacing, shadows, borders) so every UI element has a named, consistent value.
**Priority:** Critical | **Story Points:** 8

#### TASK EP-11-F01-T01 — Audit existing CSS tokens

**Summary:** Export and document all CSS custom properties from `globals.css`.
**Story Points:** 2 | **Assignee:** UI Lead

##### SUBTASK EP-11-F01-T01-S01
Export all CSS variables from `globals.css` into a reference table with columns: token name, dark-mode value, light-mode value, usage context.

##### SUBTASK EP-11-F01-T01-S02
Identify all unnamed / magic values (hardcoded `#hex`, raw `px` not on grid) — log each one with file + line reference.

##### SUBTASK EP-11-F01-T01-S03
Verify every accent color variant (12 colors × dark/light) is tokenized and not hardcoded in component files.

---

#### TASK EP-11-F01-T02 — Define typography & spacing scale

**Summary:** Formalise font roles, size scale, weight scale, and 4px-base spacing grid.
**Story Points:** 2 | **Assignee:** UI Lead

##### SUBTASK EP-11-F01-T02-S01
Define typography scale — roles: `page-title`, `section-heading`, `body`, `label`, `caption`, `monospace` — with font-size, weight, line-height.

##### SUBTASK EP-11-F01-T02-S02
Define spacing scale on 4px base grid — steps: 4, 8, 12, 14, 16, 20, 24, 32, 48 px with token names.

##### SUBTASK EP-11-F01-T02-S03
Define border-radius, box-shadow, and z-index scales with token names.

---

#### TASK EP-11-F01-T03 — Produce living style guide HTML page

**Summary:** Build a `/style-guide` internal page rendering all tokens, components, and states.
**Story Points:** 4 | **Assignee:** Frontend Dev

##### SUBTASK EP-11-F01-T03-S01
Render all color swatches (background, text, border, status — success/warning/error/info) with token names and hex values.

##### SUBTASK EP-11-F01-T03-S02
Render typography specimens for every role in dark and light mode.

##### SUBTASK EP-11-F01-T03-S03
Render interactive component states: button (default, hover, active, disabled, loading), input (empty, filled, focused, error), badge (all status variants).

---

#### BUG EP-11-F01-B01 — Accent color tokens bleed between user sessions

**Summary:** Switching accent color as User A causes User B on the same browser to inherit the color on next load.
**Priority:** High | **Severity:** Major
**Root Cause:** Per-user localStorage key is shared (`theme-accent`) regardless of logged-in user.
**Steps to Reproduce:**
1. Login as User A → set accent to Purple.
2. Logout → login as User B.
3. Observe User B's accent is Purple instead of their saved preference.

**Acceptance Criteria:**
- [ ] localStorage key includes user ID: `theme-accent-{userId}`.
- [ ] Server-side theme value is authoritative on first load; client syncs after hydration.
- [ ] No hydration mismatch errors in console.

---

#### BUG EP-11-F01-B02 — Light mode toggle reverts after page refresh

**Summary:** Switching to light mode persists in session but reverts to dark on hard refresh.
**Priority:** Medium | **Severity:** Minor
**Root Cause:** Theme mode written to localStorage but not to the user's DB profile; refresh reads DB default (dark).
**Steps to Reproduce:**
1. Login → open Settings → switch to Light mode → hard refresh (Ctrl+Shift+R).
2. Observe dark mode is re-applied.

**Acceptance Criteria:**
- [ ] Theme mode persisted in `users.theme_mode` column on every toggle.
- [ ] Server-rendered HTML applies the correct mode class before any JS runs.

---

### FEATURE EP-11-F02 — Wireframes for All Pages

**Summary:** Produce annotated low-fidelity wireframes for every page in the application.
**Priority:** High | **Story Points:** 13

#### TASK EP-11-F02-T01 — Wireframe: Auth pages (Login / Register / Password Reset)

**Summary:** Design Login, Register, and Password Reset screens.
**Story Points:** 2 | **Assignee:** UI Designer

##### SUBTASK EP-11-F02-T01-S01
Login page wireframe — logo placement, email + password fields, submit CTA, error state banner, "Forgot password" link.

##### SUBTASK EP-11-F02-T01-S02
Register page wireframe — name, email, password, confirm-password, role selector (hidden for non-superadmin), submit CTA.

##### SUBTASK EP-11-F02-T01-S03
Password Reset flow wireframe — Request Reset screen + Reset form screen with token input.

---

#### TASK EP-11-F02-T02 — Wireframe: Dashboard & Analytics page

**Summary:** Design the main analytics dashboard with KPI cards, charts, and module selector.
**Story Points:** 3 | **Assignee:** UI Designer

##### SUBTASK EP-11-F02-T02-S01
KPI card row — define metrics: Total Incidents, Open, Removed, Pending, This Week.

##### SUBTASK EP-11-F02-T02-S02
Line chart area — date range picker, module selector multi-dropdown, data series toggle.

##### SUBTASK EP-11-F02-T02-S03
Module breakdown table — sortable, last 30-day totals per module with delta badge.

---

#### TASK EP-11-F02-T03 — Wireframe: Module List / Data Table pages (all 11 modules)

**Summary:** Single wireframe template adaptable to all 11 data modules.
**Story Points:** 3 | **Assignee:** UI Designer

##### SUBTASK EP-11-F02-T03-S01
Table toolbar wireframe — search input, date range filter, status dropdown, page size selector, Bulk Update button, CSV Export button, Upload button.

##### SUBTASK EP-11-F02-T03-S02
Data table wireframe — checkbox column, all data columns, action column (Edit / Delete icons), sticky header, pagination bar.

##### SUBTASK EP-11-F02-T03-S03
Edit modal wireframe — form layout for each field type (text, date, datetime, select, textarea), Save / Cancel actions, delete confirmation overlay.

---

#### TASK EP-11-F02-T04 — Wireframe: Admin Panel pages

**Summary:** Design wireframes for all Admin Panel sections.
**Story Points:** 3 | **Assignee:** UI Designer

##### SUBTASK EP-11-F02-T04-S01
User Management wireframe — user list table, Create User drawer, Edit User drawer, deactivate toggle.

##### SUBTASK EP-11-F02-T04-S02
Module Permissions wireframe — matrix table (users × modules) with can_view / can_upload / can_edit / can_delete toggles.

##### SUBTASK EP-11-F02-T04-S03
API Token Management wireframe — token list, Generate Token modal (name + expiry), copy icon, last-used timestamp, deactivate CTA.

##### SUBTASK EP-11-F02-T04-S04
Activity Log wireframe — filter bar (user, action type, date range), log table with timestamp + user + action + details columns.

---

#### TASK EP-11-F02-T05 — Wireframe: API Docs & Playground pages

**Summary:** Design the public-facing `/api-docs` page and the interactive API Playground.
**Story Points:** 2 | **Assignee:** UI Designer

##### SUBTASK EP-11-F02-T05-S01
API Docs wireframe — endpoint card layout, parameter table, response schema block, authentication instructions panel.

##### SUBTASK EP-11-F02-T05-S02
API Playground wireframe — request builder (method + URL + params form), response panel (Table / JSON toggle), Field Reference side panel.

---

#### BUG EP-11-F02-B01 — Wireframe annotations missing on 3 admin panel screens

**Summary:** User Management, Panel Permissions, and DB Optimize wireframes exported without field-level annotations.
**Priority:** Medium | **Severity:** Minor
**Steps to Reproduce:** Open wireframe deck page 8–10 — no labels on form fields or buttons.
**Acceptance Criteria:**
- [ ] Every interactive element has a label, state note, or linked specification.
- [ ] Re-exported PDF/Figma links updated in the design tracker.

---

### FEATURE EP-11-F03 — Component Library Implementation

**Summary:** Build and document all reusable React components in isolation.
**Priority:** High | **Story Points:** 13

#### TASK EP-11-F03-T01 — Core interactive components

**Summary:** Implement Button, Input, Select, DatePicker, Modal, Badge, Toast.
**Story Points:** 5 | **Assignee:** Frontend Dev

##### SUBTASK EP-11-F03-T01-S01
`Button` — variants: primary, secondary, danger, ghost; sizes: sm, md, lg; states: default, hover, active, disabled, loading spinner.

##### SUBTASK EP-11-F03-T01-S02
`Input` + `Select` + `Textarea` — controlled, uncontrolled, error state, helper text, label, required indicator.

##### SUBTASK EP-11-F03-T01-S03
`DatePicker` — flatpickr wrapper with IST-aware config, dark/light theme sync, range mode support.

##### SUBTASK EP-11-F03-T01-S04
`Modal` — focus-trap, ESC close, backdrop click close, size variants (sm/md/lg/fullscreen), confirm variant.

##### SUBTASK EP-11-F03-T01-S05
`Badge` — status variants: open (yellow), removed (green), pending (blue), failed (red); size variants.

##### SUBTASK EP-11-F03-T01-S06
`Toast` — stack management, auto-dismiss (3 s default), manual dismiss, icon per type (success/error/info/warning).

---

#### TASK EP-11-F03-T02 — Data table component

**Summary:** Build the reusable `<DataTable>` component used across all 11 modules.
**Story Points:** 5 | **Assignee:** Frontend Dev

##### SUBTASK EP-11-F03-T02-S01
Column definition API — `{ key, label, sortable, filterable, width, render }` per column.

##### SUBTASK EP-11-F03-T02-S02
Checkbox selection — individual row, select-all-on-page, cross-page selection counter.

##### SUBTASK EP-11-F03-T02-S03
Client-side sort + server-side sort toggle; sort indicator in column header.

##### SUBTASK EP-11-F03-T02-S04
Pagination bar — page number buttons (with ellipsis), page size selector, total count label.

##### SUBTASK EP-11-F03-T02-S05
Empty state and skeleton loading rows.

---

#### TASK EP-11-F03-T03 — Layout & navigation components

**Summary:** Implement Sidebar, Topbar, Breadcrumb, PageHeader, SectionCard.
**Story Points:** 3 | **Assignee:** Frontend Dev

##### SUBTASK EP-11-F03-T03-S01
`Sidebar` — collapsible, active-link highlight, module group with expand/collapse, permission-filtered nav items.

##### SUBTASK EP-11-F03-T03-S02
`Topbar` — user avatar + name, theme toggle, notification bell placeholder, logout link.

##### SUBTASK EP-11-F03-T03-S03
`Breadcrumb` — auto-generated from route segments, custom label override prop.

---

#### BUG EP-11-F03-B01 — Modal does not trap focus — screen-reader users can tab outside

**Summary:** Keyboard users can Tab past the modal boundary into the background page content.
**Priority:** High | **Severity:** Major
**Steps to Reproduce:** Open any Edit modal → press Tab repeatedly → focus leaves modal after last field.
**Acceptance Criteria:**
- [ ] Focus cycles within modal while it is open.
- [ ] Focus returns to the triggering element on modal close.
- [ ] Tested with NVDA on Chrome.

---

#### BUG EP-11-F03-B02 — DatePicker in Edit modal shows UTC time instead of IST

**Summary:** `datetime` fields in the edit modal display the raw UTC value stored in DB rather than the IST-converted value.
**Priority:** High | **Severity:** Major
**Root Cause:** Modal pre-fill passes raw DB string directly to flatpickr without UTC→IST conversion.
**Steps to Reproduce:**
1. Upload a record with timestamp `2026-03-01 08:00:00 UTC`.
2. Open Edit modal — date field shows `2026-03-01 08:00` instead of `2026-03-01 13:30 IST`.

**Acceptance Criteria:**
- [ ] All `datetime` fields converted UTC→IST before being set as flatpickr's initial value.
- [ ] On Save, IST value is converted IST→UTC before API call.

---

### FEATURE EP-11-F04 — Full Page UI Implementation

**Summary:** Implement all application pages using the component library and design tokens.
**Priority:** High | **Story Points:** 21

#### TASK EP-11-F04-T01 — Auth pages implementation

**Story Points:** 3 | **Assignee:** Frontend Dev

##### SUBTASK EP-11-F04-T01-S01
Login page — form validation (required, email format), error banner, loading state on submit, redirect on success.

##### SUBTASK EP-11-F04-T01-S02
Register page — client-side + server-side validation, password strength indicator.

##### SUBTASK EP-11-F04-T01-S03
Password Reset request and confirmation pages.

---

#### TASK EP-11-F04-T02 — Dashboard page implementation

**Story Points:** 5 | **Assignee:** Frontend Dev

##### SUBTASK EP-11-F04-T02-S01
KPI cards — fetch `/api/dashboard/summary`; skeleton loader; error state.

##### SUBTASK EP-11-F04-T02-S02
Line chart using Chart.js — date range + module filter; responsive; dark/light theme.

##### SUBTASK EP-11-F04-T02-S03
Module breakdown table — sortable columns, delta badge color logic.

---

#### TASK EP-11-F04-T03 — Module data pages implementation (all 11)

**Story Points:** 8 | **Assignee:** Frontend Dev

##### SUBTASK EP-11-F04-T03-S01
Module page shell — route `/modules/[table]`; reads TABLE_CONFIG; renders DataTable with correct column defs.

##### SUBTASK EP-11-F04-T03-S02
Toolbar — search, date filter, status filter, page size; all state in URL query params for shareable links.

##### SUBTASK EP-11-F04-T03-S03
Upload modal — drag-and-drop zone, file type validation, progress bar, result summary (inserted / updated / errors).

##### SUBTASK EP-11-F04-T03-S04
Edit modal — dynamic form from column config; flatpickr for date/datetime; select for enum fields.

##### SUBTASK EP-11-F04-T03-S05
Bulk status update panel — selection counter, status dropdown, Apply button, confirmation step.

---

#### TASK EP-11-F04-T04 — Admin panel pages implementation

**Story Points:** 5 | **Assignee:** Frontend Dev

##### SUBTASK EP-11-F04-T04-S01
User Management page — CRUD user drawer, deactivate toggle with confirmation.

##### SUBTASK EP-11-F04-T04-S02
Module Permissions matrix — optimistic UI toggle with debounced save; error rollback on API failure.

##### SUBTASK EP-11-F04-T04-S03
API Token Management page — generate token modal, copy-to-clipboard, expiry countdown badge.

##### SUBTASK EP-11-F04-T04-S04
Activity Log page — virtualized table for large log sets; filter bar.

---

#### BUG EP-11-F04-B01 — Module page URL filters not restored on browser back

**Summary:** Navigating back from a record detail page resets all table filters to default.
**Priority:** Medium | **Severity:** Minor
**Root Cause:** Filter state stored in React state only — lost on unmount.
**Steps to Reproduce:**
1. Apply status filter "Open" + search "netflix" → click Edit on a row.
2. Press browser Back — filter and search are cleared.

**Acceptance Criteria:**
- [ ] All active filters (search, status, date range, page, page size) stored in URL query params.
- [ ] Navigating back restores exact filter state.

---

#### BUG EP-11-F04-B02 — Upload modal progress bar stays at 100% after error response

**Summary:** When the server returns a 400 validation error mid-upload, the progress bar shows 100% and the error message is hidden behind it.
**Priority:** Medium | **Severity:** Minor
**Acceptance Criteria:**
- [ ] On error response, progress bar resets to 0% and error message is displayed prominently.
- [ ] Upload modal has a distinct error state (red border, error icon, retry button).

---

---

## EPIC EP-01 — Data Integrity & Timezone

**EPIC ID:** EP-01
**Summary:** Ensure all data paths (upload, edit, bulk update, export, API) handle UTC↔IST conversion correctly with zero data loss.
**Priority:** Critical
**Sprint:** Sprint 2 & Sprint 4
**Status:** Partially Done

---

### FEATURE EP-01-F01 — UTC↔IST Conversion Hardening

**Summary:** Audit and harden every data path that touches date/datetime fields.
**Priority:** Critical | **Story Points:** 8

#### TASK EP-01-F01-T01 — Bulk Excel upload IST→UTC conversion

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-01-F01-T01-S01
Audit all 11 module upload handlers — confirm each `date` and `datetime` column is converted IST→UTC before INSERT.

##### SUBTASK EP-01-F01-T01-S02
Write a shared `parseISTtoUTC(value, fieldType)` utility used by all upload handlers; remove inline conversion code.

##### SUBTASK EP-01-F01-T01-S03
Add server-side rejection for dates outside valid range (1970–2050) with row-level error response.

---

#### TASK EP-01-F01-T02 — Bulk Update via Excel IST→UTC conversion

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-01-F01-T02-S01
Confirm Bulk Update route applies same `parseISTtoUTC` utility as single-upload route.

##### SUBTASK EP-01-F01-T02-S02
Return per-row error detail when a date field fails parsing (row number + column name + bad value).

---

#### TASK EP-01-F01-T03 — CSV Export UTC→IST conversion

**Story Points:** 2 | **Assignee:** Backend Dev

##### SUBTASK EP-01-F01-T03-S01
Audit CSV export route for all 11 modules — confirm every datetime column is converted UTC→IST in output.

##### SUBTASK EP-01-F01-T03-S02
Add column header suffix `(IST)` to all exported datetime columns.

---

#### BUG EP-01-F01-B01 — Bulk Update route skips IST→UTC conversion for `datetime` fields

**Summary:** The Bulk Update Excel handler converts `date` fields but sends `datetime` columns raw to MySQL, storing IST time as UTC.
**Priority:** Critical | **Severity:** Critical
**Root Cause:** Conversion utility only checks `field.type === 'date'`; misses `field.type === 'datetime'`.
**Steps to Reproduce:**
1. Export bulk-update template for `iptv_apps_internet`.
2. Fill `removal_timestamp` with `2026-03-01 14:30` (IST) → upload.
3. Query DB — `removal_timestamp` stored as `2026-03-01 14:30:00` (should be `2026-03-01 09:00:00 UTC`).

**Acceptance Criteria:**
- [ ] Both `date` and `datetime` fields converted IST→UTC in Bulk Update handler.
- [ ] Integration test: upload template with known IST datetime → verify UTC stored in DB.

---

#### BUG EP-01-F01-B02 — CSV export for `ads_tutorials_social_media` shows UTC datetime without IST conversion

**Summary:** `removal_timestamp` column in exported CSV shows UTC value instead of IST+5:30.
**Priority:** High | **Severity:** Major
**Root Cause:** Module's export route references an older export utility that predates the UTC→IST conversion refactor.
**Steps to Reproduce:**
1. Open Ads Tutorials - Social Media module → Export CSV.
2. Open CSV — `removal_timestamp` column shows UTC value.

**Acceptance Criteria:**
- [ ] All datetime columns in this module's CSV export show IST values.
- [ ] Column header reads `removal_timestamp (IST)`.

---

### FEATURE EP-01-F02 — ON DUPLICATE KEY UPDATE Logic

**Summary:** Ensure upsert logic is consistent across all modules and does not overwrite newer records with older data.
**Priority:** High | **Story Points:** 5

#### TASK EP-01-F02-T01 — Upsert strategy review

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-01-F02-T01-S01
Review all 11 module upload handlers — confirm `ON DUPLICATE KEY UPDATE` only updates non-null incoming values (no accidental null-overwrite).

##### SUBTASK EP-01-F02-T01-S02
Add `updated_at` timestamp update in every upsert so the last-modified time is always accurate.

##### SUBTASK EP-01-F02-T01-S03
Return upload summary: `{ inserted: N, updated: N, skipped: N, errors: [] }` for all modules.

---

#### TASK EP-01-F02-T02 — Duplicate detection report

**Story Points:** 2 | **Assignee:** Backend Dev

##### SUBTASK EP-01-F02-T02-S01
Add a dry-run mode to the upload endpoint (`?dryRun=true`) that returns what would be inserted vs updated without touching the DB.

---

#### BUG EP-01-F02-B01 — Upload overwrites existing `status` with null when status column is blank in Excel

**Summary:** Uploading an Excel file with a blank `status` cell sets the existing record's status to NULL in DB.
**Priority:** High | **Severity:** Major
**Root Cause:** `ON DUPLICATE KEY UPDATE status = VALUES(status)` — no null-guard on the incoming value.
**Acceptance Criteria:**
- [ ] Null/empty incoming value for `status` does NOT update the existing value.
- [ ] Only non-null, non-empty values trigger an update in the upsert.

---

---

## EPIC EP-03 — Dashboard & Analytics

**EPIC ID:** EP-03
**Summary:** Advanced filtering, drill-down, and real-time analytics dashboard across all 11 modules.
**Priority:** High
**Sprint:** Sprint 4
**Status:** Planned

---

### FEATURE EP-03-F01 — Analytics Dashboard Page

**Summary:** Build the main dashboard with KPI summary cards and trend charts.
**Priority:** High | **Story Points:** 8

#### TASK EP-03-F01-T01 — Dashboard API endpoints

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-03-F01-T01-S01
`GET /api/dashboard/summary` — returns total, open, removed, pending counts per module.

##### SUBTASK EP-03-F01-T01-S02
`GET /api/dashboard/trends` — accepts `from`, `to`, `module[]`; returns daily counts grouped by status.

##### SUBTASK EP-03-F01-T01-S03
`GET /api/dashboard/top-platforms` — top 10 platforms by incident count, filterable by module and date range.

---

#### TASK EP-03-F01-T02 — Dashboard UI widgets

**Story Points:** 5 | **Assignee:** Frontend Dev

##### SUBTASK EP-03-F01-T02-S01
KPI card component — metric name, current value, delta vs previous period (+ / - badge), sparkline.

##### SUBTASK EP-03-F01-T02-S02
Trend line chart — Chart.js, multi-series (one per status), dark/light theme, responsive.

##### SUBTASK EP-03-F01-T02-S03
Top platforms bar chart — horizontal bars, click-through to filtered module table.

##### SUBTASK EP-03-F01-T02-S04
Module summary table — rows per module, columns: total / open / removed / pending / this week / delta.

---

#### BUG EP-03-F01-B01 — Dashboard KPI totals do not respect user module permissions

**Summary:** Users without `can_view` on a module still see that module's counts in the KPI summary cards.
**Priority:** High | **Severity:** Major
**Root Cause:** `/api/dashboard/summary` queries all modules without checking `module_permissions` for the requesting user.
**Acceptance Criteria:**
- [ ] Summary endpoint filters module list against the requesting user's `can_view` permissions.
- [ ] Superadmin sees all modules; restricted users see only their permitted modules.

---

### FEATURE EP-03-F02 — Module-Level Analytics Drill-Down

**Summary:** Per-module analytics page with status breakdown, removal rate trend, and top pirate entities.
**Priority:** Medium | **Story Points:** 5

#### TASK EP-03-F02-T01 — Per-module analytics API

**Story Points:** 2 | **Assignee:** Backend Dev

##### SUBTASK EP-03-F02-T01-S01
`GET /api/analytics/[table]` — status distribution, weekly trend (last 12 weeks), top 5 pirate URLs/channels.

---

#### TASK EP-03-F02-T02 — Per-module analytics UI

**Story Points:** 3 | **Assignee:** Frontend Dev

##### SUBTASK EP-03-F02-T02-S01
Status donut chart — click slice to open pre-filtered module table.

##### SUBTASK EP-03-F02-T02-S02
Weekly trend bar chart — grouped by status, 12-week rolling window.

---

#### BUG EP-03-F02-B01 — Trend chart shows incorrect data when date range spans DST boundary

**Summary:** For date ranges crossing a Daylight Saving Time boundary, some daily buckets are doubled or missing.
**Priority:** Medium | **Severity:** Minor
**Root Cause:** Grouping done in JS using `new Date()` local time; server returns UTC dates; client timezone offset inconsistently applied.
**Acceptance Criteria:**
- [ ] All date grouping done server-side in UTC; client renders labels in IST.
- [ ] No duplicate or missing buckets for any 90-day range.

---

---

## EPIC EP-07 — Search & Discovery

**EPIC ID:** EP-07
**Summary:** Global full-text search across all 11 modules with relevance ranking, filters, and pagination.
**Priority:** High
**Sprint:** Sprint 2 & Sprint 4
**Status:** Planned

---

### FEATURE EP-07-F01 — Global Search Page

**Summary:** Single search interface to query all accessible modules simultaneously.
**Priority:** High | **Story Points:** 8

#### TASK EP-07-F01-T01 — Search API

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-07-F01-T01-S01
`GET /api/search?q=&modules[]=&status=&from=&to=&page=&limit=` — queries `titleCols` across selected modules; returns results grouped by module.

##### SUBTASK EP-07-F01-T01-S02
Add MySQL FULLTEXT indexes to `titleCols` for all 11 modules; fall back to `LIKE` if FULLTEXT not available.

##### SUBTASK EP-07-F01-T01-S03
Results include: `module`, `table`, `id (UUID)`, matched columns, `status`, `created_at (IST)`.

---

#### TASK EP-07-F01-T02 — Search UI

**Story Points:** 5 | **Assignee:** Frontend Dev

##### SUBTASK EP-07-F01-T02-S01
Global search bar in Topbar — keyboard shortcut `Ctrl+K` to open, `Esc` to close.

##### SUBTASK EP-07-F01-T02-S02
Search results page — grouped by module, highlight matched term, click result → navigate to module page with record pre-selected.

##### SUBTASK EP-07-F01-T02-S03
Filter sidebar — module multi-select, status filter, date range; updates results live with debounce.

---

#### BUG EP-07-F01-B01 — Search returns results from modules the user cannot view

**Summary:** Global search API returns records from modules where the requesting user's `can_view` is `false`.
**Priority:** Critical | **Severity:** Critical
**Root Cause:** Search route builds module list from all modules table without joining `module_permissions`.
**Steps to Reproduce:**
1. Login as a user with `can_view = false` for `social_media`.
2. Search for a keyword present only in `social_media` records.
3. Results include `social_media` rows.

**Acceptance Criteria:**
- [ ] Search route filters queried modules against requesting user's `can_view` permissions.
- [ ] Zero results returned for modules the user cannot view.

---

### FEATURE EP-07-F02 — Per-Column Debounced Filter Enhancement

**Summary:** Improve existing column filters with keyboard navigation, filter persistence, and clear-all.
**Priority:** Medium | **Story Points:** 5

#### TASK EP-07-F02-T01 — Filter UX improvements

**Story Points:** 3 | **Assignee:** Frontend Dev

##### SUBTASK EP-07-F02-T01-S01
Add clear (×) icon to every active column filter input.

##### SUBTASK EP-07-F02-T01-S02
"Clear all filters" button in toolbar — resets all column filters, search, status filter, and date range.

##### SUBTASK EP-07-F02-T01-S03
Active filter count badge on toolbar filter button when any filters are applied.

---

#### TASK EP-07-F02-T02 — Server-side filter API improvements

**Story Points:** 2 | **Assignee:** Backend Dev

##### SUBTASK EP-07-F02-T02-S01
Support `sort_by` and `sort_dir` query params in all module list endpoints.

##### SUBTASK EP-07-F02-T02-S02
Return `applied_filters` object in list API response for client reconciliation.

---

#### BUG EP-07-F02-B01 — Column filter ignores records where column value is NULL

**Summary:** Filtering by a column that has NULL values in DB never returns those rows even when search term matches other columns.
**Priority:** Low | **Severity:** Minor
**Acceptance Criteria:**
- [ ] NULL values are treated as empty string for filter matching purposes.
- [ ] Entering an empty string in a column filter shows all records including those with NULL in that column.

---

---

## EPIC EP-02 — Notifications & Alerting

**EPIC ID:** EP-02
**Summary:** Email and in-app notifications on status changes, report generation, upload completion, and scheduled alerts.
**Priority:** Medium
**Sprint:** Sprint 5
**Status:** Planned

---

### FEATURE EP-02-F01 — In-App Notification Centre

**Summary:** Bell icon notification centre in Topbar showing recent system events for the logged-in user.
**Priority:** High | **Story Points:** 8

#### TASK EP-02-F01-T01 — Notification data model & API

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-02-F01-T01-S01
Create `notifications` table: `id, user_id, type, title, body, link, is_read, created_at`.

##### SUBTASK EP-02-F01-T01-S02
`GET /api/notifications` — returns unread + last 20 read notifications for requesting user.

##### SUBTASK EP-02-F01-T01-S03
`PATCH /api/notifications/:id/read` and `PATCH /api/notifications/read-all`.

---

#### TASK EP-02-F01-T02 — Notification triggers

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-02-F01-T02-S01
Trigger notification on bulk upload complete: `"Upload complete — {N} inserted, {M} updated in {Module}"`.

##### SUBTASK EP-02-F01-T02-S02
Trigger notification on bulk status update: `"Status updated to {Status} for {N} records in {Module}"`.

##### SUBTASK EP-02-F01-T02-S03
Trigger notification on scheduled CSV export complete (EP-09).

---

#### TASK EP-02-F01-T03 — Notification centre UI

**Story Points:** 2 | **Assignee:** Frontend Dev

##### SUBTASK EP-02-F01-T03-S01
Bell icon with unread count badge (polling every 60 s or SSE).

##### SUBTASK EP-02-F01-T03-S02
Dropdown panel — notification list, unread highlighted, click → navigate to linked page + mark read.

##### SUBTASK EP-02-F01-T03-S03
"Mark all as read" button; empty state illustration.

---

#### BUG EP-02-F01-B01 — Notification bell count does not decrement after reading notifications

**Summary:** Unread badge count stays at old value after clicking "Mark all as read".
**Priority:** Medium | **Severity:** Minor
**Root Cause:** Client state not invalidated after PATCH `/read-all` response.
**Acceptance Criteria:**
- [ ] Badge count updates to 0 immediately on "Mark all as read" (optimistic update).
- [ ] Next poll confirms server count matches.

---

### FEATURE EP-02-F02 — Email Notification Service

**Summary:** Send transactional emails via SMTP for key events.
**Priority:** Medium | **Story Points:** 8

#### TASK EP-02-F02-T01 — Email service setup

**Story Points:** 2 | **Assignee:** Backend Dev

##### SUBTASK EP-02-F02-T01-S01
Add Nodemailer dependency; configure SMTP settings via env vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`).

##### SUBTASK EP-02-F02-T01-S02
Create `sendEmail(to, subject, htmlBody)` utility with retry (3 attempts, exponential back-off).

---

#### TASK EP-02-F02-T02 — Email templates

**Story Points:** 3 | **Assignee:** Frontend Dev

##### SUBTASK EP-02-F02-T02-S01
HTML email template: Upload Complete — summary table of inserted/updated/error rows per module.

##### SUBTASK EP-02-F02-T02-S02
HTML email template: Password Reset — reset link valid for 30 min.

##### SUBTASK EP-02-F02-T02-S03
HTML email template: Weekly Summary Report — module totals, top incidents table, link to dashboard.

---

#### TASK EP-02-F02-T03 — User email preferences

**Story Points:** 3 | **Assignee:** Full Stack Dev

##### SUBTASK EP-02-F02-T03-S01
Add `email_preferences` JSON column to `users` table: `{ upload_complete, status_change, weekly_report }`.

##### SUBTASK EP-02-F02-T03-S02
Email preferences UI in user Settings page — toggle per event type.

---

#### BUG EP-02-F02-B01 — Password reset email delivers expired link

**Summary:** Password reset emails sent more than 30 min after token generation contain a link that is already expired, but the email subject says "valid for 30 minutes" — no dispatch-time stamp included.
**Priority:** High | **Severity:** Major
**Root Cause:** Token TTL starts at creation time; email delivery can be delayed if SMTP queue is slow.
**Acceptance Criteria:**
- [ ] Email body states both the token expiry timestamp (IST) and a warning if the email is opened after expiry.
- [ ] Token TTL extended to 60 min; noted in email body.

---

---

## EPIC EP-04 — Security & Authentication

**EPIC ID:** EP-04
**Summary:** Password reset, OTP/2FA, rate limiting, session hardening, and permission enforcement across all routes.
**Priority:** Critical
**Sprint:** Sprint 2, Sprint 5 & Sprint 6
**Status:** Partially Done

---

### FEATURE EP-04-F01 — Password Reset Flow

**Summary:** Implement secure forgot-password and reset-password flow via email token.
**Priority:** Critical | **Story Points:** 5

#### TASK EP-04-F01-T01 — Backend: token generation & validation

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-04-F01-T01-S01
Create `password_resets` table: `id, user_id, token_hash (SHA-256), expires_at, used_at`.

##### SUBTASK EP-04-F01-T01-S02
`POST /api/auth/forgot-password` — generates token, stores SHA-256 hash, sends email, returns 200 regardless of whether email exists (prevents user enumeration).

##### SUBTASK EP-04-F01-T01-S03
`POST /api/auth/reset-password` — validates token hash + expiry; updates user password (SHA-256); marks token used.

---

#### TASK EP-04-F01-T02 — Frontend: Reset password UI

**Story Points:** 2 | **Assignee:** Frontend Dev

##### SUBTASK EP-04-F01-T02-S01
"Forgot password?" link on Login page → Request Reset form.

##### SUBTASK EP-04-F01-T02-S02
Reset Password form page — token read from URL query param; password + confirm-password; success → redirect to Login.

---

#### BUG EP-04-F01-B01 — Forgot-password endpoint reveals whether email is registered

**Summary:** `POST /api/auth/forgot-password` returns `404 User not found` when email does not exist — allows user enumeration.
**Priority:** Critical | **Severity:** Critical
**Acceptance Criteria:**
- [ ] Endpoint always returns `200 { message: "If this email is registered, a reset link has been sent." }`.
- [ ] No difference in response body or timing between registered and unregistered emails.

---

### FEATURE EP-04-F02 — Rate Limiting & Session Hardening

**Summary:** Protect all auth and data-mutation endpoints from brute-force and session hijacking.
**Priority:** Critical | **Story Points:** 8

#### TASK EP-04-F02-T01 — Rate limiting middleware

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-04-F02-T01-S01
Implement in-memory rate limiter (or Redis-backed for multi-instance): 5 login attempts per IP per 10 min → 429 response.

##### SUBTASK EP-04-F02-T01-S02
Rate limit `POST /api/auth/forgot-password`: 3 requests per email per hour.

##### SUBTASK EP-04-F02-T01-S03
Rate limit all data mutation routes (`POST`, `PATCH`, `DELETE`) per authenticated user: 200 req/min.

---

#### TASK EP-04-F02-T02 — Session hardening

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-04-F02-T02-S01
Set `SameSite=Strict` on session cookie.

##### SUBTASK EP-04-F02-T02-S02
Regenerate session ID on privilege escalation (e.g., switching from user to admin view).

##### SUBTASK EP-04-F02-T02-S03
Add `Secure` flag to session cookie when `NODE_ENV=production`.

---

#### TASK EP-04-F02-T03 — Permission 403 enforcement audit

**Story Points:** 2 | **Assignee:** Backend Dev

##### SUBTASK EP-04-F02-T03-S01
Audit all route handlers — ensure every data endpoint checks the requesting user's module permission before executing query.

##### SUBTASK EP-04-F02-T03-S02
Write middleware `requireModulePermission(table, action)` — reusable guard for all 11 module routes.

---

#### BUG EP-04-F02-B01 — Session cookie missing `Secure` flag in production

**Summary:** The HTTP-only session cookie is set without the `Secure` flag, allowing transmission over HTTP in production.
**Priority:** Critical | **Severity:** Critical
**Root Cause:** Cookie options hardcoded without `secure: process.env.NODE_ENV === 'production'`.
**Acceptance Criteria:**
- [ ] `Secure` flag applied when `NODE_ENV=production`.
- [ ] `SameSite=Strict` applied in all environments.

---

#### BUG EP-04-F02-B02 — Brute-force login possible — no lockout after failed attempts

**Summary:** The login endpoint has no rate limiting; an attacker can attempt unlimited passwords.
**Priority:** Critical | **Severity:** Critical
**Acceptance Criteria:**
- [ ] After 5 failed attempts from the same IP within 10 min, endpoint returns 429 with `Retry-After` header.
- [ ] Failed attempts logged to `user_activity_log`.

---

---

## EPIC EP-05 — API Hardening

**EPIC ID:** EP-05
**Summary:** Rate limiting, versioning strategy, documentation completeness, and REST API v1 stability.
**Priority:** High
**Sprint:** Sprint 6
**Status:** Planned

---

### FEATURE EP-05-F01 — API Rate Limiting & Token Abuse Prevention

**Summary:** Protect the public REST API from abuse with per-token rate limits and usage analytics.
**Priority:** Critical | **Story Points:** 5

#### TASK EP-05-F01-T01 — Per-token rate limiting

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-05-F01-T01-S01
Rate limit: 1000 requests per token per hour; return `429` with `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers.

##### SUBTASK EP-05-F01-T01-S02
Store rate limit counters in Redis (or in-memory with sliding window) keyed by `token_id`.

##### SUBTASK EP-05-F01-T01-S03
Admin UI shows per-token request count for the current hour alongside existing `last_used` display.

---

#### TASK EP-05-F01-T02 — API token usage analytics

**Story Points:** 2 | **Assignee:** Backend Dev

##### SUBTASK EP-05-F01-T02-S01
`api_token_usage` table already exists — add `response_time_ms` and `status_code` columns.

##### SUBTASK EP-05-F01-T02-S02
Admin API Token page — usage graph (requests per day, last 30 days) per token.

---

#### BUG EP-05-F01-B01 — Expired API token returns 200 instead of 401

**Summary:** A token past its `expires_at` date still authenticates successfully and returns data.
**Priority:** Critical | **Severity:** Critical
**Root Cause:** Token validation query only checks `is_active = 1`; does not check `expires_at`.
**Steps to Reproduce:**
1. Generate token with expiry 1 day ago.
2. Call `GET /api/v1/modules` with that token — returns 200 with data.

**Acceptance Criteria:**
- [ ] Token validation query: `WHERE token_hash = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())`.
- [ ] Returns `401 { error: "Token expired" }` for expired tokens.

---

### FEATURE EP-05-F02 — API Versioning & Deprecation Strategy

**Summary:** Define and implement a forward-compatible API versioning strategy for v1 and future v2.
**Priority:** High | **Story Points:** 5

#### TASK EP-05-F02-T01 — Versioning implementation

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-05-F02-T01-S01
Add `X-API-Version` response header to all `/api/v1/*` responses.

##### SUBTASK EP-05-F02-T01-S02
Document deprecation policy: 6-month notice period, `Deprecation` and `Sunset` response headers.

##### SUBTASK EP-05-F02-T01-S03
Create `/api/v1/health` endpoint returning `{ status: "ok", version: "1.0", uptime_s }`.

---

#### TASK EP-05-F02-T02 — API documentation completeness audit

**Story Points:** 2 | **Assignee:** Tech Writer / Dev

##### SUBTASK EP-05-F02-T02-S01
Verify `/api-docs` page covers all 9 API-accessible modules with correct field lists.

##### SUBTASK EP-05-F02-T02-S02
Add error response examples (400, 401, 429, 500) to every endpoint card on `/api-docs`.

---

#### BUG EP-05-F02-B01 — `/api/v1/[table]` returns 500 on unknown table name instead of 404

**Summary:** Requesting a non-existent table (e.g., `/api/v1/fake_table`) throws an unhandled exception and returns 500.
**Priority:** High | **Severity:** Major
**Acceptance Criteria:**
- [ ] Unknown table name returns `404 { error: "Module not found or not API-accessible" }`.
- [ ] No stack trace leaked in response body.

---

---

## EPIC EP-06 — Audit & Compliance

**EPIC ID:** EP-06
**Summary:** Full audit trail, record history (before/after values), data retention policy, and archival.
**Priority:** High
**Sprint:** Sprint 2 & Sprint 4
**Status:** Planned

---

### FEATURE EP-06-F01 — Record Change History

**Summary:** Log before/after values for every edit and status change, viewable per record.
**Priority:** High | **Story Points:** 8

#### TASK EP-06-F01-T01 — Change history data model

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-06-F01-T01-S01
Create `record_change_history` table: `id, module_table, record_uuid, user_id, action (edit|status|delete), changed_fields JSON, changed_at`.

##### SUBTASK EP-06-F01-T01-S02
`changed_fields` stores `{ field: { before, after } }` object for each changed column.

##### SUBTASK EP-06-F01-T01-S03
Write to `record_change_history` in all edit, bulk-status-update, and delete handlers.

---

#### TASK EP-06-F01-T02 — Change history UI

**Story Points:** 5 | **Assignee:** Frontend Dev

##### SUBTASK EP-06-F01-T02-S01
"History" icon/button in each table row → opens History drawer.

##### SUBTASK EP-06-F01-T02-S02
History drawer — chronological list of changes: timestamp (IST), user, action, changed fields (before → after).

##### SUBTASK EP-06-F01-T02-S03
Admin Activity Log enhanced — link from log entry to the specific record's history drawer.

---

#### BUG EP-06-F01-B01 — Activity log truncates user action detail after 255 characters

**Summary:** The `action_detail` column in `user_activity_log` is `VARCHAR(255)`; bulk upload summaries are silently truncated.
**Priority:** Medium | **Severity:** Minor
**Root Cause:** Column type too small for detailed upload summaries (can be 500+ chars).
**Acceptance Criteria:**
- [ ] `action_detail` column changed to `TEXT`.
- [ ] Migration script provided; zero data loss for existing rows.

---

### FEATURE EP-06-F02 — Data Retention & Archival Policy

**Summary:** Implement configurable data retention rules and an archival export for old records.
**Priority:** Medium | **Story Points:** 5

#### TASK EP-06-F02-T01 — Retention policy configuration

**Story Points:** 2 | **Assignee:** Backend Dev

##### SUBTASK EP-06-F02-T01-S01
Admin panel — "Data Retention" section: per-module retention period (months), archival action (archive vs hard-delete).

##### SUBTASK EP-06-F02-T01-S02
Store retention config in `system_settings` table as JSON.

---

#### TASK EP-06-F02-T02 — Archival job

**Story Points:** 3 | **Assignee:** Backend Dev

##### SUBTASK EP-06-F02-T02-S01
Scheduled job (EP-09): move records older than retention period to `{table}_archive` table.

##### SUBTASK EP-06-F02-T02-S02
Admin panel — "Run Archive Now" manual trigger with confirmation modal.

##### SUBTASK EP-06-F02-T02-S03
Archived records excluded from all module list queries, searches, and analytics by default; "Include archived" toggle in admin.

---

#### BUG EP-06-F02-B01 — Hard-delete does not write to activity log

**Summary:** When a record is deleted via the Delete button, no entry is created in `user_activity_log`.
**Priority:** High | **Severity:** Major
**Root Cause:** Delete API handler missing `logActivity()` call.
**Acceptance Criteria:**
- [ ] Every DELETE action logs: user, module, record UUID, action `"delete"`, timestamp.
- [ ] Confirmed for all 11 module delete handlers.

---

---

## EPIC EP-08 — Mobile & UX

**EPIC ID:** EP-08
**Summary:** Full responsive design for all pages (tablet + mobile), UX polish, and accessibility (WCAG 2.1 AA).
**Priority:** Medium
**Sprint:** Sprint 7
**Status:** Planned

---

### FEATURE EP-08-F01 — Responsive Layout

**Summary:** Make all pages fully functional on tablet (768px) and mobile (375px) viewports.
**Priority:** High | **Story Points:** 8

#### TASK EP-08-F01-T01 — Responsive Sidebar & Navigation

**Story Points:** 3 | **Assignee:** Frontend Dev

##### SUBTASK EP-08-F01-T01-S01
Sidebar collapses to off-canvas drawer on screens < 768px; hamburger toggle in Topbar.

##### SUBTASK EP-08-F01-T01-S02
Topbar adapts — hide non-critical items below 480px; collapse to icon-only above 768px.

---

#### TASK EP-08-F01-T02 — Responsive Data Table

**Story Points:** 5 | **Assignee:** Frontend Dev

##### SUBTASK EP-08-F01-T02-S01
Horizontal scroll wrapper on tables below 768px — sticky first column (checkbox + title).

##### SUBTASK EP-08-F01-T02-S02
Card view toggle for mobile — each record rendered as a card instead of a table row below 480px.

##### SUBTASK EP-08-F01-T02-S03
Touch-friendly row actions — swipe-left reveals Edit / Delete actions on mobile.

---

#### BUG EP-08-F01-B01 — Edit modal overflows viewport on mobile screens

**Summary:** The Edit modal is wider than 375px viewport; horizontal scroll appears inside the modal.
**Priority:** High | **Severity:** Major
**Acceptance Criteria:**
- [ ] Modal max-width capped at `min(720px, 100vw - 32px)`.
- [ ] All form fields stack vertically on < 480px.

---

### FEATURE EP-08-F02 — Accessibility (WCAG 2.1 AA)

**Summary:** Meet WCAG 2.1 AA for all pages — keyboard navigation, colour contrast, ARIA labels.
**Priority:** Medium | **Story Points:** 5

#### TASK EP-08-F02-T01 — Colour contrast audit

**Story Points:** 2 | **Assignee:** UI Lead

##### SUBTASK EP-08-F02-T01-S01
Run automated contrast audit (axe-core) on all pages in dark and light mode.

##### SUBTASK EP-08-F02-T01-S02
Fix all contrast failures — minimum 4.5:1 for body text, 3:1 for large text and UI components.

---

#### TASK EP-08-F02-T02 — Keyboard navigation & ARIA

**Story Points:** 3 | **Assignee:** Frontend Dev

##### SUBTASK EP-08-F02-T02-S01
All interactive elements reachable and operable by keyboard; visible focus ring on all focusable elements.

##### SUBTASK EP-08-F02-T02-S02
Tables: `role="grid"`, `aria-sort` on sortable columns, `aria-label` on action icon buttons.

##### SUBTASK EP-08-F02-T02-S03
Modals: `role="dialog"`, `aria-labelledby`, `aria-describedby`, focus trap (see EP-11-F03-B01).

---

#### BUG EP-08-F02-B01 — Status badge colours fail AA contrast in light mode

**Summary:** "Open" (yellow text on white) and "Pending" (blue on light-grey) badge variants fail 4.5:1 contrast ratio in light mode.
**Priority:** High | **Severity:** Major
**Acceptance Criteria:**
- [ ] All badge variants pass 4.5:1 contrast ratio in both dark and light mode.
- [ ] Contrast values documented in the style guide.

---

---

## EPIC EP-09 — Automation & Scheduling

**EPIC ID:** EP-09
**Summary:** Scheduled CSV exports, email delivery of reports, and CI/CD pipeline automation.
**Priority:** Medium
**Sprint:** Sprint 7
**Status:** Planned

---

### FEATURE EP-09-F01 — Scheduled CSV Export

**Summary:** Users can schedule recurring CSV exports (daily/weekly/monthly) delivered by email.
**Priority:** Medium | **Story Points:** 8

#### TASK EP-09-F01-T01 — Schedule configuration UI

**Story Points:** 3 | **Assignee:** Frontend Dev

##### SUBTASK EP-09-F01-T01-S01
"Schedule Export" button in module toolbar → drawer with: frequency (daily/weekly/monthly), time (IST), recipient email(s), format (CSV), active toggle.

##### SUBTASK EP-09-F01-T01-S02
List of active schedules in Admin Panel → Scheduled Exports section.

---

#### TASK EP-09-F01-T02 — Schedule execution engine

**Story Points:** 5 | **Assignee:** Backend Dev

##### SUBTASK EP-09-F01-T02-S01
Create `export_schedules` table: `id, user_id, module_table, frequency, run_at_time, last_run_at, recipients JSON, is_active`.

##### SUBTASK EP-09-F01-T02-S02
Cron job (node-cron) checks `export_schedules` every minute; triggers due exports; marks `last_run_at`.

##### SUBTASK EP-09-F01-T02-S03
Generates CSV (reusing existing export logic); attaches to email via Nodemailer; logs to `notifications` table.

---

#### BUG EP-09-F01-B01 — Scheduled export cron fires twice when two PM2 instances are running

**Summary:** With 2 PM2 cluster instances, the cron job fires twice → duplicate emails sent.
**Priority:** High | **Severity:** Major
**Root Cause:** `node-cron` runs in every process; no distributed lock.
**Acceptance Criteria:**
- [ ] Distributed lock (Redis or DB row-level lock on `export_schedules.is_running`) prevents concurrent execution.
- [ ] Only one email per scheduled run regardless of instance count.

---

### FEATURE EP-09-F02 — CI/CD Pipeline

**Summary:** Automated build, lint, test, and deployment pipeline.
**Priority:** Medium | **Story Points:** 5

#### TASK EP-09-F02-T01 — GitHub Actions pipeline

**Story Points:** 3 | **Assignee:** DevOps

##### SUBTASK EP-09-F02-T01-S01
`ci.yml` workflow — triggers on PR to `main`: install (pnpm), lint (ESLint), build (`next build`), unit tests.

##### SUBTASK EP-09-F02-T01-S02
`deploy.yml` workflow — triggers on push to `main`: SSH to Ubuntu server, `git pull`, `pnpm install`, `pnpm build`, `pm2 reload pms`.

##### SUBTASK EP-09-F02-T01-S03
Deployment status notification to Slack channel on success/failure.

---

#### TASK EP-09-F02-T02 — Environment & secrets management

**Story Points:** 2 | **Assignee:** DevOps

##### SUBTASK EP-09-F02-T02-S01
Document all required env vars in `.env.example`; add validation on app startup (throw if required var missing).

##### SUBTASK EP-09-F02-T02-S02
Store all secrets in GitHub Actions Secrets; never commit `.env` to repo.

---

#### BUG EP-09-F02-B01 — `pnpm build` fails silently in CI when MySQL env vars are not set

**Summary:** The Next.js build succeeds with exit code 0 even when `DB_HOST` is not set, but the deployed app crashes on first request.
**Priority:** High | **Severity:** Major
**Root Cause:** DB connection is lazy; not established at build time.
**Acceptance Criteria:**
- [ ] Add a build-time env var validation step before `next build` in CI.
- [ ] CI fails with a clear error if required vars are missing.

---

---

## EPIC EP-10 — Testing & Quality

**EPIC ID:** EP-10
**Summary:** Unit tests, integration tests, end-to-end tests, and a pre-launch deployment checklist.
**Priority:** High
**Sprint:** Sprint 6 & Sprint 7
**Status:** Planned

---

### FEATURE EP-10-F01 — Unit & Integration Tests

**Summary:** Test all utility functions, API route handlers, and critical business logic paths.
**Priority:** High | **Story Points:** 8

#### TASK EP-10-F01-T01 — Test infrastructure setup

**Story Points:** 2 | **Assignee:** QA / Dev

##### SUBTASK EP-10-F01-T01-S01
Add Jest + `@testing-library/react` to dev dependencies; configure `jest.config.js` for Next.js App Router.

##### SUBTASK EP-10-F01-T01-S02
Set up test database (`pms_test`) with schema migrations; add `DB_HOST_TEST` env var.

---

#### TASK EP-10-F01-T02 — Unit tests for utility functions

**Story Points:** 3 | **Assignee:** Dev

##### SUBTASK EP-10-F01-T02-S01
`parseISTtoUTC` — test: normal datetime, date-only, null, invalid string, boundary at midnight, DST edge case.

##### SUBTASK EP-10-F01-T02-S02
`formatUTCtoIST` — test: same cases; verify +5:30 offset.

##### SUBTASK EP-10-F01-T02-S03
UUID generation — test: format `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`, uniqueness across 10,000 calls.

---

#### TASK EP-10-F01-T03 — Integration tests for critical API routes

**Story Points:** 3 | **Assignee:** Dev

##### SUBTASK EP-10-F01-T03-S01
`POST /api/auth/login` — correct password → session cookie set; wrong password → 401; rate limit → 429.

##### SUBTASK EP-10-F01-T03-S02
`POST /api/[table]/upload` — valid Excel → correct insert count; duplicate URL → upsert; datetime columns stored as UTC.

##### SUBTASK EP-10-F01-T03-S03
`GET /api/v1/[table]` — valid token → data; expired token → 401; missing token → 401; unknown table → 404.

---

#### BUG EP-10-F01-B01 — Jest config does not transform `xlsx` package — tests crash on import

**Summary:** `import * as XLSX from 'xlsx'` in upload handler causes Jest to crash with `SyntaxError: Cannot use import statement outside a module`.
**Priority:** Medium | **Severity:** Minor
**Root Cause:** `xlsx` ESM build not included in Jest `transformIgnorePatterns`.
**Acceptance Criteria:**
- [ ] `xlsx` added to `transformIgnorePatterns` exclusion list in `jest.config.js`.
- [ ] Upload handler unit tests run successfully.

---

### FEATURE EP-10-F02 — End-to-End Tests (Playwright)

**Summary:** Critical user journeys automated via Playwright.
**Priority:** High | **Story Points:** 8

#### TASK EP-10-F02-T01 — E2E test setup

**Story Points:** 2 | **Assignee:** QA

##### SUBTASK EP-10-F02-T01-S01
Install Playwright; configure `playwright.config.ts` — base URL, test user credentials from env, screenshot on failure.

##### SUBTASK EP-10-F02-T01-S02
Seed script: creates test user (admin), test module records, test API token before each test suite.

---

#### TASK EP-10-F02-T02 — Critical journey E2E tests

**Story Points:** 6 | **Assignee:** QA

##### SUBTASK EP-10-F02-T02-S01
**Journey 1 — Login:** Navigate to `/` → redirect to `/login`; login with valid credentials → redirect to dashboard; verify KPI cards render.

##### SUBTASK EP-10-F02-T02-S02
**Journey 2 — Upload:** Open Social Media module → click Upload → select valid Excel → verify success toast and row count increase.

##### SUBTASK EP-10-F02-T02-S03
**Journey 3 — Edit record:** Click Edit on first row → change status → Save → verify updated status in table row.

##### SUBTASK EP-10-F02-T02-S04
**Journey 4 — CSV Export:** Apply date filter → click Export → verify downloaded CSV has correct column headers and IST datetime values.

##### SUBTASK EP-10-F02-T02-S05
**Journey 5 — API token:** Admin → API Token Management → Generate token → copy token → call `/api/v1/modules` with token in Playwright fetch → verify 200.

---

#### BUG EP-10-F02-B01 — Playwright tests intermittently fail on CI due to race condition in upload test

**Summary:** Upload E2E test fails ~20% of the time with "Toast not found" — the success toast appears and disappears before assertion.
**Priority:** Medium | **Severity:** Minor
**Root Cause:** Default toast auto-dismiss is 3 s; CI machines are slow; Playwright assertion fires after toast disappears.
**Acceptance Criteria:**
- [ ] Use `waitForSelector` with a longer timeout (8 s) for toast in E2E upload test.
- [ ] Or: increase toast duration to 8 s in test environment via env flag.

---

### FEATURE EP-10-F03 — Pre-Launch Deployment Checklist

**Summary:** A tracked deployment checklist covering all critical production readiness items.
**Priority:** Critical | **Story Points:** 3

#### TASK EP-10-F03-T01 — Production readiness checklist

**Story Points:** 3 | **Assignee:** Tech Lead

##### SUBTASK EP-10-F03-T01-S01
Environment — all required env vars set; `.env` not in repo; `NODE_ENV=production`.

##### SUBTASK EP-10-F03-T01-S02
Security — HTTPS enforced; session cookie `Secure + HttpOnly + SameSite=Strict`; rate limiting active; no stack traces in API responses.

##### SUBTASK EP-10-F03-T01-S03
Database — all indexes verified; connection pool size tuned; DB backup cron active.

##### SUBTASK EP-10-F03-T01-S04
Performance — `next build` output <500 KB per page; no console errors/warnings in production build.

##### SUBTASK EP-10-F03-T01-S05
Monitoring — PM2 `ecosystem.config.js` with restart policy; error logging to file; uptime check configured.

---

#### BUG EP-10-F03-B01 — Production `next build` includes source maps — leaks internal file paths

**Summary:** The production build ships `.js.map` files exposing internal Next.js route handler file paths.
**Priority:** High | **Severity:** Major
**Root Cause:** `productionBrowserSourceMaps` not explicitly disabled in `next.config.js`.
**Acceptance Criteria:**
- [ ] `productionBrowserSourceMaps: false` set in `next.config.js`.
- [ ] Verified: no `.map` files in `.next/static/chunks/` after production build.

---

---

## Summary Table

| EPIC | Features | Tasks | Subtasks | Bugs |
|------|----------|-------|----------|------|
| EP-11 Design UI | 4 | 14 | 39 | 8 |
| EP-01 Data Integrity | 2 | 5 | 13 | 3 |
| EP-03 Dashboard | 2 | 4 | 10 | 2 |
| EP-07 Search | 2 | 4 | 10 | 2 |
| EP-02 Notifications | 2 | 6 | 14 | 2 |
| EP-04 Security & Auth | 2 | 5 | 12 | 4 |
| EP-05 API Hardening | 2 | 4 | 9 | 2 |
| EP-06 Audit & Compliance | 2 | 4 | 9 | 2 |
| EP-08 Mobile & UX | 2 | 4 | 9 | 2 |
| EP-09 Automation | 2 | 4 | 9 | 2 |
| EP-10 Testing & Quality | 3 | 7 | 19 | 3 |
| **TOTAL** | **27** | **61** | **153** | **32** |

---

*End of JIRA Update Plan — Piracy Monitoring System (PMS)*
