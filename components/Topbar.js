'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Topbar({ userName, userRole }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const router = useRouter()
  const isAdmin = userRole === 'superadmin' || userRole === 'admin'

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Link href="/upload" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
          <div className="topbar-logo">P</div>
          <div style={{ fontWeight: '700', fontSize: '15px' }}>Piracy <span style={{ color: 'var(--accent-light)' }}>Monitor</span></div>
        </Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/upload" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
          <i className="fas fa-table" style={{ marginRight: '6px' }} />Data
        </Link>
        <Link href="/dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
          <i className="fas fa-chart-bar" style={{ marginRight: '6px' }} />Reports
        </Link>
        <Link href="/removal-status" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
          <i className="fas fa-edit" style={{ marginRight: '6px' }} />Status Update
        </Link>
        {isAdmin && (
          <Link href="/admin" style={{ color: 'var(--amber)', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
            <i className="fas fa-user-shield" style={{ marginRight: '6px' }} />Admin
          </Link>
        )}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setDropdownOpen(o => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border2)', borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '13px', fontWeight: '600' }}>
            <div style={{ width: '26px', height: '26px', background: 'linear-gradient(135deg, var(--accent), var(--purple))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#fff' }}>
              {(userName || 'U')[0].toUpperCase()}
            </div>
            <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName || 'User'}</span>
            {userRole && userRole !== 'user' && (
              <span style={{ fontSize: '10px', background: userRole === 'superadmin' ? 'rgba(239,68,68,.2)' : 'rgba(59,130,246,.2)', color: userRole === 'superadmin' ? 'var(--red)' : 'var(--accent)', padding: '1px 5px', borderRadius: '4px', fontWeight: '700' }}>
                {userRole}
              </span>
            )}
            <i className="fas fa-chevron-down" style={{ fontSize: '10px', color: 'var(--text-muted)' }} />
          </button>
          {dropdownOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setDropdownOpen(false)} />
              <div className="user-dropdown" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 100 }}>
                <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Signed in as</div>
                  <div style={{ fontSize: '13px', fontWeight: '700' }}>{userName}</div>
                </div>
                <Link href="/upload" className="dropdown-item" onClick={() => setDropdownOpen(false)}><i className="fas fa-table" />Data Management</Link>
                <Link href="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}><i className="fas fa-chart-pie" />Dashboard</Link>
                <Link href="/removal-status" className="dropdown-item" onClick={() => setDropdownOpen(false)}><i className="fas fa-edit" />Status Update</Link>
                {isAdmin && <Link href="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)} style={{ color: 'var(--amber)' }}><i className="fas fa-user-shield" />Admin Panel</Link>}
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={handleLogout} style={{ color: 'var(--red)' }}><i className="fas fa-sign-out-alt" />Logout</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
