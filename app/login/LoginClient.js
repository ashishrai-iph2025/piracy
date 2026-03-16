'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionExpired = searchParams.get('session_expired')

  // Login page is always light mode — fixed, regardless of user theme preference
  // No cleanup needed: ThemeProvider handles restoring the correct per-user mode on the next page
  useEffect(() => {
    document.documentElement.setAttribute('data-mode', 'light')
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username || !password) {
      setError('Username and password are required')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
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

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            background: 'none',
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, var(--accent), var(--purple))',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              color: '#fff',
              fontWeight: '800',
            }}>
              API
            </div>
          </div>
          <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }} />
          
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#FC934C' }}>
            Monitoring System
          </h2>
        </div>

        {sessionExpired && (
          <div style={{
            background: 'rgba(239,68,68,.1)',
            border: '1px solid rgba(239,68,68,.3)',
            borderRadius: '8px',
            padding: '14px',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            <i className="fas fa-clock" style={{ marginRight: '8px' }} />
            <div style={{ fontSize: '13px', fontWeight: '500', marginTop: '4px' }}>
              Session expired due to inactivity (30 minutes).
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Please login again to continue.
            </div>
          </div>
        )}

        {error === '__pending__' && (
          <div style={{
            background: 'rgba(234,179,8,.1)', border: '1px solid rgba(234,179,8,.35)',
            borderRadius: '10px', padding: '16px', marginBottom: '20px', textAlign: 'center',
          }}>
            <i className="fas fa-hourglass-half" style={{ fontSize: '22px', color: '#ca8a04', marginBottom: '8px', display: 'block' }} />
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#92400e' }}>Account Pending Approval</div>
            <div style={{ fontSize: '12px', color: '#78350f', marginTop: '6px', lineHeight: 1.5 }}>
              Your registration is awaiting admin approval.<br />You will receive your login credentials via email once approved.
            </div>
          </div>
        )}
        {error && error !== '__pending__' && (
          <div style={{
            background: 'rgba(239,68,68,.1)',
            border: '1px solid rgba(239,68,68,.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '13px',
            color: 'var(--red)',
          }}>
            <i className="fas fa-exclamation-circle" style={{ marginRight: '6px' }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">Username or Email</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter username or email"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              required
              suppressHydrationWarning
            />
          </div>

          <div style={{ marginBottom: '20px', position: 'relative' }} suppressHydrationWarning>
            <label className="form-label">Password</label>
            <input
              type={showPass ? 'text' : 'password'}
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ paddingRight: '40px' }}
              suppressHydrationWarning
            />
            <button
              type="button"
              onClick={() => setShowPass(s => !s)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '32px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              <i className={`fas fa-eye${showPass ? '-slash' : ''}`} />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              border: 'none',
              color: '#fff',
              padding: '14px 32px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                Signing in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link href="/register" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>
            <i className="fas fa-user-plus" style={{ marginRight: '6px' }} />
            Create new account
          </Link>
        </div>
      </div>
    </div>
  )
}
