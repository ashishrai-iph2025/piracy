'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', username: '', password: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    const { first_name, last_name, email, username, password } = form
    if (!first_name || !last_name || !email || !username || !password) {
      setError('All fields are required')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('pending')
      } else {
        setError(data.message || 'Registration failed')
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
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, var(--green), #16a34a)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '22px', color: '#fff',
          }}>
            <i className="fas fa-user-plus" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>Create Account</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Join API Monitoring System
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
            borderRadius: '8px', padding: '12px', marginBottom: '20px',
            fontSize: '13px', color: 'var(--red)',
          }}>
            <i className="fas fa-exclamation-circle" style={{ marginRight: '6px' }} />{error}
          </div>
        )}

        {success === 'pending' && (
          <div style={{
            background: 'rgba(234,179,8,.08)', border: '1px solid rgba(234,179,8,.4)',
            borderRadius: '12px', padding: '24px 20px', marginBottom: '20px', textAlign: 'center',
          }}>
            <i className="fas fa-paper-plane" style={{ fontSize: '32px', color: '#ca8a04', marginBottom: '12px', display: 'block' }} />
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#92400e', marginBottom: '8px' }}>
              Registration Submitted!
            </div>
            <div style={{ fontSize: '13px', color: '#78350f', lineHeight: 1.6 }}>
              Your account is <strong>pending admin approval</strong>.<br />
              Once approved, your login credentials will be sent to<br />
              <strong>{form.email}</strong>
            </div>
            <div style={{ marginTop: '16px', fontSize: '12px', color: '#a16207' }}>
              <i className="fas fa-clock" style={{ marginRight: '5px' }} />
              You will be notified via email — no further action needed.
            </div>
          </div>
        )}

        {success === 'pending' ? null : <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label className="form-label">First Name</label>
              <input type="text" className="form-input" placeholder="John" value={form.first_name} onChange={set('first_name')} required />
            </div>
            <div>
              <label className="form-label">Last Name</label>
              <input type="text" className="form-input" placeholder="Doe" value={form.last_name} onChange={set('last_name')} required />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="john@example.com" value={form.email} onChange={set('email')} required />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Username</label>
            <input type="text" className="form-input" placeholder="johndoe" value={form.username} onChange={set('username')} required />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, var(--green), #16a34a)',
              border: 'none', color: '#fff',
              padding: '14px 32px', borderRadius: '8px',
              fontWeight: '600', fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', width: '100%',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> Creating account...</>
            ) : (
              <><i className="fas fa-user-plus" /> Create Account</>
            )}
          </button>
        </form>}

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link href="/login" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>
            <i className="fas fa-sign-in-alt" style={{ marginRight: '6px' }} />
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
