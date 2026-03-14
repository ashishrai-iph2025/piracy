import { NextResponse } from 'next/server'
import { getSession, getUserPermissions, hasPermission, logActivity } from '@/lib/session'
import { query } from '@/lib/db'
import { SHEET_CONFIG } from '@/lib/sheetConfig'

function sessionErr() { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
function permErr() { return NextResponse.json({ error: 'Permission denied' }, { status: 403 }) }

// GET: search records by URL, name, or ID across a given sheet
export async function GET(req) {
  const session = getSession()
  if (!session) return sessionErr()

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const sheetName = searchParams.get('sheet') || ''

  if (!search || !sheetName) return NextResponse.json({ records: [] })

  const cfg = SHEET_CONFIG[sheetName]
  if (!cfg) return NextResponse.json({ error: 'Unknown sheet' }, { status: 400 })

  const perms = await getUserPermissions(session.userId, session.role)
  if (!hasPermission(perms, sheetName, 'can_edit') && !hasPermission(perms, sheetName, 'can_bulk_update')) return permErr()

  const urlCol = cfg.uniqueUrlCol
  const nameCols = cfg.columns
    .filter(c => ['platform_name', 'content_owner', 'copyright_owner', 'seller_name', 'iptv_application_name', 'channel_page_profile_name'].includes(c.key))
    .map(c => c.key)
    .slice(0, 2)

  const idVal = parseInt(search)
  const likeParam = `%${search}%`

  let whereClause = `id = ?`
  const params = [isNaN(idVal) ? 0 : idVal]

  if (urlCol) {
    whereClause += ` OR \`${urlCol}\` LIKE ?`
    params.push(likeParam)
  }
  for (const col of nameCols) {
    whereClause += ` OR \`${col}\` LIKE ?`
    params.push(likeParam)
  }

  try {
    const records = await query(
      `SELECT * FROM \`${cfg.table}\` WHERE ${whereClause} LIMIT 30`,
      params
    )
    return NextResponse.json({ records, table: cfg.table })
  } catch (err) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// POST: update removal_status for a single record
export async function POST(req) {
  const session = getSession()
  if (!session) return sessionErr()

  try {
    const body = await req.json()
    const { id, sheet: sheetName, removal_status, removal_timestamp } = body

    if (!id || !sheetName || !removal_status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const cfg = SHEET_CONFIG[sheetName]
    if (!cfg) return NextResponse.json({ error: 'Unknown sheet' }, { status: 400 })

    const perms = await getUserPermissions(session.userId, session.role)
    if (!hasPermission(perms, sheetName, 'can_edit')) return permErr()

    const existing = await query(
      `SELECT id, removal_status, removal_timestamp FROM \`${cfg.table}\` WHERE id = ?`, [id]
    )
    if (!existing.length) return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    const old = existing[0]

    await query(
      `UPDATE \`${cfg.table}\` SET removal_status = ?, removal_timestamp = ?, updated_at = NOW() WHERE id = ?`,
      [removal_status, removal_timestamp || null, id]
    )

    // Log history (table may not exist — silently ignore)
    try {
      await query(
        `INSERT INTO removal_status_history (record_id, sheet_name, table_name, old_status, new_status, old_removal_time, new_removal_time, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, sheetName, cfg.table, old.removal_status, removal_status,
         old.removal_timestamp, removal_timestamp || null, session.userId]
      )
    } catch {}

    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    await logActivity(session.userId, session.userName, 'status_update', {
      sheetName, recordId: id, ipAddress: ip,
      details: { from: old.removal_status, to: removal_status }
    })

    return NextResponse.json({ success: true, message: 'Status updated successfully' })
  } catch (err) {
    console.error('Status update error:', err)
    return NextResponse.json({ error: 'Update failed: ' + err.message }, { status: 500 })
  }
}
