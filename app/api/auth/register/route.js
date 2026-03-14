import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import crypto from 'crypto'

export async function POST(req) {
  try {
    const { first_name, last_name, email, username, password } = await req.json()

    if (!first_name || !last_name || !email || !username || !password) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, message: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Check if exists
    const existing = await query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    )

    if (existing.length) {
      return NextResponse.json({ success: false, message: 'Email or username already exists' }, { status: 409 })
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
    const passwordExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 19).replace('T', ' ')

    try {
      await query(
        'INSERT INTO users (first_name, last_name, email, username, password, password_expires_at, status, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [first_name, last_name, email, username, hashedPassword, passwordExpires, 'pending', 0]
      )
    } catch {
      // status column may not exist yet — insert with is_active=0 so user cannot login until approved
      await query(
        'INSERT INTO users (first_name, last_name, email, username, password, password_expires_at, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [first_name, last_name, email, username, hashedPassword, passwordExpires, 0]
      )
    }

    return NextResponse.json({ success: true, message: 'pending' })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
