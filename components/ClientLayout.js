'use client'

import { useState, useEffect, Suspense } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import ThemeProvider from './ThemeProvider'
import Sidebar from './Sidebar'

const AUTH_PATHS = ['/login', '/register']
const SIDEBAR_W  = 240   // px

function UserBadge() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/check').then(r => r.json()).then(d => {
      if (d.authenticated) setUser(d)
    }).catch(() => {})
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (!user) return null

  const roleColor = user.role === 'superadmin' ? '#ef4444' : user.role === 'admin' ? 'var(--accent)' : 'var(--text-muted)'

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '10px', padding: '6px 12px 6px 8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, var(--accent), var(--purple))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '12px', fontWeight: '800', color: '#fff',
      }}>
        {(user.userName || 'U')[0].toUpperCase()}
      </div>
      <div style={{ lineHeight: 1.3 }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
          {user.userName}
        </div>
        <div style={{ fontSize: '10px', fontWeight: '600', color: roleColor, textTransform: 'capitalize' }}>
          {user.role}
        </div>
      </div>
      <button
        onClick={handleLogout}
        title="Sign out"
        style={{
          marginLeft: '4px', background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: '13px', padding: '2px 4px', borderRadius: '4px',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <i className="fas fa-right-from-bracket" />
      </button>
    </div>
  )
}

export default function ClientLayout({ children }) {
  const pathname   = usePathname()
  const isAuthPage = AUTH_PATHS.some(p => pathname.startsWith(p))

  const [open, setOpen] = useState(true)   // default true; corrected on mount
  const [mounted, setMounted] = useState(false)

  // On mount: respect saved preference; default-close on narrow screens
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const saved    = localStorage.getItem('sidebar-open')
    if (isMobile) {
      setOpen(false)
    } else if (saved !== null) {
      setOpen(saved === 'true')
    }
    setMounted(true)
  }, [])

  // Drive --sidebar-width CSS variable so all layout uses it
  useEffect(() => {
    if (isAuthPage) return
    document.documentElement.style.setProperty(
      '--sidebar-width',
      open ? `${SIDEBAR_W}px` : '0px'
    )
  }, [open, isAuthPage])

  function toggle() {
    setOpen(prev => {
      const next = !prev
      localStorage.setItem('sidebar-open', String(next))
      return next
    })
  }

  if (isAuthPage) {
    return <ThemeProvider>{children}</ThemeProvider>
  }

  return (
    <ThemeProvider>
      {/* Sidebar */}
      <Suspense fallback={null}>
        <Sidebar open={open} onToggle={toggle} />
      </Suspense>

      {/* Dark overlay on mobile when sidebar is open */}
      {open && mounted && (
        <div className="sidebar-overlay" onClick={toggle} />
      )}

      {/* Floating open-button shown when sidebar is fully hidden */}
      {!open && (
        <button
          className="sidebar-float-toggle"
          onClick={toggle}
          title="Open navigation"
          aria-label="Open sidebar"
        >
          <i className="fas fa-bars" />
        </button>
      )}

      {/* User badge — only rendered client-side to avoid hydration mismatch */}
      {mounted && (
        <div style={{
          marginLeft: 'var(--sidebar-width)',
          transition: 'margin-left 0.25s ease',
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '10px 18px',
        }}>
          <UserBadge />
        </div>
      )}

      {children}
    </ThemeProvider>
  )
}
