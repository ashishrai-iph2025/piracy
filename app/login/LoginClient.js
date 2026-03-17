'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

import Image from 'next/image'

// Uses ip-house-logo.svg which fills with currentColor
function IpHouseLogo({ dark = false }) {
  return (
    <div style={{ color: dark ? '#ffffff' : '#112043', lineHeight: 0 }}>
      <Image
        src="/ip-house-logo.svg"
        alt="IP House"
        width={210}
        height={54}
        priority
        style={{ objectFit: 'contain', filter: dark ? 'brightness(0) invert(1)' : 'none' }}
      />
    </div>
  )
}

function IpHouseIcon({ size = 48 }) {
  return (
    <Image
      src="/newlogo.png"
      alt="IP House"
      width={size}
      height={size}
      priority
      style={{ objectFit: 'contain' }}
    />
  )
}

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [isDark, setIsDark]     = useState(true)
  const router       = useRouter()
  const searchParams = useSearchParams()
  const sessionExpired = searchParams.get('session_expired')

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = (dark) => {
      setIsDark(dark)
      document.documentElement.setAttribute('data-mode', dark ? 'dark' : 'light')
    }
    apply(mq.matches)
    mq.addEventListener('change', e => apply(e.matches))
    return () => mq.removeEventListener('change', e => apply(e.matches))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username || !password) { setError('Username and password are required'); return }
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (data.success) {
        router.push('/upload')
      } else if (data.message === 'pending_approval') {
        setError('__pending__')
      } else {
        setError(data.message || 'Invalid credentials')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Theme tokens ────────────────────────────────────────────────────────────
  const brand   = '#112043'
  const accent  = '#3b82f6'

  const panel = isDark ? {
    bg:        '#0b1120',
    card:      '#131d2e',
    border:    '#1e2e45',
    input:     '#0e1828',
    textPrim:  '#e2eaf5',
    textSec:   '#7a92b0',
    textMuted: '#4a6080',
  } : {
    bg:        '#f0f4f8',
    card:      '#ffffff',
    border:    '#d0daea',
    input:     '#f8fafc',
    textPrim:  '#0f1829',
    textSec:   '#4a6080',
    textMuted: '#7a92b0',
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: isDark ? '#0b1120' : '#e8eef6',
      fontFamily: 'Inter, DM Sans, Arial, sans-serif',
    }}>

      {/* ── Left brand panel ──────────────────────────────────────────────── */}
      <div style={{
        flex: '0 0 46%',
        background: `linear-gradient(155deg, ${brand} 0%, #1a3360 60%, #0e2050 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '56px 60px',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="login-brand-panel"
      >
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '340px', height: '340px', borderRadius: '50%',
          background: 'rgba(59,130,246,0.12)', filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '280px', height: '280px', borderRadius: '50%',
          background: 'rgba(139,92,246,0.10)', filter: 'blur(50px)', pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <IpHouseLogo dark />
        </div>

        {/* Center content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Big icon */}
          

          <h1 style={{
            color: '#ffffff',
            fontSize: '32px',
            fontWeight: '800',
            lineHeight: 1.2,
            marginBottom: '16px',
            letterSpacing: '-0.02em',
          }}>
            API Monitoring<br />System
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: '15px',
            lineHeight: 1.7,
            maxWidth: '320px',
          }}>
            Centralised tracking, API analytics, and reporting — all in one place.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '40px' }}>
            {[
              { icon: 'fa-shield-halved', text: 'Role-based access control' },
              { icon: 'fa-chart-line',    text: 'Real-time analytics dashboard' },
              
            ].map(f => (
              <div key={f.icon} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(59,130,246,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <i className={`fas ${f.icon}`} style={{ color: '#93c5fd', fontSize: '13px' }} />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '500' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
            © {new Date().getFullYear()} IP House. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        background: panel.bg,
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
        }}>

          {/* Card */}
          <div style={{
            background: panel.card,
            border: `1px solid ${panel.border}`,
            borderRadius: '20px',
            padding: '44px 40px',
            boxShadow: isDark
              ? '0 24px 60px rgba(0,0,0,0.5)'
              : '0 24px 60px rgba(0,0,0,0.08)',
          }}>

            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)',
                border: `1px solid rgba(59,130,246,0.25)`,
                borderRadius: '20px',
                padding: '4px 12px',
                marginBottom: '20px',
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                <span style={{ fontSize: '11px', fontWeight: '600', color: accent, letterSpacing: '0.05em' }}>
                  SECURE PORTAL
                </span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: panel.textPrim, marginBottom: '6px', letterSpacing: '-0.02em' }}>
                Welcome back
              </h2>
              <p style={{ fontSize: '13px', color: panel.textSec }}>
                Sign in to your IP House account
              </p>
            </div>

            {/* Session expired banner */}
            {sessionExpired && (
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '10px', padding: '12px 14px', marginBottom: '20px',
                display: 'flex', alignItems: 'flex-start', gap: '10px',
              }}>
                <i className="fas fa-clock" style={{ color: '#ef4444', fontSize: '14px', marginTop: '1px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#ef4444' }}>Session Expired</div>
                  <div style={{ fontSize: '11px', color: panel.textSec, marginTop: '2px' }}>
                    Your session timed out after 30 minutes of inactivity.
                  </div>
                </div>
              </div>
            )}

            {/* Pending approval */}
            {error === '__pending__' && (
              <div style={{
                background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)',
                borderRadius: '10px', padding: '14px 16px', marginBottom: '20px',
                display: 'flex', alignItems: 'flex-start', gap: '10px',
              }}>
                <i className="fas fa-hourglass-half" style={{ color: '#ca8a04', fontSize: '16px', marginTop: '1px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#ca8a04' }}>Account Pending Approval</div>
                  <div style={{ fontSize: '11px', color: panel.textSec, marginTop: '3px', lineHeight: 1.5 }}>
                    Your registration is under review. Login credentials will be sent via email once approved.
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && error !== '__pending__' && (
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '10px', padding: '12px 14px', marginBottom: '20px',
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '13px', color: '#ef4444',
              }}>
                <i className="fas fa-exclamation-circle" style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Username */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: panel.textSec, marginBottom: '7px', letterSpacing: '0.03em' }}>
                  USERNAME OR EMAIL
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="fas fa-user" style={{
                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                    color: panel.textMuted, fontSize: '13px', pointerEvents: 'none',
                  }} />
                  <input
                    type="text"
                    placeholder="Enter username or email"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    autoFocus
                    required
                    suppressHydrationWarning
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: panel.input,
                      border: `1px solid ${panel.border}`,
                      borderRadius: '10px',
                      padding: '12px 14px 12px 38px',
                      fontSize: '14px',
                      color: panel.textPrim,
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      fontFamily: 'inherit',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = accent
                      e.target.style.boxShadow = `0 0 0 3px rgba(59,130,246,0.15)`
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = panel.border
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: panel.textSec, marginBottom: '7px', letterSpacing: '0.03em' }}>
                  PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="fas fa-lock" style={{
                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                    color: panel.textMuted, fontSize: '13px', pointerEvents: 'none',
                  }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    suppressHydrationWarning
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: panel.input,
                      border: `1px solid ${panel.border}`,
                      borderRadius: '10px',
                      padding: '12px 42px 12px 38px',
                      fontSize: '14px',
                      color: panel.textPrim,
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      fontFamily: 'inherit',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = accent
                      e.target.style.boxShadow = `0 0 0 3px rgba(59,130,246,0.15)`
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = panel.border
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: panel.textMuted, fontSize: '13px', padding: '4px',
                    }}
                    tabIndex={-1}
                  >
                    <i className={`fas fa-eye${showPass ? '-slash' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '4px',
                  background: loading
                    ? 'rgba(59,130,246,0.5)'
                    : `linear-gradient(135deg, ${accent}, #1d4ed8)`,
                  border: 'none',
                  borderRadius: '10px',
                  padding: '13px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  transition: 'opacity 0.2s, transform 0.1s',
                  letterSpacing: '0.02em',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(59,130,246,0.35)',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '15px', height: '15px', border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', borderRadius: '50',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    Signing in...
                  </>
                ) : (
                  <>
                    <i className="fas fa-right-to-bracket" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
              <div style={{ flex: 1, height: '1px', background: panel.border }} />
              <span style={{ fontSize: '11px', color: panel.textMuted, fontWeight: '500' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: panel.border }} />
            </div>

            {/* Register link */}
            <Link
              href="/register"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px',
                background: 'transparent',
                border: `1px solid ${panel.border}`,
                borderRadius: '10px',
                color: panel.textSec,
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = panel.border; e.currentTarget.style.color = panel.textSec }}
            >
              <i className="fas fa-user-plus" style={{ fontSize: '12px' }} />
              Request Account Access
            </Link>
          </div>

          {/* Below card note */}
          
        </div>
      </div>

      {/* Mobile: hide left panel below 768px */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .login-brand-panel { display: none !important; }
        }
      `}</style>
    </div>
  )
}
