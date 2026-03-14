'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

// ── Colour palette ────────────────────────────────────────────────────────────
const C = {
  page:    { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', icon: 'fa-window-maximize' },
  api:     { bg: '#dcfce7', border: '#22c55e', text: '#166534', icon: 'fa-server' },
  db:      { bg: '#fef9c3', border: '#eab308', text: '#713f12', icon: 'fa-database' },
  email:   { bg: '#f3e8ff', border: '#a855f7', text: '#581c87', icon: 'fa-envelope' },
  comp:    { bg: '#ffedd5', border: '#f97316', text: '#7c2d12', icon: 'fa-puzzle-piece' },
  session: { bg: '#fce7f3', border: '#ec4899', text: '#831843', icon: 'fa-cookie-bite' },
  file:    { bg: '#e0f2fe', border: '#0ea5e9', text: '#075985', icon: 'fa-file-excel' },
  lib:     { bg: '#f0fdf4', border: '#86efac', text: '#14532d', icon: 'fa-code' },
}

// ── Node component ────────────────────────────────────────────────────────────
function Node({ type, label, sub, badges = [], onClick, active }) {
  const s = C[type] || C.page
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? s.border : s.bg,
        border: `2px solid ${s.border}`,
        borderRadius: '10px',
        padding: '8px 12px',
        cursor: onClick ? 'pointer' : 'default',
        textAlign: 'left',
        display: 'inline-flex',
        flexDirection: 'column',
        gap: '3px',
        minWidth: '148px',
        maxWidth: '180px',
        transition: 'all .15s',
        boxShadow: active ? `0 0 0 3px ${s.border}44` : '0 1px 3px rgba(0,0,0,.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <i className={`fas ${s.icon}`} style={{ fontSize: '11px', color: active ? '#fff' : s.border }} />
        <span style={{ fontSize: '12px', fontWeight: '700', color: active ? '#fff' : s.text, lineHeight: 1.3 }}>{label}</span>
      </div>
      {sub && <span style={{ fontSize: '10px', color: active ? 'rgba(255,255,255,.8)' : s.text, opacity: .75, lineHeight: 1.3 }}>{sub}</span>}
      {badges.length > 0 && (
        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginTop: '2px' }}>
          {badges.map((b, i) => (
            <span key={i} style={{ fontSize: '9px', fontWeight: '700', background: active ? 'rgba(255,255,255,.25)' : `${s.border}22`, color: active ? '#fff' : s.text, borderRadius: '4px', padding: '1px 5px' }}>{b}</span>
          ))}
        </div>
      )}
    </button>
  )
}

// ── Arrow between nodes ───────────────────────────────────────────────────────
function Arrow({ label, dir = 'right', color = '#64748b' }) {
  const isV = dir === 'down' || dir === 'up'
  return (
    <div style={{ display: 'flex', flexDirection: isV ? 'column' : 'row', alignItems: 'center', gap: '2px', padding: isV ? '2px 0' : '0 2px', flexShrink: 0 }}>
      {dir === 'up' && <span style={{ fontSize: '14px', color }}>▲</span>}
      {dir === 'left' && <span style={{ fontSize: '14px', color }}>◀</span>}
      <div style={{
        background: color,
        width: isV ? '2px' : (label ? 'auto' : '28px'),
        height: isV ? (label ? 'auto' : '24px') : '2px',
        minWidth: isV ? '2px' : (label ? 'auto' : '28px'),
        minHeight: isV ? (label ? '24px' : '24px') : '2px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: label ? (isV ? '3px 0' : '0 4px') : '0',
        borderRadius: '2px',
      }}>
        {label && <span style={{ fontSize: '9px', color: '#fff', fontWeight: '700', whiteSpace: 'nowrap', padding: '0 3px' }}>{label}</span>}
      </div>
      {(dir === 'right' || !dir) && <span style={{ fontSize: '14px', color }}>▶</span>}
      {dir === 'down' && <span style={{ fontSize: '14px', color }}>▼</span>}
    </div>
  )
}

function Row({ children, gap = 8 }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap, flexWrap: 'wrap' }}>{children}</div>
}

function Col({ children, gap = 8 }) {
  return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap }}>{children}</div>
}

