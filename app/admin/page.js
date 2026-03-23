'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import IpHouseLoader from '@/components/IpHouseLoader'
import { SHEET_CONFIG } from '@/lib/sheetConfig'

const SHEET_NAMES = Object.keys(SHEET_CONFIG)
const TPL_SKIP = new Set(['uploaded_by', 'upload_batch_id', 'created_at', 'updated_at', 'sr_no'])

const PERM_FIELDS = [
  { key: 'can_view', label: 'View', icon: 'fa-eye' },
  { key: 'can_upload', label: 'Upload', icon: 'fa-upload' },
  { key: 'can_edit', label: 'Edit', icon: 'fa-pen' },
  { key: 'can_delete', label: 'Delete', icon: 'fa-trash' },
  { key: 'can_bulk_update', label: 'Bulk Update', icon: 'fa-list-check' },
  { key: 'can_export', label: 'Export', icon: 'fa-download' },
]

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s',
      background: checked ? 'var(--accent)' : 'var(--border2)',
    }}>
      <span style={{
        position: 'absolute', top: '3px', width: '16px', height: '16px', borderRadius: '50%',
        background: '#fff', transition: 'left .2s', left: checked ? '21px' : '3px',
      }} />
    </button>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('user')
  const [tab, setTab] = useState('users')

  // API Playground state
  const [apiTokens, setApiTokens]         = useState([])
  const [apiUsage,  setApiUsage]           = useState([])
  const [loadingTokens, setLoadingTokens] = useState(false)
  const [playUser,  setPlayUser]           = useState('')
  const [playPass,  setPlayPass]           = useState('')
  const [playToken, setPlayToken]         = useState('')
  const [playTokenErr, setPlayTokenErr]   = useState('')
  const [playTable,    setPlayTable]      = useState('unauthorized_search_result')
  const [playDateFrom, setPlayDateFrom]   = useState('')
  const [playDateTo,   setPlayDateTo]     = useState('')
  const [playTitle,    setPlayTitle]      = useState('')
  const [playPage,     setPlayPage]       = useState('1')
  const [playLimit,    setPlayLimit]      = useState('25')
  const [playResp,     setPlayResp]       = useState(null)
  const [playLoading,  setPlayLoading]    = useState(false)
  const [playRespTime, setPlayRespTime]   = useState(null)
  const [copiedToken,  setCopiedToken]    = useState(false)

  // Users
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showAddUser, setShowAddUser] = useState(false)

  // Permissions
  const [permissions, setPermissions] = useState([])
  const [loadingPerms, setLoadingPerms] = useState(false)
  const [savingPerms, setSavingPerms] = useState(false)
  const [permResult, setPermResult] = useState(null)

  // New User form
  const [newUser, setNewUser] = useState({ first_name: '', last_name: '', email: '', username: '', password: '', role: 'user', is_active: true })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  // Change Password modal
  const [pwdModal, setPwdModal] = useState(null) // { id, name }
  const [pwdValue, setPwdValue] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState('')
  const [pwdSaving, setPwdSaving] = useState(false)

  // DB Optimize
  const [dbReport, setDbReport]       = useState(null)
  const [dbLoading, setDbLoading]     = useState(false)
  const [dbApplying, setDbApplying]   = useState(false)
  const [dbApplyResult, setDbApplyResult] = useState(null)

  // Pending approvals
  const [pendingUsers, setPendingUsers]       = useState([])
  const [loadingPending, setLoadingPending]   = useState(false)
  const [approvalResult, setApprovalResult]   = useState(null)
  const [rejectReason, setRejectReason]       = useState({})

  // Email config
  const [emailConfigs, setEmailConfigs]       = useState([])
  const [emailPurposes, setEmailPurposes]     = useState([])
  const [loadingEmail, setLoadingEmail]       = useState(false)
  const [emailResult, setEmailResult]         = useState(null)
  const [showEmailForm, setShowEmailForm]     = useState(false)
  const [editEmailId, setEditEmailId]         = useState(null)
  const [emailForm, setEmailForm]             = useState({
    purpose: 'notification', label: '', smtp_host: 'smtp.gmail.com', smtp_port: 587,
    smtp_secure: false, smtp_user: '', smtp_pass: '', from_name: '', from_email: '', is_active: true,
  })
  const [testingEmail, setTestingEmail]       = useState(false)

  // Template column config
  const [tplSheet,   setTplSheet]   = useState(SHEET_NAMES[0])
  const [tplType,    setTplType]    = useState('upload')
  const [tplCols,    setTplCols]    = useState([])
  const [tplLoading, setTplLoading] = useState(false)
  const [tplSaving,  setTplSaving]  = useState(false)
  const [tplResult,  setTplResult]  = useState(null)
  const [tplDirty,   setTplDirty]   = useState(false)
  const tplDragSrc = useRef(null)

  useEffect(() => {
    fetch('/api/auth/check').then(r => r.json()).then(d => {
      if (!d.authenticated) router.push('/login?session_expired=1')
      else if (d.role !== 'superadmin' && d.role !== 'admin') router.push('/upload')
      else { setUserName(d.userName); setUserRole(d.role) }
    })
  }, [router])

  useEffect(() => {
    if (tab === 'users')     fetchUsers()
    if (tab === 'pending')   fetchPendingUsers()
    if (tab === 'api')       fetchApiTokens()
    if (tab === 'db')        fetchDbReport()
    if (tab === 'email')     fetchEmailConfigs()
    if (tab === 'templates') fetchTemplateConfig(tplSheet, tplType)
  }, [tab])

  async function fetchDbReport() {
    setDbLoading(true); setDbReport(null); setDbApplyResult(null)
    try {
      const res = await fetch('/api/admin/db-optimize')
      const d   = await res.json()
      setDbReport(d)
    } catch (e) { setDbReport({ error: e.message }) }
    finally { setDbLoading(false) }
  }

  async function applyDbIndexes() {
    setDbApplying(true); setDbApplyResult(null)
    try {
      const res = await fetch('/api/admin/db-optimize', { method: 'POST' })
      const d   = await res.json()
      setDbApplyResult(d)
      fetchDbReport()
    } catch (e) { setDbApplyResult({ error: e.message }) }
    finally { setDbApplying(false) }
  }

  async function fetchApiTokens() {
    setLoadingTokens(true)
    try {
      const res = await fetch('/api/admin/tokens')
      const d   = await res.json()
      setApiTokens(d.tokens    || [])
      setApiUsage(d.recentUsage || [])
    } catch {} finally { setLoadingTokens(false) }
  }

  async function generatePlayToken() {
    setPlayTokenErr(''); setPlayToken('')
    if (!playUser || !playPass) { setPlayTokenErr('Enter username and password'); return }
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: playUser, password: playPass }),
      })
      const d = await res.json()
      if (d.token) { setPlayToken(d.token); fetchApiTokens() }
      else setPlayTokenErr(d.error || 'Login failed')
    } catch { setPlayTokenErr('Request failed') }
  }

  async function executePlayRequest() {
    if (!playToken) { setPlayResp({ error: 'Generate or enter a token first' }); return }
    setPlayLoading(true); setPlayResp(null)
    const params = new URLSearchParams({ page: playPage, limit: playLimit })
    if (playDateFrom) params.set('date_from', playDateFrom)
    if (playDateTo)   params.set('date_to',   playDateTo)
    if (playTitle)    params.set('title',      playTitle)
    const url = `/api/v1/${playTable}?${params}`
    const t0 = Date.now()
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${playToken}` } })
      const d   = await res.json()
      setPlayRespTime(Date.now() - t0)
      setPlayResp({ status: res.status, ...d })
      fetchApiTokens()
    } catch (e) { setPlayResp({ error: e.message }) }
    setPlayLoading(false)
  }

  async function revokeToken(id) {
    await fetch(`/api/admin/tokens?id=${id}`, { method: 'DELETE' })
    fetchApiTokens()
  }

  function copyToken() {
    navigator.clipboard.writeText(playToken).then(() => {
      setCopiedToken(true)
      setTimeout(() => setCopiedToken(false), 2000)
    })
  }

  async function fetchUsers() {
    setLoadingUsers(true)
    try {
      const res = await fetch('/api/admin/users')
      const d = await res.json()
      const all = d.users || []
      setUsers(all)
      setPendingUsers(all.filter(u => u.status === 'pending'))
    } catch {} finally { setLoadingUsers(false) }
  }

  async function fetchPendingUsers() {
    setLoadingPending(true); setApprovalResult(null)
    try {
      const res = await fetch('/api/admin/users')
      const d   = await res.json()
      setPendingUsers((d.users || []).filter(u => u.status === 'pending'))
    } catch {} finally { setLoadingPending(false) }
  }

  async function handleApproval(userId, action) {
    setApprovalResult(null)
    const reason = rejectReason[userId] || ''
    const res = await fetch('/api/admin/users/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, action, reason }),
    })
    const d = await res.json()
    setApprovalResult(d)
    if (d.success) fetchPendingUsers()
  }

  async function fetchEmailConfigs() {
    setLoadingEmail(true); setEmailResult(null)
    try {
      const res = await fetch('/api/admin/email-config')
      const d   = await res.json()
      setEmailConfigs(d.configs || [])
      setEmailPurposes(d.purposes || [])
    } catch {} finally { setLoadingEmail(false) }
  }

  function startEditEmail(cfg) {
    setEditEmailId(cfg.id)
    setEmailForm({ purpose: cfg.purpose, label: cfg.label, smtp_host: cfg.smtp_host, smtp_port: cfg.smtp_port, smtp_secure: Boolean(cfg.smtp_secure), smtp_user: cfg.smtp_user, smtp_pass: '', from_name: cfg.from_name, from_email: cfg.from_email, is_active: Boolean(cfg.is_active) })
    setShowEmailForm(true)
  }

  function startNewEmail() {
    setEditEmailId(null)
    setEmailForm({ purpose: 'notification', label: '', smtp_host: 'smtp.gmail.com', smtp_port: 587, smtp_secure: false, smtp_user: '', smtp_pass: '', from_name: '', from_email: '', is_active: true })
    setShowEmailForm(true)
  }

  async function saveEmailConfig(e) {
    e.preventDefault(); setEmailResult(null)
    const res = await fetch('/api/admin/email-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...emailForm, id: editEmailId }),
    })
    const d = await res.json()
    setEmailResult(d)
    if (d.success) { setShowEmailForm(false); fetchEmailConfigs() }
  }

  async function deleteEmailConfig(id) {
    const res = await fetch('/api/admin/email-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id }) })
    const d = await res.json()
    if (d.success) fetchEmailConfigs()
  }

  async function testEmailConnection() {
    setTestingEmail(true); setEmailResult(null)
    const res = await fetch('/api/admin/email-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'test', ...emailForm }),
    })
    const d = await res.json()
    setEmailResult(d)
    setTestingEmail(false)
  }

  async function fetchTemplateConfig(sheet, type) {
    setTplLoading(true); setTplResult(null)
    try {
      const res = await fetch(`/api/admin/template-config?sheet=${encodeURIComponent(sheet)}&type=${type}`)
      const d   = await res.json()
      const cfg = SHEET_CONFIG[sheet]
      // Build full column list from SHEET_CONFIG (excludes system cols)
      const baseCols = cfg.columns.filter(c =>
        !TPL_SKIP.has(c.key) && !c.key.endsWith('_hash') &&
        (type === 'update' || c.key !== 'id')
      )
      if (d.columnKeys) {
        const savedSet = new Set(d.columnKeys)
        const saved    = d.columnKeys.map(k => baseCols.find(c => c.key === k)).filter(Boolean).map(c => ({ ...c, included: true }))
        const unsaved  = baseCols.filter(c => !savedSet.has(c.key)).map(c => ({ ...c, included: false }))
        setTplCols([...saved, ...unsaved])
      } else {
        setTplCols(baseCols.map(c => ({ ...c, included: true })))
      }
      setTplDirty(false)
    } catch (e) { setTplResult({ error: e.message }) }
    finally { setTplLoading(false) }
  }

  async function saveTemplateConfig() {
    const included = tplCols.filter(c => c.included).map(c => c.key)
    if (!included.length) { setTplResult({ error: 'At least one column must be included' }); return }
    setTplSaving(true); setTplResult(null)
    try {
      const res = await fetch('/api/admin/template-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetName: tplSheet, templateType: tplType, columnKeys: included }),
      })
      const d = await res.json()
      if (d.success) { setTplResult({ success: 'Template configuration saved!' }); setTplDirty(false) }
      else setTplResult({ error: d.error })
    } catch (e) { setTplResult({ error: e.message }) }
    finally { setTplSaving(false) }
  }

  async function resetTemplateConfig() {
    setTplSaving(true); setTplResult(null)
    try {
      await fetch('/api/admin/template-config', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetName: tplSheet, templateType: tplType }),
      })
      await fetchTemplateConfig(tplSheet, tplType)
      setTplResult({ success: 'Reset to default (all columns included)' })
    } catch (e) { setTplResult({ error: e.message }) }
    finally { setTplSaving(false) }
  }

  function tplToggle(idx) {
    const cfg = SHEET_CONFIG[tplSheet]
    const col = tplCols[idx]
    // Lock: id in update, uniqueUrlCol in upload
    if (tplType === 'update' && col.key === 'id') return
    if (tplType === 'upload' && cfg.uniqueUrlCol && col.key === cfg.uniqueUrlCol) return
    setTplCols(prev => prev.map((c, i) => i === idx ? { ...c, included: !c.included } : c))
    setTplDirty(true)
  }

  function tplDragStart(idx) { tplDragSrc.current = idx }
  function tplDragOver(e, idx) {
    e.preventDefault()
    if (tplDragSrc.current === null || tplDragSrc.current === idx) return
    const next = [...tplCols]
    const [item] = next.splice(tplDragSrc.current, 1)
    next.splice(idx, 0, item)
    tplDragSrc.current = idx
    setTplCols(next)
    setTplDirty(true)
  }
  function tplDragEnd() { tplDragSrc.current = null }

  async function fetchPermissions(userId) {
    setLoadingPerms(true); setPermResult(null)
    try {
      const res = await fetch(`/api/admin/permissions?user_id=${userId}`)
      const d = await res.json()
      setPermissions(d.permissions || [])
    } catch {} finally { setLoadingPerms(false) }
  }

  function selectUserForPerms(user) {
    setSelectedUser(user)
    setTab('permissions')
    fetchPermissions(user.id)
  }

  function togglePerm(moduleId, permKey) {
    setPermissions(prev => prev.map(p =>
      p.module_id === moduleId ? { ...p, [permKey]: p[permKey] ? 0 : 1 } : p
    ))
  }

  function setAllForModule(moduleId, value) {
    setPermissions(prev => prev.map(p =>
      p.module_id === moduleId ? { ...p, can_view: value, can_upload: value, can_edit: value, can_delete: value, can_bulk_update: value, can_export: value } : p
    ))
  }

  function setAllForPerm(permKey, value) {
    setPermissions(prev => prev.map(p => ({ ...p, [permKey]: value ? 1 : 0 })))
  }

  async function savePermissions() {
    if (!selectedUser) return
    setSavingPerms(true); setPermResult(null)
    try {
      const res = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: selectedUser.id, permissions }),
      })
      const d = await res.json()
      setPermResult(d)
    } catch { setPermResult({ error: 'Save failed' }) }
    finally { setSavingPerms(false) }
  }

  async function handleAddUser(e) {
    e.preventDefault()
    setSaving(true); setFormError(''); setFormSuccess('')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
      const d = await res.json()
      if (d.success) {
        setFormSuccess('User created successfully')
        setNewUser({ first_name: '', last_name: '', email: '', username: '', password: '', role: 'user', is_active: true })
        fetchUsers()
        setTimeout(() => { setShowAddUser(false); setFormSuccess('') }, 1500)
      } else setFormError(d.error || 'Failed to create user')
    } catch { setFormError('Server error') }
    finally { setSaving(false) }
  }

  async function toggleUserActive(user) {
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, is_active: !user.is_active }),
    })
    const d = await res.json()
    if (d.success) fetchUsers()
  }

  function openPwdModal(user) {
    setPwdModal({ id: user.id, name: `${user.first_name} ${user.last_name}` })
    setPwdValue(''); setPwdError(''); setPwdSuccess('')
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    if (!pwdValue || pwdValue.length < 6) { setPwdError('Password must be at least 6 characters'); return }
    setPwdSaving(true); setPwdError(''); setPwdSuccess('')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pwdModal.id, password: pwdValue }),
      })
      const d = await res.json()
      if (d.success) {
        setPwdSuccess('Password changed successfully')
        setTimeout(() => setPwdModal(null), 1200)
      } else setPwdError(d.error || 'Failed to change password')
    } catch { setPwdError('Server error') }
    finally { setPwdSaving(false) }
  }

  async function changeUserRole(user, newRole) {
    if (user.role === newRole) return
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, role: newRole }),
    })
    const d = await res.json()
    if (d.success) fetchUsers()
  }

  const roleColor = { superadmin: 'var(--red)', admin: 'var(--accent)', user: 'var(--text-secondary)' }

  return (
    <div className="page-content">
      <div className="main">

        {/* Header */}
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '4px' }}>
              <i className="fas fa-user-shield" style={{ color: 'var(--accent)', marginRight: '10px' }} />Admin Panel
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Manage users and module-level permissions</p>
          </div>
          {tab === 'users' && (
            <button className="btn btn-primary" onClick={() => setShowAddUser(true)}>
              <i className="fas fa-user-plus" />Add User
            </button>
          )}
          {tab === 'permissions' && selectedUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => { setTab('users'); setSelectedUser(null) }}>
                <i className="fas fa-arrow-left" />Back to Users
              </button>
              <button className="btn btn-primary" onClick={savePermissions} disabled={savingPerms}>
                {savingPerms ? 'Saving…' : <><i className="fas fa-save" />Save Permissions</>}
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="tab-bar" style={{ marginBottom: '20px' }}>
          <button className={`tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
            <i className="fas fa-users" style={{ marginRight: '6px' }} />Users ({users.length})
          </button>
          <button className={`tab-btn ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')} style={{ position: 'relative' }}>
            <i className="fas fa-hourglass-half" style={{ marginRight: '6px' }} />Pending Approvals
            {pendingUsers.length > 0 && (
              <span style={{ marginLeft: '6px', background: '#ef4444', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' }}>{pendingUsers.length}</span>
            )}
          </button>
          {selectedUser && (
            <button className={`tab-btn ${tab === 'permissions' ? 'active' : ''}`} onClick={() => setTab('permissions')}>
              <i className="fas fa-key" style={{ marginRight: '6px' }} />Permissions — {selectedUser.first_name}
            </button>
          )}
          <button className={`tab-btn ${tab === 'email' ? 'active' : ''}`} onClick={() => setTab('email')}>
            <i className="fas fa-envelope-open-text" style={{ marginRight: '6px' }} />Email Config
          </button>
          <button className={`tab-btn ${tab === 'api' ? 'active' : ''}`} onClick={() => setTab('api')}>
            <i className="fas fa-terminal" style={{ marginRight: '6px' }} />API Playground
          </button>
          <button className={`tab-btn ${tab === 'db' ? 'active' : ''}`} onClick={() => setTab('db')}>
            <i className="fas fa-database" style={{ marginRight: '6px' }} />DB Optimize
          </button>
          <button className={`tab-btn ${tab === 'templates' ? 'active' : ''}`} onClick={() => setTab('templates')}>
            <i className="fas fa-table-columns" style={{ marginRight: '6px' }} />Template Columns
          </button>
        </div>

        {/* ── Users Tab ── */}
        {tab === 'users' && (
          <div className="table-wrapper">
            <IpHouseLoader show={loadingUsers} size="sm" text="Loading users…" />
            {!loadingUsers && (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Last Login</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{user.id}</td>
                        <td style={{ fontWeight: '600' }}>{user.first_name} {user.last_name}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{user.username}</td>
                        <td style={{ fontSize: '12px' }}>{user.email}</td>
                        <td>
                          {(userRole === 'superadmin' || userRole === 'admin') ? (
                            <select
                              value={user.role}
                              onChange={e => changeUserRole(user, e.target.value)}
                              style={{
                                fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px', border: '1px solid var(--border2)',
                                background: 'var(--bg-secondary)', color: roleColor[user.role] || 'var(--text-secondary)', cursor: 'pointer',
                              }}
                            >
                              <option value="user">user</option>
                              <option value="admin">admin</option>
                              {userRole === 'superadmin' && <option value="superadmin">superadmin</option>}
                            </select>
                          ) : (
                            <span style={{ fontSize: '11px', fontWeight: '700', color: roleColor[user.role] || 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '20px' }}>
                              {user.role}
                            </span>
                          )}
                        </td>
                        <td>
                          {user.status === 'pending' ? (
                            <span className="badge" style={{ background: 'rgba(234,179,8,.15)', color: '#ca8a04', border: '1px solid rgba(234,179,8,.35)' }}>Pending</span>
                          ) : user.status === 'rejected' ? (
                            <span className="badge badge-red">Rejected</span>
                          ) : (
                            <span className={`badge ${user.is_active ? 'badge-green' : 'badge-red'}`}>
                              {user.is_active ? 'Active' : 'Disabled'}
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {user.last_login ? String(user.last_login).slice(0, 16) : '—'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => selectUserForPerms(user)} title="Manage module permissions">
                              <i className="fas fa-key" />Permissions
                            </button>
                            {(userRole === 'superadmin' || user.role !== 'superadmin') && (
                              <button
                                onClick={() => openPwdModal(user)}
                                style={{ padding: '4px 8px', fontSize: '11px', background: 'rgba(99,102,241,.15)', border: '1px solid rgba(99,102,241,.3)', color: '#6366f1', borderRadius: '6px', cursor: 'pointer' }}
                                title="Change password"
                              >
                                <i className="fas fa-lock" />Password
                              </button>
                            )}
                            <button onClick={() => toggleUserActive(user)}
                              style={{ padding: '4px 8px', fontSize: '11px', background: user.is_active ? 'rgba(239,68,68,.15)' : 'rgba(34,197,94,.15)', border: `1px solid ${user.is_active ? 'rgba(239,68,68,.3)' : 'rgba(34,197,94,.3)'}`, color: user.is_active ? '#ef4444' : '#22c55e', borderRadius: '6px', cursor: 'pointer' }}>
                              <i className={`fas fa-${user.is_active ? 'ban' : 'check'}`} />
                              {user.is_active ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No users found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Pending Approvals Tab ── */}
        {tab === 'pending' && (
          <div>
            {approvalResult && (
              <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px',
                background: approvalResult.success ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)',
                border: `1px solid ${approvalResult.success ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)'}`,
                color: approvalResult.success ? 'var(--green)' : 'var(--red)' }}>
                <i className={`fas fa-${approvalResult.success ? 'check' : 'exclamation'}-circle`} style={{ marginRight: '6px' }} />
                {approvalResult.success
                  ? approvalResult.emailWarning ? `Done. Email warning: ${approvalResult.emailWarning}` : 'Action completed & email sent.'
                  : approvalResult.error}
              </div>
            )}
            <IpHouseLoader show={loadingPending} size="sm" text="Loading requests…" />
            {!loadingPending && pendingUsers.length === 0 && (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <i className="fas fa-check-circle" style={{ fontSize: '40px', color: 'var(--green)', marginBottom: '12px', display: 'block' }} />
                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>No pending registrations</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>All registrations have been reviewed.</div>
              </div>
            )}
            {!loadingPending && pendingUsers.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingUsers.map(u => (
                  <div key={u.id} className="card" style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#fff', fontSize: '16px', flexShrink: 0 }}>
                        {u.first_name[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ fontWeight: '700', fontSize: '15px' }}>{u.first_name} {u.last_name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>@{u.username} · {u.email}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Registered: {u.created_at ? String(u.created_at).slice(0, 16) : '—'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleApproval(u.id, 'approve')}
                            style={{ flex: 1, padding: '8px 12px', borderRadius: '7px', border: 'none', background: 'rgba(34,197,94,.15)', color: '#16a34a', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                          >
                            <i className="fas fa-check" />Approve
                          </button>
                          <button
                            onClick={() => handleApproval(u.id, 'reject')}
                            style={{ flex: 1, padding: '8px 12px', borderRadius: '7px', border: 'none', background: 'rgba(239,68,68,.15)', color: '#dc2626', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                          >
                            <i className="fas fa-xmark" />Reject
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Rejection reason (optional)"
                          value={rejectReason[u.id] || ''}
                          onChange={e => setRejectReason(r => ({ ...r, [u.id]: e.target.value }))}
                          className="form-input"
                          style={{ fontSize: '12px', padding: '6px 10px' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Email Config Tab ── */}
        {tab === 'email' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px' }}>Email Configurations</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Manage SMTP settings for different notification purposes</div>
              </div>
              <button className="btn btn-primary" onClick={startNewEmail}><i className="fas fa-plus" />Add Config</button>
            </div>

            {emailResult && (
              <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px',
                background: emailResult.success ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)',
                border: `1px solid ${emailResult.success ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)'}`,
                color: emailResult.success ? 'var(--green)' : 'var(--red)' }}>
                <i className={`fas fa-${emailResult.success ? 'check' : 'exclamation'}-circle`} style={{ marginRight: '6px' }} />
                {emailResult.message || emailResult.error}
              </div>
            )}

            {showEmailForm && (
              <div className="card" style={{ padding: '20px 24px', marginBottom: '20px' }}>
                <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '16px' }}>
                  {editEmailId ? 'Edit Configuration' : 'New Configuration'}
                </div>
                <form onSubmit={saveEmailConfig}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label className="form-label">Purpose</label>
                      <select className="form-input" value={emailForm.purpose} onChange={e => setEmailForm(f => ({ ...f, purpose: e.target.value }))}>
                        {emailPurposes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Label (friendly name)</label>
                      <input className="form-input" value={emailForm.label} onChange={e => setEmailForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Gmail Workspace" required />
                    </div>
                    <div>
                      <label className="form-label">SMTP Host</label>
                      <input className="form-input" value={emailForm.smtp_host} onChange={e => setEmailForm(f => ({ ...f, smtp_host: e.target.value }))} placeholder="smtp.gmail.com" required />
                    </div>
                    <div>
                      <label className="form-label">SMTP Port</label>
                      <input className="form-input" type="number" value={emailForm.smtp_port} onChange={e => setEmailForm(f => ({ ...f, smtp_port: parseInt(e.target.value) }))} required />
                    </div>
                    <div>
                      <label className="form-label">SMTP Username / Email</label>
                      <input className="form-input" value={emailForm.smtp_user} onChange={e => setEmailForm(f => ({ ...f, smtp_user: e.target.value }))} placeholder="noreply@domain.com" required />
                    </div>
                    <div>
                      <label className="form-label">{editEmailId ? 'App Password (leave blank to keep)' : 'App Password'}</label>
                      <input className="form-input" type="password" value={emailForm.smtp_pass} onChange={e => setEmailForm(f => ({ ...f, smtp_pass: e.target.value }))} placeholder="Gmail app password" />
                    </div>
                    <div>
                      <label className="form-label">From Name</label>
                      <input className="form-input" value={emailForm.from_name} onChange={e => setEmailForm(f => ({ ...f, from_name: e.target.value }))} placeholder="API Monitoring System" />
                    </div>
                    <div>
                      <label className="form-label">From Email</label>
                      <input className="form-input" value={emailForm.from_email} onChange={e => setEmailForm(f => ({ ...f, from_email: e.target.value }))} placeholder="noreply@domain.com" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={emailForm.smtp_secure} onChange={e => setEmailForm(f => ({ ...f, smtp_secure: e.target.checked }))} />
                      Use SSL (port 465)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={emailForm.is_active} onChange={e => setEmailForm(f => ({ ...f, is_active: e.target.checked }))} />
                      Active
                    </label>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                      <button type="button" className="btn btn-secondary" onClick={testEmailConnection} disabled={testingEmail}>
                        <i className="fas fa-plug" />{testingEmail ? 'Testing…' : 'Test Connection'}
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowEmailForm(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary"><i className="fas fa-save" />Save</button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            <IpHouseLoader show={loadingEmail} size="sm" text="Loading config…" />
            {!loadingEmail && emailConfigs.length === 0 && !showEmailForm && (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <i className="fas fa-envelope-open-text" style={{ fontSize: '40px', color: 'var(--text-muted)', marginBottom: '12px', display: 'block' }} />
                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>No email configurations yet</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>Add your first SMTP config to enable email notifications.</div>
              </div>
            )}
            {!loadingEmail && emailConfigs.length > 0 && (
              <div className="table-wrapper">
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Purpose</th>
                        <th>Label</th>
                        <th>SMTP Host</th>
                        <th>From</th>
                        <th>Status</th>
                        <th>Updated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emailConfigs.map(cfg => (
                        <tr key={cfg.id}>
                          <td><span style={{ fontSize: '11px', fontWeight: '700', background: 'var(--accent-glow)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '20px' }}>{cfg.purpose}</span></td>
                          <td style={{ fontWeight: '600' }}>{cfg.label}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{cfg.smtp_host}:{cfg.smtp_port}</td>
                          <td style={{ fontSize: '12px' }}>{cfg.from_name} &lt;{cfg.from_email}&gt;</td>
                          <td><span className={`badge ${cfg.is_active ? 'badge-green' : 'badge-red'}`}>{cfg.is_active ? 'Active' : 'Inactive'}</span></td>
                          <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cfg.updated_at ? String(cfg.updated_at).slice(0, 16) : '—'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => startEditEmail(cfg)}><i className="fas fa-pen" />Edit</button>
                              <button onClick={() => deleteEmailConfig(cfg.id)} style={{ padding: '4px 8px', fontSize: '11px', background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)', color: '#ef4444', borderRadius: '6px', cursor: 'pointer' }}><i className="fas fa-trash" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Permissions Tab ── */}
        {tab === 'permissions' && selectedUser && (
          <div>
            <div className="card" style={{ marginBottom: '12px', padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#fff', fontSize: '16px' }}>
                  {selectedUser.first_name[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px' }}>{selectedUser.first_name} {selectedUser.last_name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedUser.email} · <span style={{ color: roleColor[selectedUser.role] }}>{selectedUser.role}</span></div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {selectedUser.role === 'superadmin' || selectedUser.role === 'admin'
                    ? <span style={{ color: 'var(--green)' }}><i className="fas fa-check-circle" style={{ marginRight: '4px' }} />Full access (admin role)</span>
                    : 'Set per-module permissions below'}
                </div>
              </div>
            </div>

            {permResult && (
              <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px',
                background: permResult.success ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)',
                border: `1px solid ${permResult.success ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)'}`,
                color: permResult.success ? 'var(--green)' : 'var(--red)' }}>
                <i className={`fas fa-${permResult.success ? 'check' : 'exclamation'}-circle`} style={{ marginRight: '6px' }} />
                {permResult.success ? 'Permissions saved successfully' : (permResult.error || 'Save failed')}
              </div>
            )}

            {loadingPerms ? (
              <div style={{ padding: '60px', textAlign: 'center' }}><IpHouseLoader show={loadingPerms} size="sm" text="Loading permissions…" /></div>
            ) : (
              <div className="table-wrapper">
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Module</th>
                        {PERM_FIELDS.map(f => (
                          <th key={f.key} style={{ textAlign: 'center', minWidth: '80px' }}>
                            <div><i className={`fas ${f.icon}`} style={{ marginRight: '4px' }} />{f.label}</div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '6px' }}>
                              <button onClick={() => setAllForPerm(f.key, true)} style={{ fontSize: '10px', background: 'rgba(34,197,94,.15)', border: '1px solid rgba(34,197,94,.3)', color: '#22c55e', borderRadius: '4px', padding: '1px 5px', cursor: 'pointer' }}>All</button>
                              <button onClick={() => setAllForPerm(f.key, false)} style={{ fontSize: '10px', background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)', color: '#ef4444', borderRadius: '4px', padding: '1px 5px', cursor: 'pointer' }}>None</button>
                            </div>
                          </th>
                        ))}
                        <th style={{ textAlign: 'center', minWidth: '100px' }}>All / None</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permissions.map(p => (
                        <tr key={p.module_id}>
                          <td>
                            <div style={{ fontWeight: '600', fontSize: '13px' }}>{p.module_label}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.module_name}</div>
                          </td>
                          {PERM_FIELDS.map(f => (
                            <td key={f.key} style={{ textAlign: 'center' }}>
                              <Toggle checked={!!p[f.key]} onChange={v => togglePerm(p.module_id, f.key)} />
                            </td>
                          ))}
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                              <button onClick={() => setAllForModule(p.module_id, 1)} style={{ fontSize: '10px', background: 'rgba(34,197,94,.15)', border: '1px solid rgba(34,197,94,.3)', color: '#22c55e', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer' }}>All</button>
                              <button onClick={() => setAllForModule(p.module_id, 0)} style={{ fontSize: '10px', background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)', color: '#ef4444', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer' }}>None</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── API Playground Tab ── */}
        {tab === 'api' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

              {/* Step 1 — Authentication */}
              <div className="card">
                <div className="card-title"><i className="fas fa-lock" />Step 1 — Generate Token</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label className="form-label">Username</label>
                    <input className="form-input" value={playUser} onChange={e => setPlayUser(e.target.value)} placeholder="your username" />
                  </div>
                  <div>
                    <label className="form-label">Password</label>
                    <input type="password" className="form-input" value={playPass} onChange={e => setPlayPass(e.target.value)} placeholder="••••••••"
                      onKeyDown={e => e.key === 'Enter' && generatePlayToken()} />
                  </div>
                  {playTokenErr && <div style={{ color: 'var(--red)', fontSize: '12px' }}><i className="fas fa-exclamation-circle" style={{ marginRight: '5px' }} />{playTokenErr}</div>}
                  <button className="btn btn-primary" onClick={generatePlayToken} style={{ width: '100%' }}>
                    <i className="fas fa-key" />Generate Token
                  </button>
                </div>

                {playToken && (
                  <div style={{ marginTop: '14px', padding: '12px', background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.25)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--green)' }}><i className="fas fa-check-circle" style={{ marginRight: '5px' }} />Token Generated</span>
                      <button onClick={copyToken} className="btn btn-secondary" style={{ padding: '3px 10px', fontSize: '11px' }}>
                        <i className={`fas fa-${copiedToken ? 'check' : 'copy'}`} />{copiedToken ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <code style={{ fontSize: '11px', wordBreak: 'break-all', color: 'var(--text-secondary)', display: 'block', fontFamily: 'JetBrains Mono, monospace' }}>{playToken}</code>
                    <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <strong>Usage:</strong> Authorization: Bearer {'{token}'}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '14px', padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <div style={{ fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>Endpoint</div>
                  <code style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent-light)' }}>POST /api/v1/auth/login</code>
                  <pre style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>{`{
  "username": "your_username",
  "password": "your_password"
}`}</pre>
                </div>
              </div>

              {/* Step 2 — Query Builder */}
              <div className="card">
                <div className="card-title"><i className="fas fa-sliders" />Step 2 — Build Request</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label className="form-label">Table / Endpoint</label>
                    <select className="form-input" value={playTable} onChange={e => setPlayTable(e.target.value)}>
                      {[
                        ['unauthorized_search_result',    'Unauthorized Search Result'],
                        ['ads_tutorials_social_media',    'Ads Tutorials — Social Media'],
                        ['password_sharing_social_media', 'Password Sharing — Social Media'],
                        ['password_sharing_marketplace',  'Password Sharing — Marketplace'],
                        ['iptv_apps_internet',            'IPTV & Apps — Internet'],
                        ['iptv_apps_apps',                'IPTV & Apps — Apps'],
                        ['iptv_apps_social_media',        'IPTV & Apps — Social Media'],
                        ['iptv_apps_marketplace',         'IPTV & Apps — Marketplace'],
                        ['iptv_apps_meta_ads',            'IPTV & Apps — Meta Ads'],
                      ].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label className="form-label">Date From</label>
                      <input type="date" className="form-input" value={playDateFrom} onChange={e => setPlayDateFrom(e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label">Date To</label>
                      <input type="date" className="form-input" value={playDateTo} onChange={e => setPlayDateTo(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Title / Keyword Filter (optional)</label>
                    <input className="form-input" value={playTitle} onChange={e => setPlayTitle(e.target.value)} placeholder="Search in title, name, brand…" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label className="form-label">Page</label>
                      <input type="number" className="form-input" min="1" value={playPage} onChange={e => setPlayPage(e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label">Limit (max 1000)</label>
                      <input type="number" className="form-input" min="1" max="1000" value={playLimit} onChange={e => setPlayLimit(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '6px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--accent-light)', wordBreak: 'break-all' }}>
                    GET /api/v1/{playTable}?page={playPage}&limit={playLimit}{playDateFrom ? `&date_from=${playDateFrom}` : ''}{playDateTo ? `&date_to=${playDateTo}` : ''}{playTitle ? `&title=${encodeURIComponent(playTitle)}` : ''}
                  </div>

                  <button className="btn btn-primary" onClick={executePlayRequest} disabled={playLoading} style={{ width: '100%' }}>
                    {playLoading
                      ? <><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', marginRight: '6px' }} />Executing…</>
                      : <><i className="fas fa-play" />Execute Request</>}
                  </button>
                </div>
              </div>
            </div>

            {/* Response Panel */}
            {playResp && (
              <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><i className="fas fa-code" />Response</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>
                    <span className={`badge ${playResp.status < 300 ? 'badge-green' : 'badge-red'}`} style={{ marginRight: '8px' }}>{playResp.status || (playResp.error ? '500' : '200')}</span>
                    {playRespTime !== null && <span style={{ color: 'var(--text-muted)' }}>{playRespTime} ms</span>}
                    {playResp.total !== undefined && <span style={{ color: 'var(--text-secondary)', marginLeft: '12px' }}>{playResp.total} total records · {(playResp.data || []).length} returned</span>}
                  </span>
                </div>
                <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', maxHeight: '400px', overflowY: 'auto' }}>
                  <pre style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                    {JSON.stringify(playResp, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Token Management */}
            <div className="card">
              <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><i className="fas fa-shield-halved" />Token Management</span>
                <button onClick={fetchApiTokens} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                  <i className="fas fa-rotate-right" />
                </button>
              </div>
              {loadingTokens ? (
                <div style={{ padding: '30px', textAlign: 'center' }}><IpHouseLoader show={loadingTokens} size="sm" text="Loading tokens…" /></div>
              ) : apiTokens.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No tokens generated yet</div>
              ) : (
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Status</th>
                        <th>Calls</th>
                        <th>Last Used</th>
                        <th>Expires</th>
                        <th>Created</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiTokens.map(t => (
                        <tr key={t.id}>
                          <td style={{ fontWeight: '600' }}>{t.user_name}</td>
                          <td>
                            <span className={`badge ${t.is_active ? 'badge-green' : 'badge-gray'}`}>
                              {t.is_active ? 'Active' : 'Revoked'}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', textAlign: 'center' }}>{t.usage_count}</td>
                          <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.last_used_at ? new Date(t.last_used_at).toLocaleString() : '—'}</td>
                          <td style={{ fontSize: '11px', color: t.expires_at && new Date(t.expires_at) < new Date() ? 'var(--red)' : 'var(--text-muted)' }}>
                            {t.expires_at ? new Date(t.expires_at).toLocaleDateString() : '—'}
                          </td>
                          <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(t.created_at).toLocaleString()}</td>
                          <td>
                            {t.is_active && (
                              <button className="btn btn-danger" style={{ padding: '3px 10px', fontSize: '11px' }} onClick={() => revokeToken(t.id)}>
                                <i className="fas fa-ban" />Revoke
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Recent Usage Log */}
              {apiUsage.length > 0 && (
                <>
                  <div className="section-divider" style={{ marginTop: '20px' }}>Recent API Calls</div>
                  <div className="table-scroll">
                    <table className="data-table">
                      <thead>
                        <tr><th>Endpoint</th><th>Status</th><th>IP</th><th>Params</th><th>Time</th></tr>
                      </thead>
                      <tbody>
                        {apiUsage.slice(0, 20).map(u => (
                          <tr key={u.id || Math.random()}>
                            <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>{u.endpoint}</td>
                            <td><span className={`badge ${u.status_code < 300 ? 'badge-green' : 'badge-red'}`}>{u.status_code}</span></td>
                            <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>{u.ip_address}</td>
                            <td style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {(() => { try { const p = JSON.parse(u.params || '{}'); return Object.entries(p).filter(([,v]) => v).map(([k,v]) => `${k}=${v}`).join(', ') || '—' } catch { return '—' } })()}
                            </td>
                            <td style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(u.created_at).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── DB Optimize Tab ── */}
        {tab === 'db' && (
          <div>
            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="card-title"><i className="fas fa-database" />Database Index Optimizer</div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Checks and applies covering indexes on all 11 module tables to speed up dashboard aggregate queries (GROUP BY + SUM).
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={fetchDbReport} disabled={dbLoading}>
                  {dbLoading ? <><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', marginRight: '6px' }} />Checking…</> : <><i className="fas fa-magnifying-glass" />Check Indexes</>}
                </button>
                {dbReport && !dbReport.error && dbReport.missing > 0 && (
                  <button className="btn btn-primary" onClick={applyDbIndexes} disabled={dbApplying}>
                    {dbApplying ? <><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', marginRight: '6px' }} />Applying…</> : <><i className="fas fa-bolt" />Apply {dbReport.missing} Missing Index{dbReport.missing !== 1 ? 'es' : ''}</>}
                  </button>
                )}
                {dbReport && !dbReport.error && dbReport.missing === 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--green)' }}>
                    <i className="fas fa-check-circle" />All indexes are in place
                  </span>
                )}
              </div>
            </div>

            {/* Apply Result */}
            {dbApplyResult && (
              <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-title"><i className="fas fa-bolt" />Apply Result</div>
                {dbApplyResult.error ? (
                  <div style={{ color: 'var(--red)', fontSize: '13px' }}><i className="fas fa-exclamation-circle" style={{ marginRight: '6px' }} />{dbApplyResult.error}</div>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
                      {[
                        { label: 'Created', count: dbApplyResult.results?.filter(r => r.status === 'created').length ?? 0, color: 'var(--green)' },
                        { label: 'Already Existed', count: dbApplyResult.results?.filter(r => r.status === 'already_exists').length ?? 0, color: 'var(--text-muted)' },
                        { label: 'Errors', count: dbApplyResult.results?.filter(r => r.status === 'error').length ?? 0, color: 'var(--red)' },
                      ].map(s => (
                        <div key={s.label} style={{ padding: '10px 16px', background: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center', minWidth: '100px' }}>
                          <div style={{ fontSize: '22px', fontWeight: '800', color: s.color }}>{s.count}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    {dbApplyResult.results?.filter(r => r.status === 'error').length > 0 && (
                      <div className="table-scroll">
                        <table className="data-table">
                          <thead><tr><th>Index</th><th>Status</th><th>Message</th></tr></thead>
                          <tbody>
                            {dbApplyResult.results.filter(r => r.status === 'error').map((r, i) => (
                              <tr key={i}>
                                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>{r.index}</td>
                                <td><span className="badge badge-red">error</span></td>
                                <td style={{ fontSize: '12px', color: 'var(--red)' }}>{r.message}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Index Report */}
            {dbReport && !dbReport.error && (
              <div className="card">
                <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span><i className="fas fa-list-check" />Index Report</span>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                    <span style={{ color: 'var(--green)' }}><i className="fas fa-check-circle" style={{ marginRight: '4px' }} />{dbReport.existing} existing</span>
                    <span style={{ color: 'var(--red)' }}><i className="fas fa-circle-xmark" style={{ marginRight: '4px' }} />{dbReport.missing} missing</span>
                    <span style={{ color: 'var(--text-muted)' }}>of {(dbReport.existing ?? 0) + (dbReport.missing ?? 0)} total</span>
                  </div>
                </div>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Table</th>
                        <th>Index Name</th>
                        <th>Columns</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dbReport.indexes || []).map((idx, i) => (
                        <tr key={i}>
                          <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>{idx.table}</td>
                          <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)' }}>{idx.name}</td>
                          <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--accent-light)' }}>{idx.columns}</td>
                          <td style={{ textAlign: 'center' }}>
                            {idx.exists
                              ? <span className="badge badge-green"><i className="fas fa-check" style={{ marginRight: '4px' }} />Exists</span>
                              : <span className="badge badge-red"><i className="fas fa-circle-xmark" style={{ marginRight: '4px' }} />Missing</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {dbReport?.error && (
              <div style={{ padding: '16px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: '8px', color: 'var(--red)', fontSize: '13px' }}>
                <i className="fas fa-exclamation-circle" style={{ marginRight: '6px' }} />{dbReport.error}
              </div>
            )}
          </div>
        )}

        {/* ── Template Columns Tab ── */}
        {tab === 'templates' && (
          <div>
            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="card-title"><i className="fas fa-table-columns" />Template Column Manager</div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Choose which columns appear in the Excel template for each module and reorder them by dragging.
                Changes apply to both the Upload Template and Bulk Update Template downloads.
              </p>

              {/* Controls row */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>Module</div>
                  <select
                    value={tplSheet}
                    onChange={e => { setTplSheet(e.target.value); fetchTemplateConfig(e.target.value, tplType) }}
                    style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', fontSize: '13px', minWidth: '220px' }}
                  >
                    {SHEET_NAMES.map(n => <option key={n} value={n}>{SHEET_CONFIG[n].label}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>Template Type</div>
                  <div style={{ display: 'flex', gap: '0', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    {[['upload', 'Upload'], ['update', 'Bulk Update']].map(([val, lbl]) => (
                      <button
                        key={val}
                        onClick={() => { setTplType(val); fetchTemplateConfig(tplSheet, val) }}
                        style={{
                          padding: '7px 16px', border: 'none', cursor: 'pointer', fontSize: '13px',
                          background: tplType === val ? 'var(--accent)' : 'var(--bg-secondary)',
                          color: tplType === val ? '#fff' : 'var(--text)',
                          fontWeight: tplType === val ? '600' : '400',
                        }}
                      >{lbl}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                  <button className="btn btn-secondary" onClick={resetTemplateConfig} disabled={tplSaving || tplLoading} title="Remove saved config — revert to all columns default">
                    <i className="fas fa-rotate-left" />Reset Default
                  </button>
                  <button className="btn btn-primary" onClick={saveTemplateConfig} disabled={tplSaving || tplLoading || !tplDirty}>
                    {tplSaving ? <><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', marginRight: '6px' }} />Saving…</> : <><i className="fas fa-save" />Save Config</>}
                  </button>
                </div>
              </div>

              {/* Result message */}
              {tplResult && (
                <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: '6px', fontSize: '13px',
                  background: tplResult.error ? 'rgba(239,68,68,.1)' : 'rgba(34,197,94,.1)',
                  border: `1px solid ${tplResult.error ? 'rgba(239,68,68,.3)' : 'rgba(34,197,94,.3)'}`,
                  color: tplResult.error ? 'var(--red)' : 'var(--green)',
                }}>
                  <i className={`fas ${tplResult.error ? 'fa-exclamation-circle' : 'fa-check-circle'}`} style={{ marginRight: '6px' }} />
                  {tplResult.error || tplResult.success}
                </div>
              )}

              {/* Column list */}
              {tplLoading ? (
                <IpHouseLoader show size="sm" text="Loading columns…" />
              ) : (
                <div>
                  {/* Legend */}
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span><i className="fas fa-grip-vertical" style={{ marginRight: '4px' }} />Drag to reorder</span>
                    <span style={{ color: 'var(--accent)' }}><i className="fas fa-lock" style={{ marginRight: '4px', fontSize: '10px' }} />Required column (cannot hide)</span>
                    {tplDirty && <span style={{ color: 'var(--amber, #f59e0b)', fontWeight: '600' }}><i className="fas fa-circle-dot" style={{ marginRight: '4px', fontSize: '10px' }} />Unsaved changes</span>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {tplCols.map((col, idx) => {
                      const cfg = SHEET_CONFIG[tplSheet]
                      const isLocked = (tplType === 'update' && col.key === 'id') ||
                                       (tplType === 'upload' && cfg.uniqueUrlCol && col.key === cfg.uniqueUrlCol)
                      return (
                        <div
                          key={col.key}
                          draggable
                          onDragStart={() => tplDragStart(idx)}
                          onDragOver={e => tplDragOver(e, idx)}
                          onDragEnd={tplDragEnd}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '8px 12px', borderRadius: '6px', cursor: 'grab',
                            background: col.included ? 'var(--bg-secondary)' : 'var(--bg)',
                            border: `1px solid ${col.included ? 'var(--border)' : 'var(--border2, #333)'}`,
                            opacity: col.included ? 1 : 0.5,
                            transition: 'opacity .15s',
                          }}
                        >
                          {/* Drag handle */}
                          <i className="fas fa-grip-vertical" style={{ color: 'var(--text-muted)', fontSize: '12px', flexShrink: 0 }} />

                          {/* Position number */}
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '20px', textAlign: 'right', flexShrink: 0 }}>
                            {col.included ? idx + 1 : '—'}
                          </span>

                          {/* Toggle */}
                          {isLocked ? (
                            <i className="fas fa-lock" style={{ color: 'var(--accent)', fontSize: '11px', flexShrink: 0 }} title="Required — cannot be hidden" />
                          ) : (
                            <button
                              onClick={() => tplToggle(idx)}
                              title={col.included ? 'Click to hide from template' : 'Click to include in template'}
                              style={{
                                width: '36px', height: '20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                position: 'relative', flexShrink: 0,
                                background: col.included ? 'var(--accent)' : 'var(--border2, #555)',
                                transition: 'background .2s',
                              }}
                            >
                              <span style={{
                                position: 'absolute', top: '2px', width: '16px', height: '16px',
                                borderRadius: '50%', background: '#fff', transition: 'left .2s',
                                left: col.included ? '18px' : '2px',
                              }} />
                            </button>
                          )}

                          {/* Column info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontWeight: '600', fontSize: '13px' }}>{col.label}</span>
                            <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{col.key}</span>
                            {col.type && <span style={{ marginLeft: '6px', fontSize: '10px', color: 'var(--text-muted)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '3px', padding: '1px 5px' }}>{col.type}</span>}
                          </div>

                          {isLocked && (
                            <span style={{ fontSize: '11px', color: 'var(--accent)', flexShrink: 0 }}>Required</span>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {tplCols.filter(c => c.included).length} of {tplCols.length} columns included in template
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {pwdModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPwdModal(null)}>
            <div className="modal" style={{ maxWidth: '400px' }}>
              <div className="modal-header">
                <h3 className="modal-title"><i className="fas fa-lock" style={{ marginRight: '8px' }} />Change Password</h3>
                <button onClick={() => setPwdModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>×</button>
              </div>
              <form onSubmit={handleChangePassword}>
                <div className="modal-body">
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Set a new password for <strong>{pwdModal.name}</strong>
                  </div>
                  {pwdError && <div style={{ color: 'var(--red)', background: 'rgba(239,68,68,.1)', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>{pwdError}</div>}
                  {pwdSuccess && <div style={{ color: 'var(--green)', background: 'rgba(34,197,94,.1)', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>{pwdSuccess}</div>}
                  <div>
                    <label className="form-label">New Password *</label>
                    <input type="password" className="form-input" required minLength={6}
                      value={pwdValue} onChange={e => setPwdValue(e.target.value)}
                      placeholder="At least 6 characters" autoFocus />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setPwdModal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={pwdSaving}>
                    {pwdSaving ? 'Saving…' : <><i className="fas fa-lock" />Change Password</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddUser && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddUser(false)}>
            <div className="modal" style={{ maxWidth: '500px' }}>
              <div className="modal-header">
                <h3 className="modal-title"><i className="fas fa-user-plus" style={{ marginRight: '8px' }} />Add New User</h3>
                <button onClick={() => setShowAddUser(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>×</button>
              </div>
              <form onSubmit={handleAddUser}>
                <div className="modal-body">
                  {formError && <div style={{ color: 'var(--red)', background: 'rgba(239,68,68,.1)', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>{formError}</div>}
                  {formSuccess && <div style={{ color: 'var(--green)', background: 'rgba(34,197,94,.1)', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>{formSuccess}</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    {[
                      { key: 'first_name', label: 'First Name *', required: true },
                      { key: 'last_name', label: 'Last Name' },
                      { key: 'username', label: 'Username *', required: true },
                      { key: 'email', label: 'Email *', type: 'email', required: true },
                      { key: 'password', label: 'Password *', type: 'password', required: true },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="form-label">{f.label}</label>
                        <input type={f.type || 'text'} className="form-input" required={f.required}
                          value={newUser[f.key]} onChange={e => setNewUser(p => ({ ...p, [f.key]: e.target.value }))} />
                      </div>
                    ))}
                    <div>
                      <label className="form-label">Role</label>
                      <select className="form-input" value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Superadmin</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddUser(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Creating…' : <><i className="fas fa-user-plus" />Create User</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
