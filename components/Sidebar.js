'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { SHEET_NAV } from '@/lib/sheetConfig'
import { useTheme, THEMES } from './ThemeProvider'

const COLOR_MAP = {
  red: '#ef4444', blue: '#3b82f6', orange: '#f97316', purple: '#8b5cf6',
  teal: '#14b8a6', green: '#22c55e', pink: '#ec4899', yellow: '#eab308', indigo: '#6366f1',
}

export default function Sidebar({ open, onToggle }) {
  const [user, setUser]           = useState(null)
  const [showTheme, setShowTheme] = useState(false)
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const activeSheet  = searchParams.get('sheet')
  const { theme, setTheme, mode, setMode, customColor, setCustomColor } = useTheme()

  useEffect(() => {
    fetch('/api/auth/check')
      .then(r => r.json())
      .then(d => { if (d.authenticated) setUser(d) })
      .catch(() => {})
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  // Close sidebar on mobile after nav click
  function handleNavClick() {
    if (typeof window !== 'undefined' && window.innerWidth < 768 && open) {
      onToggle()
    }
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  return (
    <aside className={`sidebar${open ? '' : ' sidebar-hidden'}`}>

      {/* ── Brand + collapse toggle ── */}
      <div className="sidebar-brand" style={{ justifyContent: 'space-between', padding: '12px 14px' }}>
        <Image
          src="/sidebar_top.png"
          alt="IP House"
          width={150}
          height={32}
          style={{ objectFit: 'contain', objectPosition: 'left center', maxWidth: '160px', height: '32px', flexShrink: 1 }}
          priority
        />
        <button
          className="sidebar-collapse-btn"
          onClick={onToggle}
          title="Collapse sidebar"
          aria-label="Toggle sidebar"
          style={{ flexShrink: 0, marginLeft: '8px' }}
        >
          <i className="fas fa-chevron-left" />
        </button>
      </div>


      {/* ── Nav ── */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Overview</div>

        <Link
          href="/dashboard"
          onClick={handleNavClick}
          className={`nav-item${pathname === '/dashboard' ? ' active' : ''}`}
        >
          <i className="fas fa-chart-bar nav-icon" style={{ color: '#3b82f6' }} />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/removal-status"
          onClick={handleNavClick}
          className={`nav-item${pathname === '/removal-status' ? ' active' : ''}`}
        >
          <i className="fas fa-circle-check nav-icon" style={{ color: '#22c55e' }} />
          <span>Status Update</span>
        </Link>

        <div className="nav-section-label" style={{ marginTop: '6px' }}>Modules</div>

        {SHEET_NAV.filter(item => !user || user.viewableModules === null || (Array.isArray(user.viewableModules) && user.viewableModules.includes(item.key))).map(item => {
          const active = pathname === '/upload' && activeSheet === item.key
          return (
            <Link
              key={item.key}
              href={`/upload?sheet=${encodeURIComponent(item.key)}`}
              onClick={handleNavClick}
              className={`nav-item${active ? ' active' : ''}`}
            >
              <i
                className={`fas ${item.icon} nav-icon`}
                style={{ color: active ? 'var(--accent-light)' : COLOR_MAP[item.color] || 'var(--text-muted)' }}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}

        {user?.role === 'superadmin' && (
          <>
            <div className="nav-section-label" style={{ marginTop: '6px' }}>Planning</div>
            <Link
              href="/sprint"
              onClick={handleNavClick}
              className={`nav-item${pathname === '/sprint' ? ' active' : ''}`}
            >
              <i className="fas fa-list-check nav-icon" style={{ color: '#06b6d4' }} />
              <span>Sprint Plan</span>
            </Link>
            <Link
              href="/architecture"
              onClick={handleNavClick}
              className={`nav-item${pathname === '/architecture' ? ' active' : ''}`}
            >
              <i className="fas fa-diagram-project nav-icon" style={{ color: '#8b5cf6' }} />
              <span>Architecture</span>
            </Link>
          </>
        )}

        {isAdmin && (
          <>
            <div className="nav-section-label" style={{ marginTop: '6px' }}>Admin</div>

            <Link
              href="/activity"
              onClick={handleNavClick}
              className={`nav-item${pathname === '/activity' ? ' active' : ''}`}
            >
              <i className="fas fa-chart-line nav-icon" style={{ color: '#8b5cf6' }} />
              <span>User Activity</span>
            </Link>

            <Link
              href="/admin"
              onClick={handleNavClick}
              className={`nav-item${pathname === '/admin' ? ' active' : ''}`}
            >
              <i className="fas fa-user-shield nav-icon" style={{ color: '#f59e0b' }} />
              <span>Admin Panel</span>
            </Link>

            <Link
              href="/api-docs"
              onClick={handleNavClick}
              className={`nav-item${pathname === '/api-docs' ? ' active' : ''}`}
            >
              <i className="fas fa-book-open nav-icon" style={{ color: '#14b8a6' }} />
              <span>API Docs</span>
            </Link>
          </>
        )}
      </nav>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        <div className="sidebar-theme-wrap">
          <button
            className="sidebar-footer-btn"
            onClick={() => setShowTheme(o => !o)}
            title="Change accent color"
          >
            <i className="fas fa-palette" />
            <span>Theme</span>
            <div
              className="theme-current-dot"
              style={{ background: THEMES.find(t => t.id === theme)?.color || '#3b82f6' }}
            />
          </button>

          {showTheme && (
            <div className="theme-swatches">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  title={t.label}
                  onClick={() => { setTheme(t.id); setShowTheme(false) }}
                  className={`theme-swatch${theme === t.id ? ' active' : ''}`}
                  style={{ background: t.color }}
                />
              ))}
            </div>
          )}
          {showTheme && (
            <div style={{ padding: '6px 10px 4px', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>Appearance</div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                <button
                  onClick={() => setMode('light')}
                  style={{
                    flex: 1, padding: '5px 0', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                    border: mode === 'light' ? '2px solid var(--accent)' : '1px solid var(--border2)',
                    background: mode === 'light' ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                    color: mode === 'light' ? 'var(--accent)' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                  }}
                >
                  <i className="fas fa-sun" style={{ fontSize: '10px' }} />Light
                </button>
                <button
                  onClick={() => setMode('dark')}
                  style={{
                    flex: 1, padding: '5px 0', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                    border: mode === 'dark' ? '2px solid var(--accent)' : '1px solid var(--border2)',
                    background: mode === 'dark' ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                    color: mode === 'dark' ? 'var(--accent)' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                  }}
                >
                  <i className="fas fa-moon" style={{ fontSize: '10px' }} />Dark
                </button>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600' }}>Custom Color</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="color"
                  value={customColor}
                  onChange={e => setCustomColor(e.target.value)}
                  title="Pick custom accent color"
                  style={{ width: '28px', height: '22px', border: 'none', background: 'none', cursor: 'pointer', padding: 0, borderRadius: '4px' }}
                />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{customColor}</span>
              </div>
            </div>
          )}
        </div>

        <button className="signout-btn" onClick={handleLogout}>
          <i className="fas fa-right-from-bracket" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
