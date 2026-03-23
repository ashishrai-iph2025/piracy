'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ── Date Range Picker ──────────────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const WDAYS  = ['Su','Mo','Tu','We','Th','Fr','Sa']

function DateRangePicker({ dateFrom, dateTo, onFromChange, onToChange }) {
  const [open, setOpen]         = useState(false)
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [selecting, setSelecting] = useState('from')
  const [hover, setHover]       = useState(null)
  const [dropPos, setDropPos]   = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const dropRef    = useRef(null)

  useEffect(() => {
    function onDown(e) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropRef.current    && !dropRef.current.contains(e.target)
      ) { setOpen(false); setHover(null) }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  function openPicker() {
    const rect = triggerRef.current.getBoundingClientRect()
    const dropW = 308
    let left = rect.left + rect.width / 2 - dropW / 2
    // clamp to viewport
    left = Math.max(8, Math.min(left, window.innerWidth - dropW - 8))
    let top = rect.bottom + 8
    if (top + 420 > window.innerHeight) top = rect.top - 420 - 8
    setDropPos({ top, left })
    const base = dateFrom ? new Date(dateFrom) : new Date()
    setViewYear(base.getFullYear()); setViewMonth(base.getMonth())
    setSelecting(dateFrom && !dateTo ? 'to' : 'from')
    setOpen(true)
  }

  function pad(n) { return String(n).padStart(2, '0') }
  function toStr(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}` }
  function fmtLabel(s) {
    if (!s) return null
    const [y, m, d] = s.split('-')
    return `${MONTHS[+m - 1].slice(0, 3)} ${+d}, ${y}`
  }

  function getDays() {
    const first = new Date(viewYear, viewMonth, 1).getDay()
    const last  = new Date(viewYear, viewMonth + 1, 0).getDate()
    const days  = Array(first).fill(null)
    for (let d = 1; d <= last; d++) days.push(d)
    return days
  }

  function clickDay(day) {
    if (!day) return
    const ds = toStr(viewYear, viewMonth, day)
    if (selecting === 'from') {
      onFromChange(ds); onToChange(''); setSelecting('to')
    } else {
      if (dateFrom && ds < dateFrom) { onFromChange(ds); onToChange(dateFrom) }
      else { onToChange(ds) }
      setOpen(false); setHover(null)
    }
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  function dayStyle(day) {
    if (!day) return {}
    const ds      = toStr(viewYear, viewMonth, day)
    const isFrom  = ds === dateFrom
    const isTo    = ds === dateTo
    const endRef  = dateTo || (selecting === 'to' ? hover : null)
    const inRange = dateFrom && endRef && ds > dateFrom && ds < endRef
    const isToday = ds === toStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
    const dim     = selecting === 'to' && dateFrom && ds < dateFrom

    return {
      position: 'relative',
      textAlign: 'center',
      padding: '7px 0',
      borderRadius: (isFrom || isTo) ? '50%' : inRange ? '0' : '50%',
      background: (isFrom || isTo)
        ? 'linear-gradient(135deg, var(--accent), var(--accent-dark))'
        : inRange ? 'var(--accent-glow)' : 'transparent',
      color: (isFrom || isTo) ? '#fff' : dim ? 'var(--border2)' : isToday ? 'var(--accent-light)' : 'var(--text-primary)',
      fontWeight: (isFrom || isTo || isToday) ? '700' : '400',
      cursor: dim ? 'default' : 'pointer',
      fontSize: '12px',
      boxShadow: (isFrom || isTo) ? '0 2px 10px var(--accent-glow)' : 'none',
      outline: isToday && !isFrom && !isTo ? '1.5px dashed var(--accent)' : 'none',
      outlineOffset: '-3px',
      transition: 'background 0.12s',
    }
  }

  const displayText = dateFrom
    ? (dateTo ? `${fmtLabel(dateFrom)}  →  ${fmtLabel(dateTo)}` : `${fmtLabel(dateFrom)}  →  …`)
    : 'Select date range'

  return (
    <>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={openPicker}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--bg-input)', border: `1px solid ${open ? 'var(--accent)' : 'var(--border2)'}`,
          borderRadius: 'var(--radius-sm)', padding: '9px 12px', fontSize: '12.5px',
          fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left',
          color: dateFrom ? 'var(--text-primary)' : 'var(--text-muted)',
          boxShadow: open ? '0 0 0 3px var(--accent-glow)' : 'none',
          transition: 'all 0.15s',
        }}
      >
        <i className="fas fa-calendar-days" style={{ color: 'var(--accent)', fontSize: '14px', flexShrink: 0 }} />
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayText}
        </span>
        {(dateFrom || dateTo) && (
          <span
            onClick={e => { e.stopPropagation(); onFromChange(''); onToChange('') }}
            style={{ color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer', flexShrink: 0, lineHeight: 1 }}
            title="Clear dates"
          >×</span>
        )}
      </button>

      {/* Floating calendar — fixed position to escape modal overflow */}
      {open && (
        <div
          ref={dropRef}
          style={{
            position: 'fixed', top: dropPos.top, left: dropPos.left,
            zIndex: 9999, width: '308px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '18px',
            boxShadow: '0 24px 72px rgba(0,0,0,0.5)',
            padding: '18px',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          {/* From / To chips */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {['from', 'to'].map(s => {
              const val = s === 'from' ? dateFrom : dateTo
              const active = selecting === s
              return (
                <div
                  key={s}
                  onClick={() => { if (s === 'to' && !dateFrom) return; setSelecting(s) }}
                  style={{
                    flex: 1, padding: '8px 10px', borderRadius: '10px', cursor: s === 'to' && !dateFrom ? 'default' : 'pointer',
                    background: active ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                    border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                    opacity: s === 'to' && !dateFrom ? 0.45 : 1,
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: active ? 'var(--accent)' : 'var(--text-muted)', marginBottom: '2px' }}>
                    {s === 'from' ? '▶ Start' : 'End ◀'}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: val ? (active ? 'var(--accent-light)' : 'var(--text-primary)') : 'var(--text-muted)' }}>
                    {val ? fmtLabel(val) : '—'}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Month navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <button type="button" onClick={prevMonth} style={{
              width: '30px', height: '30px', borderRadius: '9px', border: '1px solid var(--border)',
              background: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-glow)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.borderColor = 'var(--border)' }}
            ><i className="fas fa-chevron-left" /></button>

            <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--text-primary)', letterSpacing: '0.3px' }}>
              {MONTHS[viewMonth]} <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{viewYear}</span>
            </div>

            <button type="button" onClick={nextMonth} style={{
              width: '30px', height: '30px', borderRadius: '9px', border: '1px solid var(--border)',
              background: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-glow)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.borderColor = 'var(--border)' }}
            ><i className="fas fa-chevron-right" /></button>
          </div>

          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '6px' }}>
            {WDAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', padding: '3px 0', letterSpacing: '0.3px' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {getDays().map((day, i) => (
              <div
                key={i}
                style={dayStyle(day)}
                onClick={() => day && !(selecting === 'to' && dateFrom && toStr(viewYear, viewMonth, day) < dateFrom) && clickDay(day)}
                onMouseEnter={() => day && selecting === 'to' && setHover(toStr(viewYear, viewMonth, day))}
                onMouseLeave={() => setHover(null)}
              >
                {day || ''}
              </div>
            ))}
          </div>

          {/* Footer actions */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button type="button"
              onClick={() => { onFromChange(''); onToChange(''); setOpen(false); setHover(null) }}
              style={{
                flex: 1, padding: '8px', borderRadius: '10px', border: '1px solid var(--border)',
                background: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'pointer',
                fontSize: '12px', fontWeight: '600',
              }}
            >Clear</button>
            <button type="button"
              onClick={() => { setOpen(false); setHover(null) }}
              disabled={!dateFrom}
              style={{
                flex: 2, padding: '8px', borderRadius: '10px', border: 'none',
                background: dateFrom ? 'linear-gradient(135deg, var(--accent), var(--accent-dark))' : 'var(--bg-secondary)',
                color: dateFrom ? '#fff' : 'var(--text-muted)',
                cursor: dateFrom ? 'pointer' : 'default',
                fontSize: '12px', fontWeight: '700',
                boxShadow: dateFrom ? '0 4px 14px var(--accent-glow)' : 'none',
              }}
            >
              {!dateFrom ? 'Pick start date' : dateTo ? '✓ Apply Range' : 'Apply (no end date)'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ── Searchable Select Dropdown ──────────────────────────────────────────────
function SearchableSelect({ options = [], value, onChange, placeholder = 'Select…', emptyLabel = 'All (no filter)' }) {
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setSearch('') }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()))

  function select(val) { onChange(val); setOpen(false); setSearch('') }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px',
          background: 'var(--bg-input)', border: `1px solid ${open ? 'var(--accent)' : 'var(--border2)'}`,
          borderRadius: 'var(--radius-sm)', color: value ? 'var(--text-primary)' : 'var(--text-muted)',
          padding: '7px 10px', fontSize: '12px', fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer',
          boxShadow: open ? '0 0 0 3px var(--accent-glow)' : 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {value || placeholder}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
          {value && (
            <span
              onClick={e => { e.stopPropagation(); onChange('') }}
              style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1, cursor: 'pointer' }}
              title="Clear"
            >×</span>
          )}
          <i className={`fas fa-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: '9px', color: 'var(--text-muted)' }} />
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 400,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', boxShadow: '0 8px 28px rgba(0,0,0,0.35)', overflow: 'hidden',
        }}>
          {/* Search */}
          <div style={{ padding: '7px 8px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-secondary)', borderRadius: '6px', padding: '5px 8px' }}>
              <i className="fas fa-search" style={{ color: 'var(--text-muted)', fontSize: '10px', flexShrink: 0 }} />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '12px', width: '100%', fontFamily: 'inherit' }}
              />
              {search && <span onClick={() => setSearch('')} style={{ color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}>×</span>}
            </div>
          </div>

          {/* Options */}
          <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
            <div
              onClick={() => select('')}
              style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', fontStyle: 'italic',
                background: !value ? 'var(--accent-glow)' : 'transparent' }}
              onMouseEnter={e => { if (value) e.currentTarget.style.background = 'var(--bg-secondary)' }}
              onMouseLeave={e => { if (value) e.currentTarget.style.background = 'transparent' }}
            >{emptyLabel}</div>

            {filtered.length === 0
              ? <div style={{ padding: '10px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>No results</div>
              : filtered.map(opt => (
                <div
                  key={opt}
                  onClick={() => select(opt)}
                  title={opt}
                  style={{ padding: '6px 10px', fontSize: '12px', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    color: value === opt ? 'var(--accent-light)' : 'var(--text-primary)',
                    background: value === opt ? 'var(--accent-glow)' : 'transparent' }}
                  onMouseEnter={e => { if (value !== opt) e.currentTarget.style.background = 'var(--bg-secondary)' }}
                  onMouseLeave={e => { if (value !== opt) e.currentTarget.style.background = value === opt ? 'var(--accent-glow)' : 'transparent' }}
                >{opt}</div>
              ))
            }
          </div>

          {/* Footer count */}
          <div style={{ padding: '4px 10px', borderTop: '1px solid var(--border)', fontSize: '10px', color: 'var(--text-muted)' }}>
            {filtered.length} of {options.length} options
          </div>
        </div>
      )}
    </div>
  )
}
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { SHEET_NAV, SHEET_CONFIG, REMOVAL_STATUSES, getStatusBadgeClass } from '@/lib/sheetConfig'
import { validateForm } from '@/lib/validation'
import IpHouseLoader from '@/components/IpHouseLoader'
import { utcToIstDisplay, utcToIstForInput, utcToIstDateForInput } from '@/lib/timezone'

