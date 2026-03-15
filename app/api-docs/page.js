'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ── Helpers ──────────────────────────────────────────────────────────────────

const METHOD_STYLE = {
  GET:    { bg: 'rgba(34,197,94,.15)',  color: '#16a34a', border: 'rgba(34,197,94,.35)' },
  POST:   { bg: 'rgba(59,130,246,.15)', color: '#2563eb', border: 'rgba(59,130,246,.35)' },
  PUT:    { bg: 'rgba(234,179,8,.15)',  color: '#ca8a04', border: 'rgba(234,179,8,.35)' },
  DELETE: { bg: 'rgba(239,68,68,.15)', color: '#dc2626', border: 'rgba(239,68,68,.35)' },
  PATCH:  { bg: 'rgba(139,92,246,.15)',color: '#7c3aed', border: 'rgba(139,92,246,.35)' },
}

const AUTH_STYLE = {
  none:       { label: 'Public',       color: '#64748b', bg: 'var(--bg-secondary)' },
  session:    { label: 'Session',      color: '#2563eb', bg: 'rgba(59,130,246,.1)' },
  admin:      { label: 'Admin+',       color: '#ca8a04', bg: 'rgba(234,179,8,.1)' },
  superadmin: { label: 'Superadmin',   color: '#dc2626', bg: 'rgba(239,68,68,.1)' },
  token:      { label: 'Bearer Token', color: '#7c3aed', bg: 'rgba(139,92,246,.1)' },
}

function MethodBadge({ method }) {
  const s = METHOD_STYLE[method] || METHOD_STYLE.GET
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: '5px', padding: '2px 8px', fontSize: '11px', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '.5px' }}>
      {method}
    </span>
  )
}

function AuthBadge({ level }) {
  const s = AUTH_STYLE[level] || AUTH_STYLE.session
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: '5px', padding: '2px 8px', fontSize: '11px', fontWeight: '700' }}>
      {s.label}
    </span>
  )
}

function Code({ children, lang = 'json' }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(children).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }
  return (
    <div style={{ position: 'relative', marginTop: '8px' }}>
      <pre style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px 16px', fontSize: '12px', fontFamily: 'monospace', overflowX: 'auto', margin: 0, color: 'var(--text-primary)', lineHeight: 1.6 }}>
        {children}
      </pre>
      <button onClick={copy} style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '5px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', color: copied ? 'var(--green)' : 'var(--text-muted)' }}>
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  )
}

function ParamRow({ name, type, required, desc }) {
  return (
    <tr>
      <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--accent)', fontWeight: '600' }}>{name}</td>
      <td style={{ padding: '8px 10px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{type}</td>
      <td style={{ padding: '8px 10px', fontSize: '11px' }}>
        {required
          ? <span style={{ color: '#ef4444', fontWeight: '700' }}>Required</span>
          : <span style={{ color: 'var(--text-muted)' }}>Optional</span>}
      </td>
      <td style={{ padding: '8px 10px', fontSize: '12px', color: 'var(--text-secondary)' }}>{desc}</td>
    </tr>
  )
}

function ParamTable({ params }) {
  if (!params?.length) return null
  return (
    <div style={{ overflowX: 'auto', marginTop: '10px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <thead>
          <tr style={{ background: 'var(--bg-card)' }}>
            {['Parameter', 'Type', 'Required', 'Description'].map(h => (
              <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', borderBottom: '1px solid var(--border)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {params.map((p, i) => <ParamRow key={i} {...p} />)}
        </tbody>
      </table>
    </div>
  )
}

function EndpointCard({ method, path, auth, summary, desc, params, reqBody, resBody, notes }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '10px', marginBottom: '10px', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', background: open ? 'var(--bg-card)' : 'var(--bg-secondary)', border: 'none', padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}
      >
        <MethodBadge method={method} />
        <code style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', flex: 1 }}>{path}</code>
        <AuthBadge level={auth} />
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginRight: '8px' }}>{summary}</span>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'}`} style={{ color: 'var(--text-muted)', fontSize: '11px' }} />
      </button>
      {open && (
        <div style={{ padding: '18px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-primary)' }}>
          {desc && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>{desc}</p>}
          {params && (
            <>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>Parameters</div>
              <ParamTable params={params} />
            </>
          )}
          {reqBody && (
            <>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginTop: '16px', marginBottom: '4px' }}>Request Body</div>
              <Code>{reqBody}</Code>
            </>
          )}
          {resBody && (
            <>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginTop: '16px', marginBottom: '4px' }}>Response</div>
              <Code>{resBody}</Code>
            </>
          )}
          {notes && (
            <div style={{ marginTop: '16px', background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.2)', borderRadius: '8px', padding: '12px 14px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <i className="fas fa-circle-info" style={{ color: '#3b82f6', marginRight: '6px' }} />
              {notes}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '10px', marginBottom: '8px', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', background: open ? 'var(--bg-card)' : 'var(--bg-secondary)', border: 'none', padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', gap: '12px' }}
      >
        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{q}</span>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'}`} style={{ color: 'var(--text-muted)', fontSize: '11px', flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-primary)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          {a}
        </div>
      )}
    </div>
  )
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h2 style={{ fontSize: '17px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <i className={`fas ${icon}`} style={{ color: 'var(--accent)', fontSize: '15px' }} />
        {title}
      </h2>
      {subtitle && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '23px' }}>{subtitle}</p>}
    </div>
  )
}

