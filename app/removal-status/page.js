'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SHEET_NAV, REMOVAL_STATUSES, getStatusBadgeClass } from '@/lib/sheetConfig'

function StatusBadge({ status }) {
  if (!status) return <span className="badge badge-gray">—</span>
  return <span className={`badge ${getStatusBadgeClass(status)}`}>{status}</span>
}

function RecordField({ label, value }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)', alignItems: 'start' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', paddingTop: '2px' }}>{label}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
        {value && String(value).startsWith('http') ? (
          <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-light)' }}>{String(value).slice(0, 60)}{String(value).length > 60 ? '…' : ''}</a>
        ) : String(value || '—')}
      </div>
    </div>
  )
}

export default function RemovalStatusPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('user')
  const [sheet, setSheet] = useState('Unauthorized Search Result')
  const [searchQuery, setSearchQuery] = useState('')
  const [records, setRecords] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [removalTimestamp, setRemovalTimestamp] = useState('')
  const [updating, setUpdating] = useState(false)
  const [updateResult, setUpdateResult] = useState(null)
  const [bulkSelections, setBulkSelections] = useState({})
  const [bulkStatus, setBulkStatus] = useState('')
  const [bulkUpdating, setBulkUpdating] = useState(false)

  useEffect(() => {
    fetch('/api/auth/check').then(r => r.json()).then(d => {
      if (!d.authenticated) router.push('/login?session_expired=1')
      else { setUserName(d.userName); setUserRole(d.role || 'user') }
    })
  }, [router])

  async function doSearch() {
    if (!searchQuery.trim()) return
    setSearching(true); setRecords([]); setSelectedRecord(null); setUpdateResult(null)
    try {
      const res = await fetch(`/api/removal-status?sheet=${encodeURIComponent(sheet)}&search=${encodeURIComponent(searchQuery)}`)
      const d = await res.json()
      setRecords(d.records || [])
    } catch (e) { console.error(e) }
    finally { setSearching(false) }
  }

  function selectRecord(rec) {
    setSelectedRecord(rec)
    setNewStatus(rec.removal_status || '')
    setRemovalTimestamp(rec.removal_timestamp || rec.removal_date || '')
    setUpdateResult(null)
  }

  async function doUpdate() {
    if (!selectedRecord || !newStatus) return
    setUpdating(true); setUpdateResult(null)
    try {
      const res = await fetch('/api/removal-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedRecord.id, sheet, removal_status: newStatus, removal_timestamp: removalTimestamp }),
      })
      const d = await res.json()
      setUpdateResult(d)
      if (d.success) await doSearch()
    } catch { setUpdateResult({ error: 'Update failed' }) }
    finally { setUpdating(false) }
  }

  const selectedBulkIds = Object.entries(bulkSelections).filter(([, v]) => v).map(([k]) => parseInt(k))

  async function doBulkUpdate() {
    if (!selectedBulkIds.length || !bulkStatus) return
    setBulkUpdating(true)
    try {
      const res = await fetch('/api/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheet, ids: selectedBulkIds, removal_status: bulkStatus }),
      })
      const d = await res.json()
      if (d.success) { setBulkSelections({}); setBulkStatus(''); await doSearch() }
    } catch (e) { console.error(e) }
    finally { setBulkUpdating(false) }
  }

  // Determine which columns to show in search results
  const displayCols = [
    { key: 'id', label: 'ID' },
    { key: 'platform_name', label: 'Platform' },
    { key: 'platform', label: 'Platform' },
    { key: 'iptv_application_name', label: 'IPTV/App' },
    { key: 'content_owner', label: 'Content Owner' },
    { key: 'copyright_owner', label: 'Copyright Owner' },
    { key: 'seller_name', label: 'Seller' },
    { key: 'channel_page_profile_name', label: 'Profile Name' },
    { key: 'removal_status', label: 'Status' },
  ]

  const activeDisplayCols = displayCols.filter(col =>
    records.length > 0 && (records[0][col.key] !== undefined)
  ).slice(0, 6)

  return (
    <div className="page-content">
      <div className="main">

        {/* Back + Header */}
        <div style={{ marginBottom: '16px' }}>
          <Link href="/upload" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
            <i className="fas fa-arrow-left" />Back to Data
          </Link>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '4px' }}>
            <i className="fas fa-edit" style={{ color: 'var(--accent)', marginRight: '10px' }} />Update Removal Status
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Search records by URL, name, or ID — update individually or in bulk</p>
        </div>

        {/* Search */}
        <div className="card">
          <div className="card-title"><i className="fas fa-search" />Search Records</div>
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <label className="form-label">Module</label>
              <select className="form-input" value={sheet} onChange={e => { setSheet(e.target.value); setRecords([]); setSelectedRecord(null) }}>
                {SHEET_NAV.map(n => <option key={n.key} value={n.key}>{n.label}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Search (URL, Name, ID)</label>
              <input type="text" className="form-input"
                placeholder="Enter URL, name, or record ID…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()} />
            </div>
            <button className="btn btn-primary" onClick={doSearch} disabled={searching || !searchQuery.trim()}>
              {searching ? <><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />Searching…</> : <><i className="fas fa-search" />Search</>}
            </button>
          </div>
        </div>

        {/* Results */}
        {records.length > 0 && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div className="card-title" style={{ margin: 0 }}>
                <i className="fas fa-list" />{records.length} Record{records.length !== 1 ? 's' : ''} Found
              </div>

              {selectedBulkIds.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{selectedBulkIds.length} selected</span>
                  <select className="form-input" style={{ width: 'auto', padding: '7px 10px' }} value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}>
                    <option value="">Set status…</option>
                    {REMOVAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button className="btn btn-primary" onClick={doBulkUpdate} disabled={!bulkStatus || bulkUpdating} style={{ padding: '7px 12px' }}>
                    {bulkUpdating ? 'Updating…' : 'Apply Bulk'}
                  </button>
                </div>
              )}
            </div>

            <div className="table-wrapper" style={{ marginBottom: 0 }}>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input type="checkbox"
                          checked={selectedBulkIds.length === records.length && records.length > 0}
                          onChange={e => {
                            if (e.target.checked) { const all = {}; records.forEach(r => { all[r.id] = true }); setBulkSelections(all) }
                            else setBulkSelections({})
                          }} />
                      </th>
                      <th>ID</th>
                      {activeDisplayCols.filter(c => c.key !== 'id').map(c => <th key={c.key}>{c.label}</th>)}
                      <th>Current Status</th>
                      <th style={{ width: '80px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(rec => (
                      <tr key={rec.id} style={{ background: selectedRecord?.id === rec.id ? 'rgba(59,130,246,.08)' : '' }}>
                        <td onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={!!bulkSelections[rec.id]} onChange={() => setBulkSelections(p => ({ ...p, [rec.id]: !p[rec.id] }))} />
                        </td>
                        <td><span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{rec.id}</span></td>
                        {activeDisplayCols.filter(c => c.key !== 'id').map(c => (
                          <td key={c.key} style={{ fontSize: '12px' }}>{rec[c.key] || '—'}</td>
                        ))}
                        <td><StatusBadge status={rec.removal_status} /></td>
                        <td>
                          <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '11px' }} onClick={() => selectRecord(rec)}>
                            <i className="fas fa-pen" />Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Edit Panel */}
        {selectedRecord && (
          <div className="card">
            <div className="card-title"><i className="fas fa-pen" />Edit Record #{selectedRecord.id}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Record Details</div>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', maxHeight: '380px', overflowY: 'auto' }}>
                  {Object.entries(selectedRecord).filter(([k]) => !['updated_at', 'created_at', 'uploaded_by', 'upload_batch_id'].includes(k)).map(([key, val]) => (
                    <RecordField key={key} label={key.replace(/_/g, ' ')} value={val} />
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Update Status</div>
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">New Removal Status *</label>
                  <select className="form-input" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                    <option value="">Select status…</option>
                    {REMOVAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label">Removal Timestamp</label>
                  <input type="datetime-local" className="form-input"
                    value={removalTimestamp ? String(removalTimestamp).slice(0, 16) : ''}
                    onChange={e => setRemovalTimestamp(e.target.value)} />
                </div>
                {updateResult && (
                  <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px',
                    background: updateResult.success ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)',
                    border: `1px solid ${updateResult.success ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)'}`,
                    color: updateResult.success ? 'var(--green)' : 'var(--red)' }}>
                    <i className={`fas fa-${updateResult.success ? 'check' : 'exclamation'}-circle`} style={{ marginRight: '6px' }} />
                    {updateResult.message || updateResult.error}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-primary" onClick={doUpdate} disabled={!newStatus || updating} style={{ flex: 1 }}>
                    {updating ? <><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />Updating…</> : <><i className="fas fa-save" />Save Changes</>}
                  </button>
                  <button className="btn btn-secondary" onClick={() => { setSelectedRecord(null); setUpdateResult(null) }}>Cancel</button>
                </div>
                <div style={{ marginTop: '16px', padding: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Status</div>
                  <StatusBadge status={selectedRecord.removal_status} />
                  {selectedRecord.removal_timestamp && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>Removed: {String(selectedRecord.removal_timestamp).slice(0, 16)}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {records.length === 0 && !searching && searchQuery && (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fas fa-search" style={{ fontSize: '32px', color: 'var(--text-muted)', marginBottom: '12px', display: 'block' }} />
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No records found for "{searchQuery}"</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '6px' }}>Try a different search term or select a different module</div>
          </div>
        )}
      </div>
    </div>
  )
}