// ── helpers ────────────────────────────────────────────────────────────────
function truncate(str, n = 40) {
  if (!str) return ''
  const s = String(str)
  return s.length > n ? s.slice(0, n) + '…' : s
}

function colMinWidth(col) {
  if (col.key === 'id')                                      return '110px'
  if (col.type === 'url')                                    return '180px'
  if (col.type === 'status')                                 return '130px'
  if (col.type === 'datetime' || col.type === 'date')        return '130px'
  if (col.type === 'number')                                 return '90px'
  return '120px'
}

function StatusBadge({ status }) {
  if (!status) return <span className="badge badge-gray">—</span>
  return <span className={`badge ${getStatusBadgeClass(status)}`}>{status}</span>
}

// ── Edit Row Modal ──────────────────────────────────────────────────────────
function EditModal({ sheetName, rowId, onClose, onSaved }) {
  const [row, setRow]           = useState(null)
  const [columns, setColumns]   = useState([])
  const [formData, setFormData] = useState({})
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    fetch(`/api/edit?sheet=${encodeURIComponent(sheetName)}&id=${rowId}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return }
        setRow(d.row)
        setColumns(d.columns)
        const fd = {}
        for (const col of d.columns) {
          if (col.key === 'id') continue
          const v = d.row[col.key]
          fd[col.key] = v === null || v === undefined ? '' : String(v)
        }
        setFormData(fd)
      })
      .catch(() => setError('Failed to load record'))
  }, [sheetName, rowId])

  async function handleSave() {
    setError(''); setFieldErrors({})
    const cfg = SHEET_CONFIG[sheetName]
    const errs = validateForm(formData, columns, cfg?.uniqueUrlCol)
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      setError('Please fix the validation errors below before saving.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheet: sheetName, id: rowId, data: formData }),
      })
      const d = await res.json()
      if (d.success) { onSaved(); onClose() }
      else setError(d.error || 'Save failed')
    } catch { setError('Save failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h3 className="modal-title"><i className="fas fa-pen" style={{ marginRight: '8px' }} />Edit Record #{rowId}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>×</button>
        </div>
        <div className="modal-body">
          <IpHouseLoader show={!row && !error} size="sm" text="Loading record…" />
          {error && <div style={{ color: 'var(--red)', background: 'rgba(239,68,68,.1)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
          {row && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {columns.filter(c => c.key !== 'id').map(col => (
                <div key={col.key} style={{ gridColumn: ['post_description', 'additional_remarks', 'remarks', 'keyword', 'linking_html_tag'].includes(col.key) ? 'span 2' : 'auto' }}>
                  <label className="form-label" style={{ color: fieldErrors[col.key] ? 'var(--red)' : undefined }}>{col.label}</label>
                  {col.type === 'status' ? (
                    <select className="form-input" value={formData[col.key] || ''} onChange={e => { setFormData(p => ({ ...p, [col.key]: e.target.value })); setFieldErrors(p => ({ ...p, [col.key]: undefined })) }}
                      style={{ borderColor: fieldErrors[col.key] ? 'var(--red)' : undefined }}>
                      <option value="">—</option>
                      {REMOVAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : col.type === 'datetime' ? (
                    <>
                      <input type="datetime-local" className="form-input"
                        value={formData[col.key] ? String(formData[col.key]).slice(0, 16).replace(' ', 'T') : ''}
                        onChange={e => { setFormData(p => ({ ...p, [col.key]: e.target.value.replace('T', ' ') })); setFieldErrors(p => ({ ...p, [col.key]: undefined })) }}
                        style={{ borderColor: fieldErrors[col.key] ? 'var(--red)' : undefined }} />
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>IST (UTC+5:30) — auto-converted to UTC for storage</div>
                    </>
                  ) : col.type === 'date' ? (
                    <>
                      <input type="date" className="form-input"
                        value={formData[col.key] ? String(formData[col.key]).slice(0, 10) : ''}
                        onChange={e => { setFormData(p => ({ ...p, [col.key]: e.target.value })); setFieldErrors(p => ({ ...p, [col.key]: undefined })) }}
                        style={{ borderColor: fieldErrors[col.key] ? 'var(--red)' : undefined }} />
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Date (IST)</div>
                    </>

                  ) : col.type === 'number' ? (
                    <input type="number" className="form-input"
                      value={formData[col.key] || ''}
                      onChange={e => setFormData(p => ({ ...p, [col.key]: e.target.value }))} />
                  ) : col.type === 'url' ? (
                    <input type="url" className="form-input"
                      value={formData[col.key] || ''}
                      onChange={e => { setFormData(p => ({ ...p, [col.key]: e.target.value })); setFieldErrors(p => ({ ...p, [col.key]: undefined })) }}
                      style={{ borderColor: fieldErrors[col.key] ? 'var(--red)' : undefined }} />
                  ) : (
                    <input type="text" className="form-input"
                      value={formData[col.key] || ''}
                      onChange={e => setFormData(p => ({ ...p, [col.key]: e.target.value }))} />
                  )}
                  {fieldErrors[col.key] && (
                    <div style={{ fontSize:'11px', color:'var(--red)', marginTop:'4px', display:'flex', alignItems:'center', gap:'4px' }}>
                      <i className="fas fa-circle-exclamation" style={{ fontSize:'10px' }} />
                      {fieldErrors[col.key]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !row}>
            {saving ? <><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', marginRight: '6px' }} />Saving…</> : <><i className="fas fa-save" />Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Bulk Status Modal ───────────────────────────────────────────────────────
function BulkStatusModal({ sheetName, selectedIds, onClose, onDone }) {
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)

  async function handleApply() {
    if (!status) return
    setSaving(true)
    try {
      const res = await fetch('/api/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheet: sheetName, ids: selectedIds, removal_status: status }),
      })
      const d = await res.json()
      setResult(d)
      if (d.success) setTimeout(() => { onDone(); onClose() }, 1200)
    } catch { setResult({ error: 'Update failed' }) }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h3 className="modal-title"><i className="fas fa-list-check" style={{ marginRight: '8px' }} />Bulk Status Update</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>×</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Updating <strong style={{ color: 'var(--text-primary)' }}>{selectedIds.length} records</strong>
          </p>
          <div>
            <label className="form-label">New Removal Status</label>
            <select className="form-input" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">Select status…</option>
              {REMOVAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {result && (
            <div style={{ marginTop: '14px', padding: '12px', borderRadius: '8px', fontSize: '13px',
              background: result.success ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)',
              border: `1px solid ${result.success ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)'}`,
              color: result.success ? 'var(--green)' : 'var(--red)' }}>
              {result.message || result.error}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleApply} disabled={!status || saving}>
            {saving ? 'Updating…' : `Apply to ${selectedIds.length} records`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Bulk Excel Upload Modal ─────────────────────────────────────────────────
function BulkExcelModal({ sheetName, onClose, onDone }) {
  const [file, setFile]         = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)

  async function handleUpload() {
    if (!file) return
    setLoading(true); setResult(null)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('sheet', sheetName)
    try {
      const res = await fetch('/api/bulk-update', { method: 'POST', body: fd })
      const d = await res.json()
      setResult(d)
      if (d.success) setTimeout(() => { onDone(); onClose() }, 1500)
    } catch { setResult({ error: 'Upload failed' }) }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3 className="modal-title"><i className="fas fa-file-excel" style={{ marginRight: '8px' }} />Bulk Update via Excel</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>×</button>
        </div>
        <div className="modal-body">
          {/* Instructions */}
          <div style={{ padding: '12px', background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.2)', borderRadius: '8px', fontSize: '12px', color: 'var(--accent-light)', marginBottom: '12px' }}>
            <div style={{ fontWeight: '700', marginBottom: '6px' }}><i className="fas fa-info-circle" style={{ marginRight: '6px' }} />How to Bulk Update</div>
            <ol style={{ margin: 0, paddingLeft: '16px', lineHeight: '1.8' }}>
              <li>Download the <strong>Bulk Update Template</strong> below</li>
              <li>Column <strong>A (Id)</strong> is required — paste IDs from your CSV export</li>
              <li>Fill only the columns you want to change; leave others blank</li>
              <li>Dates must be in <strong>IST format</strong> — system auto-converts to UTC</li>
              <li>Upload the completed file here</li>
            </ol>
          </div>
          {/* Template download */}
          <a
            href={`/api/template?sheet=${encodeURIComponent(sheetName)}&type=update`}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px',
              background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.3)', borderRadius: '8px',
              color: 'var(--green)', textDecoration: 'none', fontSize: '12px', fontWeight: '600', marginBottom: '14px',
            }}
          >
            <i className="fas fa-file-arrow-down" />Download Bulk Update Template (.xlsx)
            <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)' }}>Includes id + all columns + Instructions sheet</span>
          </a>
          <div
            className={`drop-zone ${dragOver ? 'dragover' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); setFile(e.dataTransfer?.files[0]) }}
            onClick={() => document.getElementById('bulkExcelInput').click()}
          >
            <i className="fas fa-file-excel" style={{ fontSize: '28px', marginBottom: '10px', color: dragOver ? 'var(--accent)' : 'var(--green)' }} />
            <p style={{ fontSize: '13px', marginBottom: '4px' }}>Drop Excel file or <strong style={{ color: 'var(--accent-light)' }}>click to browse</strong></p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>.xlsx / .xls with id column</p>
            {file && <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--accent-light)' }}><i className="fas fa-file" /> {file.name}</div>}
          </div>
          <input type="file" id="bulkExcelInput" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
          {result && (
            <div style={{ marginTop: '14px', padding: '12px', borderRadius: '8px', fontSize: '13px',
              background: result.success ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)',
              border: `1px solid ${result.success ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)'}`,
              color: result.success ? 'var(--green)' : 'var(--red)' }}>
              {result.message || result.error}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={handleUpload} disabled={!file || loading}>
            {loading ? <><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', marginRight: '6px' }} />Processing…</> : <><i className="fas fa-upload" />Upload & Update</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────
function UploadPageInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [userName, setUserName]           = useState('')
  const [userRole, setUserRole]           = useState('user')
  const [viewableModules, setViewableModules] = useState(null)
  const initialSheet = searchParams.get('sheet')
  const [activeSheet, setActiveSheet] = useState(
    (initialSheet && SHEET_CONFIG[initialSheet]) ? initialSheet : 'Unauthorized Search Result'
  )
  const [data, setData]           = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [limit, setLimit]         = useState(15)
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(false)
  const [stats, setStats]         = useState({ total: 0, removed: 0 })
  const [perms, setPerms]         = useState({})
  const [permDenied, setPermDenied] = useState(false)

  // Sort & column filters
  const [sortCol, setSortCol]       = useState('id')
  const [sortDir, setSortDir]       = useState('desc')
  const [colFilters, setColFilters] = useState({})

  // Selection
  const [selected, setSelected] = useState({})

  // Modals
  const [uploadOpen, setUploadOpen]     = useState(false)
  const [uploadFile, setUploadFile]     = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [dragOver, setDragOver]         = useState(false)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const [dlDateFrom, setDlDateFrom]     = useState('')
  const [dlDateTo, setDlDateTo]         = useState('')
  const [dlTitle, setDlTitle]           = useState('')
  const [dlOwner, setDlOwner]           = useState('')
  const [dlOptions, setDlOptions]       = useState({ titleOptions: [], ownerOptions: [] })
  const [dlOptsLoading, setDlOptsLoading] = useState(false)
  const [editId, setEditId]             = useState(null)
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false)
  const [bulkExcelOpen, setBulkExcelOpen]   = useState(false)

  const searchTimeout = useRef(null)
  const filterTimeout = useRef(null)
  const fetchIdRef    = useRef(0)

  // Auth
  useEffect(() => {
    fetch('/api/auth/check').then(r => r.json()).then(d => {
      if (!d.authenticated) router.push('/login?session_expired=1')
      else { setUserName(d.userName); setUserRole(d.role || 'user'); setViewableModules(d.viewableModules ?? null) }
    })
  }, [router])

  // Sync active sheet from URL ?sheet= param
  useEffect(() => {
    const sheetFromUrl = searchParams.get('sheet')
    if (sheetFromUrl && SHEET_CONFIG[sheetFromUrl] && sheetFromUrl !== activeSheet) {
      setActiveSheet(sheetFromUrl)
    }
  }, [searchParams])

  // After permissions load, redirect to first accessible module if current one is not permitted
  useEffect(() => {
    if (viewableModules === null) return // null = admin, all allowed
    const sheetFromUrl = searchParams.get('sheet')
    const current = sheetFromUrl || activeSheet
    const allowed = SHEET_NAV.filter(n => viewableModules.includes(n.key))
    if (!allowed.length) return
    if (!viewableModules.includes(current)) {
      setActiveSheet(allowed[0].key)
      router.replace(`/upload?sheet=${encodeURIComponent(allowed[0].key)}`)
    }
  }, [viewableModules])

  // Keepalive
  useEffect(() => {
    const t = setInterval(() => fetch('/api/auth/check'), 5 * 60 * 1000)
    return () => clearInterval(t)
  }, [])

  const cfg     = SHEET_CONFIG[activeSheet] || {}
  const columns = cfg.columns || []
  const pages   = Math.ceil(total / limit)

  // Auto-detect download filter columns for the active sheet
  const dlDateColDef  = columns.find(c =>
    (c.type === 'datetime' || c.type === 'date') &&
    (c.key.includes('identification') || c.key.startsWith('date_of'))
  )
  const dlTitleColDef = columns.find(c =>
    ['title', 'iptv_application_name', 'channel_page_profile_name', 'listing_title'].includes(c.key)
  )
  const dlOwnerColDef = columns.find(c =>
    ['copyright_owner', 'content_owner'].includes(c.key)
  )

  // fetchData — all sort/filter params passed explicitly
  const fetchData = useCallback(async (pg, lim, q, sheet, sc, sd, cf) => {
    const reqId = ++fetchIdRef.current
    setLoading(true); setPermDenied(false)
    try {
      const p = new URLSearchParams({ sheet, page: pg, limit: lim, search: q || '', sort_col: sc, sort_dir: sd })
      for (const [k, v] of Object.entries(cf || {})) {
        if (v && v.trim()) p.set(`f_${k}`, v.trim())
      }
      const res = await fetch(`/api/data?${p}`)
      if (reqId !== fetchIdRef.current) return  // stale — a newer request is in flight, discard
      if (res.status === 401) { router.push('/login?session_expired=1'); return }
      if (res.status === 403) { setPermDenied(true); setData([]); setTotal(0); setPerms({}); return }
      const d = await res.json()
      if (reqId !== fetchIdRef.current) return  // stale
      setData(d.data || [])
      setTotal(d.total || 0)
      setStats(d.stats || { total: 0, removed: 0 })
      setPerms(d.permissions || {})
    } catch (e) { console.error(e) }
    finally { if (reqId === fetchIdRef.current) setLoading(false) }
  }, [router])

  // Reload when sheet changes — reset all filters/sort
  useEffect(() => {
    setPage(1); setSearch(''); setSelected({}); setSortCol('id'); setSortDir('desc'); setColFilters({})
    fetchData(1, limit, '', activeSheet, 'id', 'desc', {})
  }, [activeSheet])

  function handleSearchChange(e) {
    const val = e.target.value
    setSearch(val)
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setPage(1)
      fetchData(1, limit, val, activeSheet, sortCol, sortDir, colFilters)
    }, 400)
  }

  function handleSort(col) {
    const dir = sortCol === col && sortDir === 'desc' ? 'asc' : 'desc'
    setSortCol(col); setSortDir(dir); setPage(1)
    fetchData(1, limit, search, activeSheet, col, dir, colFilters)
  }

  function handleColFilter(key, val) {
    const newFilters = { ...colFilters, [key]: val }
    setColFilters(newFilters)
    clearTimeout(filterTimeout.current)
    filterTimeout.current = setTimeout(() => {
      setPage(1)
      fetchData(1, limit, search, activeSheet, sortCol, sortDir, newFilters)
    }, 400)
  }

  function clearAllFilters() {
    setColFilters({}); setSearch(''); setPage(1)
    fetchData(1, limit, '', activeSheet, sortCol, sortDir, {})
  }

  function changePage(p) { setPage(p); fetchData(p, limit, search, activeSheet, sortCol, sortDir, colFilters) }
  function changeLimit(e) {
    const l = parseInt(e.target.value); setLimit(l); setPage(1)
    fetchData(1, l, search, activeSheet, sortCol, sortDir, colFilters)
  }

  const selectedIds = Object.entries(selected).filter(([, v]) => v).map(([k]) => parseInt(k))
  const activeFilterCount = Object.values(colFilters).filter(v => v && v.trim()).length

  function toggleSelect(id) { setSelected(p => ({ ...p, [id]: !p[id] })) }
  function toggleAll() {
    if (selectedIds.length === data.length) setSelected({})
    else { const all = {}; data.forEach(r => { all[r.id] = true }); setSelected(all) }
  }

  async function handleDelete(id) {
    if (!confirm(`Delete record #${id}? This cannot be undone.`)) return
    const res = await fetch(`/api/data?sheet=${encodeURIComponent(activeSheet)}&id=${id}`, { method: 'DELETE' })
    const d = await res.json()
    if (d.success) fetchData(page, limit, search, activeSheet, sortCol, sortDir, colFilters)
    else alert(d.error || 'Delete failed')
  }

  async function doUpload() {
    if (!uploadFile) return
    setUploadLoading(true); setUploadResult(null)
    const fd = new FormData()
    fd.append('file', uploadFile)
    fd.append('sheet', activeSheet)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const d = await res.json()
      setUploadResult(d)
      if (d.success) setTimeout(() => {
        setUploadOpen(false); setUploadFile(null); setUploadResult(null)
        fetchData(1, limit, search, activeSheet, sortCol, sortDir, colFilters)
      }, 1800)
    } catch { setUploadResult({ error: 'Upload failed' }) }
    finally { setUploadLoading(false) }
  }

  function doDownload() {
    if (dlDateColDef && !dlDateFrom) return
    const p = new URLSearchParams({ sheet: activeSheet })
    if (dlDateFrom)  p.set('date_from', dlDateFrom)
    if (dlDateTo)    p.set('date_to', dlDateTo)
    if (dlTitle)     p.set('title_filter', dlTitle.trim())
    if (dlOwner)     p.set('owner_filter', dlOwner.trim())
    window.location.href = `/api/download?${p}`
    setDownloadOpen(false)
    setDlDateFrom(''); setDlDateTo(''); setDlTitle(''); setDlOwner('')
  }

  async function openDlModal() {
    setDownloadOpen(true)
    setDlOptsLoading(true)
    try {
      const res = await fetch(`/api/download/options?sheet=${encodeURIComponent(activeSheet)}`)
      const d = await res.json()
      setDlOptions({ titleOptions: d.titleOptions || [], ownerOptions: d.ownerOptions || [] })
    } catch {}
    setDlOptsLoading(false)
  }

  function closeDlModal() {
    setDownloadOpen(false)
    setDlDateFrom(''); setDlDateTo(''); setDlTitle(''); setDlOwner('')
    setDlOptions({ titleOptions: [], ownerOptions: [] })
  }

  const navColor = {
    red: '#ef4444', blue: '#3b82f6', orange: '#f97316', purple: '#8b5cf6',
    teal: '#14b8a6', green: '#22c55e', pink: '#ec4899', yellow: '#f59e0b', indigo: '#6366f1'
  }

  const hasCheckbox = perms.can_edit || perms.can_bulk_update
  const hasActions  = perms.can_edit || perms.can_delete
  const colSpanTotal = columns.length + (hasCheckbox ? 1 : 0) + (hasActions ? 1 : 0)

  return (
    <div className="page-content">
      <div className="main">

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card blue">
            <div className="stat-label">Module</div>
            <div className="stat-value" style={{ fontSize: '18px', marginTop: '4px' }}>{cfg.label || activeSheet}</div>
            <div className="stat-sub">{total.toLocaleString()} total records</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Removed / Resolved</div>
            <div className="stat-value">{Number(stats.removed || 0).toLocaleString()}</div>
            <div className="stat-sub">{stats.total ? ((stats.removed / stats.total) * 100).toFixed(1) : 0}% removal rate</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{Math.max(0, (stats.total || 0) - (stats.removed || 0)).toLocaleString()}</div>
            <div className="stat-sub">awaiting action</div>
          </div>
          {selectedIds.length > 0 && (
            <div className="stat-card purple">
              <div className="stat-label">Selected</div>
              <div className="stat-value">{selectedIds.length}</div>
              <div className="stat-sub">rows for bulk action</div>
            </div>
          )}
        </div>

        {/* Module Tabs */}
        <div className="tab-bar" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
          {SHEET_NAV.filter(nav => viewableModules === null || (Array.isArray(viewableModules) && viewableModules.includes(nav.key))).map(nav => (
            <button key={nav.key}
              className={`tab-btn ${activeSheet === nav.key ? 'active' : ''}`}
              onClick={() => setActiveSheet(nav.key)}
              style={{ whiteSpace: 'nowrap', flexShrink: 0,
                ...(activeSheet === nav.key ? { background: navColor[nav.color] || 'var(--accent)' } : {}) }}>
              <i className={`fas ${nav.icon}`} style={{ marginRight: '6px' }} />
              {nav.label}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px', flexShrink: 0 }}>
            <Link href="/removal-status" className="tab-btn-report" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-edit" />Status Update
            </Link>
            <Link href="/dashboard" className="tab-btn-report" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-chart-bar" />Reporting
            </Link>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div className="search-box">
              <i className="fas fa-search" style={{ color: 'var(--text-muted)', fontSize: '13px' }} />
              <input type="text" placeholder={`Search ${cfg.label || activeSheet}…`}
                value={search} onChange={handleSearchChange} />
              {search && <button onClick={() => { setSearch(''); setPage(1); fetchData(1, limit, '', activeSheet, sortCol, sortDir, colFilters) }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>}
            </div>

            {/* Clear all filters badge */}
            {(activeFilterCount > 0 || search) && (
              <button
                onClick={clearAllFilters}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', borderRadius: '6px', color: '#ef4444', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                <i className="fas fa-filter-circle-xmark" />
                Clear Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{total.toLocaleString()} records</span>
            <select className="form-input" style={{ width: 'auto', padding: '7px 10px' }} value={limit} onChange={changeLimit}>
              <option value="15">15/page</option>
              <option value="25">25/page</option>
              <option value="50">50/page</option>
              <option value="100">100/page</option>
            </select>
            <button className="btn btn-secondary" onClick={() => fetchData(page, limit, search, activeSheet, sortCol, sortDir, colFilters)} style={{ padding: '7px 12px' }}>
              <i className="fas fa-rotate" />
            </button>

            {selectedIds.length > 0 && perms.can_bulk_update && (
              <button className="btn btn-secondary" onClick={() => setBulkStatusOpen(true)} style={{ padding: '7px 12px' }}>
                <i className="fas fa-list-check" />Bulk Status ({selectedIds.length})
              </button>
            )}
            {perms.can_bulk_update && (
              <button className="btn btn-secondary" onClick={() => setBulkExcelOpen(true)} style={{ padding: '7px 12px' }} title="Bulk update via Excel">
                <i className="fas fa-file-excel" />Bulk Update
              </button>
            )}
            {perms.can_export && (
              <button className="tab-btn-report" onClick={openDlModal}>
                <i className="fas fa-download" style={{ marginRight: '6px' }} />Download
              </button>
            )}
            {perms.can_upload && (
              <>
                <a
                  href={`/api/template?sheet=${encodeURIComponent(activeSheet)}`}
                  className="btn btn-secondary"
                  style={{ padding: '7px 12px', textDecoration: 'none' }}
                  title="Download blank Excel template"
                >
                  <i className="fas fa-file-arrow-down" />Template
                </a>
                <button className="btn btn-primary" onClick={() => setUploadOpen(true)}>
                  <i className="fas fa-upload" />Upload Data
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sort indicator */}
        {sortCol && sortCol !== 'id' && (
          <div style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="fas fa-sort" />
            Sorted by <strong style={{ color: 'var(--accent-light)' }}>{columns.find(c => c.key === sortCol)?.label || sortCol}</strong>
            <span style={{ color: sortDir === 'asc' ? 'var(--green)' : 'var(--amber)' }}>
              ({sortDir === 'asc' ? '▲ A → Z' : '▼ Z → A'})
            </span>
            <button onClick={() => { setSortCol('id'); setSortDir('desc'); fetchData(page, limit, search, activeSheet, 'id', 'desc', colFilters) }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '11px', padding: '0 4px' }}>
              ✕ reset
            </button>
          </div>
        )}

        {/* Access denied */}
        {permDenied && (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <i className="fas fa-lock" style={{ fontSize: '40px', color: 'var(--red)', marginBottom: '16px', display: 'block' }} />
            <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Access Denied</div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>You do not have permission to view this module. Contact your administrator.</div>
          </div>
        )}

        {/* Table */}
        {!permDenied && <div className="table-wrapper" style={{ position: 'relative' }}>
          <IpHouseLoader show={loading} overlay size="md" text="Loading data…" />

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  {hasCheckbox && (
                    <th className="th-sticky" style={{ width: '36px', minWidth: '36px' }}>
                      <input type="checkbox"
                        checked={selectedIds.length > 0 && selectedIds.length === data.length}
                        onChange={toggleAll} />
                    </th>
                  )}
                  {columns.map(col => (
                    <th key={col.key} style={{ minWidth: colMinWidth(col), verticalAlign: 'top' }}>
                      {/* Sort trigger row */}
                      <div
                        className="th-sort-row"
                        onClick={() => handleSort(col.key)}
                        title={`Sort by ${col.label}`}
                      >
                        <span>{col.label}</span>
                        <span className={`sort-icon${sortCol === col.key ? ' active' : ''}`}>
                          {sortCol === col.key
                            ? (sortDir === 'asc' ? '▲' : '▼')
                            : '⇅'}
                        </span>
                      </div>
                      {/* Per-column filter input */}
                      <input
                        className="col-filter-input"
                        value={colFilters[col.key] || ''}
                        onChange={e => handleColFilter(col.key, e.target.value)}
                        onClick={e => e.stopPropagation()}
                        placeholder="Filter…"
                        title={`Filter by ${col.label}`}
                      />
                    </th>
                  ))}
                  {hasActions && <th style={{ width: '90px', minWidth: '90px', verticalAlign: 'top' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={colSpanTotal} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                      <i className="fas fa-database" style={{ fontSize: '28px', display: 'block', marginBottom: '10px' }} />
                      No records found{search ? ` for "${search}"` : ''}
                    </td>
                  </tr>
                ) : data.map(row => (
                  <tr key={row.id} style={{ background: selected[row.id] ? 'rgba(59,130,246,.07)' : '' }}>
                    {hasCheckbox && (
                      <td onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={!!selected[row.id]} onChange={() => toggleSelect(row.id)} />
                      </td>
                    )}
                    {columns.map(col => (
                      <td key={col.key}>
                        {col.type === 'status' ? (
                          <StatusBadge status={row[col.key]} />
                        ) : col.type === 'url' ? (
                          row[col.key] ? (
                            <a href={row[col.key]} target="_blank" rel="noopener noreferrer"
                              title={row[col.key]}
                              style={{ color: 'var(--accent-light)', fontSize: '11px', display: 'block', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {truncate(row[col.key], 30)}
                            </a>
                          ) : '—'
                        ) : col.type === 'number' ? (
                          <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                            {row[col.key] != null ? Number(row[col.key]).toLocaleString() : '—'}
                          </span>
                        ) : col.type === 'datetime' || col.type === 'date' ? (
                          <span style={{ fontSize: '11px', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                            {row[col.key] ? utcToIstDisplay(row[col.key], col.type) : '—'}
                          </span>
                        ) : col.key === 'id' ? (
                          <span
                            title={row[col.key] ?? ''}
                            style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)',
                              display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>
                            {row[col.key] ? row[col.key].slice(0, 8) + '…' : '—'}
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px' }} title={String(row[col.key] || '')}>
                            {truncate(String(row[col.key] || ''), 36) || '—'}
                          </span>
                        )}
                      </td>
                    ))}
                    {hasActions && (
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {perms.can_edit && (
                            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => setEditId(row.id)}>
                              <i className="fas fa-pen" />
                            </button>
                          )}
                          {perms.can_delete && (
                            <button onClick={() => handleDelete(row.id)}
                              style={{ padding: '4px 8px', fontSize: '11px', background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)', color: '#ef4444', borderRadius: '6px', cursor: 'pointer' }}>
                              <i className="fas fa-trash" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Showing {data.length ? ((page - 1) * limit + 1) : 0}–{Math.min(page * limit, total)} of {total.toLocaleString()}
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              <button className="page-btn" onClick={() => changePage(1)} disabled={page === 1}>«</button>
              <button className="page-btn" onClick={() => changePage(page - 1)} disabled={page === 1}>‹</button>
              {Array.from({ length: Math.min(7, pages) }, (_, i) => {
                let p = pages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= pages - 3 ? pages - 6 + i : page - 3 + i
                return <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => changePage(p)}>{p}</button>
              })}
              <button className="page-btn" onClick={() => changePage(page + 1)} disabled={page === pages}>›</button>
              <button className="page-btn" onClick={() => changePage(pages)} disabled={page === pages}>»</button>
            </div>
          </div>
        </div>
        }

      </div>

      {/* ── Upload Modal ── */}
      {uploadOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && (setUploadOpen(false), setUploadFile(null), setUploadResult(null))}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">📤 Upload Data — {cfg.label}</h3>
              <button onClick={() => { setUploadOpen(false); setUploadFile(null); setUploadResult(null) }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ padding: '10px 12px', background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', borderRadius: '8px', fontSize: '12px', color: '#22c55e', marginBottom: '10px' }}>
                <i className="fas fa-info-circle" style={{ marginRight: '6px' }} />
                Sheet tab in Excel must be named exactly: <strong>"{activeSheet}"</strong>. Duplicate URLs will be skipped automatically.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', marginBottom: '16px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  <i className="fas fa-table" style={{ marginRight: '6px', color: 'var(--accent)' }} />
                  Don&apos;t have the right format?
                </span>
                <a href={`/api/template?sheet=${encodeURIComponent(activeSheet)}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--accent-light)', fontWeight: '600', textDecoration: 'none', fontSize: '12px' }}>
                  <i className="fas fa-file-arrow-down" />Download Template
                </a>
              </div>
              <div
                className={`drop-zone ${dragOver ? 'dragover' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); setUploadFile(e.dataTransfer?.files[0]) }}
                onClick={() => document.getElementById('uploadFileInput').click()}
              >
                <i className="fas fa-cloud-upload-alt" style={{ fontSize: '32px', marginBottom: '12px', color: dragOver ? 'var(--accent)' : 'var(--text-muted)' }} />
                <p style={{ fontSize: '14px', marginBottom: '6px' }}>Drop your file here or <strong style={{ color: 'var(--accent-light)' }}>click to browse</strong></p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Supports .xlsx, .xls, .csv — Max 50MB</p>
                {uploadFile && (
                  <div style={{ marginTop: '10px', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '6px', fontSize: '12px', color: 'var(--accent-light)' }}>
                    <i className="fas fa-file" style={{ marginRight: '6px' }} />{uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>
              <input type="file" id="uploadFileInput" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={e => setUploadFile(e.target.files[0])} />
              {uploadResult && (
                <div style={{ marginTop: '14px', padding: '14px', borderRadius: '8px', fontSize: '13px',
                  background: uploadResult.success ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)',
                  border: `1px solid ${uploadResult.success ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)'}`,
                  color: uploadResult.success ? 'var(--green)' : 'var(--red)' }}>
                  <i className={`fas fa-${uploadResult.success ? 'check' : 'exclamation'}-circle`} style={{ marginRight: '6px' }} />
                  {uploadResult.message || uploadResult.error}
                  {uploadResult.errorLog?.length > 0 && (
                    <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '12px', opacity: 0.8 }}>
                      {uploadResult.errorLog.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setUploadOpen(false); setUploadFile(null); setUploadResult(null) }}>Cancel</button>
              <button className="btn btn-primary" onClick={doUpload} disabled={!uploadFile || uploadLoading}>
                {uploadLoading ? <><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', marginRight: '6px' }} />Uploading…</> : <><i className="fas fa-upload" />Upload & Process</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Download Modal ── */}
      {downloadOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeDlModal()}>
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <i className="fas fa-download" style={{ marginRight: '8px', color: 'var(--green)' }} />
                Export — {cfg.label}
              </h3>
              <button onClick={closeDlModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Date range */}
              {dlDateColDef && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <i className="fas fa-calendar-days" style={{ color: 'var(--accent)', fontSize: '12px' }} />
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Date Range
                    </span>
                    <span style={{ fontSize: '10px', background: 'rgba(239,68,68,.15)', color: '#ef4444', padding: '1px 6px', borderRadius: '10px', fontWeight: '600' }}>Required</span>
                  </div>
                  <DateRangePicker
                    dateFrom={dlDateFrom}
                    dateTo={dlDateTo}
                    onFromChange={setDlDateFrom}
                    onToChange={setDlDateTo}
                  />
                  <div style={{ marginTop: '7px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <i className="fas fa-info-circle" style={{ marginRight: '4px' }} />
                    Filtering on: <strong style={{ color: 'var(--text-secondary)' }}>{dlDateColDef.label}</strong>
                  </div>
                </div>
              )}

              {/* Title filter */}
              {dlTitleColDef && (
                <div>
                  <label className="form-label">
                    <i className="fas fa-heading" style={{ marginRight: '5px', color: 'var(--purple)' }} />
                    {dlTitleColDef.label}
                    <span style={{ marginLeft: '6px', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>
                      {dlOptsLoading ? '— loading…' : dlOptions.titleOptions.length ? `— ${dlOptions.titleOptions.length} options` : '(optional)'}
                    </span>
                  </label>
                  <SearchableSelect
                    options={dlOptions.titleOptions}
                    value={dlTitle}
                    onChange={setDlTitle}
                    placeholder={dlOptsLoading ? 'Loading…' : `Select ${dlTitleColDef.label}…`}
                    emptyLabel="— No filter (all titles)"
                  />
                </div>
              )}

              {/* Owner filter */}
              {dlOwnerColDef && (
                <div>
                  <label className="form-label">
                    <i className="fas fa-copyright" style={{ marginRight: '5px', color: 'var(--amber)' }} />
                    {dlOwnerColDef.label}
                    <span style={{ marginLeft: '6px', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>
                      {dlOptsLoading ? '— loading…' : dlOptions.ownerOptions.length ? `— ${dlOptions.ownerOptions.length} options` : '(optional)'}
                    </span>
                  </label>
                  <SearchableSelect
                    options={dlOptions.ownerOptions}
                    value={dlOwner}
                    onChange={setDlOwner}
                    placeholder={dlOptsLoading ? 'Loading…' : `Select ${dlOwnerColDef.label}…`}
                    emptyLabel="— No filter (all owners)"
                  />
                </div>
              )}

              <div style={{ padding: '10px 12px', background: 'rgba(34,197,94,.07)', border: '1px solid rgba(34,197,94,.2)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <i className="fas fa-file-csv" style={{ marginRight: '6px', color: 'var(--green)' }} />
                Exports as <strong>CSV</strong> with UTF-8 BOM — all columns included, filtered rows only.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeDlModal}>Cancel</button>
              <button
                className="btn btn-success"
                onClick={doDownload}
                disabled={dlDateColDef && !dlDateFrom}
                title={dlDateColDef && !dlDateFrom ? 'Start date is required' : ''}
              >
                <i className="fas fa-download" />Export CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editId && (
        <EditModal sheetName={activeSheet} rowId={editId}
          onClose={() => setEditId(null)}
          onSaved={() => fetchData(page, limit, search, activeSheet, sortCol, sortDir, colFilters)} />
      )}

      {/* ── Bulk Status Modal ── */}
      {bulkStatusOpen && (
        <BulkStatusModal sheetName={activeSheet} selectedIds={selectedIds}
          onClose={() => setBulkStatusOpen(false)}
          onDone={() => { setSelected({}); fetchData(page, limit, search, activeSheet, sortCol, sortDir, colFilters) }} />
      )}

      {/* ── Bulk Excel Modal ── */}
      {bulkExcelOpen && (
        <BulkExcelModal sheetName={activeSheet}
          onClose={() => setBulkExcelOpen(false)}
          onDone={() => fetchData(page, limit, search, activeSheet, sortCol, sortDir, colFilters)} />
      )}
    </div>
  )
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg)' }} />}>
      <UploadPageInner />
    </Suspense>
  )
}
