'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SHEET_NAV } from '@/lib/sheetConfig'

// ── Chart colors
const COLORS = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899','#10b981','#a855f7','#0ea5e9','#84cc16','#f43f5e','#14b8a6','#6366f1']

const MOD_COLOR = {
  red:'#ef4444', blue:'#3b82f6', orange:'#f97316', purple:'#8b5cf6',
  teal:'#14b8a6', green:'#22c55e', pink:'#ec4899', yellow:'#eab308', indigo:'#6366f1',
}

// ── Date Range Picker (same as upload page) ────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const WDAYS  = ['Su','Mo','Tu','We','Th','Fr','Sa']

function DateRangePicker({ dateFrom, dateTo, onFromChange, onToChange }) {
  const [open, setOpen]           = useState(false)
  const [viewYear, setViewYear]   = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [selecting, setSelecting] = useState('from')
  const [hover, setHover]         = useState(null)
  const [dropPos, setDropPos]     = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const dropRef    = useRef(null)

  useEffect(() => {
    function onDown(e) {
      if (triggerRef.current && !triggerRef.current.contains(e.target) &&
          dropRef.current    && !dropRef.current.contains(e.target))
        { setOpen(false); setHover(null) }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  function openPicker() {
    const rect = triggerRef.current.getBoundingClientRect()
    const dropW = 308
    let left = rect.left + rect.width / 2 - dropW / 2
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
    if (selecting === 'from') { onFromChange(ds); onToChange(''); setSelecting('to') }
    else {
      if (dateFrom && ds < dateFrom) { onFromChange(ds); onToChange(dateFrom) }
      else { onToChange(ds) }
      setOpen(false); setHover(null)
    }
  }

  function prevMonth() { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) } else setViewMonth(m => m - 1) }
  function nextMonth() { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) } else setViewMonth(m => m + 1) }

  function dayStyle(day) {
    if (!day) return {}
    const ds     = toStr(viewYear, viewMonth, day)
    const isFrom = ds === dateFrom
    const isTo   = ds === dateTo
    const endRef = dateTo || (selecting === 'to' ? hover : null)
    const inRange = dateFrom && endRef && ds > dateFrom && ds < endRef
    const isToday = ds === toStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
    const dim    = selecting === 'to' && dateFrom && ds < dateFrom
    return {
      position:'relative', textAlign:'center', padding:'7px 0',
      borderRadius: (isFrom || isTo) ? '50%' : inRange ? '0' : '50%',
      background: (isFrom || isTo) ? 'linear-gradient(135deg, var(--accent), var(--accent-dark))' : inRange ? 'var(--accent-glow)' : 'transparent',
      color: (isFrom || isTo) ? '#fff' : dim ? 'var(--border2)' : isToday ? 'var(--accent-light)' : 'var(--text-primary)',
      fontWeight: (isFrom || isTo || isToday) ? '700' : '400',
      cursor: dim ? 'default' : 'pointer', fontSize:'12px',
      boxShadow: (isFrom || isTo) ? '0 2px 10px var(--accent-glow)' : 'none',
      outline: isToday && !isFrom && !isTo ? '1.5px dashed var(--accent)' : 'none',
      outlineOffset:'-3px', transition:'background 0.12s',
    }
  }

  const displayText = dateFrom
    ? (dateTo ? `${fmtLabel(dateFrom)}  →  ${fmtLabel(dateTo)}` : `${fmtLabel(dateFrom)}  →  …`)
    : 'Select date range'

  return (
    <>
      <button ref={triggerRef} type="button" onClick={openPicker} style={{
        display:'flex', alignItems:'center', gap:'8px',
        background:'var(--bg-input)', border:`1px solid ${open ? 'var(--accent)' : 'var(--border2)'}`,
        borderRadius:'var(--radius-sm)', padding:'9px 14px', fontSize:'12.5px',
        fontFamily:'inherit', cursor:'pointer', textAlign:'left',
        color: dateFrom ? 'var(--text-primary)' : 'var(--text-muted)',
        boxShadow: open ? '0 0 0 3px var(--accent-glow)' : 'none', transition:'all 0.15s',
        minWidth:'220px',
      }}>
        <i className="fas fa-calendar-days" style={{ color:'var(--accent)', fontSize:'14px', flexShrink:0 }} />
        <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{displayText}</span>
        {(dateFrom || dateTo) && (
          <span onClick={e => { e.stopPropagation(); onFromChange(''); onToChange('') }}
            style={{ color:'var(--text-muted)', fontSize:'16px', cursor:'pointer', flexShrink:0, lineHeight:1 }} title="Clear">×</span>
        )}
      </button>

      {open && (
        <div ref={dropRef} style={{
          position:'fixed', top:dropPos.top, left:dropPos.left, zIndex:9999, width:'308px',
          background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'18px',
          boxShadow:'0 24px 72px rgba(0,0,0,0.5)', padding:'18px', animation:'fadeIn 0.15s ease',
        }}>
          <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
            {['from','to'].map(s => {
              const val = s === 'from' ? dateFrom : dateTo
              const active = selecting === s
              return (
                <div key={s} onClick={() => { if (s === 'to' && !dateFrom) return; setSelecting(s) }} style={{
                  flex:1, padding:'8px 10px', borderRadius:'10px', cursor: s === 'to' && !dateFrom ? 'default' : 'pointer',
                  background: active ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                  border:`1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  opacity: s === 'to' && !dateFrom ? 0.45 : 1, transition:'all 0.15s',
                }}>
                  <div style={{ fontSize:'9px', fontWeight:'800', textTransform:'uppercase', letterSpacing:'0.8px', color: active ? 'var(--accent)' : 'var(--text-muted)', marginBottom:'2px' }}>
                    {s === 'from' ? '▶ Start' : 'End ◀'}
                  </div>
                  <div style={{ fontSize:'11px', fontWeight:'600', color: val ? (active ? 'var(--accent-light)' : 'var(--text-primary)') : 'var(--text-muted)' }}>
                    {val ? fmtLabel(val) : '—'}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
            <button type="button" onClick={prevMonth} style={{ width:'30px', height:'30px', borderRadius:'9px', border:'1px solid var(--border)', background:'var(--bg-secondary)', color:'var(--text-secondary)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px' }}
              onMouseEnter={e => { e.currentTarget.style.background='var(--accent-glow)'; e.currentTarget.style.borderColor='var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.background='var(--bg-secondary)'; e.currentTarget.style.borderColor='var(--border)' }}
            ><i className="fas fa-chevron-left" /></button>
            <div style={{ fontWeight:'800', fontSize:'15px', color:'var(--text-primary)' }}>
              {MONTHS[viewMonth]} <span style={{ color:'var(--text-secondary)', fontWeight:'500' }}>{viewYear}</span>
            </div>
            <button type="button" onClick={nextMonth} style={{ width:'30px', height:'30px', borderRadius:'9px', border:'1px solid var(--border)', background:'var(--bg-secondary)', color:'var(--text-secondary)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px' }}
              onMouseEnter={e => { e.currentTarget.style.background='var(--accent-glow)'; e.currentTarget.style.borderColor='var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.background='var(--bg-secondary)'; e.currentTarget.style.borderColor='var(--border)' }}
            ><i className="fas fa-chevron-right" /></button>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', marginBottom:'6px' }}>
            {WDAYS.map(d => <div key={d} style={{ textAlign:'center', fontSize:'10px', fontWeight:'700', color:'var(--text-muted)', padding:'3px 0' }}>{d}</div>)}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'2px' }}>
            {getDays().map((day, i) => (
              <div key={i} style={dayStyle(day)}
                onClick={() => day && !(selecting === 'to' && dateFrom && toStr(viewYear, viewMonth, day) < dateFrom) && clickDay(day)}
                onMouseEnter={() => day && selecting === 'to' && setHover(toStr(viewYear, viewMonth, day))}
                onMouseLeave={() => setHover(null)}
              >{day || ''}</div>
            ))}
          </div>

          <div style={{ display:'flex', gap:'8px', marginTop:'16px' }}>
            <button type="button" onClick={() => { onFromChange(''); onToChange(''); setOpen(false); setHover(null) }} style={{
              flex:1, padding:'8px', borderRadius:'10px', border:'1px solid var(--border)',
              background:'var(--bg-secondary)', color:'var(--text-secondary)', cursor:'pointer', fontSize:'12px', fontWeight:'600',
            }}>Clear</button>
            <button type="button" onClick={() => { setOpen(false); setHover(null) }} disabled={!dateFrom} style={{
              flex:2, padding:'8px', borderRadius:'10px', border:'none',
              background: dateFrom ? 'linear-gradient(135deg, var(--accent), var(--accent-dark))' : 'var(--bg-secondary)',
              color: dateFrom ? '#fff' : 'var(--text-muted)', cursor: dateFrom ? 'pointer' : 'default',
              fontSize:'12px', fontWeight:'700', boxShadow: dateFrom ? '0 4px 14px var(--accent-glow)' : 'none',
            }}>{!dateFrom ? 'Pick start date' : dateTo ? '✓ Apply Range' : 'Apply (no end date)'}</button>
          </div>
        </div>
      )}
    </>
  )
}

// ── Module multi-select dropdown ───────────────────────────────────────────
function ModuleSelect({ allModules, selected, onChange }) {
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    function onDown(e) { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setSearch('') } }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const filtered = allModules.filter(m => m.label.toLowerCase().includes(search.toLowerCase()))
  const allSelected = selected.length === allModules.length

  function toggle(key) {
    if (selected.includes(key)) onChange(selected.filter(k => k !== key))
    else onChange([...selected, key])
  }

  function toggleAll() {
    if (allSelected) onChange([])
    else onChange(allModules.map(m => m.key))
  }

  const label = allSelected ? 'All Modules' : selected.length === 0 ? 'No Modules' : `${selected.length} of ${allModules.length} Modules`

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        display:'flex', alignItems:'center', gap:'8px',
        background:'var(--bg-input)', border:`1px solid ${open ? 'var(--accent)' : 'var(--border2)'}`,
        borderRadius:'var(--radius-sm)', padding:'9px 14px', fontSize:'12.5px',
        fontFamily:'inherit', cursor:'pointer', minWidth:'180px',
        color:'var(--text-primary)', boxShadow: open ? '0 0 0 3px var(--accent-glow)' : 'none', transition:'all 0.15s',
      }}>
        <i className="fas fa-layer-group" style={{ color:'var(--accent)', fontSize:'13px' }} />
        <span style={{ flex:1 }}>{label}</span>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'}`} style={{ fontSize:'9px', color:'var(--text-muted)' }} />
      </button>

      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 4px)', left:0, zIndex:500, width:'240px',
          background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:'12px', boxShadow:'0 12px 40px rgba(0,0,0,0.4)', overflow:'hidden',
        }}>
          <div style={{ padding:'8px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', background:'var(--bg-secondary)', borderRadius:'8px', padding:'5px 8px' }}>
              <i className="fas fa-search" style={{ color:'var(--text-muted)', fontSize:'10px' }} />
              <input autoFocus type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search modules…"
                style={{ background:'none', border:'none', outline:'none', color:'var(--text-primary)', fontSize:'12px', width:'100%', fontFamily:'inherit' }} />
              {search && <span onClick={() => setSearch('')} style={{ color:'var(--text-muted)', cursor:'pointer', fontSize:'12px' }}>×</span>}
            </div>
          </div>

          <div style={{ padding:'6px 8px', borderBottom:'1px solid var(--border)' }}>
            <div onClick={toggleAll} style={{
              display:'flex', alignItems:'center', gap:'8px', padding:'5px 6px', borderRadius:'6px', cursor:'pointer',
              background: allSelected ? 'var(--accent-glow)' : 'transparent',
            }}
              onMouseEnter={e => { if (!allSelected) e.currentTarget.style.background = 'var(--bg-secondary)' }}
              onMouseLeave={e => { if (!allSelected) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{
                width:'14px', height:'14px', borderRadius:'4px', border:`2px solid ${allSelected ? 'var(--accent)' : 'var(--border2)'}`,
                background: allSelected ? 'var(--accent)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              }}>
                {allSelected && <i className="fas fa-check" style={{ fontSize:'8px', color:'#fff' }} />}
              </div>
              <span style={{ fontSize:'12px', fontWeight:'700', color: allSelected ? 'var(--accent-light)' : 'var(--text-secondary)' }}>All Modules</span>
            </div>
          </div>

          <div style={{ maxHeight:'240px', overflowY:'auto' }}>
            {filtered.map(m => {
              const checked = selected.includes(m.key)
              return (
                <div key={m.key} onClick={() => toggle(m.key)} style={{
                  display:'flex', alignItems:'center', gap:'8px', padding:'6px 14px', cursor:'pointer',
                  background: checked ? 'rgba(var(--accent-rgb,59,130,246),0.08)' : 'transparent',
                }}
                  onMouseEnter={e => { if (!checked) e.currentTarget.style.background = 'var(--bg-secondary)' }}
                  onMouseLeave={e => { if (!checked) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{
                    width:'14px', height:'14px', borderRadius:'4px', border:`2px solid ${checked ? 'var(--accent)' : 'var(--border2)'}`,
                    background: checked ? 'var(--accent)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                  }}>
                    {checked && <i className="fas fa-check" style={{ fontSize:'8px', color:'#fff' }} />}
                  </div>
                  <i className={`fas ${m.icon}`} style={{ fontSize:'11px', color: MOD_COLOR[m.color] || 'var(--text-muted)', width:'14px', textAlign:'center' }} />
                  <span style={{ fontSize:'12px', color: checked ? 'var(--text-primary)' : 'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.label}</span>
                </div>
              )
            })}
          </div>
          <div style={{ padding:'6px 14px', borderTop:'1px solid var(--border)', fontSize:'10px', color:'var(--text-muted)' }}>
            {selected.length} selected
          </div>
        </div>
      )}
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────
function pct(a, b) { return (!b) ? '0.0' : ((a / b) * 100).toFixed(1) }

function RateBar({ rate, color }) {
  const r = parseFloat(rate) || 0
  const c = color || (r >= 80 ? '#22c55e' : r >= 50 ? '#f59e0b' : '#ef4444')
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
      <div style={{ flex:1, height:'5px', background:'var(--border)', borderRadius:'3px', overflow:'hidden' }}>
        <div style={{ width:`${r}%`, height:'100%', background:c, borderRadius:'3px', transition:'width 0.6s' }} />
      </div>
      <span style={{ fontSize:'11px', fontWeight:'700', color:c, minWidth:'36px', textAlign:'right' }}>{r}%</span>
    </div>
  )
}

function StatCard({ label, value, sub, icon, accent }) {
  return (
    <div style={{
      background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'12px',
      padding:'18px 20px', display:'flex', flexDirection:'column', gap:'6px',
      borderLeft:`3px solid ${accent || 'var(--accent)'}`,
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ fontSize:'11px', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</div>
        <i className={`fas fa-${icon}`} style={{ fontSize:'16px', color: accent || 'var(--accent)', opacity:0.7 }} />
      </div>
      <div style={{ fontSize:'26px', fontWeight:'800', color:'var(--text-primary)', lineHeight:1 }}>{Number(value || 0).toLocaleString()}</div>
      {sub && <div style={{ fontSize:'11px', color:'var(--text-secondary)', fontWeight:'500' }}>{sub}</div>}
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const [dateFrom, setDateFrom]       = useState('')
  const [dateTo, setDateTo]           = useState('')
  const [accessibleModules, setAccessibleModules] = useState([]) // { key, label, icon, color }
  const [selectedKeys, setSelectedKeys] = useState([])           // keys currently selected
  const [data, setData]               = useState(null)
  const [loading, setLoading]         = useState(false)
  const [chartsLoaded, setChartsLoaded] = useState(false)
  const [expandedModule, setExpandedModule] = useState(null)

  const chartRefs      = useRef({})
  const chartInstances = useRef({})

  // Auth check + build accessible module list from SHEET_NAV (no heavy DB on mount)
  useEffect(() => {
    fetch('/api/auth/check').then(r => r.json()).then(d => {
      if (!d.authenticated) { router.push('/login?session_expired=1'); return }
      let accessible = SHEET_NAV
      if (d.viewableModules && Array.isArray(d.viewableModules)) {
        accessible = SHEET_NAV.filter(m => d.viewableModules.includes(m.key))
      }
      setAccessibleModules(accessible)
      setSelectedKeys(accessible.map(m => m.key))
    })
    // Load Chart.js
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js'
    script.onload = () => { setChartsLoaded(true) }
    document.head.appendChild(script)
    return () => { Object.values(chartInstances.current).forEach(c => c?.destroy()) }
  }, [])

  async function loadData() {
    if (!selectedKeys.length) return
    setLoading(true)
    const params = new URLSearchParams()
    if (dateFrom) params.set('from', dateFrom)
    if (dateTo)   params.set('to',   dateTo)
    if (selectedKeys.length < accessibleModules.length) {
      params.set('modules', selectedKeys.join(','))
    }
    try {
      const res = await fetch(`/api/dashboard?${params}`)
      if (res.status === 401) { router.push('/login?session_expired=1'); return }
      const d = await res.json()
      setData(d)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function applyFilters() { loadData() }

  function clearFilters() {
    setDateFrom(''); setDateTo('')
    setSelectedKeys(accessibleModules.map(m => m.key))
    setData(null)
  }

  // Render charts when data + Chart.js ready
  useEffect(() => {
    if (data && chartsLoaded && window.Chart) renderCharts(data)
  }, [data, chartsLoaded])

  function destroyChart(id) {
    if (chartInstances.current[id]) { chartInstances.current[id].destroy(); delete chartInstances.current[id] }
  }

  function renderCharts(d) {
    const Chart = window.Chart
    const gridColor = 'rgba(255,255,255,0.05)'
    const tickColor = '#7a92b0'
    const font = { family:'DM Sans, Inter, sans-serif', size:11 }

    // Module comparison chart (horizontal bar)
    if (chartRefs.current.moduleBar && d.modules?.length) {
      destroyChart('moduleBar')
      const sorted = [...d.modules].sort((a, b) => b.total - a.total)
      chartInstances.current.moduleBar = new Chart(chartRefs.current.moduleBar, {
        type: 'bar',
        data: {
          labels: sorted.map(m => m.label),
          datasets: [
            { label:'Identified', data: sorted.map(m => m.total),    backgroundColor: sorted.map(m => MOD_COLOR[m.color] || '#3b82f6'), borderRadius:4, barThickness:14 },
            { label:'Actioned',   data: sorted.map(m => m.actioned), backgroundColor: sorted.map(m => (MOD_COLOR[m.color] || '#3b82f6') + '66'), borderRadius:4, barThickness:8 },
          ]
        },
        options: {
          responsive:true, maintainAspectRatio:false, indexAxis:'y',
          plugins: { legend:{ display:true, labels:{ color:tickColor, font, padding:12 } } },
          scales: {
            x: { ticks:{ color:tickColor, font }, grid:{ color:gridColor } },
            y: { ticks:{ color:tickColor, font, font:{ size:10 } }, grid:{ display:false } },
          }
        }
      })
    }

    // Country distribution bar
    if (chartRefs.current.countryBar && d.countries?.length) {
      destroyChart('countryBar')
      chartInstances.current.countryBar = new Chart(chartRefs.current.countryBar, {
        type: 'bar',
        data: {
          labels: d.countries.slice(0,12).map(c => c.country),
          datasets: [
            { label:'Total',    data: d.countries.slice(0,12).map(c => c.total),    backgroundColor:'#3b82f6', borderRadius:4 },
            { label:'Actioned', data: d.countries.slice(0,12).map(c => c.actioned), backgroundColor:'#22c55e', borderRadius:4 },
          ]
        },
        options: {
          responsive:true, maintainAspectRatio:false,
          plugins: { legend:{ display:true, labels:{ color:tickColor, font, padding:12 } } },
          scales: {
            x: { ticks:{ color:tickColor, font }, grid:{ color:gridColor } },
            y: { ticks:{ color:tickColor, font }, grid:{ color:gridColor } },
          }
        }
      })
    }
  }

  const stats = data?.stats || {}

  return (
    <div className="page-content">
      <div className="main">

        {/* ── Header ── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <h1 style={{ fontSize:'20px', fontWeight:'800', color:'var(--text-primary)', margin:0 }}>
              <i className="fas fa-chart-bar" style={{ color:'var(--accent)', marginRight:'10px' }} />
              Piracy Enforcement Dashboard
            </h1>
            <div style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'3px' }}>
              Real-time analysis across all monitoring modules
            </div>
          </div>
          <Link href="/upload" style={{
            display:'inline-flex', alignItems:'center', gap:'6px', padding:'7px 14px',
            background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'8px',
            color:'var(--text-secondary)', textDecoration:'none', fontSize:'13px', fontWeight:'600',
          }}>
            <i className="fas fa-arrow-left" /> Back
          </Link>
        </div>

        {/* ── Filter Bar ── */}
        <div style={{
          background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'14px',
          padding:'16px 20px', marginBottom:'20px',
        }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'12px' }}>
            <i className="fas fa-filter" style={{ marginRight:'6px', color:'var(--accent)' }} />
            Filters
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:'12px', flexWrap:'wrap' }}>
            {/* Date Range */}
            <div style={{ flex:'1 1 220px' }}>
              <div style={{ fontSize:'11px', fontWeight:'600', color:'var(--text-secondary)', marginBottom:'5px' }}>Date Range</div>
              <DateRangePicker dateFrom={dateFrom} dateTo={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
            </div>

            {/* Module Filter */}
            <div style={{ flex:'1 1 180px' }}>
              <div style={{ fontSize:'11px', fontWeight:'600', color:'var(--text-secondary)', marginBottom:'5px' }}>Modules</div>
              <ModuleSelect allModules={accessibleModules} selected={selectedKeys} onChange={setSelectedKeys} />
            </div>

            {/* Action buttons */}
            <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
              <button onClick={applyFilters} disabled={loading} style={{
                display:'flex', alignItems:'center', gap:'7px', padding:'9px 18px',
                background:'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                border:'none', borderRadius:'var(--radius-sm)', color:'#fff',
                fontWeight:'700', fontSize:'13px', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, transition:'all 0.2s',
              }}>
                {loading ? <><div className="spinner" style={{ width:'13px', height:'13px', borderWidth:'2px' }} />Loading…</> : <><i className="fas fa-rotate" />Apply</>}
              </button>
              <button onClick={clearFilters} style={{
                display:'flex', alignItems:'center', gap:'7px', padding:'9px 14px',
                background:'var(--bg-secondary)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)',
                color:'var(--text-secondary)', fontWeight:'600', fontSize:'13px', cursor:'pointer',
              }}>
                <i className="fas fa-xmark" />Clear
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {(dateFrom || dateTo || selectedKeys.length < accessibleModules.length) && (
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginTop:'10px', paddingTop:'10px', borderTop:'1px solid var(--border)' }}>
              {dateFrom && (
                <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'3px 10px', background:'var(--accent-glow)', border:'1px solid var(--accent)', borderRadius:'20px', fontSize:'11px', color:'var(--accent-light)', fontWeight:'600' }}>
                  <i className="fas fa-calendar" style={{ fontSize:'9px' }} />
                  {dateFrom}{dateTo ? ` → ${dateTo}` : ' (no end)'}
                  <span onClick={() => { setDateFrom(''); setDateTo('') }} style={{ cursor:'pointer', marginLeft:'2px', opacity:0.7 }}>×</span>
                </span>
              )}
              {selectedKeys.length < accessibleModules.length && (
                <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'3px 10px', background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.3)', borderRadius:'20px', fontSize:'11px', color:'#a78bfa', fontWeight:'600' }}>
                  <i className="fas fa-layer-group" style={{ fontSize:'9px' }} />
                  {selectedKeys.length} modules selected
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Empty state ── */}
        {!data && !loading && (
          <div style={{ textAlign:'center', padding:'80px 40px', color:'var(--text-secondary)' }}>
            <div style={{ fontSize:'56px', marginBottom:'20px', opacity:0.25 }}>
              <i className="fas fa-chart-bar" />
            </div>
            <div style={{ fontSize:'18px', fontWeight:'700', color:'var(--text-primary)', marginBottom:'8px' }}>
              Dashboard not loaded yet
            </div>
            <div style={{ fontSize:'13px', color:'var(--text-muted)', marginBottom:'28px', maxWidth:'400px', margin:'0 auto 28px' }}>
              Select a date range and modules above, then click <strong style={{ color:'var(--accent-light)' }}>Apply</strong> to generate the analysis report.
            </div>
            <button onClick={applyFilters} style={{
              padding:'11px 28px', background:'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              border:'none', borderRadius:'10px', color:'#fff', fontWeight:'700', fontSize:'14px',
              cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'8px',
              boxShadow:'0 4px 18px var(--accent-glow)',
            }}>
              <i className="fas fa-rotate" /> Load Dashboard
            </button>
          </div>
        )}

        {/* ── Loading spinner ── */}
        {loading && !data && (
          <div style={{ textAlign:'center', padding:'60px', color:'var(--text-secondary)' }}>
            <div className="spinner" style={{ margin:'0 auto 16px', width:'36px', height:'36px', borderWidth:'3px' }} />
            <div>Loading dashboard data…</div>
          </div>
        )}

        {data && (
          <>
            {/* ── Summary Stats Row ── */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'14px', marginBottom:'20px' }}>
              <StatCard label="Total Identified" value={stats.totalIdent} sub="Across selected modules" icon="eye" accent="#3b82f6" />
              <StatCard label="Total Actioned" value={stats.totalActioned} sub={`${stats.actionRate}% action rate`} icon="circle-check" accent="#22c55e" />
              <StatCard label="Pending / Active" value={(stats.totalIdent || 0) - (stats.totalActioned || 0)} sub="Still requiring action" icon="hourglass-half" accent="#f59e0b" />
              <StatCard label="Modules Active" value={stats.moduleCount} sub={`of ${accessibleModules.length} accessible`} icon="layer-group" accent="#8b5cf6" />
            </div>

            {/* ── Module Cards Grid ── */}
            <div className="section-divider">
              <i className="fas fa-grid-2" style={{ color:'var(--accent)' }} /> Module Analysis
              <span style={{ marginLeft:'auto', fontSize:'11px', background:'var(--bg-secondary)', padding:'2px 10px', borderRadius:'20px', color:'var(--text-muted)' }}>
                {data.modules?.length || 0} modules
              </span>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'14px', marginBottom:'20px' }}>
              {(data.modules || []).map(mod => (
                <div key={mod.key} style={{
                  background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'12px',
                  overflow:'hidden', transition:'border-color 0.2s',
                  borderTop:`3px solid ${MOD_COLOR[mod.color] || 'var(--accent)'}`,
                }}>
                  {/* Module header */}
                  <div style={{ padding:'14px 16px 10px', display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{
                      width:'36px', height:'36px', borderRadius:'10px', flexShrink:0,
                      background:`${MOD_COLOR[mod.color] || 'var(--accent)'}22`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                      <i className={`fas ${mod.icon}`} style={{ color: MOD_COLOR[mod.color] || 'var(--accent)', fontSize:'14px' }} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'12px', fontWeight:'700', color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{mod.label}</div>
                      <div style={{ fontSize:'10px', color:'var(--text-muted)', marginTop:'1px' }}>
                        {Number(mod.total).toLocaleString()} identified
                      </div>
                    </div>
                    <Link href={`/upload?sheet=${encodeURIComponent(mod.key)}`} style={{
                      fontSize:'10px', color:'var(--accent-light)', textDecoration:'none', fontWeight:'600',
                      padding:'3px 8px', background:'var(--accent-glow)', borderRadius:'6px', flexShrink:0,
                    }}>View <i className="fas fa-arrow-right" style={{ fontSize:'9px' }} /></Link>
                  </div>

                  {/* Stats */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ padding:'10px 16px', borderRight:'1px solid var(--border)' }}>
                      <div style={{ fontSize:'10px', color:'var(--text-muted)', fontWeight:'600', marginBottom:'2px' }}>IDENTIFIED</div>
                      <div style={{ fontSize:'18px', fontWeight:'800', color:'var(--text-primary)', lineHeight:1 }}>{Number(mod.total).toLocaleString()}</div>
                    </div>
                    <div style={{ padding:'10px 16px' }}>
                      <div style={{ fontSize:'10px', color:'#22c55e', fontWeight:'600', marginBottom:'2px' }}>ACTIONED</div>
                      <div style={{ fontSize:'18px', fontWeight:'800', color:'#22c55e', lineHeight:1 }}>{Number(mod.actioned).toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Rate bar */}
                  <div style={{ padding:'10px 16px 12px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                      <span style={{ fontSize:'10px', color:'var(--text-muted)', fontWeight:'600' }}>ACTION RATE</span>
                    </div>
                    <RateBar rate={mod.actionRate} color={MOD_COLOR[mod.color]} />
                  </div>

                  {/* Expand / top platforms + countries */}
                  {(mod.platforms?.length > 0 || mod.countries?.length > 0) && (
                    <>
                      <div
                        onClick={() => setExpandedModule(expandedModule === mod.key ? null : mod.key)}
                        style={{ padding:'7px 16px', borderTop:'1px solid var(--border)', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', color:'var(--text-muted)', fontSize:'11px', fontWeight:'600' }}
                      >
                        <i className={`fas fa-chevron-${expandedModule === mod.key ? 'up' : 'down'}`} style={{ fontSize:'9px' }} />
                        {expandedModule === mod.key ? 'Hide details' : 'Show breakdown'}
                      </div>

                      {expandedModule === mod.key && (
                        <div style={{ padding:'0 16px 14px', borderTop:'1px solid var(--border)' }}>
                          {mod.platforms?.length > 0 && (
                            <div style={{ marginTop:'10px' }}>
                              <div style={{ fontSize:'10px', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>
                                By Platform
                              </div>
                              {mod.platforms.slice(0, 5).map((p, i) => (
                                <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px' }}>
                                  <div style={{ flex:1, fontSize:'11px', color:'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.platform}</div>
                                  <div style={{ fontSize:'11px', fontFamily:'monospace', color:'var(--text-primary)', minWidth:'40px', textAlign:'right' }}>{Number(p.cnt).toLocaleString()}</div>
                                  <div style={{ width:'60px' }}>
                                    <div style={{ height:'4px', background:'var(--border)', borderRadius:'2px' }}>
                                      <div style={{ width:`${pct(p.cnt, mod.platforms[0]?.cnt)}%`, height:'100%', background: MOD_COLOR[mod.color] || 'var(--accent)', borderRadius:'2px' }} />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {mod.countries?.length > 0 && (
                            <div style={{ marginTop:'10px' }}>
                              <div style={{ fontSize:'10px', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>
                                By Country (Top 5)
                              </div>
                              {mod.countries.slice(0, 5).map((c, i) => (
                                <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px' }}>
                                  <div style={{ flex:1, fontSize:'11px', color:'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.country}</div>
                                  <div style={{ fontSize:'11px', fontFamily:'monospace', color:'var(--text-primary)', minWidth:'40px', textAlign:'right' }}>{Number(c.cnt).toLocaleString()}</div>
                                  <div style={{ width:'60px' }}>
                                    <div style={{ height:'4px', background:'var(--border)', borderRadius:'2px' }}>
                                      <div style={{ width:`${pct(c.cnt, mod.countries[0]?.cnt)}%`, height:'100%', background:'#22c55e', borderRadius:'2px' }} />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* ── Charts Section ── */}
            <div className="section-divider">
              <i className="fas fa-chart-bar" style={{ color:'var(--accent)' }} /> Charts & Trends
            </div>

            <div className="grid-2-1" style={{ marginBottom:'20px' }}>
              {/* Country distribution */}
              <div className="card" style={{ marginBottom:0 }}>
                <div className="card-title">
                  <i className="fas fa-globe" /> Country Distribution (Combined)
                  <span style={{ marginLeft:'auto', fontSize:'11px', background:'var(--bg-secondary)', padding:'2px 8px', borderRadius:'20px' }}>
                    Top {Math.min(data.countries?.length || 0, 12)}
                  </span>
                </div>
                <div style={{ height:'300px' }}>
                  <canvas ref={el => chartRefs.current.countryBar = el} />
                </div>
              </div>

              {/* Module comparison */}
              <div className="card" style={{ marginBottom:0 }}>
                <div className="card-title">
                  <i className="fas fa-layer-group" /> Module Comparison
                </div>
                <div style={{ height:'300px' }}>
                  <canvas ref={el => chartRefs.current.moduleBar = el} />
                </div>
              </div>
            </div>

            {/* ── Country breakdown table ── */}
            <div className="section-divider">
              <i className="fas fa-flag" style={{ color:'var(--accent)' }} /> Geographic Breakdown
            </div>
            <div className="card" style={{ marginBottom:'20px' }}>
              <div className="card-title">
                <i className="fas fa-earth-americas" /> Country-Level Summary (All Modules Combined)
                <span style={{ marginLeft:'auto', fontSize:'11px', background:'var(--bg-secondary)', padding:'2px 8px', borderRadius:'20px' }}>
                  Top {data.countries?.length || 0} countries
                </span>
              </div>
              <div className="table-wrapper" style={{ border:'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Country</th>
                      <th style={{ textAlign:'right' }}>Total Identified</th>
                      <th style={{ textAlign:'right' }}>Total Actioned</th>
                      <th style={{ minWidth:'140px' }}>Action Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.countries || []).map((r, i) => (
                      <tr key={i}>
                        <td style={{ color:'var(--text-muted)', fontSize:'11px' }}>{i + 1}</td>
                        <td style={{ fontWeight:'600' }}>{r.country}</td>
                        <td style={{ textAlign:'right', fontFamily:'monospace', fontSize:'12px' }}>{Number(r.total).toLocaleString()}</td>
                        <td style={{ textAlign:'right', fontFamily:'monospace', fontSize:'12px', color:'var(--green)' }}>{Number(r.actioned).toLocaleString()}</td>
                        <td><RateBar rate={pct(r.actioned, r.total)} /></td>
                      </tr>
                    ))}
                    {(!data.countries || !data.countries.length) && (
                      <tr><td colSpan="5" style={{ textAlign:'center', color:'var(--text-muted)', padding:'20px' }}>No country data available</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Per-module summary table ── */}
            <div className="section-divider">
              <i className="fas fa-table-list" style={{ color:'var(--accent)' }} /> Module Summary Report
            </div>
            <div className="card">
              <div className="card-title">
                <i className="fas fa-chart-simple" /> Enforcement Summary by Module
              </div>
              <div className="table-wrapper" style={{ border:'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Module</th>
                      <th style={{ textAlign:'right' }}>Identified</th>
                      <th style={{ textAlign:'right' }}>Actioned</th>
                      <th style={{ textAlign:'right' }}>Pending</th>
                      <th style={{ minWidth:'140px' }}>Action Rate</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.modules || []).sort((a, b) => b.total - a.total).map((mod, i) => (
                      <tr key={mod.key}>
                        <td style={{ color:'var(--text-muted)', fontSize:'11px' }}>{i + 1}</td>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                            <i className={`fas ${mod.icon}`} style={{ color: MOD_COLOR[mod.color] || 'var(--accent)', fontSize:'12px', width:'14px' }} />
                            <span style={{ fontWeight:'600', fontSize:'12px' }}>{mod.label}</span>
                          </div>
                        </td>
                        <td style={{ textAlign:'right', fontFamily:'monospace', fontSize:'12px' }}>{Number(mod.total).toLocaleString()}</td>
                        <td style={{ textAlign:'right', fontFamily:'monospace', fontSize:'12px', color:'var(--green)' }}>{Number(mod.actioned).toLocaleString()}</td>
                        <td style={{ textAlign:'right', fontFamily:'monospace', fontSize:'12px', color:'#f59e0b' }}>{Number(mod.total - mod.actioned).toLocaleString()}</td>
                        <td><RateBar rate={mod.actionRate} color={MOD_COLOR[mod.color]} /></td>
                        <td>
                          <Link href={`/upload?sheet=${encodeURIComponent(mod.key)}`} style={{
                            fontSize:'10px', color:'var(--accent-light)', textDecoration:'none', fontWeight:'600',
                            padding:'3px 8px', background:'var(--accent-glow)', borderRadius:'6px', whiteSpace:'nowrap',
                          }}>View Data</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background:'var(--bg-secondary)', fontWeight:'700' }}>
                      <td colSpan={2} style={{ fontSize:'12px', padding:'10px 12px', color:'var(--text-secondary)' }}>Total</td>
                      <td style={{ textAlign:'right', fontFamily:'monospace', fontSize:'12px', padding:'10px 12px' }}>{Number(stats.totalIdent).toLocaleString()}</td>
                      <td style={{ textAlign:'right', fontFamily:'monospace', fontSize:'12px', color:'var(--green)', padding:'10px 12px' }}>{Number(stats.totalActioned).toLocaleString()}</td>
                      <td style={{ textAlign:'right', fontFamily:'monospace', fontSize:'12px', color:'#f59e0b', padding:'10px 12px' }}>{Number((stats.totalIdent||0) - (stats.totalActioned||0)).toLocaleString()}</td>
                      <td style={{ padding:'10px 12px' }}><RateBar rate={stats.actionRate} /></td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
