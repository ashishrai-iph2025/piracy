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

// GET ?sheet=<name>&type=upload|update
// Returns saved column_keys array or null (meaning use default)
export async function GET(req) {
  const session = getSession()
  const err = requireAdmin(session)
  if (err) return err

  const { searchParams } = new URL(req.url)
  const sheetName    = searchParams.get('sheet')
  const templateType = searchParams.get('type') || 'upload'

  if (!sheetName || !SHEET_CONFIG[sheetName])
    return NextResponse.json({ error: 'Invalid sheet' }, { status: 400 })

  try {
    const rows = await query(
      'SELECT column_keys FROM template_column_config WHERE sheet_name = ? AND template_type = ?',
      [sheetName, templateType]
    )
    const columnKeys = rows.length ? JSON.parse(rows[0].column_keys) : null
    return NextResponse.json({ sheetName, templateType, columnKeys })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST { sheetName, templateType, columnKeys: [...] }
// Saves / updates saved column order for this sheet+type
export async function POST(req) {
  const session = getSession()
  const err = requireAdmin(session)
  if (err) return err

  try {
    const { sheetName, templateType, columnKeys } = await req.json()

    if (!sheetName || !SHEET_CONFIG[sheetName])
      return NextResponse.json({ error: 'Invalid sheet' }, { status: 400 })
    if (!['upload', 'update'].includes(templateType))
      return NextResponse.json({ error: 'Invalid template type' }, { status: 400 })
    if (!Array.isArray(columnKeys) || columnKeys.length === 0)
      return NextResponse.json({ error: 'columnKeys must be a non-empty array' }, { status: 400 })

    await query(
      `INSERT INTO template_column_config (sheet_name, template_type, column_keys, updated_by)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         column_keys = VALUES(column_keys),
         updated_by  = VALUES(updated_by),
         updated_at  = CURRENT_TIMESTAMP`,
      [sheetName, templateType, JSON.stringify(columnKeys), session.userId]
    )
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE { sheetName, templateType }
// Removes saved config — template reverts to default all-columns order
export async function DELETE(req) {
  const session = getSession()
  const err = requireAdmin(session)
  if (err) return err

  try {
    const { sheetName, templateType } = await req.json()
    await query(
      'DELETE FROM template_column_config WHERE sheet_name = ? AND template_type = ?',
      [sheetName, templateType]
    )
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
