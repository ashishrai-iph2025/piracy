import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import crypto from 'crypto'

export async function POST(req) {
  try {
    const { username, password } = await req.json()
    if (!username || !password)
      return NextResponse.json({ success: false, message: 'Username and password required' }, { status: 400 })

    let users
    try {
      users = await query(
        'SELECT id, first_name, password, role, is_active, status FROM users WHERE username = ? OR email = ?',
        [username, username]
      )
    } catch {
      // status column may not exist yet — fall back without it
      users = await query(
        'SELECT id, first_name, password, role, is_active FROM users WHERE username = ? OR email = ?',
        [username, username]
      )
    }
    if (!users.length) return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })

    const user = users[0]
    if (user.status === 'pending') return NextResponse.json({ success: false, message: 'pending_approval' }, { status: 401 })
    if (user.status === 'rejected') return NextResponse.json({ success: false, message: 'Account registration was rejected. Please contact an administrator.' }, { status: 401 })
    // When status column doesn't exist yet, is_active=0 means pending/disabled — treat as pending_approval
    if (!user.is_active) return NextResponse.json({ success: false, message: user.status === undefined ? 'pending_approval' : 'Account is disabled. Please contact an administrator.' }, { status: 401 })

    const hash = crypto.createHash('sha256').update(password).digest('hex')
    if (hash !== user.password) return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })

    await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id])

    const session = { userId: user.id, userName: user.first_name, role: user.role, loginTime: Date.now(), lastActivity: Date.now() }
    const sessionValue = Buffer.from(JSON.stringify(session)).toString('base64')

    const response = NextResponse.json({ success: true, userName: user.first_name, role: user.role })
    response.cookies.set('piracy_session', sessionValue, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 30, path: '/' })
    return response
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
