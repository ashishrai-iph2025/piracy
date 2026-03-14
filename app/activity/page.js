'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

function getActionBadgeClass(action) {
  if (!action) return 'badge-gray'
  switch (action.toLowerCase()) {
    case 'login':       return 'badge-green'
    case 'logout':      return 'badge-gray'
    case 'upload':      return 'badge-blue'
    case 'delete':      return 'badge-red'
    case 'bulk_delete': return 'badge-red'
    case 'edit':        return 'badge-amber'
    case 'bulk_update': return 'badge-amber'
    default:            return 'badge-gray'
  }
}

function getActionIcon(action) {
  if (!action) return null
  switch (action.toLowerCase()) {
    case 'login':       return 'fa-right-to-bracket'
    case 'logout':      return 'fa-right-from-bracket'
    case 'upload':      return 'fa-upload'
    case 'delete':
    case 'bulk_delete': return 'fa-trash'
    case 'edit':        return 'fa-pen'
    case 'bulk_update': return 'fa-layer-group'
    default:            return 'fa-circle-dot'
  }
}

function formatDate(dt) {
  if (!dt) return '—'
  const d = new Date(dt)
  return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export default function ActivityPage() {
  const [data, setData]   = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage]   = useState(1)
  const [pages, setPages] = useState(1)
  const [limit, setLimit] = useState(15)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/activity?page=${page}&limit=${limit}`)
      if (res.status === 401) { router.push('/login'); return }
      const d = await res.json()
      setData(d.data || [])
      setTotal(d.total || 0)
      setPages(d.pages || 1)
    } catch {}
    setLoading(false)
  }, [page, limit, router])

  useEffect(() => { loadData() }, [loadData])

  return (
    <div className="page-content">
      <div className="main">

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                <div style={{
                  width: '40px', height: '40px',
                  background: 'linear-gradient(135deg, var(--accent), var(--purple))',
                  borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className="fas fa-chart-line" style={{ color: '#fff', fontSize: '17px' }} />
                </div>
                <div>
                  <h1 style={{ fontSize: '20px', fontWeight: '700', lineHeight: 1.2 }}>User Activity Log</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
                    Track all user actions in the system
                  </p>
                </div>
              </div>
            </div>
            <button onClick={loadData} className="btn btn-secondary" style={{ padding: '8px 14px' }}>
              <i className="fas fa-rotate-right" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div className="stat-card blue" style={{ minWidth: '200px' }}>
            <div className="stat-label">Total Actions</div>
            <div className="stat-value">{total}</div>
          </div>
          <div className="stat-card purple" style={{ minWidth: '200px' }}>
            <div className="stat-label">Page</div>
            <div className="stat-value" style={{ fontSize: '22px' }}>{page} / {pages}</div>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : (
            <>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Sheet / Module</th>
                      <th>File</th>
                      <th>Records</th>
                      <th>IP Address</th>
                      <th>Date &amp; Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                          <i className="fas fa-inbox" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }} />
                          No activity found
                        </td>
                      </tr>
                    ) : data.map((row, i) => (
                      <tr key={row.id}>
                        <td style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>
                          {(page - 1) * limit + i + 1}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '28px', height: '28px',
                              background: 'linear-gradient(135deg, var(--accent), var(--purple))',
                              borderRadius: '50%', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontSize: '11px', fontWeight: '700',
                              color: '#fff', flexShrink: 0,
                            }}>
                              {(row.user_name || 'U')[0].toUpperCase()}
                            </div>
                            <span style={{ fontWeight: '600' }}>{row.user_name}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getActionBadgeClass(row.action)}`}>
                            <i className={`fas ${getActionIcon(row.action)}`} style={{ marginRight: '4px', fontSize: '9px' }} />
                            {row.action}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row.sheet_name || '—'}
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>
                          {row.file_name || '—'}
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', textAlign: 'center' }}>
                          {row.records_count || '—'}
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {row.ip_address || '—'}
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {formatDate(row.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="pagination">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Per page:</span>
                  {[15, 25, 50, 100].map(n => (
                    <button
                      key={n}
                      className={`page-btn${limit === n ? ' active' : ''}`}
                      onClick={() => { setLimit(n); setPage(1) }}
                    >{n}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <i className="fas fa-chevron-left" />
                  </button>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '0 8px' }}>
                    {page} / {pages}
                  </span>
                  <button className="page-btn" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>
                    <i className="fas fa-chevron-right" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
