import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'
import crypto from 'crypto'

function requireAdmin(session) {
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'superadmin' && session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }
  return null
}

export async function GET(req) {
  const session = getSession()
  const err = requireAdmin(session)
  if (err) return err

  try {
    const users = await query(
      `SELECT id, first_name, last_name, username, email, role, is_active, last_login, created_at FROM users ORDER BY created_at DESC`
    )
    return NextResponse.json({ users })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req) {
  const session = getSession()
  const err = requireAdmin(session)
  if (err) return err

  try {
    const body = await req.json()
    const { first_name, last_name, email, username, password, role, is_active } = body

    if (!first_name || !email || !username || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existing = await query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username])
    if (existing.length) return NextResponse.json({ error: 'Email or username already exists' }, { status: 409 })

    const hash = crypto.createHash('sha256').update(password).digest('hex')
    await query(
      `INSERT INTO users (first_name, last_name, email, username, password, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name || '', email, username, hash, role || 'user', is_active !== false ? 1 : 0]
    )
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req) {
  const session = getSession()
  const err = requireAdmin(session)
  if (err) return err

  try {
    const body = await req.json()
    const { id, first_name, last_name, email, username, password, role, is_active } = body
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    // Admins can change roles but cannot assign superadmin — only superadmin can do that
    if (role !== undefined) {
      if (session.role !== 'superadmin' && role === 'superadmin') {
        return NextResponse.json({ error: 'Only superadmin can assign the superadmin role' }, { status: 403 })
      }
    }

    // Admins cannot change password of a superadmin — only superadmin can do that
    if (password !== undefined && session.role !== 'superadmin') {
      const rows = await query('SELECT role FROM users WHERE id = ?', [id])
      if (!rows.length) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      if (rows[0].role === 'superadmin') {
        return NextResponse.json({ error: 'Only superadmin can change a superadmin\'s password' }, { status: 403 })
      }
    }

    const updates = {}
    if (first_name !== undefined) updates.first_name = first_name
    if (last_name  !== undefined) updates.last_name  = last_name
    if (email      !== undefined) updates.email      = email
    if (username   !== undefined) updates.username   = username
    if (role       !== undefined) updates.role       = role
    if (is_active  !== undefined) updates.is_active  = is_active ? 1 : 0
    if (password) updates.password = crypto.createHash('sha256').update(password).digest('hex')

    const setClauses = Object.keys(updates).map(k => `\`${k}\` = ?`).join(', ')
    await query(`UPDATE users SET ${setClauses} WHERE id = ?`, [...Object.values(updates), id])

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