// ── Module list ───────────────────────────────────────────────────────────────
const MODULES = [
  'Unauthorized Search Result', 'Ads Tutorials - Social Media', 'Password Sharing - Social Media',
  'Password Sharing - Marketplace', 'IPTV & Apps - Internet', 'IPTV & Apps - Apps',
  'IPTV & Apps - Social Media', 'IPTV & Apps - Marketplace', 'Marketplace', 'Social Media', 'IPTV & Apps - Meta Ads',
]

const REMOVAL_STATUSES = ['Removed', 'Pending', 'Enforced', 'Not Removed', 'Under Review', 'Appealed', 'Re-uploaded', 'Partial Removal', 'Down', 'Up', 'Active', 'Suspended', 'Approved', 'Rejected']

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ApiDocsPage() {
  const [tab, setTab]           = useState('overview')
  const [authorized, setAuthorized] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/check').then(r => r.json()).then(d => {
      if (d.authenticated && (d.role === 'admin' || d.role === 'superadmin')) setAuthorized(true)
      else setAuthorized(false)
    }).catch(() => setAuthorized(false))
  }, [])

  if (authorized === null) return null
  if (!authorized) return (
    <div className="page-content">
      <div className="main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
        <i className="fas fa-lock" style={{ fontSize: '48px', color: 'var(--text-muted)' }} />
        <div style={{ fontSize: '20px', fontWeight: '700' }}>Access Denied</div>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Admin or Superadmin access required.</div>
        <button onClick={() => router.push('/dashboard')} style={{ marginTop: '8px', padding: '10px 24px', borderRadius: '8px', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Back to Dashboard</button>
      </div>
    </div>
  )

  const TABS = [
    { id: 'overview',  label: 'Overview',      icon: 'fa-house' },
    { id: 'auth',      label: 'Authentication', icon: 'fa-lock' },
    { id: 'data',      label: 'Data APIs',      icon: 'fa-table' },
    { id: 'admin',     label: 'Admin APIs',     icon: 'fa-user-shield' },
    { id: 'v1',        label: 'External API v1',icon: 'fa-terminal' },
    { id: 'faq',       label: 'FAQ',            icon: 'fa-circle-question' },
  ]

  return (
    <div className="page-content">
      <div className="main">

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-book-open" style={{ color: 'var(--accent)' }} />
            API Documentation
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Complete reference for all PMS endpoints — internal session APIs and external token-based API v1.
          </p>
        </div>

        {/* Tabs */}
        <div className="tab-bar" style={{ marginBottom: '24px', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <i className={`fas ${t.icon}`} style={{ marginRight: '6px' }} />{t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div>
            {/* Base URL */}
            <div className="card" style={{ padding: '20px 24px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '10px' }}>Base URL</div>
              <Code>https://your-domain.com</Code>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>All endpoints are relative to this base. In local development: <code style={{ background: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: '4px' }}>http://localhost:3000</code></div>
            </div>

            {/* Two-column summary grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '12px', marginBottom: '20px' }}>
              {[
                { icon: 'fa-lock', color: '#3b82f6', title: 'Authentication', desc: 'Two methods: session cookies (browser) or Bearer tokens (API clients). All data endpoints require authentication.' },
                { icon: 'fa-shield-halved', color: '#ef4444', title: 'Permissions', desc: 'Module-level permissions: can_view, can_upload, can_edit, can_delete, can_bulk_update, can_export. Managed per-user by admins.' },
                { icon: 'fa-clock-rotate-left', color: '#8b5cf6', title: 'Timezone', desc: 'All datetime values are stored in UTC. The API returns UTC. The UI converts to IST (UTC+5:30) for display and accepts IST on input.' },
                { icon: 'fa-circle-xmark', color: '#ef4444', title: 'Error Format', desc: '{"error":"message"} with appropriate HTTP status codes: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Server Error.' },
                { icon: 'fa-layer-group', color: '#22c55e', title: '11 Modules', desc: 'The system manages 11 piracy reporting modules. All data endpoints require a sheet parameter matching the module name exactly.' },
                { icon: 'fa-key', color: '#f59e0b', title: 'Rate Limiting', desc: 'No hard rate limit currently enforced on internal APIs. External API v1 tracks usage per token. Rate limiting is planned in Sprint 4.' },
              ].map((c, i) => (
                <div key={i} className="card" style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <i className={`fas ${c.icon}`} style={{ color: c.color, fontSize: '16px' }} />
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{c.title}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.desc}</div>
                </div>
              ))}
            </div>

            {/* Modules table */}
            <div className="card" style={{ padding: '20px 24px', marginBottom: '16px' }}>
              <div style={{ fontWeight: '700', marginBottom: '12px', fontSize: '14px' }}>Available Modules (sheet parameter values)</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {MODULES.map(m => (
                  <code key={m} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '5px', padding: '3px 10px', fontSize: '12px', color: 'var(--accent)', fontWeight: '600' }}>{m}</code>
                ))}
              </div>
            </div>

            {/* HTTP status codes */}
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ fontWeight: '700', marginBottom: '12px', fontSize: '14px' }}>HTTP Status Codes</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '8px' }}>
                {[
                  { code: '200', color: '#22c55e', label: 'Success' },
                  { code: '400', color: '#f97316', label: 'Bad Request — missing/invalid params' },
                  { code: '401', color: '#ef4444', label: 'Unauthorized — no valid session/token' },
                  { code: '403', color: '#ef4444', label: 'Forbidden — no permission for action' },
                  { code: '404', color: '#64748b', label: 'Not Found — record/table not found' },
                  { code: '409', color: '#8b5cf6', label: 'Conflict — duplicate URL/username' },
                  { code: '500', color: '#ef4444', label: 'Server Error — internal failure' },
                ].map(s => (
                  <div key={s.code} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '7px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: '800', color: s.color, fontSize: '14px' }}>{s.code}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── AUTHENTICATION ── */}
        {tab === 'auth' && (
          <div>
            <SectionTitle icon="fa-lock" title="Authentication" subtitle="Session-based auth for browser clients. Token-based auth for external API consumers." />

            <div className="card" style={{ padding: '16px 20px', marginBottom: '16px', background: 'rgba(59,130,246,.05)', border: '1px solid rgba(59,130,246,.2)' }}>
              <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '8px' }}><i className="fas fa-circle-info" style={{ color: '#3b82f6', marginRight: '6px' }} />How Session Auth Works</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                On successful login, the server sets a <code style={{ background: 'var(--bg-secondary)', padding: '1px 5px', borderRadius: '3px' }}>piracy_session</code> HttpOnly cookie containing a base64-encoded JSON session. This cookie is automatically sent by the browser with every subsequent request. Sessions expire after 30 minutes of inactivity.
              </div>
            </div>

            <EndpointCard
              method="POST" path="/api/auth/login" auth="none"
              summary="Authenticate and create session"
              desc="Validates username/password, checks account status, sets a session cookie. Returns user info on success."
              reqBody={`{
  "username": "john_doe",      // or email address
  "password": "yourpassword"
}`}
              resBody={`// Success
{ "success": true, "userName": "John", "role": "user" }

// Error — invalid credentials
{ "success": false, "message": "Invalid credentials" }

// Error — account pending
{ "success": false, "message": "pending_approval" }

// Error — account rejected
{ "success": false, "message": "Account registration was rejected." }`}
              notes="On success, sets HttpOnly cookie piracy_session (expires 30min). Account must have status=active and is_active=1. New registrations have status=pending until admin approves."
            />

            <EndpointCard
              method="POST" path="/api/auth/logout" auth="session"
              summary="Destroy current session"
              desc="Clears the session cookie. Always returns success regardless of whether a session existed."
              resBody={`{ "success": true }`}
            />

            <EndpointCard
              method="GET" path="/api/auth/check" auth="session"
              summary="Verify session and return user info"
              desc="Used by the frontend on every page load to check if the session is still valid and fetch permissions."
              resBody={`// Authenticated
{
  "authenticated": true,
  "userId": 1,
  "userName": "John",
  "role": "user",               // user | admin | superadmin
  "viewableModules": ["Unauthorized Search Result", ...] // null = all modules
}

// Unauthenticated
{ "authenticated": false }`}
            />

            <EndpointCard
              method="POST" path="/api/auth/register" auth="none"
              summary="Submit new user registration"
              desc="Creates a new account with status=pending. The account is NOT active until an admin approves it. An approval email with credentials is sent upon approval."
              reqBody={`{
  "first_name": "John",
  "last_name":  "Doe",
  "email":      "john@example.com",
  "username":   "john_doe",
  "password":   "min6chars"        // minimum 6 characters
}`}
              resBody={`// Submitted (awaiting admin approval)
{ "success": true, "message": "pending" }

// Conflict
{ "success": false, "message": "Email or username already exists" }`}
              notes="Passwords must be at least 6 characters. When approved by admin, a new secure password is auto-generated and emailed to the user — the registration password is not used for login."
            />
          </div>
        )}

        {/* ── DATA APIs ── */}
        {tab === 'data' && (
          <div>
            <SectionTitle icon="fa-table" title="Data APIs" subtitle="Core CRUD operations for all 11 piracy reporting modules. All require an active session." />

            <EndpointCard
              method="GET" path="/api/data" auth="session"
              summary="Fetch paginated records"
              desc="Returns paginated data from any module. Supports global search, per-column filters, and sorting. Requires can_view permission."
              params={[
                { name: 'sheet',    type: 'string',  required: true,  desc: 'Module name (e.g. "Unauthorized Search Result")' },
                { name: 'page',     type: 'integer', required: false, desc: 'Page number, default 1' },
                { name: 'limit',    type: 'integer', required: false, desc: 'Rows per page, default 25, max 200' },
                { name: 'search',   type: 'string',  required: false, desc: 'Global text search across up to 8 text columns' },
                { name: 'sort_col', type: 'string',  required: false, desc: 'Column key to sort by, default id' },
                { name: 'sort_dir', type: 'string',  required: false, desc: '"asc" or "desc" (default)' },
                { name: 'f_<key>',  type: 'string',  required: false, desc: 'Per-column filter, e.g. f_removal_status=Removed' },
              ]}
              resBody={`{
  "data":    [ { "id": 1, "title": "...", "removal_status": "Removed", ... } ],
  "total":   1247,
  "page":    1,
  "limit":   25,
  "columns": [ { "key": "title", "label": "Title", "type": "text" }, ... ]
}`}
            />

            <EndpointCard
              method="DELETE" path="/api/data" auth="session"
              summary="Delete a single record"
              desc="Permanently deletes a record by ID. Requires can_delete permission on the module."
              params={[
                { name: 'sheet', type: 'string',  required: true, desc: 'Module name' },
                { name: 'id',    type: 'integer', required: true, desc: 'Record ID to delete' },
              ]}
              resBody={`{ "success": true }
// or
{ "error": "Record not found" }  // 404`}
              notes="Deletion is permanent and irreversible. Activity is not currently logged for deletes. Only users with can_delete permission may call this endpoint."
            />

            <EndpointCard
              method="GET" path="/api/edit" auth="session"
              summary="Fetch single record for editing"
              desc="Returns a single record with datetime values pre-converted from UTC to IST for display in the edit form. Requires can_edit permission."
              params={[
                { name: 'sheet', type: 'string',  required: true, desc: 'Module name' },
                { name: 'id',    type: 'integer', required: true, desc: 'Record ID' },
              ]}
              resBody={`{
  "row":     { "id": 1, "title": "...", "date_of_identification": "2024-01-15T10:30:00", ... },
  "columns": [ { "key": "title", "label": "Title", "type": "text" }, ... ]
}
// Dates are in IST (UTC+5:30) for display in the UI`}
            />

            <EndpointCard
              method="PUT" path="/api/edit" auth="session"
              summary="Update a single record"
              desc="Updates any fields of a record. Datetime values should be sent as IST — the API converts to UTC before saving. Enforces unique URL constraint. Requires can_edit permission."
              reqBody={`{
  "sheet": "Unauthorized Search Result",
  "id":    42,
  "data": {
    "title":            "Updated Title",
    "removal_status":   "Removed",
    "removal_timestamp":"2024-06-01T14:00:00"  // IST datetime
    // only include fields you want to update
  }
}`}
              resBody={`{ "success": true }

// Duplicate URL conflict
{ "error": "Duplicate linking_url: this URL already exists in record #18" }  // 409`}
              notes="Only columns defined in the module's schema are accepted. The unique URL column (e.g. linking_url) is validated for uniqueness against other records. DateTime fields must be in IST; they are auto-converted to UTC on save."
            />

            <EndpointCard
              method="POST" path="/api/upload" auth="session"
              summary="Upload Excel file to import records"
              desc="Accepts a multipart form upload of an Excel (.xlsx) file. Performs fuzzy header matching, date parsing, IST→UTC conversion, and upserts rows by unique URL. Requires can_upload permission."
              params={[
                { name: 'file',  type: 'File (multipart)', required: true, desc: '.xlsx file — must have a sheet tab matching the sheet parameter' },
                { name: 'sheet', type: 'string (form field)', required: true, desc: 'Module name — must match an Excel sheet tab name' },
              ]}
              resBody={`{
  "success":   true,
  "inserted":  145,
  "updated":   23,
  "duplicates":7,
  "skipped":   2,
  "errors":    0,
  "total":     177,
  "batchId":   "a3f8d2c1b4e5f6a7",
  "message":   "Processed 177 rows: 145 new, 23 updated, 7 duplicate URLs skipped, 2 skipped (no URL), 0 errors",
  "errorLog":  ["Row 12: column error details..."]  // only if errors > 0
}`}
              notes="Rows without a unique URL value are skipped. Duplicate URLs update the existing record (upsert). Datetime columns in IST are converted to UTC. Header names are matched with fuzzy normalization so minor differences in spacing/casing are tolerated. Max file size depends on server config."
            />

            <EndpointCard
              method="POST" path="/api/bulk-update" auth="session"
              summary="Bulk status update (JSON) — selected IDs"
              desc="Updates removal_status and/or other fields for a list of IDs in one call. Fastest for status-only updates. Requires can_bulk_update permission."
              reqBody={`{
  "sheet":              "Unauthorized Search Result",
  "ids":                [1, 5, 12, 47],
  "removal_status":     "Removed",              // optional
  "removal_timestamp":  "2024-06-01 10:00:00",  // optional, UTC
  "fields": {                                    // optional — any other columns
    "notes": "Confirmed removal",
    "enforced_by": "Legal Team"
  }
}`}
              resBody={`{
  "success": true,
  "updated": 4,
  "errors":  0,
  "message": "4 records updated"
}`}
              notes={`Allowed removal statuses: ${REMOVAL_STATUSES.join(', ')}. The fields object allows updating any module column — invalid keys are silently ignored.`}
            />

            <EndpointCard
              method="POST" path="/api/bulk-update" auth="session"
              summary="Bulk update (Excel) — update by ID column"
              desc="Upload an Excel file where the first column is 'id'. Updates each matching record with the provided column values. Excel must have an 'id' column. Requires can_bulk_update permission."
              params={[
                { name: 'file',  type: 'File (multipart)', required: true, desc: '.xlsx file with an id column + columns to update' },
                { name: 'sheet', type: 'string (form field)', required: true, desc: 'Module name' },
              ]}
              resBody={`{
  "success": true,
  "updated": 80,
  "skipped": 3,
  "errors":  1,
  "total":   84,
  "message": "Processed 84 rows: 80 updated, 3 skipped, 1 errors",
  "errorLog": ["Row 22 (ID 99): duplicate URL"]
}`}
              notes="The Excel file must have a column named exactly 'id'. Rows with missing or invalid IDs are skipped. Only columns that exist in the module schema are updated — extra columns are ignored."
            />

            <EndpointCard
              method="GET" path="/api/download" auth="session"
              summary="Export records as CSV"
              desc="Exports filtered data as a downloadable CSV file. Datetime values are converted from UTC to IST in the export. Requires can_view permission."
              params={[
                { name: 'sheet',      type: 'string',  required: true,  desc: 'Module name' },
                { name: 'search',     type: 'string',  required: false, desc: 'Global search filter' },
                { name: 'date_from',  type: 'date',    required: false, desc: 'Filter records from this date (YYYY-MM-DD)' },
                { name: 'date_to',    type: 'date',    required: false, desc: 'Filter records up to this date (YYYY-MM-DD)' },
                { name: 'title',      type: 'string',  required: false, desc: 'Filter by title/keyword column' },
                { name: 'owner',      type: 'string',  required: false, desc: 'Filter by copyright owner column' },
                { name: 'removal_status', type: 'string', required: false, desc: 'Filter by removal status' },
              ]}
              resBody="Returns CSV file stream with Content-Disposition: attachment header. Datetime columns are in IST (UTC+5:30)."
            />

            <EndpointCard
              method="GET" path="/api/template" auth="session"
              summary="Download Excel upload template"
              desc="Generates and downloads a pre-formatted Excel template for a module, with correct column headers, hints row, and example formatting."
              params={[
                { name: 'sheet', type: 'string', required: true, desc: 'Module name' },
              ]}
              resBody="Returns Excel (.xlsx) file stream. First row = column headers. Second row = hints/examples. System columns (uploaded_by, upload_batch_id, etc.) are excluded."
            />

            <EndpointCard
              method="GET" path="/api/removal-status" auth="session"
              summary="Search records by URL, name, or ID"
              desc="Cross-module search for looking up specific records by their unique identifier. Used by the Status Update page."
              params={[
                { name: 'sheet',  type: 'string', required: true,  desc: 'Module name' },
                { name: 'q',      type: 'string', required: false, desc: 'Search query — URL, title, name, or ID' },
                { name: 'limit',  type: 'integer',required: false, desc: 'Max results, default 50' },
              ]}
              resBody={`{
  "results": [
    { "id": 1, "url": "https://pirate.site/...", "title": "Match Title", "removal_status": "Pending" }
  ]
}`}
            />

            <EndpointCard
              method="GET" path="/api/dashboard" auth="session"
              summary="Fetch dashboard analytics"
              desc="Returns aggregated counts and status breakdowns for all modules the user has access to."
              resBody={`{
  "modules": [
    {
      "key":    "Unauthorized Search Result",
      "label":  "Unauthorized Search Result",
      "total":  1247,
      "removed": 834,
      "pending": 213,
      "byStatus": { "Removed": 834, "Pending": 213, ... },
      "byCountry": { "IN": 120, "US": 87, ... },
      "recentCount": 45
    }
  ],
  "totalRecords": 8921,
  "totalRemoved": 5423
}`}
            />

            <EndpointCard
              method="GET" path="/api/activity" auth="session"
              summary="Fetch user activity log"
              desc="Returns paginated activity log entries. Admins see all users. Regular users see only their own activity."
              params={[
                { name: 'page',  type: 'integer', required: false, desc: 'Page number, default 1' },
                { name: 'limit', type: 'integer', required: false, desc: 'Rows per page, default 50' },
              ]}
              resBody={`{
  "logs": [
    {
      "id": 1, "user_id": 2, "user_name": "John",
      "action": "upload",
      "details": { "sheetName": "Marketplace", "inserted": 45, "updated": 12 },
      "ip_address": "192.168.1.1",
      "created_at": "2024-06-01T10:30:00Z"
    }
  ],
  "total": 840
}`}
              notes="Action types: login, logout, upload, edit, delete, bulk_status_update, bulk_update_excel, export."
            />

            <EndpointCard
              method="GET" path="/api/preferences" auth="session"
              summary="Get user theme preferences"
              resBody={`{ "theme": "blue", "mode": "dark", "customColor": "#3b82f6" }`}
            />

            <EndpointCard
              method="POST" path="/api/preferences" auth="session"
              summary="Save user theme preferences"
              reqBody={`{ "theme": "purple", "mode": "light", "customColor": "#8b5cf6" }`}
              resBody={`{ "success": true }`}
            />
          </div>
        )}

        {/* ── ADMIN APIs ── */}
        {tab === 'admin' && (
          <div>
            <SectionTitle icon="fa-user-shield" title="Admin APIs" subtitle="User management, permissions, email configuration, and system tools. Require Admin or Superadmin role." />

            <EndpointCard
              method="GET" path="/api/admin/users" auth="admin"
              summary="List all users"
              resBody={`{
  "users": [
    { "id": 1, "first_name": "John", "last_name": "Doe", "username": "john_doe",
      "email": "john@example.com", "role": "user", "status": "active",
      "is_active": 1, "last_login": "2024-06-01T10:30:00Z", "created_at": "..." }
  ]
}`}
            />

            <EndpointCard
              method="POST" path="/api/admin/users" auth="admin"
              summary="Create a new user"
              desc="Creates an active user account directly (bypasses approval flow). Useful for admin-created accounts."
              reqBody={`{
  "first_name": "Jane",
  "last_name":  "Smith",
  "email":      "jane@example.com",
  "username":   "jane_smith",
  "password":   "secure123",
  "role":       "user",       // user | admin | superadmin
  "is_active":  true
}`}
              resBody={`{ "success": true }
// Conflict
{ "error": "Email or username already exists" }  // 409`}
            />

            <EndpointCard
              method="PUT" path="/api/admin/users" auth="admin"
              summary="Update user details or role"
              desc="Updates any user fields. Role changes: admins can change user↔admin; only superadmin can assign superadmin role. Leave password blank to keep existing."
              reqBody={`{
  "id":        2,
  "role":      "admin",        // admin can set user/admin; superadmin can set any
  "is_active": true,
  "password":  ""              // blank = keep existing password
}`}
              resBody={`{ "success": true }
// Forbidden for admin trying to set superadmin role
{ "error": "Only superadmin can assign the superadmin role" }  // 403`}
            />

            <EndpointCard
              method="POST" path="/api/admin/users/approve" auth="admin"
              summary="Approve or reject a pending registration"
              desc="Approve: generates a new secure password, activates the account, sends login credentials via email. Reject: deactivates account, sends rejection email."
              reqBody={`// Approve
{ "user_id": 5, "action": "approve" }

// Reject with reason
{ "user_id": 5, "action": "reject", "reason": "Duplicate account" }`}
              resBody={`{ "success": true }

// Approved but email failed
{ "success": true, "emailWarning": "Account approved but email failed: ..." }`}
              notes="On approval, a new 10-character password is generated (uppercase + lowercase + digits + symbols), saved to the DB as a SHA-256 hash, and emailed to the user. The original registration password is discarded."
            />

            <EndpointCard
              method="GET" path="/api/admin/permissions" auth="admin"
              summary="Get permissions for a user"
              params={[
                { name: 'user_id', type: 'integer', required: true, desc: 'User ID' },
              ]}
              resBody={`{
  "permissions": [
    {
      "module_id": 1, "module_name": "Unauthorized Search Result",
      "can_view": 1, "can_upload": 1, "can_edit": 1,
      "can_delete": 0, "can_bulk_update": 1, "can_export": 1
    }
  ]
}`}
            />

            <EndpointCard
              method="POST" path="/api/admin/permissions" auth="admin"
              summary="Save permissions for a user"
              reqBody={`{
  "user_id": 3,
  "permissions": [
    { "module_id": 1, "can_view": 1, "can_upload": 1, "can_edit": 0,
      "can_delete": 0, "can_bulk_update": 0, "can_export": 1 }
  ]
}`}
              resBody={`{ "success": true }`}
            />

            <EndpointCard
              method="GET" path="/api/admin/email-config" auth="admin"
              summary="List all email configurations"
              resBody={`{
  "configs": [
    { "id": 1, "purpose": "notification", "label": "Gmail Workspace",
      "smtp_host": "smtp.gmail.com", "smtp_port": 587, "smtp_user": "noreply@domain.com",
      "from_name": "Piracy System", "from_email": "noreply@domain.com", "is_active": 1 }
  ],
  "purposes": [
    { "value": "notification", "label": "User Notifications (approval/rejection)" },
    { "value": "alert",   "label": "System Alerts" },
    { "value": "report",  "label": "Scheduled Reports" },
    { "value": "digest",  "label": "Activity Digest" }
  ]
}`}
            />

            <EndpointCard
              method="POST" path="/api/admin/email-config" auth="admin"
              summary="Add / edit / delete / test email config"
              reqBody={`// Add new config
{
  "purpose": "notification", "label": "Gmail Workspace",
  "smtp_host": "smtp.gmail.com", "smtp_port": 587, "smtp_secure": false,
  "smtp_user": "noreply@domain.com", "smtp_pass": "app_password_here",
  "from_name": "Piracy System", "from_email": "noreply@domain.com", "is_active": true
}

// Update existing (id provided, smtp_pass blank = keep current)
{ "id": 1, "label": "New Label", "is_active": false, "smtp_pass": "" }

// Test SMTP connection without saving
{ "action": "test", "smtp_host": "smtp.gmail.com", "smtp_port": 587,
  "smtp_user": "noreply@domain.com", "smtp_pass": "app_password" }

// Delete
{ "action": "delete", "id": 1 }`}
              resBody={`{ "success": true }
// Test result
{ "success": true, "message": "SMTP connection verified successfully" }
// Test failure
{ "success": false, "message": "Connection failed: Invalid login" }`}
            />

            <EndpointCard
              method="GET" path="/api/admin/tokens" auth="admin"
              summary="List API tokens and recent usage"
              resBody={`{
  "tokens": [
    { "id": 1, "user_name": "John", "token": "tok_abc123...", "is_active": 1,
      "expires_at": null, "last_used_at": "2024-06-01T10:30:00Z", "created_at": "..." }
  ],
  "recentUsage": [
    { "token_id": 1, "endpoint": "/api/v1/marketplace", "ip_address": "...", "status_code": 200, "created_at": "..." }
  ]
}`}
            />

            <EndpointCard
              method="GET" path="/api/admin/db-optimize" auth="admin"
              summary="Get database index recommendations"
              resBody={`{
  "indexes": [
    { "table": "unauthorized_search_result", "column": "removal_status",
      "type": "INDEX", "exists": false, "recommendation": "Add index to speed up status filter queries" }
  ]
}`}
            />

            <EndpointCard
              method="POST" path="/api/admin/db-optimize" auth="admin"
              summary="Apply recommended indexes"
              resBody={`{
  "created":       3,
  "already_exists":1,
  "errors":        0,
  "results": [ { "index": "idx_removal_status", "status": "created" } ]
}`}
            />
          </div>
        )}

        {/* ── EXTERNAL API v1 ── */}
        {tab === 'v1' && (
          <div>
            <SectionTitle icon="fa-terminal" title="External API v1" subtitle="Token-based REST API for external integrations and automation. Authentication via Bearer token in the Authorization header." />

            <div className="card" style={{ padding: '16px 20px', marginBottom: '16px', background: 'rgba(139,92,246,.05)', border: '1px solid rgba(139,92,246,.2)' }}>
              <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '8px' }}><i className="fas fa-key" style={{ color: '#8b5cf6', marginRight: '6px' }} />Token Authentication</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '10px' }}>
                All v1 endpoints require a Bearer token in the Authorization header. Tokens are managed by admins via Admin Panel → API Playground → Generate Token.
              </div>
              <Code>{`Authorization: Bearer tok_abc123def456...`}</Code>
            </div>

            <EndpointCard
              method="POST" path="/api/v1/auth/login" auth="none"
              summary="Generate Bearer token"
              desc="Authenticates with username and password and returns a Bearer token for use in subsequent API calls."
              reqBody={`{ "username": "john_doe", "password": "yourpassword" }`}
              resBody={`{
  "token": "tok_a1b2c3d4e5f6...",
  "expires_at": null,              // null = no expiry
  "user": { "id": 1, "name": "John", "role": "user" }
}`}
            />

            <EndpointCard
              method="GET" path="/api/v1/[table]" auth="token"
              summary="Query records from a table"
              desc="Returns paginated records from one of the supported tables. Use GET /api/v1/modules to discover which tables you have access to. All timestamps are in UTC. System columns (uploaded_by, upload_batch_id, *_hash, *_timestamp) are stripped from responses."
              params={[
                { name: 'table',     type: 'path param', required: true,  desc: 'DB table name (see available tables below)' },
                { name: 'page',      type: 'integer',    required: false, desc: 'Page number, default 1' },
                { name: 'limit',     type: 'integer',    required: false, desc: 'Rows per page, default 25, max 100' },
                { name: 'date_from', type: 'date',       required: false, desc: 'Filter from date (YYYY-MM-DD), UTC' },
                { name: 'date_to',   type: 'date',       required: false, desc: 'Filter to date (YYYY-MM-DD), UTC' },
                { name: 'title',     type: 'string',     required: false, desc: 'Keyword filter on title/name columns' },
              ]}
              resBody={`GET /api/v1/unauthorized_search_result?page=1&limit=10&date_from=2024-01-01

{
  "table":   "unauthorized_search_result",
  "page":    1,
  "limit":   10,
  "total":   1247,
  "data": [
    { "id": 1, "title": "...", "removal_status": "Removed", ... }
  ]
}`}
              notes="Available tables: unauthorized_search_result, ads_tutorials_social_media, password_sharing_social_media, password_sharing_marketplace, iptv_apps_internet, iptv_apps_apps, iptv_apps_social_media, iptv_apps_marketplace, iptv_apps_meta_ads. Token usage is logged with endpoint, IP, and status code."
            />

            <EndpointCard
              method="GET" path="/api/v1/modules" auth="token"
              summary="List authorised modules"
              desc="Returns the modules the authenticated user is allowed to access. Admins and superadmins receive all active modules. Regular users receive only modules where can_view = 1. Use the db_table value from the response as the [table] path parameter when calling GET /api/v1/[table]."
              resBody={`GET /api/v1/modules

{
  "success": true,
  "modules": [
    "Unauthorized Search Result",
    "Ads Tutorials- Social Media",
    "IPTV & Apps - Internet"
  ]
}`}
              notes="Admins and superadmins receive all active module names. Regular users receive only the modules where can_view = 1 is granted."
            />
          </div>
        )}

        {/* ── FAQ ── */}
        {tab === 'faq' && (
          <div>
            <SectionTitle icon="fa-circle-question" title="Frequently Asked Questions" subtitle="Common questions about Upload, Edit, Bulk Update, Delete, Export, and Permissions." />

            {/* Upload */}
            <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--accent)', marginBottom: '10px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-upload" />Upload
            </div>
            <FaqItem q="What file format is required for upload?"
              a="The system accepts .xlsx files only (Excel 2007+). .xls and .csv are not supported. Use the Download Template button on the upload page to get a pre-formatted file with the correct headers." />
            <FaqItem q="What happens if my Excel headers don't match exactly?"
              a="The upload engine uses fuzzy header matching — it normalizes headers by converting spaces, dashes, slashes, and special characters to underscores, then strips non-alphanumeric chars and compares case-insensitively. Minor differences are tolerated. If a column cannot be matched, it is silently skipped." />
            <FaqItem q="What happens when I upload a URL that already exists?"
              a="The row is upserted — all columns except the unique URL column are updated with the new values. The inserted count shows new rows; updated shows rows where the URL matched an existing record. If you see a high duplicates count, those are rows where the URL matched but no columns changed." />
            <FaqItem q="Rows are being skipped — what causes this?"
              a="A row is skipped (counted in 'skipped') if its unique URL column is empty or null. Every module has one designated URL column that must be present for the row to be imported. Download the template and check the required columns." />
            <FaqItem q="How does the system handle date/time values in Excel?"
              a="Datetime columns (identified_at, removal_timestamp, etc.) in uploaded files are treated as IST (UTC+5:30). The system converts them to UTC before storing in the database. The UI always displays dates in IST. Date-only columns (YYYY-MM-DD) are stored as-is without timezone conversion." />
            <FaqItem q="What is a batch ID?"
              a="Each upload generates a random 16-character hex batchId returned in the response. All rows from that upload are tagged with this ID in upload_batch_id. This allows you to identify and potentially roll back a specific upload batch." />
            <FaqItem q="Is there a row limit per upload?"
              a="There is no hard row limit enforced by the application, but very large files may hit the server's memory or request timeout limits. For best results, keep uploads under 10,000 rows. For larger datasets, split into multiple files." />

            {/* Edit / Update */}
            <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--accent)', marginBottom: '10px', marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-pen" />Edit / Update
            </div>
            <FaqItem q="Which permission is needed to edit a record?"
              a="The can_edit permission on the specific module. Users without this permission will receive a 403 Forbidden response from both GET /api/edit and PUT /api/edit." />
            <FaqItem q="Can I update the unique URL column?"
              a="Yes, but only if the new URL doesn't already exist in another record. If it does, the API returns a 409 Conflict with the ID of the conflicting record." />
            <FaqItem q="What timezone should I send datetime values in for edits?"
              a="Send datetime values in IST (UTC+5:30). The API converts them to UTC before saving. When you fetch a record for editing (GET /api/edit), datetimes are returned in IST. When you submit the edit form (PUT /api/edit), send the IST values back — do not manually convert." />
            <FaqItem q="Can I send only the fields I want to update?"
              a="Yes. The PUT /api/edit endpoint only updates fields present in the data object. Omitted fields are not touched. Send an empty string or null to explicitly clear a field value." />

            {/* Bulk Update */}
            <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--accent)', marginBottom: '10px', marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-list-check" />Bulk Update
            </div>
            <FaqItem q="What are the two modes of bulk update?"
              a="1) JSON mode (POST with application/json): send a list of IDs and the fields to update. Best for status-only changes via the UI's checkboxes. 2) Excel mode (POST with multipart/form-data): upload an Excel file with an 'id' column. Best for updating many fields across many records from a spreadsheet." />
            <FaqItem q="The Excel bulk update requires an 'id' column — where do I get the IDs?"
              a="Export the data first using the Download / Export button, which includes the id column. Edit the relevant columns in that export file, and re-upload it as a bulk update. The system matches rows by their id value." />
            <FaqItem q="What removal statuses are valid?"
              a={`Valid values: ${REMOVAL_STATUSES.join(', ')}. Invalid values are accepted but may cause issues with filtering. The status field is a free-text column in the DB.`} />
            <FaqItem q="Can I update fields other than removal_status in JSON mode?"
              a="Yes. Pass a fields object in the request body with any column keys from the module. Example: { fields: { 'enforced_by': 'Legal', 'notes': 'Confirmed' } }. Invalid column keys are silently ignored." />
            <FaqItem q="What happens if some IDs don't exist during bulk update?"
              a="The affected_rows check means non-existent IDs are counted in 'skipped' rather than 'updated'. No error is thrown for missing IDs — the query simply affects 0 rows." />

            {/* Delete */}
            <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--accent)', marginBottom: '10px', marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-trash" />Delete
            </div>
            <FaqItem q="Is deletion permanent?"
              a="Yes. DELETE /api/data permanently removes the row from the database. There is no soft-delete, recycle bin, or undo functionality. Ensure you are certain before deleting." />
            <FaqItem q="Can I delete multiple records at once?"
              a="No, the DELETE endpoint accepts a single id at a time. For bulk deletion, you would need to make multiple requests or ask a superadmin to execute a DB query directly." />
            <FaqItem q="Which permission is needed to delete?"
              a="The can_delete permission on the specific module. By default, new users have can_delete=0. Admins must explicitly grant this permission per module." />

            {/* Export */}
            <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--accent)', marginBottom: '10px', marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-download" />Export / Download
            </div>
            <FaqItem q="What format does export produce?"
              a="CSV (comma-separated values). The file is streamed directly and named after the module. Datetime columns in the export are in IST (UTC+5:30)." />
            <FaqItem q="Are all records exported or just the current page?"
              a="All matching records are exported — not just the current page. Apply the same filters you'd use in the table view (search, date range, etc.) to control which records are included." />
            <FaqItem q="Can I export data via the API (for automation)?"
              a="Yes, via the External API v1: GET /api/v1/[table] with Bearer token auth. Use pagination to retrieve all pages. Timestamps in v1 responses are in UTC." />

            {/* Permissions */}
            <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--accent)', marginBottom: '10px', marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-key" />Permissions
            </div>
            <FaqItem q="What are the 6 permission types?"
              a="can_view (see data), can_upload (upload Excel), can_edit (edit records), can_delete (delete records), can_bulk_update (bulk status/field update), can_export (download CSV). Each is set independently per module per user." />
            <FaqItem q="If can_view is disabled, can the user still see the module page?"
              a="No. A 403 is returned from the data API, and the module page renders an Access Denied message. The module is also hidden from the sidebar." />
            <FaqItem q="Do admin and superadmin bypass module permissions?"
              a="Yes. Admin and superadmin roles have full access to all modules regardless of permission settings. Module-level permissions only apply to users with the 'user' role." />
            <FaqItem q="What happens if a user tries to call an API without the required permission?"
              a='The API returns HTTP 403 with { "error": "Permission denied" }. The frontend handles this and displays an appropriate Access Denied message.' />
            <FaqItem q="Where are permissions stored?"
              a="In the user_module_permissions table, with one row per user per module. If no row exists for a user-module pair, the system defaults to no access (all permissions = 0)." />
          </div>
        )}

      </div>
    </div>
  )
}
