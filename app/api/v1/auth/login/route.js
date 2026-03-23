import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import crypto from 'crypto'

// Ensure token tables exist on first call
async function ensureTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS api_tokens (
      id           CHAR(36)     NOT NULL DEFAULT (UUID()) PRIMARY KEY,
      token        VARCHAR(64)  NOT NULL UNIQUE,
      user_id      CHAR(36)     NOT NULL,
      user_name    VARCHAR(100) NOT NULL,
      description  VARCHAR(255),
      expires_at   DATETIME,
      last_used_at DATETIME,
      is_active    TINYINT(1) NOT NULL DEFAULT 1,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_token  (token),
      INDEX idx_user   (user_id),
      INDEX idx_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)
  await query(`
    CREATE TABLE IF NOT EXISTS api_token_usage (
      id          CHAR(36)     NOT NULL DEFAULT (UUID()) PRIMARY KEY,
      token_id    CHAR(36)     NOT NULL,
      endpoint    VARCHAR(255),
      params      TEXT,
      ip_address  VARCHAR(45),
      status_code SMALLINT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_token_id (token_id),
      INDEX idx_created  (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)
}

export async function POST(req) {
  await ensureTables()

  try {
    const body = await req.json()
    const { username, password } = body || {}

    if (!username || !password) {
      return NextResponse.json(
        { error: 'username and password are required in request body' },
        { status: 400 }
      )
    }

    const rows = await query(
      'SELECT id, username, password, role, is_active FROM users WHERE username = ? LIMIT 1',
      [username]
    )

    if (!rows.length || !rows[0].is_active) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const user = rows[0]

    // SHA-256 check (existing hash method)
    const sha256 = crypto.createHash('sha256').update(password).digest('hex')
    let valid = sha256 === user.password

    // bcrypt fallback
    if (!valid) {
      try {
        const bcrypt = await import('bcryptjs')
        valid = await bcrypt.default.compare(password, user.password)
      } catch {}
    }

    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token     = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await query(
      'INSERT INTO api_tokens (token, user_id, user_name, expires_at) VALUES (?, ?, ?, ?)',
      [token, user.id, user.username, expiresAt]
    )

    return NextResponse.json({
      success: true,
      token,
      token_type: 'Bearer',
      expires_at: expiresAt.toISOString(),
      user: { username: user.username, role: user.role },
      usage: 'Add header:  Authorization: Bearer <token>',
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