function FlowCard({ title, icon, color, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ border: `1.5px solid ${color}33`, borderRadius: '14px', overflow: 'hidden', marginBottom: '16px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', background: `${color}11`, border: 'none', padding: '12px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}
      >
        <i className={`fas ${icon}`} style={{ color, fontSize: '14px' }} />
        <span style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-primary)', flex: 1 }}>{title}</span>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'}`} style={{ color: 'var(--text-muted)', fontSize: '11px' }} />
      </button>
      {open && (
        <div style={{ padding: '20px', background: 'var(--bg-primary)', overflowX: 'auto' }}>
          {children}
        </div>
      )}
    </div>
  )
}

function Legend() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
      <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginRight: '4px', alignSelf: 'center' }}>LEGEND:</span>
      {Object.entries(C).map(([key, s]) => (
        <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '600', color: s.text, background: s.bg, border: `1px solid ${s.border}`, borderRadius: '6px', padding: '3px 8px' }}>
          <i className={`fas ${s.icon}`} style={{ fontSize: '10px' }} />
          {key.charAt(0).toUpperCase() + key.slice(1)}
        </span>
      ))}
    </div>
  )
}

// ── Directory Tree ────────────────────────────────────────────────────────────
function Tree({ items, depth = 0 }) {
  return (
    <div style={{ paddingLeft: depth ? 18 : 0 }}>
      {items.map((item, i) => (
        <div key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 0', borderLeft: depth ? '1px dashed var(--border2)' : 'none', paddingLeft: depth ? 12 : 0, position: 'relative' }}>
            {depth > 0 && <span style={{ position: 'absolute', left: 0, top: '50%', width: 12, height: 1, background: 'var(--border2)' }} />}
            <i className={`fas ${item.icon || (item.children ? 'fa-folder-open' : 'fa-file-code')}`}
               style={{ fontSize: '11px', color: item.color || (item.children ? '#f59e0b' : '#64748b'), flexShrink: 0 }} />
            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: item.children ? '700' : '400' }}>{item.name}</span>
            {item.desc && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>— {item.desc}</span>}
            {item.badge && <span style={{ fontSize: '9px', fontWeight: '700', background: 'var(--accent-glow)', color: 'var(--accent)', borderRadius: '4px', padding: '1px 5px' }}>{item.badge}</span>}
          </div>
          {item.children && <Tree items={item.children} depth={depth + 1} />}
        </div>
      ))}
    </div>
  )
}

const DIR_TREE = [
  { name: 'app/', children: [
    { name: 'layout.js', desc: 'Root layout — ClientLayout wrapper, fonts, Font Awesome', icon: 'fa-file-code', color: '#3b82f6' },
    { name: 'page.js', desc: 'Root redirect → /upload', icon: 'fa-file-code' },
    { name: 'login/', children: [
      { name: 'page.js', desc: 'SSR-disabled shell (dynamic import)', badge: 'ssr:false' },
      { name: 'LoginClient.js', desc: 'Login form, session cookie, pending banner', icon: 'fa-file-code', color: '#3b82f6' },
    ]},
    { name: 'register/', children: [
      { name: 'page.js', desc: 'Registration form → status=pending on submit', color: '#3b82f6', icon: 'fa-file-code' },
    ]},
    { name: 'upload/', children: [
      { name: 'page.js', desc: 'Main data table — view, edit, delete, upload, bulk update, export', color: '#3b82f6', icon: 'fa-file-code', badge: 'Core' },
    ]},
    { name: 'dashboard/', children: [
      { name: 'page.js', desc: 'Analytics charts per module', color: '#3b82f6', icon: 'fa-file-code' },
    ]},
    { name: 'removal-status/', children: [
      { name: 'page.js', desc: 'Search & update removal status by URL/ID', color: '#3b82f6', icon: 'fa-file-code' },
    ]},
    { name: 'activity/', children: [
      { name: 'page.js', desc: 'User activity log table (admin sees all)', color: '#3b82f6', icon: 'fa-file-code' },
    ]},
    { name: 'admin/', children: [
      { name: 'page.js', desc: 'Users, Pending, Permissions, Email Config, API Playground, DB Optimize', color: '#f59e0b', icon: 'fa-file-code', badge: 'Admin+' },
    ]},
    { name: 'sprint/', children: [
      { name: 'page.js', desc: 'Sprint plan & JIRA docs', color: '#ef4444', icon: 'fa-file-code', badge: 'Superadmin' },
    ]},
    { name: 'api-docs/', children: [
      { name: 'page.js', desc: 'Full API reference docs', color: '#f59e0b', icon: 'fa-file-code', badge: 'Admin+' },
    ]},
    { name: 'architecture/', children: [
      { name: 'page.js', desc: 'This page — visual architecture diagram', color: '#ef4444', icon: 'fa-file-code', badge: 'Superadmin' },
    ]},
    { name: 'api/', children: [
      { name: 'auth/', children: [
        { name: 'login/route.js', desc: 'POST — authenticate, set session cookie' },
        { name: 'logout/route.js', desc: 'POST — clear session cookie' },
        { name: 'check/route.js', desc: 'GET — validate session, return user info' },
        { name: 'register/route.js', desc: 'POST — create pending user account' },
      ]},
      { name: 'data/route.js', desc: 'GET paginated records, DELETE single record' },
      { name: 'edit/route.js', desc: 'GET single record (IST), PUT update record' },
      { name: 'upload/route.js', desc: 'POST multipart Excel upload → upsert' },
      { name: 'bulk-update/route.js', desc: 'POST JSON bulk status | POST Excel bulk update' },
      { name: 'download/route.js', desc: 'GET CSV export (UTC→IST)' },
      { name: 'template/route.js', desc: 'GET Excel upload template' },
      { name: 'removal-status/route.js', desc: 'GET search records by URL/ID/name' },
      { name: 'dashboard/route.js', desc: 'GET aggregated analytics per module' },
      { name: 'activity/route.js', desc: 'GET paginated activity log' },
      { name: 'preferences/route.js', desc: 'GET/POST user theme preferences' },
      { name: 'admin/', children: [
        { name: 'users/route.js', desc: 'GET/POST/PUT list, create, update users' },
        { name: 'users/approve/route.js', desc: 'POST approve/reject + send email', badge: 'Email' },
        { name: 'permissions/route.js', desc: 'GET/POST module permissions per user' },
        { name: 'email-config/route.js', desc: 'GET/POST SMTP config CRUD + test' },
        { name: 'tokens/route.js', desc: 'GET/POST/DELETE API token management' },
        { name: 'modules/route.js', desc: 'GET list all DB modules' },
        { name: 'db-optimize/route.js', desc: 'GET index report | POST apply indexes' },
      ]},
      { name: 'v1/', children: [
        { name: 'auth/login/route.js', desc: 'POST — get Bearer token for API access' },
        { name: '[table]/route.js', desc: 'GET paginated data by table name (token auth)', badge: 'External' },
      ]},
    ]},
  ]},
  { name: 'components/', children: [
    { name: 'ClientLayout.js', desc: 'Root client layout — sidebar, user badge, auth gating', color: '#f97316', icon: 'fa-puzzle-piece' },
    { name: 'ThemeProvider.js', desc: 'Per-user theme, dark/light mode, CSS vars', color: '#f97316', icon: 'fa-puzzle-piece' },
    { name: 'Sidebar.js', desc: 'Navigation, theme/mode switcher, module links, sign out', color: '#f97316', icon: 'fa-puzzle-piece' },
  ]},
  { name: 'lib/', children: [
    { name: 'db.js', desc: 'MySQL pool singleton (global._mysqlPool)', color: '#22c55e', icon: 'fa-code' },
    { name: 'session.js', desc: 'getSession, getUserPermissions, hasPermission, logActivity', color: '#22c55e', icon: 'fa-code' },
    { name: 'sheetConfig.js', desc: 'SHEET_NAV + SHEET_CONFIG — 11 module definitions', color: '#22c55e', icon: 'fa-code' },
    { name: 'email.js', desc: 'sendApprovalEmail, sendRejectionEmail, testEmailConfig', color: '#22c55e', icon: 'fa-code' },
    { name: 'timezone.js', desc: 'istToUtc, utcToIstForInput, utcToIstDateForInput', color: '#22c55e', icon: 'fa-code' },
    { name: 'validation.js', desc: 'Input sanitization helpers', color: '#22c55e', icon: 'fa-code' },
  ]},
  { name: 'migrations/', children: [
    { name: '001_initial.sql', desc: 'Initial DB schema', icon: 'fa-file-code', color: '#eab308' },
    { name: '002_approval_email.sql', desc: 'users.status column + email_config table', icon: 'fa-file-code', color: '#eab308' },
  ]},
]

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ArchitecturePage() {
  const [authorized, setAuthorized] = useState(null)
  const [tab, setTab] = useState('flows')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/check').then(r => r.json()).then(d => {
      setAuthorized(d.authenticated && d.role === 'superadmin')
    }).catch(() => setAuthorized(false))
  }, [])

  if (authorized === null) return null
  if (!authorized) return (
    <div className="page-content">
      <div className="main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
        <i className="fas fa-lock" style={{ fontSize: '48px', color: 'var(--text-muted)' }} />
        <div style={{ fontSize: '20px', fontWeight: '700' }}>Superadmin Only</div>
        <button onClick={() => router.push('/dashboard')} style={{ padding: '10px 24px', borderRadius: '8px', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Back to Dashboard</button>
      </div>
    </div>
  )

  return (
    <div className="page-content">
      <div className="main">

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-diagram-project" style={{ color: 'var(--accent)' }} />
            System Architecture
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Visual map of every page, route, component, and how they connect.</p>
        </div>

        <div className="tab-bar" style={{ marginBottom: '24px' }}>
          {[
            { id: 'flows',     label: 'User Flows',       icon: 'fa-route' },
            { id: 'directory', label: 'Directory Tree',   icon: 'fa-folder-tree' },
            { id: 'dataflow',  label: 'Data Flow',        icon: 'fa-arrows-spin' },
            { id: 'components',label: 'Component Tree',   icon: 'fa-sitemap' },
          ].map(t => (
            <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <i className={`fas ${t.icon}`} style={{ marginRight: '6px' }} />{t.label}
            </button>
          ))}
        </div>

        {/* ── USER FLOWS ── */}
        {tab === 'flows' && (
          <div>
            <Legend />

            {/* Auth flow */}
            <FlowCard title="1 — Authentication Flow" icon="fa-lock" color="#3b82f6">
              <Col gap={6}>
                <Row gap={6}>
                  <Node type="page" label="/register" sub="app/register/page.js" badges={['Public']} />
                  <Arrow label="POST /api/auth/register" color="#22c55e" />
                  <Node type="api" label="Register API" sub="status=pending, is_active=0" />
                  <Arrow label="INSERT" color="#eab308" />
                  <Node type="db" label="users table" sub="status: pending" />
                </Row>
                <Arrow dir="down" label="awaits admin" color="#a855f7" />
                <Row gap={6}>
                  <Node type="page" label="/admin" sub="Pending Approvals tab" badges={['Admin+']} />
                  <Arrow label="POST /api/admin/users/approve" color="#22c55e" />
                  <Node type="api" label="Approve API" sub="generates password, sets active" />
                  <Arrow dir="right" color="#a855f7" />
                  <Node type="email" label="Email Service" sub="lib/email.js → nodemailer" />
                  <Arrow label="credentials email" color="#a855f7" />
                  <Node type="email" label="User Inbox" sub="noreply@markscan.in" />
                </Row>
                <Arrow dir="down" label="user logs in" color="#3b82f6" />
                <Row gap={6}>
                  <Node type="page" label="/login" sub="app/login/LoginClient.js" badges={['Public']} />
                  <Arrow label="POST /api/auth/login" color="#22c55e" />
                  <Node type="api" label="Login API" sub="validates credentials + status" />
                  <Arrow label="Set-Cookie: piracy_session" color="#ec4899" />
                  <Node type="session" label="Session Cookie" sub="HttpOnly, 30min TTL" />
                  <Arrow label="redirect" color="#3b82f6" />
                  <Node type="page" label="/upload" sub="main app" />
                </Row>
              </Col>
            </FlowCard>

            {/* Data view flow */}
            <FlowCard title="2 — View & Edit Records Flow" icon="fa-table" color="#22c55e">
              <Col gap={6}>
                <Row gap={6}>
                  <Node type="page" label="/upload" sub="?sheet=ModuleName" badges={['can_view']} />
                  <Arrow label="GET /api/data?sheet=..." color="#22c55e" />
                  <Node type="api" label="Data API" sub="pagination, search, filters" />
                  <Arrow label="SELECT" color="#eab308" />
                  <Node type="db" label="module table" sub="e.g. marketplace" />
                </Row>
                <Arrow dir="down" label="click row ▸ Edit" color="#3b82f6" />
                <Row gap={6}>
                  <Node type="page" label="Edit Modal" sub="inline on /upload" badges={['can_edit']} />
                  <Arrow label="GET /api/edit?sheet=&id=" color="#22c55e" />
                  <Node type="api" label="Edit API (GET)" sub="UTC→IST conversion" />
                  <Arrow label="SELECT *" color="#eab308" />
                  <Node type="db" label="module table" />
                </Row>
                <Arrow dir="down" label="submit form" color="#f59e0b" />
                <Row gap={6}>
                  <Node type="page" label="Edit Modal" sub="on save" />
                  <Arrow label="PUT /api/edit" color="#f59e0b" />
                  <Node type="api" label="Edit API (PUT)" sub="IST→UTC, unique URL check" />
                  <Arrow label="UPDATE" color="#eab308" />
                  <Node type="db" label="module table" />
                  <Arrow dir="right" color="#3b82f6" />
                  <Node type="lib" label="logActivity()" sub="lib/session.js" />
                </Row>
                <Arrow dir="down" label="click ✕ Delete" color="#ef4444" />
                <Row gap={6}>
                  <Node type="page" label="/upload" sub="delete confirm" badges={['can_delete']} />
                  <Arrow label="DELETE /api/data?sheet=&id=" color="#ef4444" />
                  <Node type="api" label="Data API (DELETE)" sub="permanent" />
                  <Arrow label="DELETE" color="#eab308" />
                  <Node type="db" label="module table" />
                </Row>
              </Col>
            </FlowCard>

            {/* Upload flow */}
            <FlowCard title="3 — Excel Upload Flow" icon="fa-upload" color="#f97316">
              <Col gap={6}>
                <Row gap={6}>
                  <Node type="file" label=".xlsx file" sub="user prepares data" />
                  <Arrow label="multipart form" color="#0ea5e9" />
                  <Node type="page" label="/upload" sub="Upload button" badges={['can_upload']} />
                  <Arrow label="POST /api/upload" color="#22c55e" />
                  <Node type="api" label="Upload API" sub="fuzzy header match" />
                </Row>
                <Arrow dir="down" label="per row" color="#f97316" />
                <Row gap={6}>
                  <Node type="lib" label="istToUtc()" sub="lib/timezone.js" />
                  <Arrow label="datetime cols" color="#64748b" />
                  <Node type="api" label="Row Parser" sub="type: datetime/date/number/text" />
                  <Arrow label="INSERT … ON DUPLICATE KEY UPDATE" color="#eab308" />
                  <Node type="db" label="module table" sub="upsert by unique URL" />
                </Row>
                <Arrow dir="down" label="response" color="#22c55e" />
                <Row gap={6}>
                  <Node type="api" label="Upload Response" sub="inserted / updated / skipped / errors" />
                  <Arrow label="logActivity()" color="#3b82f6" />
                  <Node type="db" label="activity_log" sub="batch_id recorded" />
                </Row>
              </Col>
            </FlowCard>

            {/* Bulk update flow */}
            <FlowCard title="4 — Bulk Update Flow" icon="fa-list-check" color="#8b5cf6">
              <Col gap={6}>
                <Row gap={6}>
                  <Node type="page" label="/upload" sub="select rows + status" badges={['can_bulk_update']} />
                  <Arrow label="POST /api/bulk-update (JSON)" color="#8b5cf6" />
                  <Node type="api" label="Bulk Update API" sub="ids[] + removal_status" />
                  <Arrow label="UPDATE … WHERE id IN (?)" color="#eab308" />
                  <Node type="db" label="module table" />
                </Row>
                <Arrow dir="down" label="OR via Excel" color="#0ea5e9" />
                <Row gap={6}>
                  <Node type="file" label="Excel with id col" sub="exported data, edited" />
                  <Arrow label="POST /api/bulk-update (multipart)" color="#0ea5e9" />
                  <Node type="api" label="Bulk Update API" sub="match row by id column" />
                  <Arrow label="UPDATE per row" color="#eab308" />
                  <Node type="db" label="module table" />
                </Row>
              </Col>
            </FlowCard>

            {/* Export flow */}
            <FlowCard title="5 — Export / Download Flow" icon="fa-download" color="#14b8a6">
              <Row gap={6}>
                <Node type="page" label="/upload" sub="Export CSV button" badges={['can_view']} />
                <Arrow label="GET /api/download?sheet=…" color="#14b8a6" />
                <Node type="api" label="Download API" sub="UTC→IST conversion" />
                <Arrow label="SELECT all matching" color="#eab308" />
                <Node type="db" label="module table" />
                <Arrow label="stream CSV" color="#14b8a6" />
                <Node type="file" label="module_name.csv" sub="downloaded to browser" />
              </Row>
            </FlowCard>

            {/* Admin flow */}
            <FlowCard title="6 — Admin Management Flow" icon="fa-user-shield" color="#f59e0b">
              <Col gap={6}>
                <Row gap={6}>
                  <Node type="page" label="/admin" sub="Users tab" badges={['Admin+']} />
                  <Arrow label="GET /api/admin/users" color="#22c55e" />
                  <Node type="api" label="Users API" />
                  <Arrow label="SELECT users" color="#eab308" />
                  <Node type="db" label="users table" />
                </Row>
                <Arrow dir="down" label="click Permissions" color="#3b82f6" />
                <Row gap={6}>
                  <Node type="page" label="/admin" sub="Permissions tab" />
                  <Arrow label="GET /api/admin/permissions?user_id=" color="#22c55e" />
                  <Node type="api" label="Permissions API" sub="auto-inserts missing modules" />
                  <Arrow label="SELECT" color="#eab308" />
                  <Node type="db" label="user_module_permissions" />
                </Row>
                <Arrow dir="down" label="save" color="#3b82f6" />
                <Row gap={6}>
                  <Node type="page" label="/admin" sub="save button" />
                  <Arrow label="POST /api/admin/permissions" color="#22c55e" />
                  <Node type="api" label="Permissions API (POST)" sub="UPSERT per module" />
                  <Arrow label="UPSERT" color="#eab308" />
                  <Node type="db" label="user_module_permissions" />
                </Row>
              </Col>
            </FlowCard>

            {/* Email config flow */}
            <FlowCard title="7 — Email Configuration Flow" icon="fa-envelope-open-text" color="#a855f7">
              <Col gap={6}>
                <Row gap={6}>
                  <Node type="page" label="/admin" sub="Email Config tab" badges={['Admin+']} />
                  <Arrow label="POST /api/admin/email-config (action:test)" color="#a855f7" />
                  <Node type="api" label="Email Config API" sub="testEmailConfig()" />
                  <Arrow label="SMTP EHLO" color="#a855f7" />
                  <Node type="email" label="smtp.gmail.com:587" sub="TLS handshake verify" />
                </Row>
                <Arrow dir="down" label="on approve user" color="#a855f7" />
                <Row gap={6}>
                  <Node type="api" label="Approve API" sub="/api/admin/users/approve" />
                  <Arrow label="getSmtpConfig('notification')" color="#22c55e" />
                  <Node type="db" label="email_config table" sub="purpose=notification" />
                  <Arrow dir="right" color="#a855f7" />
                  <Node type="lib" label="nodemailer transporter" sub="lib/email.js" />
                  <Arrow label="SMTP send" color="#a855f7" />
                  <Node type="email" label="User email" sub="credentials inside" />
                </Row>
              </Col>
            </FlowCard>

            {/* External API flow */}
            <FlowCard title="8 — External API v1 Flow" icon="fa-terminal" color="#6366f1">
              <Col gap={6}>
                <Row gap={6}>
                  <Node type="page" label="External Client" sub="script / integration" badges={['Bearer Token']} />
                  <Arrow label="POST /api/v1/auth/login" color="#6366f1" />
                  <Node type="api" label="v1 Login" sub="returns Bearer token" />
                  <Arrow label="SELECT api_tokens" color="#eab308" />
                  <Node type="db" label="api_tokens table" />
                </Row>
                <Arrow dir="down" label="use token" color="#6366f1" />
                <Row gap={6}>
                  <Node type="page" label="External Client" sub="Authorization: Bearer …" />
                  <Arrow label="GET /api/v1/[table]?page=1" color="#6366f1" />
                  <Node type="api" label="v1 Table API" sub="validateToken() → SELECT" />
                  <Arrow label="SELECT + strip sys cols" color="#eab308" />
                  <Node type="db" label="module table" />
                  <Arrow dir="right" color="#6366f1" />
                  <Node type="db" label="api_token_usage" sub="logs every call" />
                </Row>
              </Col>
            </FlowCard>
          </div>
        )}

        {/* ── DIRECTORY TREE ── */}
        {tab === 'directory' && (
          <div>
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ fontWeight: '800', fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-folder-tree" style={{ color: 'var(--accent)' }} />
                Project Structure
              </div>
              <Tree items={DIR_TREE} />
            </div>
          </div>
        )}

        {/* ── DATA FLOW ── */}
        {tab === 'dataflow' && (
          <div>
            <Legend />

            <FlowCard title="Database Layer" icon="fa-database" color="#eab308">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '10px' }}>
                {[
                  { label: 'users', sub: 'id, username, email, role, status, is_active, password (SHA-256)' },
                  { label: 'user_module_permissions', sub: 'user_id, module_id, can_view, can_upload, can_edit, can_delete, can_bulk_update, can_export' },
                  { label: 'modules', sub: 'id, name, label, route, db_table, icon, color, sort_order' },
                  { label: 'email_config', sub: 'id, purpose, smtp_host, smtp_port, smtp_user, smtp_pass, from_name, from_email, is_active' },
                  { label: 'api_tokens', sub: 'id, user_id, token, is_active, expires_at, last_used_at' },
                  { label: 'api_token_usage', sub: 'id, token_id, endpoint, params, ip_address, status_code, created_at' },
                  { label: 'activity_log', sub: 'id, user_id, user_name, action, details (JSON), ip_address, created_at' },
                  { label: 'user_preferences', sub: 'user_id, theme, mode, custom_color' },
                  { label: '11× module tables', sub: 'unauthorized_search_result, marketplace, social_media, iptv_apps_*, ads_tutorials_*, password_sharing_*' },
                ].map((t, i) => (
                  <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '700', color: '#ca8a04', marginBottom: '4px' }}>{t.label}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{t.sub}</div>
                  </div>
                ))}
              </div>
            </FlowCard>

            <FlowCard title="Request Lifecycle (every authenticated request)" icon="fa-arrows-spin" color="#3b82f6">
              <Row gap={6} style={{ flexWrap: 'wrap' }}>
                <Node type="page" label="Browser" sub="sends request" />
                <Arrow label="Cookie: piracy_session" color="#ec4899" />
                <Node type="session" label="getSession()" sub="lib/session.js — base64 decode" />
                <Arrow label="userId, role" color="#3b82f6" />
                <Node type="lib" label="getUserPermissions()" sub="SELECT from user_module_permissions" />
                <Arrow label="perms map" color="#22c55e" />
                <Node type="lib" label="hasPermission()" sub="check can_view / can_edit etc." />
                <Arrow label="403 or proceed" color="#ef4444" />
                <Node type="db" label="MySQL query" sub="via getPool() global singleton" />
              </Row>
            </FlowCard>

            <FlowCard title="Timezone Handling" icon="fa-clock" color="#06b6d4">
              <Col gap={8}>
                <Row gap={6}>
                  <Node type="file" label="Excel upload" sub="user enters IST dates" />
                  <Arrow label="istToUtc()" color="#06b6d4" />
                  <Node type="db" label="DB stores UTC" sub="DATETIME columns" />
                  <Arrow label="utcToIstForInput()" color="#06b6d4" />
                  <Node type="page" label="Edit modal" sub="shows IST to user" />
                </Row>
                <Row gap={6}>
                  <Node type="db" label="DB UTC values" />
                  <Arrow label="utcToIstDateForInput()" color="#06b6d4" />
                  <Node type="file" label="CSV export" sub="IST in download" />
                </Row>
              </Col>
            </FlowCard>

            <FlowCard title="Session & Auth Check Flow" icon="fa-cookie-bite" color="#ec4899">
              <Col gap={6}>
                <Row gap={6}>
                  <Node type="page" label="Any protected page" sub="on mount" />
                  <Arrow label="GET /api/auth/check" color="#ec4899" />
                  <Node type="api" label="Check API" sub="reads piracy_session cookie" />
                  <Arrow label="base64 decode" color="#ec4899" />
                  <Node type="session" label="Session object" sub="{userId, role, lastActivity}" />
                </Row>
                <Arrow dir="down" label="30min idle check" color="#ec4899" />
                <Row gap={6}>
                  <Node type="session" label="Expired?" sub="lastActivity + 30min < now" />
                  <Arrow label="yes → redirect" color="#ef4444" />
                  <Node type="page" label="/login?session_expired=1" sub="shows yellow banner" />
                </Row>
              </Col>
            </FlowCard>
          </div>
        )}

        {/* ── COMPONENT TREE ── */}
        {tab === 'components' && (
          <div>
            <FlowCard title="React Component Hierarchy" icon="fa-sitemap" color="#f97316">
              <div style={{ overflowX: 'auto' }}>
                <Col gap={6}>
                  <Node type="comp" label="RootLayout" sub="app/layout.js — html, head, body" />
                  <Arrow dir="down" color="#f97316" />
                  <Node type="comp" label="ClientLayout" sub="components/ClientLayout.js" badges={['client']} />
                  <Row gap={16} style={{ alignItems: 'flex-start' }}>
                    <Col gap={6}>
                      <Arrow dir="down" label="auth pages" color="#3b82f6" />
                      <Node type="comp" label="ThemeProvider" sub="light mode forced" />
                      <Arrow dir="down" color="#f97316" />
                      <Node type="page" label="LoginClient" sub="or RegisterPage" />
                    </Col>
                    <Col gap={6}>
                      <Arrow dir="down" label="app pages" color="#22c55e" />
                      <Node type="comp" label="ThemeProvider" sub="per-user theme" />
                      <Row gap={6}>
                        <Col gap={4}>
                          <Arrow dir="down" color="#f97316" />
                          <Node type="comp" label="Sidebar" sub="nav + theme switcher" />
                        </Col>
                        <Col gap={4}>
                          <Arrow dir="down" color="#f97316" />
                          <Node type="comp" label="UserBadge" sub="top-right name + logout" />
                        </Col>
                        <Col gap={4}>
                          <Arrow dir="down" color="#3b82f6" />
                          <Node type="page" label="{children}" sub="current page" />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>
              </div>
            </FlowCard>

            <FlowCard title="ThemeProvider Context" icon="fa-palette" color="#8b5cf6">
              <Col gap={6}>
                <Node type="comp" label="ThemeProvider" sub="components/ThemeProvider.js" badges={['context']} />
                <Arrow dir="down" label="provides" color="#8b5cf6" />
                <Row gap={8}>
                  {['theme', 'setTheme', 'mode', 'setMode', 'customColor', 'setCustomColor'].map(v => (
                    <Node key={v} type="lib" label={v} sub="useTheme() hook" />
                  ))}
                </Row>
                <Arrow dir="down" label="consumed by" color="#8b5cf6" />
                <Row gap={8}>
                  <Node type="comp" label="Sidebar.js" sub="theme swatch + light/dark buttons" />
                  <Node type="comp" label="any page" sub="can read mode/theme" />
                </Row>
              </Col>
            </FlowCard>

            <FlowCard title="Sidebar Navigation Logic" icon="fa-bars" color="#14b8a6">
              <Col gap={6}>
                <Row gap={6}>
                  <Node type="comp" label="Sidebar" sub="on mount" />
                  <Arrow label="GET /api/auth/check" color="#14b8a6" />
                  <Node type="api" label="check API" sub="returns viewableModules[]" />
                </Row>
                <Arrow dir="down" label="filter SHEET_NAV" color="#14b8a6" />
                <Row gap={6}>
                  <Node type="lib" label="SHEET_NAV" sub="lib/sheetConfig.js — 11 modules" />
                  <Arrow label=".filter(viewableModules.includes)" color="#14b8a6" />
                  <Node type="comp" label="Module nav links" sub="only permitted modules shown" />
                </Row>
                <Arrow dir="down" label="role-gated sections" color="#f59e0b" />
                <Row gap={8}>
                  <Node type="comp" label="Admin section" sub="role: admin OR superadmin" badges={['isAdmin']} />
                  <Node type="comp" label="Planning section" sub="role: superadmin only" badges={['superadmin']} />
                </Row>
              </Col>
            </FlowCard>

            <FlowCard title="Page Access Matrix" icon="fa-table-cells" color="#6366f1">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', fontSize: '12px', minWidth: '500px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)' }}>
                      {['Page / Route', 'Public', 'User', 'Admin', 'Superadmin'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['/login', '✅', '✅', '✅', '✅'],
                      ['/register', '✅', '✅', '✅', '✅'],
                      ['/upload (view)', '—', '✅ (if can_view)', '✅', '✅'],
                      ['/dashboard', '—', '✅', '✅', '✅'],
                      ['/removal-status', '—', '✅', '✅', '✅'],
                      ['/activity', '—', 'own logs only', '✅ all users', '✅'],
                      ['/admin', '—', '—', '✅', '✅'],
                      ['/api-docs', '—', '—', '✅', '✅'],
                      ['/sprint', '—', '—', '—', '✅'],
                      ['/architecture', '—', '—', '—', '✅'],
                      ['/api/v1/*', 'Bearer Token', 'Bearer Token', 'Bearer Token', 'Bearer Token'],
                    ].map(([route, pub, user, admin, su], i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 ? 'var(--bg-secondary)' : 'transparent' }}>
                        <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: '600', color: 'var(--text-primary)' }}>{route}</td>
                        {[pub, user, admin, su].map((v, j) => (
                          <td key={j} style={{ padding: '8px 12px', color: v === '—' ? 'var(--text-muted)' : v.startsWith('✅') ? '#22c55e' : '#f59e0b', fontSize: '12px' }}>{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FlowCard>
          </div>
        )}

      </div>
    </div>
  )
}
