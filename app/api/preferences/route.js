import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id      INT UNSIGNED PRIMARY KEY,
      theme        VARCHAR(30)  DEFAULT 'blue',
      mode         VARCHAR(10)  DEFAULT 'dark',
      custom_color VARCHAR(7)   DEFAULT '#3b82f6',
      updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)
}

export async function GET() {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    await ensureTable()
    const rows = await query(
      'SELECT theme, mode, custom_color FROM user_preferences WHERE user_id = ?',
      [session.userId]
    )
    if (!rows.length) {
      return NextResponse.json({ theme: 'blue', mode: 'dark', customColor: '#3b82f6', userId: session.userId })
    }
    const r = rows[0]
    return NextResponse.json({ theme: r.theme, mode: r.mode, customColor: r.custom_color, userId: session.userId })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    await ensureTable()
    const { theme, mode, customColor } = await req.json()
    await query(`
      INSERT INTO user_preferences (user_id, theme, mode, custom_color)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE theme = VALUES(theme), mode = VALUES(mode), custom_color = VALUES(custom_color)
    `, [session.userId, theme || 'blue', mode || 'dark', customColor || '#3b82f6'])
    return NextResponse.json({ success: true, userId: session.userId })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
