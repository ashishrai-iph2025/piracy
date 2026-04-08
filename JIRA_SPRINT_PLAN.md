# JIRA Sprint Plan — Piracy Monitoring System

**Project Key:** PMS
**Document Version:** 3.0
**Created:** 2026-03-14
**Last Updated:** 2026-03-26
**Platform:** Next.js 14 Web Application (App Router)
**Sprint Duration:** 2 weeks per sprint
**Total Sprints:** 7 planned + Backlog

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Modules](#3-modules)
4. [Completed Features — Baseline](#4-completed-features--baseline)
5. [Bugs Fixed](#5-bugs-fixed)
6. [Epics](#6-epics)
7. [Sprint Roadmap](#7-sprint-roadmap)
8. [Sprint 1 — Design System & UI Foundation](#8-sprint-1--design-system--ui-foundation)
9. [Sprint 2 — Stability & Critical Fixes](#9-sprint-2--stability--critical-fixes)
10. [Sprint 3 — UI Implementation](#10-sprint-3--ui-implementation)
11. [Sprint 4 — Data Integrity & Search](#11-sprint-4--data-integrity--search)
12. [Sprint 5 — Notifications & Auth Flows](#12-sprint-5--notifications--auth-flows)
13. [Sprint 6 — Security & API Hardening](#13-sprint-6--security--api-hardening)
14. [Sprint 7 — Mobile, Automation & Launch](#14-sprint-7--mobile-automation--launch)
15. [Backlog](#15-backlog)
16. [Definition of Done](#16-definition-of-done)

---

## 1. Project Overview

The **Piracy Monitoring System (PMS)** is a Next.js 14 web application for tracking, reporting, and managing online piracy incidents across 11 content modules. Authorized staff can ingest piracy data via bulk Excel uploads, manage records through a full CRUD interface, generate analytical reports, export data as CSV, and expose data via a versioned REST API — all governed by role-based access control per module and per user.

---

## 2. Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 — App Router, `'use client'` / `'use server'` components |
| UI | React 18, custom CSS variables (`globals.css`) — no Tailwind |
| Icons | Font Awesome 6 (CDN) |
| Date Picker | flatpickr 4.6 — dark-themed, IST-aware |
| Excel | SheetJS (`xlsx`) — template generation and upload parsing |
| Backend | Next.js Route Handlers (REST) |
| Database | MySQL 8 — `mysql2/promise` pool, `dateStrings: true` |
| Authentication | SHA-256 password hashing, 30-min HTTP-only cookie sessions |
| External API | REST API v1 — Bearer token auth via `api_tokens` table |
| Timezone | UTC stored in DB at all times; IST (Asia/Kolkata, UTC+5:30) for all UI, export, and user input |
| Package Manager | pnpm |
| Deployment | Ubuntu Linux — `pnpm run build` + PM2 or systemd |

---

## 3. Modules

| # | Module Name | DB Table | API Accessible |
|---|-------------|----------|----------------|
| 1 | Social Media | `social_media` | No |
| 2 | Marketplace | `marketplace` | No |
| 3 | Unauthorized Search Result | `unauthorized_search_result` | Yes |
| 4 | Ads Tutorials - Social Media | `ads_tutorials_social_media` | Yes |
| 5 | Password Sharing - Social Media | `password_sharing_social_media` | Yes |
| 6 | Password Sharing - Marketplace | `password_sharing_marketplace` | Yes |
| 7 | IPTV & Apps - Internet | `iptv_apps_internet` | Yes |
| 8 | IPTV & Apps - Apps | `iptv_apps_apps` | Yes |
| 9 | IPTV & Apps - Social Media | `iptv_apps_social_media` | Yes |
| 10 | IPTV & Apps - Marketplace | `iptv_apps_marketplace` | Yes |
| 11 | IPTV & Apps - Meta Ads | `iptv_apps_meta_ads` | Yes |

---

## 4. Completed Features — Baseline

### Authentication & Users
- Login / Register / Session management (30-min cookie, auto-refresh on activity)
- SHA-256 password hashing
- Per-user theme: 12 accent colors, dark / light / auto mode, custom hex color picker
- User activity log (login, logout, all CRUD actions)

### Data Management (all 11 modules)
- Bulk Excel upload with `ON DUPLICATE KEY UPDATE` on unique URL column
- IST → UTC conversion on all date/datetime fields during upload and single-record edit
- UTC → IST conversion on all display, CSV export, and edit modal pre-fill
- Single-record inline edit modal — flatpickr calendar for date/datetime fields
- Single-record delete with confirmation modal
- Bulk status update — multi-select rows, apply a new status to all selected
- Bulk Update via Excel template — upload filled template to update existing records by UUID
- CSV export — filtered, UTC → IST converted, configurable date range
- Per-column text filter with debounced search
- Pagination with configurable page sizes: 15, 25, 50, 100

### Upload Templates
- Per-module upload template (`?type=upload`) — sheetConfig-ordered columns, styled headers, format hint row
- Per-module bulk-update template (`?type=update`) — `id` (UUID) first column, then all data columns
- Saved template column configuration (order + visibility) per sheet and template type
- Instructions sheet embedded in every generated Excel file

### Admin Panel
- **User Management** — create, edit, deactivate; role assignment (superadmin / admin / user)
- **Module Permissions** — per-user can_view / can_upload / can_edit / can_delete toggles per module
- **Panel Permissions** — per-user access control for each admin panel section
- **Custom Columns** — configure extra columns per module from admin UI
- **API Token Management** — generate, name, set expiry, deactivate, copy, view last-used
- **API Playground** — interactive request builder; Table / JSON toggle; live Field Reference panel
- **DB Optimize** — index analysis and optimization trigger
- **Activity Log viewer** — filter by user and action type

### REST API v1
- `GET /api/v1/modules` — returns `{ name, table, endpoint }` per accessible module
- `GET /api/v1/[table]` — paginated records; params: `date_from`, `date_to`, `title`, `page`, `limit` (max 1000)
- Response format: `{ success, table, total, page, pages, limit, filters, data[] }`
- Columns selected exactly from sheetConfig — no extra DB-internal columns exposed
- Bearer token auth; token usage logged to `api_token_usage` table

### API Documentation Page (`/api-docs`)
- Full public-facing API reference: endpoint cards, parameter tables, response examples for all 9 modules
- Authentication instructions and token generation guide

---

## 5. Bugs Fixed

| # | Bug Description | Root Cause | Fix Applied |
|---|-----------------|------------|-------------|
| 1 | Edit modal date/datetime fields always empty | MySQL2 returns `Date` objects; `String(Date)` produces unparseable locale strings | Added `dateStrings: true` to MySQL2 pool config |
| 2 | API response included extra columns not in Field Reference | Route used `SELECT *` — returned all DB columns | Switched to `SELECT id, col1…` built from `SHEET_CONFIG` columns |
| 3 | `removal_status` / `removal_date` wrongly in IPTV API responses | Incorrectly added to sheetConfig | Reverted; only `removal_timestamp` retained where applicable |
| 4 | `removal_timestamp` / `delisting_timestamp_*` stripped from API | `'_timestamp'` in `STRIP_SUFFIX` array | Removed `'_timestamp'`; suffix strip now only covers `'_hash'` |
| 5 | Wrong `titleCols` in TABLE_CONFIG for `ads_tutorials_social_media` | Referenced non-existent `title` column | Fixed to `channel_page_profile_name`, `pirate_brand`, `platform_name` |
| 6 | `/api/v1/modules` returned raw display labels (e.g., "Password Sharing-Social Med.") | Route returned `m.name` directly from DB modules table | Returns `{ name, table, endpoint }` objects; non-API modules filtered out |
| 7 | Variable conflict: `let modules` redeclared in modules route | Unused `let modules` from original code conflicted with new `const modules` | Removed unused declaration |
| 8 | MySQL too-many-connections in development hot-reload | New pool created on every hot-reload | Global pool singleton via `global._mysqlPool` |
| 9 | Hydration error on login page | SSR/CSR mismatch on theme-dependent component | Dynamic import with `ssr: false` |
| 10 | Theme bleeding between users | Shared localStorage key | Per-user localStorage keys + server-side theme authority |

---

## 6. Epics

| Epic ID | Epic Name | Description |
|---------|-----------|-------------|
| EP-01 | Data Integrity & Timezone | All data paths (upload, edit, bulk update, export) handle UTC↔IST correctly |
| EP-02 | Notifications & Alerting | Email and in-app notifications on status changes and report generation |
| EP-03 | Dashboard & Analytics | Advanced filtering, drill-down, and real-time analytics across all 11 modules |
| EP-04 | Security & Authentication | Password reset, 2FA/OTP, rate limiting, session hardening |
| EP-05 | API Hardening | Rate limiting, versioning, documentation, and REST API v1 stability |
| EP-06 | Audit & Compliance | Audit trail, record history, data retention, and archival policy |
| EP-07 | Search & Discovery | Global search across all modules with filters, pagination, relevance |
| EP-08 | Mobile & UX | Responsive design, UX polish, accessibility |
| EP-09 | Automation & Scheduling | Scheduled exports, email delivery, CI/CD pipeline |
| EP-10 | Testing & Quality | Unit tests, integration tests, end-to-end tests, deployment checklist |
| EP-11 | Design UI for the PMS | Design system, wireframes, component library, and full UI implementation |

---

## 7. Sprint Roadmap

| Sprint | Name | Dates | Epics | Points | Status |
|--------|------|-------|-------|--------|--------|
| Sprint 1 | Design System & UI Foundation | 2026-03-30 → 2026-04-10 | EP-11 | 29 | Planned |
| Sprint 2 | Stability & Critical Fixes | 2026-04-13 → 2026-04-24 | EP-01, EP-04, EP-06, EP-07 | 19 | Planned |
| Sprint 3 | UI Implementation | 2026-04-27 → 2026-05-08 | EP-11 | 47 | Planned |
| Sprint 4 | Data Integrity & Search | 2026-05-11 → 2026-05-22 | EP-01, EP-03, EP-06, EP-07 | 21 | Planned |
| Sprint 5 | Notifications & Auth Flows | 2026-05-25 → 2026-06-05 | EP-02, EP-04 | 21 | Planned |
| Sprint 6 | Security & API Hardening | 2026-06-09 → 2026-06-20 | EP-04, EP-05, EP-10 | 26 | Planned |
| Sprint 7 | Mobile, Automation & Launch | 2026-06-23 → 2026-07-04 | EP-08, EP-09, EP-10 | 29 | Planned |

> **Currently in progress (pre-Sprint 1):** Sprint 0 bug-fix window (2026-03-16 → 2026-03-27) — US-001 IST/UTC bulk update fix (DONE), US-004 permission 403 hardening (DONE).

---

## 8. Sprint 1 — Design System & UI Foundation

**Sprint Dates:** 2026-03-30 → 2026-04-10
**Sprint Goal:** Establish the full design system (tokens, typography, spacing, color) and produce wireframes and component specs for every page in the application — so Sprint 3 implementation has zero design ambiguity.
**Epic:** EP-11 — Design UI for the PMS
**Total Points:** 29

---

### US-052 — Design Token System & Style Guide

**Story Points:** 8 | **Priority:** Critical

**User Story:**
As a frontend developer, I want a fully documented design token system so that every color, spacing, font, and border value is named, versioned, and applied consistently across all pages.

**Step 1 — Audit & Document Existing Tokens**
- [ ] ST-052-1: Export all CSS custom properties from `globals.css` into a reference table — name, dark-mode value, light-mode value, usage context
- [ ] ST-052-2: Identify and document all unnamed or magic values in the codebase (hardcoded `#hex`, raw `px` values not on the grid)
- [ ] ST-052-3: Define typography scale — name each role (`page-title`, `section-heading`, `body`, `label`, `caption`, `monospace`) with font-size, weight, and line-height

**Step 2 — Define & Formalise Token Set**
- [ ] ST-052-4: Define spacing scale on 4px base grid — document all steps: 4, 8, 12, 14, 16, 20, 24, 32, 48px with token names
- [ ] ST-052-5: Define color palette — 12 accent variants, semantic colors (success, warning, danger, info), surface layers (page, card, input, hover, border)
- [ ] ST-052-6: Define border radius scale — sm (6px), md (10px), lg (14px), xl (20px), pill (9999px)
- [ ] ST-052-7: Define shadow/elevation scale — card shadow, modal shadow, dropdown shadow

**Step 3 — Publish Style Guide**
- [ ] ST-052-8: Produce style guide document (markdown or Figma page) — one section per token category with visual swatches
- [ ] ST-052-9: QA review — confirm all tokens are used consistently; flag any components still using raw values

---

### US-053 — Wireframes: Authentication Pages

**Story Points:** 3 | **Priority:** High

**User Story:**
As a designer, I want approved wireframes for login and register pages before any code is touched, so that layout, field order, and error state decisions are made once.

**Step 1 — Research & Decisions**
- [ ] ST-053-1: List all form fields, validation rules, and error messages for login and register
- [ ] ST-053-2: Decide card dimensions, logo placement, and CTA label ("Sign In" / "Create Account")

**Step 2 — Wireframe**
- [ ] ST-053-3: Wireframe login page — idle, error (wrong password), loading states; mobile breakpoint at 375px
- [ ] ST-053-4: Wireframe register page — idle, field-level validation errors, success redirect state
- [ ] ST-053-5: Wireframe "Forgot Password" request page and "Set New Password" page (stub for Sprint 5)

**Step 3 — Review & Sign-off**
- [ ] ST-053-6: Review session with stakeholders — collect feedback and apply revisions
- [ ] ST-053-7: Mark wireframes as approved; link from this story for Sprint 3 implementers

---

### US-054 — Wireframes: Global Navigation & Layout

**Story Points:** 5 | **Priority:** High

**User Story:**
As a designer, I want approved wireframes for the sidebar, topbar, and mobile navigation so that the global layout is defined before any module pages are built.

**Step 1 — Define Navigation Structure**
- [ ] ST-054-1: List all navigation items — module groups (Internal, Search/Ads/PW, IPTV), icons (Font Awesome 6), order
- [ ] ST-054-2: Define sidebar states: expanded (icon + label), collapsed (icon only), mobile overlay

**Step 2 — Wireframe**
- [ ] ST-054-3: Wireframe sidebar — expanded, icon-only collapsed, active module highlight (left border + tint), module group labels
- [ ] ST-054-4: Wireframe topbar — page title/breadcrumb, user name + role badge, notification bell placeholder, theme switcher icon, logout
- [ ] ST-054-5: Wireframe theme switcher popover — dark/light/auto radio group (with icons), 4×3 accent color swatch grid, custom hex input row
- [ ] ST-054-6: Wireframe mobile hamburger overlay — full-screen nav slide-in with close button

**Step 3 — Review & Sign-off**
- [ ] ST-054-7: Review session — confirm grouping, icon choices, and collapsed-mode usability
- [ ] ST-054-8: Mark wireframes approved; attach to story

---

### US-055 — Wireframes: Dashboard Page

**Story Points:** 5 | **Priority:** High

**User Story:**
As a designer, I want approved wireframes for the dashboard so that KPI layout, chart placement, and filter interactions are decided before implementation.

**Step 1 — Define Dashboard Data Points**
- [ ] ST-055-1: List all KPIs to display — Total Identified, Total Removed, Pending, Removal Rate; define calculation logic per metric
- [ ] ST-055-2: Define module breakdown card fields — Identified, Delisting count, Action Rate %, top-5 platform/country lists

**Step 2 — Wireframe**
- [ ] ST-055-3: Wireframe top KPI row — 3 stat cards with accent top border, label, value, sub-label
- [ ] ST-055-4: Wireframe module selector tabs — scrollable horizontal row below KPI cards
- [ ] ST-055-5: Wireframe module breakdown card grid — auto-fill, expandable platform/country lists, `<RateBar>` component placement
- [ ] ST-055-6: Wireframe chart sections — platform distribution bar chart, country distribution bar chart
- [ ] ST-055-7: Wireframe date range filter bar — `<DateRangePicker>` position, "Clear" button
- [ ] ST-055-8: Wireframe empty/no-data state for module cards

**Step 3 — Review & Sign-off**
- [ ] ST-055-9: Review session — confirm KPI definitions, chart types, and card expand behaviour
- [ ] ST-055-10: Mark wireframes approved

---

### US-056 — Wireframes: Module Data Table & Modals

**Story Points:** 8 | **Priority:** Critical

**User Story:**
As a designer, I want approved wireframes for the module data table and all related modals (edit, delete, bulk status, bulk update) so that implementation in Sprint 3 is unambiguous.

**Step 1 — Define Table Requirements**
- [ ] ST-056-1: List column types — URL (truncated + link), status (badge), datetime (IST), number (right-aligned), text — and their cell rendering rules
- [ ] ST-056-2: List all top action bar elements — record count, page-size selector, refresh, Bulk Update, Download, Template dropdown, Upload

**Step 2 — Wireframe Data Table**
- [ ] ST-056-3: Wireframe full table layout — module tabs, top action bar, column header row, filter row, data rows, pagination bar
- [ ] ST-056-4: Wireframe bulk select state — header checkbox (all/none/indeterminate), selected row highlight, selected-count action bar
- [ ] ST-056-5: Wireframe all 8 status badge variants — Pending, Removed, Enforced, Not Removed, Under Review, Down, Suspended, Approved
- [ ] ST-056-6: Wireframe empty state — no data, no permission, filtered-empty (three distinct messages)
- [ ] ST-056-7: Wireframe table skeleton loading state

**Step 3 — Wireframe Modals**
- [ ] ST-056-8: Wireframe Edit Record modal — 2-column form grid, full-width exceptions, flatpickr date fields, status `<select>`, field-level validation errors, footer CTAs, loading + saving states
- [ ] ST-056-9: Wireframe Delete confirmation modal — record identifier, warning message, Cancel + Delete buttons
- [ ] ST-056-10: Wireframe Bulk Status modal — selected count, status dropdown, Apply/Cancel, success + error states
- [ ] ST-056-11: Wireframe Bulk Update modal — Step 1 download template, Step 2 upload file, result summary

**Step 4 — Review & Sign-off**
- [ ] ST-056-12: Review session — confirm column widths, modal sizes, and all interaction states
- [ ] ST-056-13: Mark wireframes approved

---

### Sprint 1 Summary

| Story | Title | Points |
|-------|-------|--------|
| US-052 | Design Token System & Style Guide | 8 |
| US-053 | Wireframes: Authentication Pages | 3 |
| US-054 | Wireframes: Global Navigation & Layout | 5 |
| US-055 | Wireframes: Dashboard Page | 5 |
| US-056 | Wireframes: Module Data Table & Modals | 8 |
| **Total** | | **29** |

---

## 9. Sprint 2 — Stability & Critical Fixes

**Sprint Dates:** 2026-04-13 → 2026-04-24
**Sprint Goal:** Eliminate outstanding data-path issues, harden permission enforcement, and deliver activity log pagination — so the system is solid before Sprint 3 UI implementation begins.
**Epics:** EP-01, EP-04, EP-06, EP-07
**Total Points:** 19

---

### US-001 — Fix Bulk Update Route: IST → UTC Conversion

**Story Points:** 5 | **Priority:** Critical | **Status:** DONE

**User Story:**
As a data analyst, I want bulk status updates to convert IST timestamps to UTC before writing to the DB, so records stay temporally consistent with Excel-uploaded data.

**Step 1 — Analysis**
- [x] ST-001-1: Audit the bulk update API route for all date/time field writes
- [x] ST-001-2: Confirm `lib/timezone.js` shared utility exists with `istToUtc()` and `utcToIst()`

**Step 2 — Implementation**
- [x] ST-001-3: Apply `istToUtc()` to all datetime fields in the bulk update handler
- [x] ST-001-4: Confirm conversion parity with the Excel upload route

**Step 3 — QA**
- [x] ST-001-5: Spot-check 5 records updated via bulk update — verify DB UTC value matches expected conversion from IST input

---

### US-002 — Pagination on Activity Log Page

**Story Points:** 3 | **Priority:** High | **Status:** TO DO

**User Story:**
As a superadmin, I want the activity log paginated so it stays performant at scale.

**Step 1 — Backend**
- [ ] ST-002-1: Add `page` and `limit` query params to the activity log API endpoint
- [ ] ST-002-2: Add `LIMIT` / `OFFSET` to the DB query; return `total` count in the response

**Step 2 — Frontend**
- [ ] ST-002-3: Build reusable `<Pagination>` component — first / prev / page-number / next / last controls + page-size selector
- [ ] ST-002-4: Integrate `<Pagination>` into the activity log page
- [ ] ST-002-5: Display "Showing X–Y of Z entries" label

**Step 3 — QA**
- [ ] ST-002-6: Test with 500+ log entries — verify correct offset, correct range label, page-size change works

---

### US-003 — Global Search: Phase 1 Infrastructure

**Story Points:** 8 | **Priority:** High | **Status:** TO DO

**User Story:**
As an analyst, I want a global search that queries across all 11 modules simultaneously so I can find records without knowing which module they belong to.

**Step 1 — Backend**
- [ ] ST-003-1: Design unified search API response schema — results grouped by module, each row: module, id, matched field, matched value, status, date (IST)
- [ ] ST-003-2: Add full-text indexes on searchable columns for each module table (migration script)
- [ ] ST-003-3: Implement `GET /api/search?q=<term>` — parallel `LIKE` queries across all 11 tables, filtered by `can_view` permission
- [ ] ST-003-4: Enforce minimum 3-character query; return HTTP 400 for shorter queries

**Step 2 — Frontend**
- [ ] ST-003-5: Build global search bar component — positioned in topbar, triggers on Enter or 500ms debounce
- [ ] ST-003-6: Build search results page — module-grouped result cards, record count per module
- [ ] ST-003-7: Add loading skeleton and "No results" empty state

**Step 3 — QA**
- [ ] ST-003-8: Performance test with simulated 500k rows — verify response under 2 seconds
- [ ] ST-003-9: Test permission filtering — user with no access to a module gets zero results for that module

---

### US-004 — Harden 403 / Permission Edge Cases

**Story Points:** 3 | **Priority:** High | **Status:** DONE

**User Story:**
As a security-conscious admin, I want all module routes to consistently return 403 when the user lacks view permission.

**Step 1 — Analysis**
- [x] ST-004-1: Audit all 11 module API routes for missing permission checks

**Step 2 — Implementation**
- [x] ST-004-2: Apply `getSession()` + DB permission check to all CRUD routes (view, upload, edit, delete)
- [x] ST-004-3: Implement panel-level permission enforcement in admin panel routes

**Step 3 — QA**
- [x] ST-004-4: Test: user with no-view permission — cannot load module data via API or UI
- [x] ST-004-5: Test: superadmin always bypasses module-level permission checks

---

### Sprint 2 Summary

| Story | Title | Points | Status |
|-------|-------|--------|--------|
| US-001 | Fix Bulk Update Route: IST→UTC Conversion | 5 | DONE |
| US-002 | Pagination on Activity Log Page | 3 | TO DO |
| US-003 | Global Search: Phase 1 Infrastructure | 8 | TO DO |
| US-004 | Harden 403 / Permission Edge Cases | 3 | DONE |
| **Total** | | **19** | |

---

## 10. Sprint 3 — UI Implementation

**Sprint Dates:** 2026-04-27 → 2026-05-08
**Sprint Goal:** Implement all UI pages and components using the approved wireframes and design tokens from Sprint 1 — authentication, navigation, dashboard, module table, edit modal, upload flow, admin panel, and API playground.
**Epic:** EP-11 — Design UI for the PMS
**Total Points:** 47

> All implementation stories in this sprint depend on Sprint 1 wireframe sign-off.

---

### US-057 — Implement Design System: CSS Tokens & Base Components

**Story Points:** 5 | **Priority:** Critical

**User Story:**
As a developer, I want the design token system and base component library implemented in code so every page uses consistent, themeable building blocks.

**Step 1 — CSS Token Cleanup**
- [ ] ST-057-1: Refactor `globals.css` — rename ambiguous variables, remove duplicates, add section comments grouping by category (colors, spacing, typography, radius, shadow)
- [ ] ST-057-2: Replace all hardcoded `#hex` and magic `px` values in existing pages with token variables

**Step 2 — Base Components**
- [ ] ST-057-3: Implement `.btn` variants — `btn-primary`, `btn-secondary`, `btn-danger`, `btn-ghost`, `btn-icon` — with consistent size, focus ring, disabled, and loading states
- [ ] ST-057-4: Implement `.badge` status variants — all 8 status values with distinct color tokens
- [ ] ST-057-5: Implement `.form-input`, `.form-label`, `.form-hint`, `.form-error` — consistent focus ring (`--accent-glow`), error border (`--red`), and disabled state
- [ ] ST-057-6: Implement `<SkeletonTable>` and `<SkeletonCard>` loading placeholder components

**Step 3 — QA**
- [ ] ST-057-7: Render all base components in dark and light mode across all 12 accent colors
- [ ] ST-057-8: Check contrast ratios — all text on backgrounds must meet WCAG AA (4.5:1 for normal, 3:1 for large)

---

### US-058 — Implement Authentication Pages

**Story Points:** 3 | **Priority:** High

**User Story:**
As a user, I want polished login and register pages that match the system's design language and always render in light mode.

**Step 1 — Implement**
- [ ] ST-058-1: Implement login page per approved wireframe — centered card, logo/brand mark, email + password (show/hide toggle) fields, "Sign In" CTA, error message slot, "Forgot Password" link
- [ ] ST-058-2: Implement register page per approved wireframe — Name, Email, Password, Confirm Password fields, "Create Account" CTA, field-level validation errors
- [ ] ST-058-3: Enforce light-mode CSS class on `<html>` for both auth pages regardless of stored theme

**Step 2 — QA**
- [ ] ST-058-4: Test all error states — wrong password, duplicate email, empty required fields
- [ ] ST-058-5: Test layout at 375px mobile viewport — no overflow, inputs full-width, CTA accessible

---

### US-059 — Implement Global Navigation & Theme Switcher

**Story Points:** 5 | **Priority:** High

**User Story:**
As a logged-in user, I want a consistent global navigation with module grouping, collapse support, and a theme switcher that applies changes instantly.

**Step 1 — Sidebar**
- [ ] ST-059-1: Implement sidebar with module groups — Internal, Search/Ads/PW Sharing, IPTV — each with group label and icon-per-module
- [ ] ST-059-2: Implement active module highlight — accent-color left border + accent tint background
- [ ] ST-059-3: Implement collapse/expand toggle — icon-only mode on desktop; persist state in localStorage

**Step 2 — Topbar**
- [ ] ST-059-4: Implement topbar — page title/breadcrumb, user name + role badge, notification bell placeholder, theme icon, logout button

**Step 3 — Theme Switcher**
- [ ] ST-059-5: Implement theme switcher popover — dark/light/auto radio group with icons, 4×3 color swatch grid with checkmark on selected, custom hex input with live preview
- [ ] ST-059-6: Implement instant theme application — `document.documentElement.style.setProperty()` on every selection change
- [ ] ST-059-7: Save theme preference to DB via `PUT /api/user/theme` on change

**Step 4 — Mobile**
- [ ] ST-059-8: Implement hamburger menu overlay for screens <768px — slide-in sidebar, close on backdrop tap

**Step 5 — QA**
- [ ] ST-059-9: Test active state highlights correct module on all 11 pages
- [ ] ST-059-10: Test theme switcher — all 12 colors + dark/light/auto; verify persistence after logout + login
- [ ] ST-059-11: Test mobile at 375px and 768px — hamburger opens, all modules accessible, theme popover usable

---

### US-060 — Implement Dashboard Page

**Story Points:** 8 | **Priority:** High

**User Story:**
As an analyst, I want a visually clear dashboard that surfaces KPIs and module breakdowns at a glance.

**Step 1 — KPI & Stats**
- [ ] ST-060-1: Implement 3 top KPI stat cards — Total Identified, Removed/Resolved, Pending — with accent top border and formatted numbers
- [ ] ST-060-2: Implement module selector tab bar — scrollable, active tab accented, record count badge per tab

**Step 2 — Module Cards**
- [ ] ST-060-3: Implement `<RateBar>` component — gradient fill, percentage label, color threshold logic (green ≥ 70%, amber 30–69%, red < 30%)
- [ ] ST-060-4: Implement module breakdown card — header (icon + label + "View" link), Identified + Delisting counts, `<RateBar>`, expandable platform/country top-5 lists
- [ ] ST-060-5: Implement module card auto-fill grid (`minmax(280px, 1fr)`)

**Step 3 — Charts & Filter**
- [ ] ST-060-6: Implement platform and country distribution bar charts per selected module
- [ ] ST-060-7: Wire `<DateRangePicker>` to dashboard API — all KPIs and cards update reactively on date change
- [ ] ST-060-8: Implement empty/no-data state card for modules with zero records in selected range

**Step 4 — QA**
- [ ] ST-060-9: Verify all 11 module cards render with correct data
- [ ] ST-060-10: Test date filter — confirm counts update and match direct DB query
- [ ] ST-060-11: Test mobile layout — cards stack to single column, charts reflow

---

### US-061 — Implement Module Data Table

**Story Points:** 13 | **Priority:** Critical

**User Story:**
As a data analyst, I want the module data table to be dense, filterable, and action-rich so I can find, review, and action records without leaving the table.

**Step 1 — Table Structure**
- [ ] ST-061-1: Implement module tab bar — horizontal scroll on overflow, accent active highlight, record count badge
- [ ] ST-061-2: Implement top action bar — record count label, page-size `<select>`, refresh button, Bulk Update, Download CSV, Template dropdown (upload/update), Upload Data button
- [ ] ST-061-3: Implement sheetConfig-driven column definitions — each column renders with correct width, type, and label from `SHEET_CONFIG`

**Step 2 — Cell Types**
- [ ] ST-061-4: Implement status badge cells — all 8 variants with distinct colors (from US-057)
- [ ] ST-061-5: Implement URL cells — truncate at 40 chars, `title` tooltip with full URL, external-link icon opens in new tab
- [ ] ST-061-6: Implement datetime cells — `utcToIstDisplay()` formatting (e.g., "15 Mar 2024, 14:30")
- [ ] ST-061-7: Implement number cells — right-aligned, locale-formatted

**Step 3 — Interactions**
- [ ] ST-061-8: Implement per-column filter inputs — 300ms debounce, clear icon on right
- [ ] ST-061-9: Implement bulk select — header checkbox (all/none/indeterminate), row checkboxes, selected-count action bar
- [ ] ST-061-10: Implement pagination bar — current page, total pages, prev/next, page-size selector, total record count

**Step 4 — States**
- [ ] ST-061-11: Implement skeleton loading rows (from US-057 `<SkeletonTable>`)
- [ ] ST-061-12: Implement empty state — three variants: no data, no permission, filtered-empty

**Step 5 — QA**
- [ ] ST-061-13: Verify all 11 modules render with the correct columns, correct cell types, and no missing fields
- [ ] ST-061-14: Test column filter, bulk select, pagination, and page-size change on each module
- [ ] ST-061-15: Test horizontal scroll and sticky first column on screens <768px

---

### US-062 — Implement Edit Record Modal & Delete Confirmation

**Story Points:** 5 | **Priority:** High

**User Story:**
As a data entry operator, I want the edit modal to clearly present all fields with the correct input type and pre-filled values so I can update records accurately.

**Step 1 — Modal Shell**
- [ ] ST-062-1: Implement modal overlay with backdrop — click outside closes, `Escape` key closes
- [ ] ST-062-2: Implement modal header — "Edit Record #\<UUID\>" + pencil icon + × close button
- [ ] ST-062-3: Implement modal loading skeleton (shown while record is fetching from `/api/edit`)

**Step 2 — Form Fields**
- [ ] ST-062-4: Implement 2-column grid form — `datetime` and `date` fields use `<DateTimeInput>` (flatpickr); `status` uses `<select>`; `url` uses `<input type="url">`; long-text fields span 2 columns
- [ ] ST-062-5: Verify flatpickr `<DateTimeInput>` pre-fills correctly from IST-converted DB value (already fixed by `dateStrings: true`)
- [ ] ST-062-6: Implement inline validation error — red border on field + red message + warning icon below field

**Step 3 — Footer & States**
- [ ] ST-062-7: Implement footer — "Cancel" (secondary) + "Save Changes" (primary with floppy-disk icon)
- [ ] ST-062-8: Implement saving state — spinner on Save button, all inputs `readOnly`

**Step 4 — Delete Modal**
- [ ] ST-062-9: Implement delete confirmation modal — record identifier, warning text, Cancel + "Delete" (danger) buttons

**Step 5 — QA**
- [ ] ST-062-10: Open edit modal for records in all 11 modules — verify all field types, date pre-fill, validation, and successful save
- [ ] ST-062-11: Test delete confirmation — confirm record is removed from table after deletion

---

### US-063 — Implement Upload Flow UI

**Story Points:** 5 | **Priority:** High

**User Story:**
As a data entry operator, I want a clear upload experience — from selecting a file through reviewing the result — with no ambiguity about what was accepted or rejected.

**Step 1 — Upload Zone**
- [ ] ST-063-1: Implement drag-and-drop zone — idle (dashed border, cloud icon, label), hover (accent border + tint), file-selected (file name + size + remove button), uploading (progress bar + percentage)

**Step 2 — Templates**
- [ ] ST-063-2: Implement template download section — "Upload Template" and "Bulk Update Template" buttons wired to `/api/template?sheet=&type=upload` and `?type=update`
- [ ] ST-063-3: Add helper text — "Row 1 = headers, Row 2 = format hints, data starts from Row 3"

**Step 3 — Result**
- [ ] ST-063-4: Implement result summary card — 4 stat slots (Inserted, Updated, Skipped, Errors) with color coding
- [ ] ST-063-5: Implement error rows table — row number, field, error message; expandable if > 10 rows
- [ ] ST-063-6: Implement "Upload Another" button — resets to idle state

**Step 4 — QA**
- [ ] ST-063-7: Test all upload states — valid file, file with row errors, wrong format (non-xlsx), network failure mid-upload
- [ ] ST-063-8: Test template downloads for all 11 modules (both upload and update types)

---

### US-064 — Implement Admin Panel Tabs

**Story Points:** 3 | **Priority:** High

**User Story:**
As a superadmin, I want all admin panel tabs to be fully functional and visually consistent with the design system.

**Step 1 — Tab Navigation**
- [ ] ST-064-1: Implement tab nav — accent underline on active tab, hidden tabs for sections user lacks panel permission to access
- [ ] ST-064-2: Implement Users tab — table, Add/Edit user modal (name, email, role, password), Deactivate confirmation modal

**Step 2 — Permissions Tabs**
- [ ] ST-064-3: Implement toggle switch component — used in all permission grids
- [ ] ST-064-4: Implement Module Permissions tab — user selector + 11 modules × 4 permission toggles grid + Save with success toast
- [ ] ST-064-5: Implement Panel Permissions tab — user selector + section list + can_access toggles + Save

**Step 3 — API Tokens, Columns, Optimize**
- [ ] ST-064-6: Implement API Tokens tab — token table, Generate Token modal with one-time reveal + copy button + "Save this token — it won't be shown again" warning
- [ ] ST-064-7: Implement Custom Columns tab — draggable reorder list, Add Column modal (key, label, type)
- [ ] ST-064-8: Implement DB Optimize tab — Run button, results table, Apply with confirmation

**Step 4 — QA**
- [ ] ST-064-9: Test each tab as superadmin, admin, and restricted user — confirm correct tab visibility per panel permissions
- [ ] ST-064-10: Test permission save → refresh → verify toggles persist

---

### US-065 — Implement API Playground & API Docs Page

**Story Points:** 5 | **Priority:** Medium

**User Story:**
As an admin and external developer, I want an interactive playground and a clear documentation page so the API is easy to test and integrate.

**Step 1 — API Playground (Admin Panel Tab)**
- [ ] ST-065-1: Implement Step 1 — token selector dropdown (active tokens only) with masked display and show/hide
- [ ] ST-065-2: Implement Step 2 — module selector + flatpickr date_from/date_to + title input + page + limit
- [ ] ST-065-3: Implement live URL preview — assembles full URL reactively from all form values with a "Copy" button
- [ ] ST-065-4: Implement Send button — fires live API call, shows spinner, catches errors
- [ ] ST-065-5: Implement response status badge — color-coded (green 200, amber 4xx, red 5xx) + response time in ms
- [ ] ST-065-6: Implement Table / JSON toggle — Table view renders sheetConfig-driven columns with status badge cells and truncated URL cells; JSON view has syntax highlight + copy
- [ ] ST-065-7: Implement Field Reference panel — "Template preview · N fields" before call; "Live · N fields" with actual response keys after call

**Step 2 — API Docs Page (`/api-docs`)**
- [ ] ST-065-8: Implement sticky left-nav with jump links to each endpoint section; active link updates on scroll
- [ ] ST-065-9: Implement endpoint card component — method badge, URL pattern, collapsible param table + response example
- [ ] ST-065-10: Add response examples for all 9 API modules (with accurate field lists from current sheetConfig)
- [ ] ST-065-11: Implement "Try it" button — visible to logged-in users, pre-selects module in API Playground

**Step 3 — QA**
- [ ] ST-065-12: Fire API Playground requests for all 9 modules — verify Table and JSON views, Field Reference live switch, error states (401, 404)
- [ ] ST-065-13: Test `/api-docs` page without auth — public access confirmed; all collapsibles open/close; all copy buttons work; layout at 375px

---

### Sprint 3 Summary

| Story | Title | Points |
|-------|-------|--------|
| US-057 | Design System: CSS Tokens & Base Components | 5 |
| US-058 | Authentication Pages | 3 |
| US-059 | Global Navigation & Theme Switcher | 5 |
| US-060 | Dashboard Page | 8 |
| US-061 | Module Data Table | 13 |
| US-062 | Edit Record Modal & Delete Confirmation | 5 |
| US-063 | Upload Flow UI | 5 |
| US-064 | Admin Panel Tabs | 3 |
| US-065 | API Playground & API Docs Page | 5 |
| **Total** | | **52** |

> Sprint 3 is 52 points — recommend splitting into 3a (US-057–060) and 3b (US-061–065) if the team velocity is below 30 points.

---

## 11. Sprint 4 — Data Integrity & Search

**Sprint Dates:** 2026-05-11 → 2026-05-22
**Sprint Goal:** Deliver audit trail for all record changes, complete global search with UI polish, add advanced dashboard filters, and ship filtered CSV exports.
**Epics:** EP-01, EP-03, EP-06, EP-07
**Total Points:** 24

---

### US-005 — Audit Trail: Record Change History

**Story Points:** 8 | **Priority:** High

**User Story:**
As a compliance officer, I want every record change logged with old/new values so I can audit who changed what and when.

**Step 1 — Database**
- [ ] ST-005-1: Create `record_audit_log` table — columns: id, record_id, module, action (CREATE/UPDATE/DELETE), changed_by (user_id), changed_at (UTC), field_name, old_value, new_value
- [ ] ST-005-2: Add indexes on `record_id`, `module`, `changed_by`, `changed_at`

**Step 2 — Backend**
- [ ] ST-005-3: Create `writeAuditLog(params)` utility — inserts within the caller's DB transaction
- [ ] ST-005-4: Instrument `/api/upload` (CREATE events)
- [ ] ST-005-5: Instrument `/api/edit` (UPDATE events — log each changed field individually)
- [ ] ST-005-6: Instrument delete route (DELETE events)
- [ ] ST-005-7: Instrument `/api/bulk-update` — log each affected record individually

**Step 3 — Frontend**
- [ ] ST-005-8: Build "Record History" side panel — accessible from edit modal via a "History" tab or icon button
- [ ] ST-005-9: Add history icon button to each table row in the actions column

**Step 4 — QA**
- [ ] ST-005-10: Perform CREATE, UPDATE (change 3 fields), DELETE, and bulk update — verify all are logged with correct old/new values
- [ ] ST-005-11: Confirm audit log is append-only — no UPDATE or DELETE SQL operations on `record_audit_log`

---

### US-006 — Advanced Dashboard Filters

**Story Points:** 5 | **Priority:** High

**User Story:**
As an analyst, I want to filter dashboard KPIs and charts by module, platform, removal status, and date range.

**Step 1 — Backend**
- [ ] ST-006-1: Extend `/api/dashboard` to accept `module[]`, `platform[]`, `status[]`, `dateFrom`, `dateTo` query params
- [ ] ST-006-2: Apply filter params as SQL WHERE clauses in all dashboard aggregate queries

**Step 2 — Frontend**
- [ ] ST-006-3: Build `<DashboardFilterBar>` — multi-select dropdowns for Module, Platform, Status + `<DateRangePicker>` + "Clear All" button
- [ ] ST-006-4: Wire filter state to dashboard API — all KPI cards and charts update reactively
- [ ] ST-006-5: Sync filter state to URL query params via `useSearchParams` for shareability

**Step 3 — QA**
- [ ] ST-006-6: Test each filter combination — verify counts match direct DB query
- [ ] ST-006-7: Copy filtered URL, open in new tab — verify same filter state is restored

---

### US-007 — Global Search Phase 2: UI Polish & Filters

**Story Points:** 5 | **Priority:** Medium

**User Story:**
As an analyst, I want to filter global search results by module, status, and date range, and click a result to navigate directly to the record.

**Step 1 — Backend**
- [ ] ST-007-1: Add filter params (`module`, `status`, `dateFrom`, `dateTo`) to `/api/search`

**Step 2 — Frontend**
- [ ] ST-007-2: Build sidebar filter panel on search results page
- [ ] ST-007-3: Implement result-row click — navigate to module page + open edit modal for that record's `id`
- [ ] ST-007-4: Implement search term highlight in matched field values
- [ ] ST-007-5: Register global keyboard shortcut `Ctrl+K` / `Cmd+K` for search modal
- [ ] ST-007-6: Add pagination to search results (reuse `<Pagination>` from US-002)

**Step 3 — QA**
- [ ] ST-007-7: Search for a known URL — result appears, click navigates to correct module + pre-opens edit modal
- [ ] ST-007-8: Test keyboard shortcut on all pages; test empty and no-permission states

---

### US-008 — Filtered CSV Export

**Story Points:** 3 | **Priority:** Medium

**User Story:**
As a data analyst, I want to export CSV with the same filters active on the module view.

**Step 1 — Backend**
- [ ] ST-008-1: Extend `/api/download` to accept `status`, `dateFrom`, `dateTo`, `title` filter params (same params as list view)
- [ ] ST-008-2: Apply filters to export query; generate dynamic filename with active filter suffix
- [ ] ST-008-3: Add 50,000-row guard — return HTTP 413 if exceeded

**Step 2 — Frontend**
- [ ] ST-008-4: Pass active module filter state to the Download button URL

**Step 3 — QA**
- [ ] ST-008-5: Set filters, export CSV — verify row count and column values match the filtered table view

---

### US-009 — Bulk Delete with Confirmation & Audit Log

**Story Points:** 3 | **Priority:** Medium

**User Story:**
As a data entry operator, I want to select multiple records and delete them in one action, with a confirmation step and audit log entry.

**Step 1 — Backend**
- [ ] ST-009-1: Implement `DELETE /api/bulk-delete` — accepts `ids[]`, validates permissions, performs delete, logs each to `record_audit_log`

**Step 2 — Frontend**
- [ ] ST-009-2: Add "Delete Selected" button to the bulk-select action bar (appears when rows are selected)
- [ ] ST-009-3: Implement bulk delete confirmation modal — "Deleting N records. This cannot be undone." + Cancel + Delete (danger)

**Step 3 — QA**
- [ ] ST-009-4: Select 1 record, select 10 records — confirm deletion, verify records removed from table and audit log has entries
- [ ] ST-009-5: Test permission — user without `can_delete` cannot access the bulk delete route (403)

---

### Sprint 4 Summary

| Story | Title | Points |
|-------|-------|--------|
| US-005 | Audit Trail: Record Change History | 8 |
| US-006 | Advanced Dashboard Filters | 5 |
| US-007 | Global Search Phase 2: UI Polish | 5 |
| US-008 | Filtered CSV Export | 3 |
| US-009 | Bulk Delete with Confirmation & Audit Log | 3 |
| **Total** | | **24** |

---

## 12. Sprint 5 — Notifications & Auth Flows

**Sprint Dates:** 2026-05-25 → 2026-06-05
**Sprint Goal:** Deliver email notifications for record removal, build the password reset flow, introduce in-app notification bell infrastructure, and add SMTP configuration to the admin panel.
**Epics:** EP-02, EP-04
**Total Points:** 21

---

### US-010 — Email Notifications on Record Removal

**Story Points:** 8 | **Priority:** High

**User Story:**
As a monitoring analyst, I want an email when a record's status changes to "Removed" so I'm immediately informed of enforcement progress.

**Step 1 — Email Infrastructure**
- [ ] ST-010-1: Install and configure Nodemailer with SMTP env vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`)
- [ ] ST-010-2: Create `notification_error_log` DB table — token_id, endpoint, error, created_at
- [ ] ST-010-3: Create `sendNotificationEmail(payload)` async utility — catches SMTP errors and writes to `notification_error_log`; never throws (async fire-and-forget)

**Step 2 — Email Template**
- [ ] ST-010-4: Design HTML + plain-text email template — Module name, Record URL, Platform, Updated by, Timestamp (IST), deep link to record in system

**Step 3 — Triggers**
- [ ] ST-010-5: Hook into `/api/edit` — fire notification when status field transitions to "Removed"
- [ ] ST-010-6: Hook into `/api/bulk-update` — fire per-record notifications for all records updated to "Removed"

**Step 4 — Recipient Config**
- [ ] ST-010-7: Create `notification_recipients` table — module_id, email, active
- [ ] ST-010-8: Build admin panel "Email Recipients" section — table + add/remove per module

**Step 5 — QA**
- [ ] ST-010-9: Update a record to "Removed" (single and bulk) — verify email received by all configured recipients
- [ ] ST-010-10: Simulate SMTP failure — verify error logged to `notification_error_log` and record update still succeeds

---

### US-011 — Password Reset / Forgot Password Flow

**Story Points:** 5 | **Priority:** High

**User Story:**
As a registered user, I want to reset my forgotten password via a secure email link so I can regain access without admin help.

**Step 1 — Database**
- [ ] ST-011-1: Create `password_reset_tokens` table — user_id, token_hash (SHA-256), expires_at, used_at

**Step 2 — Backend**
- [ ] ST-011-2: Implement `POST /api/auth/forgot-password` — validate email, generate token, store hash, send reset email (reuse `sendNotificationEmail`)
- [ ] ST-011-3: Implement `POST /api/auth/reset-password` — validate token (not expired, not used), update password SHA-256 hash, mark token used, clear all active sessions for user

**Step 3 — Frontend**
- [ ] ST-011-4: Implement "Forgot Password" page — email input form, success state "Check your inbox"
- [ ] ST-011-5: Implement "Set New Password" page — password + confirm-password fields, inline validation (min 8 chars, 1 number)

**Step 4 — QA**
- [ ] ST-011-6: Test full flow — request → email → reset → login with new password
- [ ] ST-011-7: Test edge cases — expired token (1h+ old), already-used token, invalid token string

---

### US-012 — In-App Notification Bell

**Story Points:** 5 | **Priority:** Medium

**User Story:**
As a user, I want an in-app notification bell that shows recent system events relevant to my modules.

**Step 1 — Database & Backend**
- [ ] ST-012-1: Create `user_notifications` table — id, user_id, type, title, body, link, module, read_at, created_at
- [ ] ST-012-2: Create `createNotification(userId, payload)` utility
- [ ] ST-012-3: Hook into removal event (reuse US-010), bulk upload completion, and permission change (admin panel save)
- [ ] ST-012-4: Implement `GET /api/notifications` — last 20 for current user + unread count
- [ ] ST-012-5: Implement `PATCH /api/notifications/read` — mark all as read

**Step 2 — Frontend**
- [ ] ST-012-6: Implement `<NotificationBell>` — unread badge (capped at "99+"), dropdown with last 20 items, relative timestamps ("2h ago"), "Mark all as read" button
- [ ] ST-012-7: Poll every 30 seconds; update badge count in real time

**Step 3 — QA**
- [ ] ST-012-8: Trigger each notification type — verify bell updates within 30s, dropdown shows correct message and link, mark-as-read clears badge

---

### US-013 — Admin Panel: SMTP Configuration UI

**Story Points:** 3 | **Priority:** Medium

**User Story:**
As a superadmin, I want to configure SMTP settings from the admin panel so email can be set up without editing server env vars.

**Step 1 — Database & Backend**
- [ ] ST-013-1: Create `system_config` table — key, value_encrypted, updated_at
- [ ] ST-013-2: Implement AES-256 encrypt/decrypt utility (keyed by `CONFIG_SECRET` env var)
- [ ] ST-013-3: Implement `GET /api/admin/config/smtp` and `PUT /api/admin/config/smtp` routes — values encrypted at rest, password field masked in GET response

**Step 2 — Frontend**
- [ ] ST-013-4: Implement "Email Settings" section in admin panel — SMTP host, port, username, password (masked), from address fields
- [ ] ST-013-5: Implement "Send Test Email" button — fires `POST /api/admin/config/smtp/test`, shows success/fail toast immediately

**Step 3 — QA**
- [ ] ST-013-6: Configure SMTP, save, reload page — verify settings persist (password still masked)
- [ ] ST-013-7: Send test email — verify receipt; test with wrong SMTP credentials — verify failure toast

---

### Sprint 5 Summary

| Story | Title | Points |
|-------|-------|--------|
| US-010 | Email Notifications on Record Removal | 8 |
| US-011 | Password Reset / Forgot Password Flow | 5 |
| US-012 | In-App Notification Bell | 5 |
| US-013 | Admin Panel: SMTP Configuration UI | 3 |
| **Total** | | **21** |

---

## 13. Sprint 6 — Security & API Hardening

**Sprint Dates:** 2026-06-09 → 2026-06-20
**Sprint Goal:** Harden the system with API rate limiting, two-factor authentication, data retention policy, and a foundational automated test suite.
**Epics:** EP-04, EP-05, EP-10
**Total Points:** 34

---

### US-014 — Rate Limiting on REST API v1

**Story Points:** 5 | **Priority:** High

**User Story:**
As a system administrator, I want the REST API to enforce rate limits per token so abusive scripts cannot degrade performance.

**Step 1 — Implementation**
- [ ] ST-014-1: Implement sliding-window rate limiter using the existing `api_token_usage` table — query count of requests in last 60s per token
- [ ] ST-014-2: Create `rateLimitCheck(tokenId, role)` function — user: 100/min, admin: 500/min, superadmin: 1000/min
- [ ] ST-014-3: Apply to both `/api/v1/[table]/route.js` and `/api/v1/modules/route.js`
- [ ] ST-014-4: Return HTTP 429 with `Retry-After` header when limit exceeded
- [ ] ST-014-5: Add `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers to all v1 responses

**Step 2 — QA**
- [ ] ST-014-6: Script 101 requests in 60s — verify 101st receives 429 + `Retry-After`
- [ ] ST-014-7: Verify rate limit resets after 60s window; verify superadmin token has higher limit

---

### US-015 — Two-Factor Authentication (TOTP)

**Story Points:** 13 | **Priority:** High

**User Story:**
As a security-conscious user, I want TOTP two-factor authentication on my account so it stays secure even if my password is compromised.

**Step 1 — Database**
- [ ] ST-015-1: Create `user_2fa` table — user_id, secret_encrypted, backup_codes_hash[] (JSON), enabled_at

**Step 2 — Backend**
- [ ] ST-015-2: Install TOTP library (`otpauth` or `speakeasy`)
- [ ] ST-015-3: Implement `POST /api/auth/2fa/setup` — generate secret, return base32 + QR code URL
- [ ] ST-015-4: Implement `POST /api/auth/2fa/verify-setup` — verify first OTP, activate 2FA, generate + return 10 backup codes (shown once, stored hashed)
- [ ] ST-015-5: Modify `POST /api/auth/login` — if 2FA enabled, return `{ requires_otp: true }` instead of setting session
- [ ] ST-015-6: Implement `POST /api/auth/2fa/verify-login` — validate OTP or backup code, then set session
- [ ] ST-015-7: Implement admin panel "Disable 2FA" action — superadmin only, clears `user_2fa` row

**Step 3 — Frontend**
- [ ] ST-015-8: Implement 2FA setup page — QR code display, 6-digit verify input, backup codes reveal with copy/download
- [ ] ST-015-9: Implement OTP challenge modal — shown after correct password when 2FA is active; backup code toggle
- [ ] ST-015-10: Add "Enable 2FA" section to user profile / settings page

**Step 4 — QA**
- [ ] ST-015-11: Full flow: setup 2FA → logout → login → OTP challenge → session granted
- [ ] ST-015-12: Test backup code usage — 10 codes, each single-use; verify 11th backup code fails
- [ ] ST-015-13: Admin disable 2FA — user can then log in with password only

---

### US-016 — Data Retention & Archival Policy

**Story Points:** 8 | **Priority:** Medium

**User Story:**
As a data governance officer, I want a configurable retention policy so records older than a threshold are archived, not deleted.

**Step 1 — Database**
- [ ] ST-016-1: Create `archived_records` table — id, source_table, source_id, module, record_json (original row as JSON), archived_at, archived_by
- [ ] ST-016-2: Create `archival_job_log` table — run_at, module, retention_months, processed, archived, errors, duration_ms

**Step 2 — Backend**
- [ ] ST-016-3: Implement `runArchivalJob(module, retentionMonths)` — move qualifying rows to `archived_records`, log to `archival_job_log`
- [ ] ST-016-4: Build cron trigger — Next.js cron route, evaluated nightly at 02:00 IST
- [ ] ST-016-5: Exclude archived records from all module list queries (`WHERE archived_at IS NULL`)
- [ ] ST-016-6: Add per-module retention config to `system_config` and admin panel "Retention" section

**Step 3 — Frontend**
- [ ] ST-016-7: Build admin panel "Archive" section — table of archived records (module, date, archived by), Restore button, Delete Permanently button (with confirmation)

**Step 4 — QA**
- [ ] ST-016-8: Manually trigger archival job on test data — verify records moved, excluded from list view and API, and restorable

---

### US-017 — Unit & Integration Test Suite: Phase 1

**Story Points:** 8 | **Priority:** Medium

**User Story:**
As a developer, I want an automated test suite covering critical API routes so regressions are caught before production.

**Step 1 — Setup**
- [ ] ST-017-1: Install Jest + Supertest; configure test DB connection to `pms_test` schema
- [ ] ST-017-2: Create seed scripts — test users (superadmin, admin, user, no-permission user), permissions, sample records for 2 modules

**Step 2 — Auth Tests**
- [ ] ST-017-3: Write tests for `POST /api/auth/login` — correct credentials (session set), wrong password (401), inactive user (401)
- [ ] ST-017-4: Write tests for `POST /api/auth/logout` — session cleared

**Step 3 — CRUD & Permission Tests**
- [ ] ST-017-5: Write CRUD tests for `unauthorized_search_result` module — create, read, update, delete (happy path + 403 scenarios)
- [ ] ST-017-6: Write permission enforcement tests — user without `can_view` gets 403; superadmin always passes

**Step 4 — Utility Tests**
- [ ] ST-017-7: Write unit tests for `lib/timezone.js` — `istToUtc()`, `utcToIst()`, `utcToIstForInput()` with edge cases (midnight, month-end, DST-equivalent)
- [ ] ST-017-8: Write unit tests for `lib/sheetConfig.js` — column resolution, sheetConfig-driven SELECT clause building

**Step 5 — CI**
- [ ] ST-017-9: Configure GitHub Actions to run tests on every PR to `main`; add coverage report artifact

---

### Sprint 6 Summary

| Story | Title | Points |
|-------|-------|--------|
| US-014 | Rate Limiting on REST API v1 | 5 |
| US-015 | Two-Factor Authentication (TOTP) | 13 |
| US-016 | Data Retention & Archival Policy | 8 |
| US-017 | Unit & Integration Test Suite: Phase 1 | 8 |
| **Total** | | **34** |

---

## 14. Sprint 7 — Mobile, Automation & Launch

**Sprint Dates:** 2026-06-23 → 2026-07-04
**Sprint Goal:** Achieve full mobile responsiveness, deliver scheduled automated report exports, set up CI/CD pipeline, and complete the production deployment checklist.
**Epics:** EP-08, EP-09, EP-10
**Total Points:** 29

---

### US-018 — Mobile Responsive Design: All Module Pages

**Story Points:** 8 | **Priority:** High

**User Story:**
As a field analyst on mobile, I want all 11 module pages to be fully usable on a smartphone.

**Step 1 — Audit**
- [ ] ST-018-1: Audit all 11 module table pages at 375px — document overflow issues, touch-target failures, and missing breakpoints

**Step 2 — Implement**
- [ ] ST-018-2: Add horizontal scroll wrapper with sticky first column to all 11 module tables
- [ ] ST-018-3: Verify hamburger sidebar (from US-059) works on all pages
- [ ] ST-018-4: Audit and fix all form layouts (edit modal, upload page, admin forms) for <768px
- [ ] ST-018-5: Reflow dashboard card grid to single column at <768px
- [ ] ST-018-6: Fix all touch targets below 44×44px (WCAG 2.1 minimum)

**Step 3 — QA**
- [ ] ST-018-7: Test on iOS Safari 17 (iPhone 14 Pro) and Android Chrome 120 (Pixel 7)
- [ ] ST-018-8: Fix all overflow/clipping issues found during QA pass

---

### US-019 — Scheduled Automated Report Export

**Story Points:** 8 | **Priority:** High

**User Story:**
As a team lead, I want automatic CSV exports emailed to me on a daily or weekly schedule without any manual action.

**Step 1 — Database**
- [ ] ST-019-1: Create `scheduled_reports` table — id, name, modules[], filters_json, frequency (daily/weekly), day_of_week, time_ist, recipients[], active, created_by
- [ ] ST-019-2: Create `report_job_log` table — report_id, run_at, status, records_exported, error

**Step 2 — Backend**
- [ ] ST-019-3: Implement `generateScheduledReport(reportId)` — reuse CSV export logic; attach CSV to email via Nodemailer
- [ ] ST-019-4: Implement cron trigger route — evaluated every 15 minutes; run all due reports
- [ ] ST-019-5: Implement `/api/admin/scheduled-reports` CRUD routes

**Step 3 — Frontend**
- [ ] ST-019-6: Build "Scheduled Reports" admin panel section — list view, Create/Edit modal, pause/resume toggle, delete with confirmation

**Step 4 — QA**
- [ ] ST-019-7: Create a 1-minute interval test report — verify email received, CSV attachment correct, job log updated
- [ ] ST-019-8: Test pause/resume — paused report does not run during its scheduled window

---

### US-020 — CI/CD Pipeline Setup

**Story Points:** 5 | **Priority:** High

**User Story:**
As a developer, I want a CI/CD pipeline that tests and builds on every PR and deploys to staging on merge to `main`.

**Step 1 — CI**
- [ ] ST-020-1: Create `.github/workflows/ci.yml` — runs on PR to `main`: ESLint, `pnpm run build`, Jest test suite
- [ ] ST-020-2: Configure MySQL 8 service container for test DB in CI environment
- [ ] ST-020-3: Configure all required GitHub Secrets (DB credentials, SMTP, session secret, CONFIG_SECRET)

**Step 2 — CD**
- [ ] ST-020-4: Create `.github/workflows/deploy-staging.yml` — triggers on merge to `main`; SSH into Ubuntu server, pull, `pnpm install`, `pnpm run build`, restart PM2

**Step 3 — Documentation**
- [ ] ST-020-5: Add pipeline status badge to `README.md`
- [ ] ST-020-6: Write `DEPLOYMENT.md` — environment variables, build steps, rollback procedure

---

### US-021 — Production Deployment Checklist & Hardening

**Story Points:** 5 | **Priority:** High

**User Story:**
As a project manager, I want a verified production deployment checklist completed before go-live.

**Step 1 — Health & Security**
- [ ] ST-021-1: Implement `GET /api/health` — DB ping, returns `{ status, db_status, version, uptime }`
- [ ] ST-021-2: Configure Next.js security headers in `next.config.js` — CSP, HSTS, X-Frame-Options, X-Content-Type-Options

**Step 2 — Pre-Launch Checks**
- [ ] ST-021-3: Verify all env vars in `.env.example` — no defaults containing real secrets
- [ ] ST-021-4: Run all DB migration scripts on production-equivalent data snapshot
- [ ] ST-021-5: SSL/TLS verification — confirm A+ rating on SSL Labs for production domain

**Step 3 — Performance**
- [ ] ST-021-6: Load test with k6 or Artillery — 50 concurrent users, 5-minute soak, record p95/p99 on module list pages; target: p95 < 2s
- [ ] ST-021-7: Document and rehearse rollback procedure — previous build re-deploy tested end-to-end

**Step 4 — Documentation**
- [ ] ST-021-8: Write and publish `DEPLOYMENT.md` — complete production checklist signed off by team lead

---

### US-022 — UX Polish: Loading States & Error Boundaries

**Story Points:** 3 | **Priority:** Medium

**User Story:**
As any user, I want consistent loading skeletons and helpful error messages throughout the app.

**Step 1 — Implement**
- [ ] ST-022-1: Replace any remaining plain spinners with `<SkeletonTable>` / `<SkeletonCard>` (from US-057) — check: dashboard, activity log, removal-status pages
- [ ] ST-022-2: Implement global `<ErrorToast>` system via React context — wraps all API call failures with a user-friendly message + retry button
- [ ] ST-022-3: Wrap all major page sections in `<ErrorBoundary>` components with an error card fallback (not a blank page)
- [ ] ST-022-4: Build custom 404 page — branded to dark theme, link back to dashboard

**Step 2 — QA**
- [ ] ST-022-5: Simulate API failures (kill DB) — verify `<ErrorToast>` appears and retry works
- [ ] ST-022-6: Navigate to a non-existent URL — verify custom 404 page renders

---

### Sprint 7 Summary

| Story | Title | Points |
|-------|-------|--------|
| US-018 | Mobile Responsive Design | 8 |
| US-019 | Scheduled Automated Report Export | 8 |
| US-020 | CI/CD Pipeline Setup | 5 |
| US-021 | Production Deployment Checklist | 5 |
| US-022 | UX Polish: Loading States & Error Boundaries | 3 |
| **Total** | | **29** |

---

## 15. Backlog

> Items not yet assigned to a sprint. Ordered by priority within each epic.

| ID | Title | Epic | Est. Points | Priority |
|----|-------|------|-------------|----------|
| US-023 | WebSocket-based real-time notifications (upgrade from 30s polling) | EP-02 | 8 | Medium |
| US-024 | Global search: Elasticsearch/OpenSearch integration for scale | EP-07 | 13 | Medium |
| US-025 | Audit trail diff viewer — side-by-side old vs. new values in history panel | EP-06 | 5 | Medium |
| US-026 | Unit & Integration Test Suite Phase 2 — remaining 9 modules + notification routes | EP-10 | 8 | High |
| US-027 | End-to-end test suite (Playwright) — login, upload, bulk update, export flows | EP-10 | 8 | High |
| US-028 | API v1: auto-generated OpenAPI 3.0 spec from sheetConfig + TABLE_CONFIG | EP-05 | 5 | Medium |
| US-029 | API v1: per-token column whitelist — restrict which fields a token can access | EP-05 | 5 | Medium |
| US-030 | Admin panel: API token usage analytics — requests over time, top endpoints chart | EP-05 | 5 | Low |
| US-031 | Accessibility audit & remediation — WCAG 2.1 AA full compliance | EP-08 | 8 | Medium |
| US-032 | Dashboard: exportable PDF report (charts + KPI summary) | EP-03 | 8 | Medium |
| US-033 | Dashboard: comparison view — current period vs. previous period delta | EP-03 | 5 | Medium |
| US-034 | Bulk upload: pre-upload validation preview — show parse errors before committing | EP-01 | 5 | Medium |
| US-035 | Mandatory 2FA policy — superadmin can force-enable 2FA for all admin/user roles | EP-04 | 3 | Medium |
| US-036 | IP allowlist / denylist for admin panel access | EP-04 | 5 | Medium |
| US-037 | Advanced permission model: field-level visibility per role per module | EP-04 | 13 | Low |
| US-038 | Data import: Google Sheets direct sync (OAuth2) | EP-01 | 13 | Low |
| US-039 | Record tagging system — custom tags per record, cross-module tag search | EP-07 | 8 | Low |
| US-040 | Performance monitoring integration (Sentry or Datadog) | EP-10 | 5 | Medium |
| US-041 | Multi-language / i18n support (English + one additional language TBD) | EP-08 | 13 | Low |
| US-042 | API v2 planning: GraphQL exploration for dashboard analytics queries | EP-05 | 3 | Low |

---

## 16. Definition of Done

A User Story is **Done** only when all of the following are true:

### Code Quality
- [ ] Code reviewed and approved by at least one peer via GitHub PR
- [ ] No ESLint errors; no `console.log` or debug code in production paths
- [ ] No hardcoded credentials, secrets, or environment-specific values in source code

### Functionality
- [ ] All Acceptance Criteria verified by the developer and confirmed by QA
- [ ] Feature works correctly in both dark and light mode across all 12 accent colors
- [ ] All 11 module contexts tested if the change is cross-cutting
- [ ] Edge cases covered: empty state, max data, invalid input, no-permission state

### Design Consistency
- [ ] UI uses design tokens from `globals.css` — no hardcoded hex colors or magic pixel values
- [ ] All new form inputs use `.form-input` / `.form-label` / `.form-error` classes
- [ ] Date/datetime fields use `<DateTimeInput>` (flatpickr) — not native `datetime-local`
- [ ] Status values rendered as `.badge` with the correct color variant

### Data & Timezone
- [ ] All new DB writes store dates in UTC
- [ ] All new UI displays and CSV exports present dates in IST (Asia/Kolkata, UTC+5:30)
- [ ] No raw UTC timestamps exposed in the user interface

### API & Schema
- [ ] New API-accessible tables added to `TABLE_CONFIG` in `/api/v1/[table]/route.js`
- [ ] New tables added to `SHEET_CONFIG` in `lib/sheetConfig.js` with correct column definitions
- [ ] `MODULE_TABLE_MAP` in `/api/v1/modules/route.js` updated if new API modules are added
- [ ] API response columns verified to match the Field Reference panel in the API Playground

### Security
- [ ] New routes perform `getSession()` check + appropriate `can_view` / `can_edit` / `can_delete` permission check
- [ ] All DB queries use parameterized values — zero raw string interpolation of user input
- [ ] Sensitive data (passwords, tokens, secrets) stored hashed (SHA-256) or encrypted (AES-256)

### Testing
- [ ] Unit tests written for all new utility functions
- [ ] Integration test written for all new API routes (happy path + 401 + 403)
- [ ] All existing tests continue to pass — no CI regressions

### Documentation & Deployment
- [ ] `/api-docs` page updated if new v1 endpoints or response fields change
- [ ] `.env.example` updated if new environment variables are introduced
- [ ] `JIRA_SPRINT_PLAN.md` updated — story marked DONE, new bugs documented
- [ ] `pnpm run build` confirmed green on the target server before PR merge
