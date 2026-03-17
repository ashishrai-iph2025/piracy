'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

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

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', username: '', password: ''
  })
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [isDark, setIsDark]   = useState(true)
  const router = useRouter()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

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
    const { first_name, last_name, email, username, password } = form
    if (!first_name || !last_name || !email || !username || !password) {
      setError('All fields are required'); return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters'); return
    }
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) setSuccess('pending')
      else setError(data.message || 'Registration failed')
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const brand  = '#112043'
  const accent = '#3b82f6'

  const panel = isDark ? {
    bg: '#0b1120', card: '#131d2e', border: '#1e2e45', input: '#0e1828',
    textPrim: '#e2eaf5', textSec: '#7a92b0', textMuted: '#4a6080',
  } : {
    bg: '#f0f4f8', card: '#ffffff', border: '#d0daea', input: '#f8fafc',
    textPrim: '#0f1829', textSec: '#4a6080', textMuted: '#7a92b0',
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: isDark ? '#0b1120' : '#e8eef6',
      fontFamily: 'Inter, DM Sans, Arial, sans-serif',
    }}>

      {/* ── Left brand panel ── */}
      <div style={{
        flex: '0 0 46%',
        background: `linear-gradient(155deg, ${brand} 0%, #1a3360 60%, #0e2050 100%)`,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        justifyContent: 'space-between', padding: '56px 60px',
        position: 'relative', overflow: 'hidden',
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
          <div style={{
            width: '80px', height: '80px',
            background: 'rgba(255,255,255,0.08)', borderRadius: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '32px', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}>
            <i className="fas fa-user-plus" style={{ fontSize: '32px', color: 'rgba(255,255,255,0.85)' }} />
          </div>

          <h1 style={{
            color: '#ffffff', fontSize: '32px', fontWeight: '800',
            lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.02em',
          }}>
            Request Account<br />Access
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.55)', fontSize: '15px',
            lineHeight: 1.7, maxWidth: '320px',
          }}>
            Submit your details and an admin will review and approve your access within 24 hours.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '40px' }}>
            {[
              { icon: 'fa-shield-halved', text: 'Role-based access control' },
              { icon: 'fa-envelope-circle-check', text: 'Credentials sent via email on approval' },
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

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
            © {new Date().getFullYear()} IP House. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '40px 24px',
        background: panel.bg, overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>

          <div style={{
            background: panel.card, border: `1px solid ${panel.border}`,
            borderRadius: '20px', padding: '44px 40px',
            boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.5)' : '0 24px 60px rgba(0,0,0,0.08)',
          }}>

            {/* Header */}
            {success !== 'pending' && (
              <div style={{ marginBottom: '28px' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: isDark ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.25)',
                  borderRadius: '20px', padding: '4px 12px', marginBottom: '20px',
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#22c55e', letterSpacing: '0.05em' }}>
                    NEW ACCOUNT
                  </span>
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: panel.textPrim, marginBottom: '6px', letterSpacing: '-0.02em' }}>
                  Create your account
                </h2>
                <p style={{ fontSize: '13px', color: panel.textSec }}>
                  Fill in your details to request access
                </p>
              </div>
            )}

            {/* Success state */}
            {success === 'pending' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '20px',
                  background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <i className="fas fa-paper-plane" style={{ fontSize: '28px', color: '#ca8a04' }} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: panel.textPrim, marginBottom: '10px' }}>
                  Registration Submitted!
                </h3>
                <p style={{ fontSize: '13px', color: panel.textSec, lineHeight: 1.7, marginBottom: '8px' }}>
                  Your account is <strong style={{ color: panel.textPrim }}>pending admin approval</strong>.<br />
                  Once approved, your login credentials will be sent to<br />
                  <strong style={{ color: accent }}>{form.email}</strong>
                </p>
                <div style={{
                  marginTop: '16px', fontSize: '12px', color: panel.textMuted,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}>
                  <i className="fas fa-clock" />
                  No further action needed — we'll email you.
                </div>
                <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, height: '1px', background: panel.border }} />
                  <span style={{ fontSize: '11px', color: panel.textMuted }}>OR</span>
                  <div style={{ flex: 1, height: '1px', background: panel.border }} />
                </div>
                <Link href="/login" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  marginTop: '16px', padding: '12px',
                  background: `linear-gradient(135deg, ${accent}, #1d4ed8)`,
                  borderRadius: '10px', color: '#fff', textDecoration: 'none',
                  fontSize: '13px', fontWeight: '700',
                  boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
                }}>
                  <i className="fas fa-right-to-bracket" style={{ fontSize: '12px' }} />
                  Go to Sign In
                </Link>
              </div>
            )}

            {/* Error */}
            {error && (
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
            {success !== 'pending' && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* First + Last name row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { label: 'FIRST NAME', key: 'first_name', placeholder: 'John',  icon: 'fa-user' },
                    { label: 'LAST NAME',  key: 'last_name',  placeholder: 'Doe',   icon: 'fa-user' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: panel.textSec, marginBottom: '7px', letterSpacing: '0.03em' }}>
                        {f.label}
                      </label>
                      <input
                        type="text" placeholder={f.placeholder} value={form[f.key]}
                        onChange={set(f.key)} required
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          background: panel.input, border: `1px solid ${panel.border}`,
                          borderRadius: '10px', padding: '11px 12px',
                          fontSize: '13px', color: panel.textPrim, outline: 'none',
                          transition: 'border-color 0.2s, box-shadow 0.2s', fontFamily: 'inherit',
                        }}
                        onFocus={e => { e.target.style.borderColor = accent; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)' }}
                        onBlur={e  => { e.target.style.borderColor = panel.border; e.target.style.boxShadow = 'none' }}
                      />
                    </div>
                  ))}
                </div>

                {/* Email, Username, Password */}
                {[
                  { label: 'EMAIL',    key: 'email',    type: 'email',    placeholder: 'john@example.com', icon: 'fa-envelope' },
                  { label: 'USERNAME', key: 'username', type: 'text',     placeholder: 'johndoe',          icon: 'fa-at' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: panel.textSec, marginBottom: '7px', letterSpacing: '0.03em' }}>
                      {f.label}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <i className={`fas ${f.icon}`} style={{
                        position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                        color: panel.textMuted, fontSize: '13px', pointerEvents: 'none',
                      }} />
                      <input
                        type={f.type} placeholder={f.placeholder} value={form[f.key]}
                        onChange={set(f.key)} required
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          background: panel.input, border: `1px solid ${panel.border}`,
                          borderRadius: '10px', padding: '12px 14px 12px 38px',
                          fontSize: '14px', color: panel.textPrim, outline: 'none',
                          transition: 'border-color 0.2s, box-shadow 0.2s', fontFamily: 'inherit',
                        }}
                        onFocus={e => { e.target.style.borderColor = accent; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)' }}
                        onBlur={e  => { e.target.style.borderColor = panel.border; e.target.style.boxShadow = 'none' }}
                      />
                    </div>
                  </div>
                ))}

                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: panel.textSec, marginBottom: '7px', letterSpacing: '0.03em' }}>
                    PASSWORD
                  </label>
                  <div style={{ position: 'relative' }}>
                    <i className="fas fa-lock" style={{
                      position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                      color: panel.textMuted, fontSize: '13px', pointerEvents: 'none',
                    }} />
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Min. 6 characters" value={form.password}
                      onChange={set('password')} required
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: panel.input, border: `1px solid ${panel.border}`,
                        borderRadius: '10px', padding: '12px 42px 12px 38px',
                        fontSize: '14px', color: panel.textPrim, outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s', fontFamily: 'inherit',
                      }}
                      onFocus={e => { e.target.style.borderColor = accent; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)' }}
                      onBlur={e  => { e.target.style.borderColor = panel.border; e.target.style.boxShadow = 'none' }}
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)} tabIndex={-1} style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: panel.textMuted, fontSize: '13px', padding: '4px',
                    }}>
                      <i className={`fas fa-eye${showPass ? '-slash' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit" disabled={loading}
                  style={{
                    marginTop: '4px',
                    background: loading ? 'rgba(34,197,94,0.5)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                    border: 'none', borderRadius: '10px', padding: '13px',
                    color: '#fff', fontSize: '14px', fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    width: '100%', transition: 'opacity 0.2s, transform 0.1s',
                    letterSpacing: '0.02em',
                    boxShadow: loading ? 'none' : '0 4px 16px rgba(34,197,94,0.35)',
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: '15px', height: '15px', border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff', borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite',
                      }} />
                      Creating account...
                    </>
                  ) : (
                    <><i className="fas fa-user-plus" />Create Account</>
                  )}
                </button>
              </form>
            )}

            {/* Divider + Sign in link */}
            {success !== 'pending' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
                  <div style={{ flex: 1, height: '1px', background: panel.border }} />
                  <span style={{ fontSize: '11px', color: panel.textMuted, fontWeight: '500' }}>OR</span>
                  <div style={{ flex: 1, height: '1px', background: panel.border }} />
                </div>
                <Link href="/login" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '12px', background: 'transparent', border: `1px solid ${panel.border}`,
                  borderRadius: '10px', color: panel.textSec, textDecoration: 'none',
                  fontSize: '13px', fontWeight: '600', transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = panel.border; e.currentTarget.style.color = panel.textSec }}
                >
                  <i className="fas fa-right-to-bracket" style={{ fontSize: '12px' }} />
                  Already have an account? Sign In
                </Link>
              </>
            )}
          </div>

          
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .login-brand-panel { display: none !important; } }
      `}</style>
    </div>
  )
}
