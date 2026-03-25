import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'
import { SHEET_CONFIG } from '@/lib/sheetConfig'

function requireAdmin(session) {
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'superadmin' && session.role !== 'admin')
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  return null
}

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS custom_columns (
      id           CHAR(36)     NOT NULL DEFAULT (UUID()) PRIMARY KEY,
      sheet_name   VARCHAR(150) NOT NULL,
      column_key   VARCHAR(100) NOT NULL,
      column_label VARCHAR(255) NOT NULL,
      column_type  VARCHAR(50)  NOT NULL DEFAULT 'VARCHAR(512)',
      sort_order   INT          DEFAULT 999,
      is_active    TINYINT(1)   NOT NULL DEFAULT 1,
      created_by   CHAR(36),
      created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_sheet_col (sheet_name, column_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)
}

// GET /api/admin/custom-columns?sheet=<sheetName>
export async function GET(req) {
  const session = getSession()
  const err = requireAdmin(session)
  if (err) return err

  await ensureTable()

  const { searchParams } = new URL(req.url)
  const sheetName = searchParams.get('sheet')
  if (!sheetName || !SHEET_CONFIG[sheetName])
    return NextResponse.json({ error: 'Invalid sheet' }, { status: 400 })

  try {
    const columns = await query(
      'SELECT * FROM custom_columns WHERE sheet_name = ? AND is_active = 1 ORDER BY sort_order, created_at',
      [sheetName]
    )
    return NextResponse.json({ columns })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST — add a new custom column and ALTER TABLE if column doesn't exist
// Body: { sheet_name, key, label, type }
export async function POST(req) {
  const session = getSession()
  const err = requireAdmin(session)
  if (err) return err

  await ensureTable()

  try {
    const { sheet_name, key, label, type } = await req.json()

    if (!sheet_name || !SHEET_CONFIG[sheet_name])
      return NextResponse.json({ error: 'Invalid sheet' }, { status: 400 })
    if (!key || !/^[a-z][a-z0-9_]*$/.test(key))
      return NextResponse.json({ error: 'Column key must be lowercase letters, numbers, underscores, starting with a letter' }, { status: 400 })
    if (!label)
      return NextResponse.json({ error: 'Column label is required' }, { status: 400 })

    const allowedTypes = ['VARCHAR(512)', 'TEXT', 'INT', 'BIGINT', 'DECIMAL(12,2)', 'DATE', 'DATETIME']
    const colType = allowedTypes.includes(type) ? type : 'VARCHAR(512)'

    const tableName = SHEET_CONFIG[sheet_name].table

    // Check if column already exists in DB
    const existing = await query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [tableName, key]
    )

    let dbStatus = 'already_exists'
    if (!existing.length) {
      // Add column to DB table
      await query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${key}\` ${colType} NULL`)
      dbStatus = 'created'
    }

    // Register in custom_columns table
    await query(
      `INSERT INTO custom_columns (sheet_name, column_key, column_label, column_type, created_by)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         column_label = VALUES(column_label),
         column_type  = VALUES(column_type),
         is_active    = 1`,
      [sheet_name, key, label, colType, session.userId]
    )

    return NextResponse.json({ success: true, dbStatus })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/admin/custom-columns?id=<id>
export async function DELETE(req) {
  const session = getSession()
  const err = requireAdmin(session)
  if (err) return err

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  try {
    await query('UPDATE custom_columns SET is_active = 0 WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
