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

function Code({ children }) {
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

const V1_TABLES = [
  { value: 'unauthorized_search_result',  label: 'Unauthorized Search Result' },
  { value: 'ads_tutorials_social_media',  label: 'Ads Tutorials - Social Media' },
  { value: 'password_sharing_social_media', label: 'Password Sharing - Social Media' },
  { value: 'password_sharing_marketplace', label: 'Password Sharing - Marketplace' },
  { value: 'iptv_apps_internet',          label: 'IPTV & Apps - Internet' },
  { value: 'iptv_apps_apps',              label: 'IPTV & Apps - Apps' },
  { value: 'iptv_apps_social_media',      label: 'IPTV & Apps - Social Media' },
  { value: 'iptv_apps_marketplace',       label: 'IPTV & Apps - Marketplace' },
  { value: 'iptv_apps_meta_ads',          label: 'IPTV & Apps - Meta Ads' },
]

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ApiDocsPage() {
  const [tab, setTab]           = useState('overview')
  const [authorized, setAuthorized] = useState(null)
  const router = useRouter()

  // ── Interactive Playground state ───────────────────────────────────────────
  const [v1Token,       setV1Token]       = useState('')
  const [v1Endpoint,    setV1Endpoint]    = useState('login')
  const [v1LoginUser,   setV1LoginUser]   = useState('')
  const [v1LoginPass,   setV1LoginPass]   = useState('')
  const [v1Table,       setV1Table]       = useState('unauthorized_search_result')
  const [v1Page,        setV1Page]        = useState('1')
  const [v1Limit,       setV1Limit]       = useState('10')
  const [v1DateFrom,    setV1DateFrom]    = useState('')
  const [v1DateTo,      setV1DateTo]      = useState('')
  const [v1Title,       setV1Title]       = useState('')
  const [v1Response,    setV1Response]    = useState(null)   // { status, data, time, error }
  const [v1Loading,     setV1Loading]     = useState(false)

  useEffect(() => {
    fetch('/api/auth/check').then(r => r.json()).then(d => {
      if (d.authenticated && (d.role === 'admin' || d.role === 'superadmin')) setAuthorized(true)
      else setAuthorized(false)
    }).catch(() => setAuthorized(false))
  }, [])

  async function executeV1() {
    setV1Loading(true); setV1Response(null)
    const t0 = Date.now()
    try {
      let res, data
      if (v1Endpoint === 'login') {
        res  = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: v1LoginUser, password: v1LoginPass }),
        })
        data = await res.json()
        if (data.token) setV1Token(data.token)
      } else if (v1Endpoint === 'table') {
        const params = new URLSearchParams({ page: v1Page || '1', limit: v1Limit || '10' })
        if (v1DateFrom) params.set('date_from', v1DateFrom)
        if (v1DateTo)   params.set('date_to',   v1DateTo)
        if (v1Title)    params.set('title',      v1Title)
        res  = await fetch(`/api/v1/${v1Table}?${params}`, {
          headers: v1Token ? { Authorization: `Bearer ${v1Token}` } : {},
        })
        data = await res.json()
      } else {
        res  = await fetch('/api/v1/modules', {
          headers: v1Token ? { Authorization: `Bearer ${v1Token}` } : {},
        })
        data = await res.json()
      }
      setV1Response({ status: res.status, data, time: Date.now() - t0 })
    } catch (e) {
      setV1Response({ status: 0, data: null, error: e.message, time: Date.now() - t0 })
    }
    setV1Loading(false)
  }

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
  "data":    [ { "id": "537cacdc-251b-11f1-bb0f-00ff85e28522", "title": "...", "removal_status": "Removed", ... } ],
  "total":   6144,
  "page":    1,
  "limit":   25,
  "pages":   246,
  "stats":   { "total": 6144, "removed": 4120 }
}`}
            />

            <EndpointCard
              method="DELETE" path="/api/data" auth="session"
              summary="Delete a single record"
              desc="Permanently deletes a record by ID. Requires can_delete permission on the module."
              params={[
                { name: 'sheet', type: 'string', required: true, desc: 'Module name' },
                { name: 'id',    type: 'UUID',   required: true, desc: 'Record UUID to delete (CHAR(36))' },
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
                { name: 'sheet', type: 'string', required: true, desc: 'Module name' },
                { name: 'id',    type: 'UUID',   required: true, desc: 'Record UUID (CHAR 36)' },
              ]}
              resBody={`{
  "row":     { "id": "537cacdc-251b-11f1-bb0f-00ff85e28522", "title": "...", "date_of_identification": "2024-01-15T10:30:00", ... },
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
  "id":    "537cacdc-251b-11f1-bb0f-00ff85e28522",
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
  "ids": [
    "537cacdc-251b-11f1-bb0f-00ff85e28522",
    "537cb3b7-251b-11f1-bb0f-00ff85e28522"
  ],
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

            {/* Token auth info */}
            <div className="card" style={{ padding: '14px 18px', marginBottom: '20px', background: 'rgba(139,92,246,.05)', border: '1px solid rgba(139,92,246,.2)' }}>
              <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '6px' }}><i className="fas fa-key" style={{ color: '#8b5cf6', marginRight: '6px' }} />Token Authentication</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '8px' }}>
                All v1 endpoints require a Bearer token in the Authorization header. Tokens are managed by admins via Admin Panel → API Playground → Generate Token. Use the playground below to obtain a token and test live requests.
              </div>
              <Code>{`Authorization: Bearer tok_abc123def456...`}</Code>
            </div>

            {/* ── Interactive Playground ───────────────────────────────────── */}
            <div className="card" style={{ marginBottom: '28px', padding: 0, overflow: 'hidden', border: '1px solid rgba(139,92,246,.3)' }}>
              {/* Playground header */}
              <div style={{ padding: '13px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(139,92,246,.06)' }}>
                <i className="fas fa-flask" style={{ color: '#8b5cf6', fontSize: '15px' }} />
                <span style={{ fontWeight: '800', fontSize: '14px' }}>Interactive Playground</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>— make live API calls directly from the browser</span>
                {v1Token && (
                  <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.3)', borderRadius: '5px', padding: '3px 8px' }}>
                    <i className="fas fa-check-circle" />Token active
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr' }}>

                {/* ── Left: endpoint selector + token ── */}
                <div style={{ borderRight: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', padding: '16px 12px', gap: '4px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '6px' }}>Endpoints</div>

                  {[
                    { id: 'login',   method: 'POST', label: '/api/v1/auth/login', icon: 'fa-key',   desc: 'Generate token' },
                    { id: 'table',   method: 'GET',  label: '/api/v1/[table]',   icon: 'fa-table', desc: 'Query records' },
                    { id: 'modules', method: 'GET',  label: '/api/v1/modules',   icon: 'fa-list',  desc: 'List modules' },
                  ].map(ep => (
                    <button
                      key={ep.id}
                      onClick={() => { setV1Endpoint(ep.id); setV1Response(null) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 11px',
                        borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left',
                        background: v1Endpoint === ep.id ? 'rgba(139,92,246,.15)' : 'transparent',
                        outline: v1Endpoint === ep.id ? '1px solid rgba(139,92,246,.35)' : 'none',
                        transition: 'background .15s',
                      }}
                    >
                      <MethodBadge method={ep.method} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '700', color: v1Endpoint === ep.id ? '#8b5cf6' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ep.label}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{ep.desc}</div>
                      </div>
                    </button>
                  ))}

                  {/* Token box */}
                  <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i className="fas fa-key" />Bearer Token
                    </div>
                    <textarea
                      value={v1Token}
                      onChange={e => setV1Token(e.target.value)}
                      placeholder="Paste token or login above to auto-fill…"
                      rows={3}
                      style={{ width: '100%', padding: '7px 9px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '10px', fontFamily: 'monospace', resize: 'none', boxSizing: 'border-box', lineHeight: 1.5 }}
                    />
                    {v1Token
                      ? <div style={{ fontSize: '10px', color: 'var(--green)', marginTop: '3px' }}><i className="fas fa-circle-check" style={{ marginRight: '3px' }} />Token ready</div>
                      : <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>Generate via POST /auth/login</div>
                    }
                    {v1Token && (
                      <button onClick={() => setV1Token('')} style={{ marginTop: '6px', fontSize: '10px', color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <i className="fas fa-times" style={{ marginRight: '3px' }} />Clear token
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Right: form + response ── */}
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '420px' }}>

                  {/* Request form */}
                  <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '14px' }}>
                      Request — {v1Endpoint === 'login' ? 'POST /api/v1/auth/login' : v1Endpoint === 'table' ? `GET /api/v1/${v1Table}` : 'GET /api/v1/modules'}
                    </div>

                    {/* LOGIN fields */}
                    {v1Endpoint === 'login' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '560px' }}>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Username <span style={{ color: '#ef4444' }}>*</span></label>
                          <input value={v1LoginUser} onChange={e => setV1LoginUser(e.target.value)} placeholder="your_username"
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', fontSize: '13px', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Password <span style={{ color: '#ef4444' }}>*</span></label>
                          <input type="password" value={v1LoginPass} onChange={e => setV1LoginPass(e.target.value)} placeholder="••••••••"
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', fontSize: '13px', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Request Body Preview</div>
                          <pre style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 12px', fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-secondary)', margin: 0 }}>
{`{
  "username": "${v1LoginUser || 'your_username'}",
  "password": "${v1LoginPass ? '••••••••' : 'your_password'}"
}`}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* TABLE fields */}
                    {v1Endpoint === 'table' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 80px', gap: '12px', maxWidth: '700px' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Table <span style={{ color: '#ef4444' }}>*</span></label>
                          <select value={v1Table} onChange={e => setV1Table(e.target.value)}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', fontSize: '13px' }}>
                            {V1_TABLES.map(t => <option key={t.value} value={t.value}>{t.label} ({t.value})</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>date_from</label>
                          <input type="date" value={v1DateFrom} onChange={e => setV1DateFrom(e.target.value)}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', fontSize: '13px', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>date_to</label>
                          <input type="date" value={v1DateTo} onChange={e => setV1DateTo(e.target.value)}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', fontSize: '13px', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>page</label>
                          <input type="number" min="1" value={v1Page} onChange={e => setV1Page(e.target.value)}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', fontSize: '13px', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>limit</label>
                          <input type="number" min="1" max="100" value={v1Limit} onChange={e => setV1Limit(e.target.value)}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', fontSize: '13px', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ gridColumn: '1 / 3' }}>
                          <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>title / keyword filter</label>
                          <input value={v1Title} onChange={e => setV1Title(e.target.value)} placeholder="Optional keyword search"
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', fontSize: '13px', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>Request URL Preview</div>
                          <pre style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', fontFamily: 'monospace', color: 'var(--accent)', margin: 0, overflowX: 'auto' }}>
                            {`GET /api/v1/${v1Table}?page=${v1Page}&limit=${v1Limit}${v1DateFrom ? `&date_from=${v1DateFrom}` : ''}${v1DateTo ? `&date_to=${v1DateTo}` : ''}${v1Title ? `&title=${encodeURIComponent(v1Title)}` : ''}`}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* MODULES — no params */}
                    {v1Endpoint === 'modules' && (
                      <div style={{ maxWidth: '560px' }}>
                        <div style={{ padding: '14px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                          <i className="fas fa-circle-info" style={{ color: '#3b82f6', marginRight: '6px' }} />
                          No parameters required. Returns the list of modules the token owner is authorised to access.
                          <pre style={{ marginTop: '10px', marginBottom: 0, fontSize: '11px', fontFamily: 'monospace', color: 'var(--accent)' }}>GET /api/v1/modules</pre>
                        </div>
                      </div>
                    )}

                    {/* Execute button */}
                    <div style={{ marginTop: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        onClick={executeV1}
                        disabled={v1Loading || (v1Endpoint !== 'login' && !v1Token)}
                        style={{
                          padding: '9px 22px', borderRadius: '7px', border: 'none', cursor: v1Loading || (v1Endpoint !== 'login' && !v1Token) ? 'not-allowed' : 'pointer',
                          background: v1Loading ? 'var(--bg-secondary)' : '#8b5cf6', color: v1Loading ? 'var(--text-muted)' : '#fff',
                          fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background .15s',
                        }}
                      >
                        {v1Loading
                          ? <><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', borderColor: 'rgba(0,0,0,.2)', borderTopColor: '#666' }} />Sending…</>
                          : <><i className="fas fa-paper-plane" />Send Request</>
                        }
                      </button>
                      {v1Endpoint !== 'login' && !v1Token && (
                        <span style={{ fontSize: '12px', color: 'var(--amber, #f59e0b)' }}><i className="fas fa-triangle-exclamation" style={{ marginRight: '4px' }} />Set a Bearer token first</span>
                      )}
                    </div>
                  </div>

                  {/* Response panel */}
                  <div style={{ flex: 1, background: 'var(--bg-secondary)', padding: '16px 20px', overflowY: 'auto', minHeight: '180px' }}>
                    {!v1Response && !v1Loading && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '10px', color: 'var(--text-muted)', minHeight: '140px' }}>
                        <i className="fas fa-circle-play" style={{ fontSize: '28px', opacity: .3 }} />
                        <span style={{ fontSize: '13px' }}>Hit "Send Request" to see the response here</span>
                      </div>
                    )}
                    {v1Loading && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', minHeight: '140px', color: 'var(--text-muted)' }}>
                        <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                        <span style={{ fontSize: '13px' }}>Waiting for response…</span>
                      </div>
                    )}
                    {v1Response && !v1Loading && (
                      <div>
                        {/* Status row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                          <span style={{
                            fontFamily: 'monospace', fontWeight: '800', fontSize: '15px', padding: '3px 10px', borderRadius: '6px',
                            background: v1Response.status >= 200 && v1Response.status < 300 ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.12)',
                            color: v1Response.status >= 200 && v1Response.status < 300 ? '#16a34a' : '#dc2626',
                            border: `1px solid ${v1Response.status >= 200 && v1Response.status < 300 ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)'}`,
                          }}>
                            {v1Response.status === 0 ? 'ERR' : v1Response.status}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{v1Response.time}ms</span>
                          {v1Response.status >= 200 && v1Response.status < 300
                            ? <span style={{ fontSize: '12px', color: 'var(--green)' }}><i className="fas fa-check-circle" style={{ marginRight: '4px' }} />Success</span>
                            : <span style={{ fontSize: '12px', color: 'var(--red)' }}><i className="fas fa-circle-xmark" style={{ marginRight: '4px' }} />{v1Response.error || 'Error'}</span>
                          }
                          {v1Response.data?.token && (
                            <span style={{ fontSize: '11px', color: '#8b5cf6', background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.25)', borderRadius: '5px', padding: '2px 7px' }}>
                              <i className="fas fa-circle-check" style={{ marginRight: '4px' }} />Token captured automatically
                            </span>
                          )}
                        </div>

                        {/* Summary chips */}
                        {v1Response.data && typeof v1Response.data === 'object' && !v1Response.data.error && (
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                            {v1Response.data.total !== undefined && (
                              <span style={{ fontSize: '11px', background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.2)', borderRadius: '5px', padding: '3px 8px', color: '#3b82f6', fontWeight: '600' }}>
                                {v1Response.data.total?.toLocaleString()} total records
                              </span>
                            )}
                            {Array.isArray(v1Response.data.data) && (
                              <span style={{ fontSize: '11px', background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.2)', borderRadius: '5px', padding: '3px 8px', color: '#16a34a', fontWeight: '600' }}>
                                {v1Response.data.data.length} rows returned
                              </span>
                            )}
                            {Array.isArray(v1Response.data.modules) && (
                              <span style={{ fontSize: '11px', background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.2)', borderRadius: '5px', padding: '3px 8px', color: '#16a34a', fontWeight: '600' }}>
                                {v1Response.data.modules.length} modules accessible
                              </span>
                            )}
                            {v1Response.data.page !== undefined && v1Response.data.total !== undefined && (
                              <span style={{ fontSize: '11px', background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.2)', borderRadius: '5px', padding: '3px 8px', color: '#8b5cf6', fontWeight: '600' }}>
                                Page {v1Response.data.page} of {Math.ceil((v1Response.data.total || 0) / (v1Response.data.limit || 1))}
                              </span>
                            )}
                          </div>
                        )}

                        {/* JSON body */}
                        <div style={{ position: 'relative' }}>
                          <pre style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px 16px', fontSize: '11px', fontFamily: 'monospace', overflowX: 'auto', margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6, maxHeight: '340px', overflowY: 'auto' }}>
                            {v1Response.error && !v1Response.data
                              ? `Network error: ${v1Response.error}`
                              : JSON.stringify(v1Response.data, null, 2)}
                          </pre>
                          <button
                            onClick={() => navigator.clipboard.writeText(JSON.stringify(v1Response.data, null, 2))}
                            style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '5px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Endpoint Documentation ── */}
            <div style={{ fontWeight: '800', fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-book" />Endpoint Reference
            </div>

            <EndpointCard
              method="POST" path="/api/v1/auth/login" auth="none"
              summary="Generate Bearer token"
              desc="Authenticates with username and password and returns a Bearer token for use in subsequent API calls. The token has no expiry by default unless configured by admin."
              reqBody={`{
  "username": "john_doe",
  "password": "yourpassword"
}`}
              resBody={`// Success — 200
{
  "token":      "tok_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
  "expires_at": null,
  "user": {
    "id":   "92bf05fc-2512-11f1-bb0f-00ff85e28522",
    "name": "John Doe",
    "role": "user"
  }
}

// Error — 401
{ "error": "Invalid credentials" }

// Account not active — 403
{ "error": "Account is inactive or pending approval" }`}
              notes="Tokens are stored in the api_tokens table and usage is logged in api_token_usage. Tokens can be revoked by admins via Admin Panel → API Playground."
            />

            <EndpointCard
              method="GET" path="/api/v1/[table]" auth="token"
              summary="Query records from a table"
              desc="Returns paginated records from a supported module table. All timestamps are in UTC. System columns (uploaded_by, upload_batch_id, *_hash) are stripped from the response."
              params={[
                { name: '[table]',   type: 'path param', required: true,  desc: 'DB table name — e.g. unauthorized_search_result, iptv_apps_internet' },
                { name: 'page',      type: 'integer',    required: false, desc: 'Page number, default 1' },
                { name: 'limit',     type: 'integer',    required: false, desc: 'Rows per page, default 25, max 1000' },
                { name: 'date_from', type: 'date',       required: false, desc: 'Filter from date (YYYY-MM-DD) — uses date_of_identification for non-IPTV, identification_date for IPTV modules' },
                { name: 'date_to',   type: 'date',       required: false, desc: 'Filter to date (YYYY-MM-DD)' },
                { name: 'title',     type: 'string',     required: false, desc: 'Keyword search on title/name/iptv_application_name/pirate_brand columns (varies by module)' },
              ]}
              resBody={`// ════════════════════════════════════════════════════════════════════════
// UNAUTHORIZED SEARCH RESULT  —  GET /api/v1/unauthorized_search_result
// ════════════════════════════════════════════════════════════════════════
{
  "success": true,
  "table":   "unauthorized_search_result",
  "total":   6144,
  "page":    1,
  "pages":   246,
  "limit":   25,
  "filters": { "date_from": null, "date_to": null, "title": null },
  "data": [{
    "id":                         "539e56ba-251b-11f1-bb0f-00ff85e28522",
    "date_of_identification":     "2026-03-08T03:36:49.000Z",
    "title":                      "THE AMAZING SPIDER-MAN",
    "copyright_owner":            "Sony Pictures Entertainment Inc.",
    "linking_url":                "https://bflix.la/watch/movie-the-amazing-spider-man",
    "website":                    "bflix.la",
    "pirate_website_brand":       "Bflix",
    "sw_data_month":              null,
    "sw_monthly_traffic":         3235000,
    "traffic_from_search_engines":null,
    "sw_global_rank":             18810,
    "sw_popular_country":         null,
    "sw_country_rank":            null,
    "market_scanned":             "USA",
    "search_engine":              "Website",
    "keyword":                    "THE AMAZING SPIDER-MAN",
    "page_no":                    null,
    "url_rank":                   null,
    "language_1":                 "English",
    "language_2":                 null,
    "language_3":                 null,
    "linking_html_tag":           null,
    "notice_id_google":           "1357E0C9-2A52-41BB-A6C3-DA4248673B6C",
    "notice_sent_date_google":    null,
    "urls_delisting_date_google": null,
    "url_status_google":          "Approved",
    "notice_id_bing":             "b1357E0C9-2A52-41BB-A6C3-DA4248673B6C",
    "notice_sent_date_bing":      null,
    "urls_delisting_date_bing":   null,
    "url_status_bing":            "Approved",
    "notice_id_yandex":           "y1357E0C9-2A52-41BB-A6C3-DA4248673B6C",
    "notice_sent_date_yandex":    null,
    "urls_delisting_date_yandex": null,
    "url_status_yandex":          "Approved",
    "tat_google":                 null,
    "removal_status":             null,
    "removal_timestamp":          null
  }]
}

// ════════════════════════════════════════════════════════════════════════
// ADS TUTORIALS - SOCIAL MEDIA  —  GET /api/v1/ads_tutorials_social_media
// ════════════════════════════════════════════════════════════════════════
{
  "success": true,
  "table":   "ads_tutorials_social_media",
  "total":   312,
  "page":    1,
  "pages":   13,
  "limit":   25,
  "filters": { "date_from": null, "date_to": null, "title": null },
  "data": [{
    "id":                         "a1b2c3d4-251b-11f1-bb0f-00ff85e28522",
    "date_of_identification":     "2026-03-10T06:00:00.000Z",
    "platform_name":              "YouTube",
    "platform_domain":            "youtube.com",
    "content_owner":              "Sports Corp",
    "pirate_domain":              "streampirate.cc",
    "pirate_brand":               "StreamPirate",
    "video_posts_urls":           "https://youtube.com/watch?v=abc123",
    "channel_profile_page_urls":  "https://youtube.com/c/piratestream",
    "channel_page_profile_name":  "Pirate Stream Channel",
    "subscribers":                45200,
    "views":                      128000,
    "post_description":           "Watch full movies free",
    "language_of_post":           "English",
    "type_of_post":               "Video",
    "linking_url":                "https://streampirate.cc/movies",
    "keywords":                   "free movies streaming",
    "market_scanned":             "IN",
    "url_status":                 "Removed",
    "notice_id":                  "NT-2026-001",
    "notice_sent_date":           "2026-03-15T06:00:00.000Z",
    "url_removal_date":           "2026-03-20T10:00:00.000Z",
    "tat":                        "10 days"
  }]
}

// ════════════════════════════════════════════════════════════════════════
// PASSWORD SHARING - SOCIAL MEDIA  —  GET /api/v1/password_sharing_social_media
// ════════════════════════════════════════════════════════════════════════
{
  "success": true,
  "table":   "password_sharing_social_media",
  "total":   180,
  "page":    1,
  "pages":   8,
  "limit":   25,
  "filters": { "date_from": null, "date_to": null, "title": null },
  "data": [{
    "id":                         "b1c2d3e4-251b-11f1-bb0f-00ff85e28522",
    "date_of_identification":     "2026-04-01T05:30:00.000Z",
    "platform_name":              "Telegram",
    "platform_domain_name":       "telegram.org",
    "content_owner":              "Sports Corp",
    "listing_posts_urls":         "https://t.me/pirateshare/12345",
    "channel_profile_page_urls":  "https://t.me/pirateshare",
    "channel_page_profile_name":  "PirateShare Group",
    "subscribers":                8900,
    "views":                      null,
    "post_description":           "Sharing OTT credentials",
    "language_of_post":           "English",
    "type_of_post":               "Post",
    "linking_url":                null,
    "credentials_available":      "Yes",
    "login_id":                   "user@email.com",
    "login_password":             "pass1234",
    "login_validation_status":    "Valid",
    "seller_name":                "SharerBot",
    "seller_country":             "IN",
    "listing_price":              null,
    "listing_currency":           null,
    "offers_discount":            null,
    "keywords":                   "OTT password share",
    "market_scanned":             "IN",
    "notes":                      null,
    "url_status":                 "Pending",
    "notice_id":                  null,
    "notice_sent_date":           null,
    "removal_date":               null,
    "tat":                        null
  }]
}

// ════════════════════════════════════════════════════════════════════════
// PASSWORD SHARING - MARKETPLACE  —  GET /api/v1/password_sharing_marketplace
// ════════════════════════════════════════════════════════════════════════
{
  "success": true,
  "table":   "password_sharing_marketplace",
  "total":   95,
  "page":    1,
  "pages":   4,
  "limit":   25,
  "filters": { "date_from": null, "date_to": null, "title": null },
  "data": [{
    "id":                         "c1d2e3f4-251b-11f1-bb0f-00ff85e28522",
    "date_of_identification":     "2026-05-10T06:00:00.000Z",
    "platform_name":              "eBay",
    "platform_domain_name":       "ebay.com",
    "market_scanned":             "USA",
    "content_owner":              "Sports Corp",
    "listing_url":                "https://ebay.com/itm/12345678",
    "login_id":                   "buyer@email.com",
    "login_password":             "pass5678",
    "login_validation_status":    "Valid",
    "listing_title":              "HD Sports Streaming 12 months",
    "seller_name":                "FastSeller99",
    "shop_url":                   "https://ebay.com/usr/fastseller99",
    "seller_country":             "US",
    "listing_price":              9.99,
    "listing_currency":           "USD",
    "offers_discount":            "10% off",
    "validity":                   "12 months",
    "type_of_listing":            "Buy It Now",
    "keywords":                   "sports streaming 12 month",
    "no_of_reviews":              142,
    "ratings":                    4.8,
    "no_of_buys":                 89,
    "notes":                      null,
    "url_status":                 "Removed",
    "notice_id":                  "NT-MKT-2026-005",
    "notice_sent_date":           "2026-05-15T06:00:00.000Z",
    "removal_date":               "2026-05-20T10:00:00.000Z",
    "tat":                        "5 days"
  }]
}

// ════════════════════════════════════════════════════════════════════════
// IPTV & APPS - INTERNET  —  GET /api/v1/iptv_apps_internet
// ════════════════════════════════════════════════════════════════════════
{
  "success": true,
  "table":   "iptv_apps_internet",
  "total":   2480,
  "page":    1,
  "pages":   100,
  "limit":   25,
  "filters": { "date_from": null, "date_to": null, "title": null },
  "data": [{
    "id":                           "d1e2f3a4-251b-11f1-bb0f-00ff85e28522",
    "identification_date":          "2026-06-01T05:30:00.000Z",
    "week_bise":                    "W22-2026",
    "type":                         "IPTV",
    "iptv_application_name":        "StreamBox Pro",
    "source_url":                   "https://streambox.cc/download",
    "source_domain":                "streambox.cc",
    "keywords":                     "iptv streaming box",
    "search_engine":                "Google",
    "page_no":                      1,
    "page_rank":                    3,
    "market_country":               "IN",
    "content_owner":                "Sports Corp",
    "trademark_wordmark":           "Sports Corp",
    "category":                     "Sports+Content",
    "sw_data_month":                "2026-05",
    "search_traffic":               12000,
    "sw_monthly_traffic":           850000,
    "unique_monthly_visits":        620000,
    "sw_global_rank":               8420,
    "sw_popular_country":           "IN",
    "sw_country_rank":              1240,
    "approved_for_enforcement":     "Y",
    "disruption_status":            "Active",
    "url_delisting_status_google":  "Approved",
    "notice_sent_date_google":      "2026-06-05T06:00:00.000Z",
    "notice_id_google":             "LU-1357E0C9-GOOG",
    "tcrp_case_id":                 "TCRP-2026-001",
    "delisting_timestamp_google":   "2026-06-10T10:00:00.000Z",
    "tat_google":                   "9 days",
    "url_delisting_status_bing":    "Pending",
    "notice_sent_date_bing":        null,
    "notice_id_bing":               null,
    "tcrp_case_id_bing":            null,
    "delisting_timestamp_bing":     null,
    "tat_bing":                     null,
    "url_delisting_status_yandex":  null,
    "notice_sent_date_yandex":      null,
    "notice_id_yandex":             null,
    "tcrp_case_id_yandex":          null,
    "delisting_timestamp_yandex":   null,
    "tat_yandex":                   null
  }]
}

// ════════════════════════════════════════════════════════════════════════
// IPTV & APPS - APPS  —  GET /api/v1/iptv_apps_apps
// ════════════════════════════════════════════════════════════════════════
{
  "success": true,
  "table":   "iptv_apps_apps",
  "total":   750,
  "page":    1,
  "pages":   30,
  "limit":   25,
  "filters": { "date_from": null, "date_to": null, "title": null },
  "data": [{
    "id":                       "e1f2a3b4-251b-11f1-bb0f-00ff85e28522",
    "identification_date":      "2026-07-01T05:30:00.000Z",
    "week_bise":                "W27-2026",
    "type":                     "App",
    "platform":                 "Android",
    "iptv_application_name":    "PirateTV App",
    "source_url":               "https://apkpure.com/pirate-tv/com.piratv",
    "source_domain":            "apkpure.com",
    "platforms":                "Android",
    "keywords":                 "iptv apk free download",
    "apps_version":             "v3.2.1",
    "developer_name":           "UnknownDev",
    "developer_id":             "dev.unknown.piratv",
    "developer_website_email":  "dev@unknown.io",
    "market":                   "IN",
    "content_owner":            "Sports Corp",
    "trademark_wordmark":       "Sports Corp",
    "category":                 "Sports",
    "subscription_paid_free":   "Free",
    "subscription_cost":        null,
    "subscription_currency":    null,
    "validity":                 null,
    "approved_for_enforcement": "Y",
    "disruption_status":        "Removed",
    "first_notice_date":        "2026-07-05T06:00:00.000Z",
    "notice_id":                "NT-APP-2026-010",
    "date_of_last_followup":    "2026-07-12",
    "no_of_times_followup":     2,
    "removal_timestamp":        "2026-07-15T08:00:00.000Z",
    "tat":                      "14 days"
  }]
}

// ════════════════════════════════════════════════════════════════════════
// IPTV & APPS - SOCIAL MEDIA  —  GET /api/v1/iptv_apps_social_media
// ════════════════════════════════════════════════════════════════════════
{
  "success": true,
  "table":   "iptv_apps_social_media",
  "total":   430,
  "page":    1,
  "pages":   18,
  "limit":   25,
  "filters": { "date_from": null, "date_to": null, "title": null },
  "data": [{
    "id":                        "f1a2b3c4-251b-11f1-bb0f-00ff85e28522",
    "identification_date":       "2026-08-01T05:30:00.000Z",
    "week_bise":                 "W31-2026",
    "type":                      "Social Media",
    "iptv_application_name":     "IPTV Share Group",
    "source_url":                "https://t.me/iptvshare/89",
    "channel_profile_page_urls": "https://t.me/iptvshare",
    "source_domain":             "t.me",
    "infringement_type":         "Live Sports Stream",
    "channel_page_profile_name": "IPTV Share",
    "copyright_owner":           "Sports Corp",
    "trademark_wordmark":        "Sports Corp",
    "category":                  "Sports",
    "subscriber_follower":       23400,
    "views_likes":               "5K",
    "keywords":                  "iptv telegram free",
    "market_country":            "IN",
    "approved_for_enforcement":  "Y",
    "disruption_status":         "Active",
    "date_time_first_notice":    null,
    "notice_id":                 null,
    "date_of_last_followup":     null,
    "no_of_times_followup":      0,
    "removal_timestamp":         null,
    "tat":                       null
  }]
}

// ════════════════════════════════════════════════════════════════════════
// IPTV & APPS - MARKETPLACE  —  GET /api/v1/iptv_apps_marketplace
// ════════════════════════════════════════════════════════════════════════
{
  "success": true,
  "table":   "iptv_apps_marketplace",
  "total":   210,
  "page":    1,
  "pages":   9,
  "limit":   25,
  "filters": { "date_from": null, "date_to": null, "title": null },
  "data": [{
    "id":                        "a2b3c4d5-251b-11f1-bb0f-00ff85e28522",
    "identification_date":       "2026-09-01T05:30:00.000Z",
    "week_bise":                 "W36-2026",
    "type":                      "Marketplace",
    "iptv_application_name":     "SuperIPTV",
    "intermediary_type":         "E-Commerce",
    "source_url":                "https://amazon.in/dp/B0001IPTV",
    "source_domain":             "amazon.in",
    "platform":                  "Amazon",
    "seller_profile_page_url":   "https://amazon.in/s?me=SELLER123",
    "copyright_owner":           "Sports Corp",
    "trademark_wordmark":        "Sports Corp",
    "category":                  "Content",
    "device_name":               "Android Box",
    "keywords":                  "iptv subscription amazon",
    "market_country":            "IN",
    "subscription_cost":         499,
    "subscription_currency":     "INR",
    "seller_name_company":       "FastSeller Ltd",
    "seller_country":            "IN",
    "number_of_buys":            320,
    "approved_for_enforcement":  "Y",
    "disruption_status":         "Removed",
    "date_time_first_notice":    "2026-09-05T06:00:00.000Z",
    "notice_id":                 "NT-MKT-IPTV-2026-020",
    "date_of_last_followup":     "2026-09-08",
    "no_of_times_followup":      1,
    "removal_timestamp":         "2026-09-10T08:00:00.000Z",
    "tat":                       "9 days"
  }]
}

// ════════════════════════════════════════════════════════════════════════
// IPTV & APPS - META ADS  —  GET /api/v1/iptv_apps_meta_ads
// ════════════════════════════════════════════════════════════════════════
{
  "success": true,
  "table":   "iptv_apps_meta_ads",
  "total":   115,
  "page":    1,
  "pages":   5,
  "limit":   25,
  "filters": { "date_from": null, "date_to": null, "title": null },
  "data": [{
    "id":                        "b3c4d5e6-251b-11f1-bb0f-00ff85e28522",
    "identification_date":       "2026-10-01T05:30:00.000Z",
    "week_bise":                 "W40-2026",
    "type":                      "Meta Ads",
    "iptv_application_name":     "IPTV Promo Ad",
    "intermediary_type":         "Meta Ads",
    "source_url":                "https://facebook.com/ads/library/?id=12345678",
    "advertiser_channel_url":    "https://facebook.com/pirateiptv",
    "platform":                  "Facebook",
    "library_id":                "12345678",
    "copyright_owner":           "Sports Corp",
    "trademark_wordmark":        "Sports Corp",
    "category":                  "Sports",
    "keywords":                  "iptv subscription cheapest",
    "market_country":            "IN",
    "followers_subscribers":     18700,
    "listing_date":              "2026-09-25",
    "seller_name":               "AdSeller Co",
    "approved_for_enforcement":  "Y",
    "disruption_status":         "Removed",
    "date_time_first_notice":    "2026-10-03T06:00:00.000Z",
    "notice_id":                 "NT-META-2026-008",
    "date_of_last_followup":     "2026-10-06",
    "no_of_times_followup":      1,
    "removal_timestamp":         "2026-10-08T09:00:00.000Z",
    "tat":                       "7 days"
  }]
}

// Unauthorized — 401
{ "error": "Unauthorized — provide a valid Bearer token via Authorization header" }

// Unknown table — 404
{ "error": "Unknown table: \\"invalid_table\\"" }`}
              notes="Non-IPTV modules (unauthorized_search_result, ads_tutorials_social_media, password_sharing_*) use date_of_identification as the date filter column and url_status for removal tracking. IPTV modules (iptv_apps_*) use identification_date, disruption_status, and removal_timestamp. System columns (uploaded_by, upload_batch_id, sr_no, *_hash) are stripped. All timestamps are UTC."
            />

            <EndpointCard
              method="GET" path="/api/v1/modules" auth="token"
              summary="List authorised modules"
              desc="Returns the list of module names the authenticated token owner is authorised to access. Use the returned names to discover which table values are valid for GET /api/v1/[table]."
              resBody={`// Status 200
{
  "success": true,
  "modules": [
    "Unauthorized Search Result",
    "Ads Tutorials- Social Media",
    "Password Sharing-Social Med.",
    "Password Sharing-Marketplace",
    "IPTV & Apps - Internet",
    "IPTV & Apps - Apps",
    "IPTV & Apps - Social Media",
    "IPTV & Apps - Marketplace",
    "IPTV & Apps - Marketplace",
    "IPTV & Apps - Meta Ads"
  ]
}

// Unauthorized — 401
{ "error": "Unauthorized" }`}
              notes="Admins and superadmins receive all active module names. Regular users receive only modules where can_view = 1 is granted in user_module_permissions."
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
