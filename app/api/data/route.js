import { NextResponse } from 'next/server'
import { getSession, getUserPermissions, hasPermission } from '@/lib/session'
import { query } from '@/lib/db'
import { SHEET_CONFIG } from '@/lib/sheetConfig'

function sessionErr() { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
function permErr()    { return NextResponse.json({ error: 'Permission denied' }, { status: 403 }) }

export async function GET(req) {
  const session = getSession()
  if (!session) return sessionErr()

  const { searchParams } = new URL(req.url)
  const sheetName = searchParams.get('sheet') || 'Unauthorized Search Result'
  const page      = Math.max(1, parseInt(searchParams.get('page')  || '1'))
  const limit     = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '25')))
  const search    = searchParams.get('search') || ''
  const sortCol   = searchParams.get('sort_col') || 'created_at'
  const sortDir   = searchParams.get('sort_dir') === 'asc' ? 'ASC' : 'DESC'
  const offset    = (page - 1) * limit

  const cfg = SHEET_CONFIG[sheetName]
  if (!cfg) return NextResponse.json({ error: 'Unknown sheet' }, { status: 400 })

  const perms = await getUserPermissions(session.userId, session.role)
  if (!hasPermission(perms, sheetName, 'can_view')) return permErr()

  // Validate sortCol against actual column keys to prevent SQL injection
  // Exclude id (UUID - not meaningful for sorting) and hash columns
  const validKeys   = cfg.columns.map(c => c.key).filter(k => k !== 'id')
  const safeSortCol = validKeys.includes(sortCol) ? sortCol : 'created_at'

  // Global search across text columns
  const searchCols = cfg.columns
    .filter(c => c.key !== 'id' && c.type !== 'number' && c.type !== 'datetime' && c.type !== 'date')
    .slice(0, 8)
    .map(c => c.key)

  const conditions = []
  const params     = []

  if (search && searchCols.length) {
    conditions.push(`(${searchCols.map(col => `\`${col}\` LIKE ?`).join(' OR ')})`)
    searchCols.forEach(() => params.push(`%${search}%`))
  }

  // Per-column filters (f_<key>=value)
  for (const col of cfg.columns) {
    const val = searchParams.get(`f_${col.key}`)
    if (val && val.trim()) {
      conditions.push(`\`${col.key}\` LIKE ?`)
      params.push(`%${val.trim()}%`)
    }
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const table       = cfg.table

  try {
    const countResult = await query(
      `SELECT COUNT(*) as total FROM \`${table}\` ${whereClause}`,
      params
    )
    const total = countResult[0].total

    const rows = await query(
      `SELECT * FROM \`${table}\` ${whereClause} ORDER BY \`${safeSortCol}\` ${sortDir} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    const statsResult = await query(
      `SELECT COUNT(*) as total,
        SUM(removal_status = 'Removed' OR removal_status = 'Down' OR removal_status = 'Suspended') as removed
       FROM \`${table}\``
    )
    const stats = { total: statsResult[0].total || 0, removed: statsResult[0].removed || 0 }

    return NextResponse.json({
      data: rows,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      stats,
      permissions: {
        can_upload:      hasPermission(perms, sheetName, 'can_upload'),
        can_edit:        hasPermission(perms, sheetName, 'can_edit'),
        can_delete:      hasPermission(perms, sheetName, 'can_delete'),
        can_bulk_update: hasPermission(perms, sheetName, 'can_bulk_update'),
        can_export:      hasPermission(perms, sheetName, 'can_export'),
      }
    })
  } catch (err) {
    console.error('Data GET error:', err)
    return NextResponse.json({ error: 'Database error: ' + err.message }, { status: 500 })
  }
}

export async function DELETE(req) {
  const session = getSession()
  if (!session) return sessionErr()

  const { searchParams } = new URL(req.url)
  const sheetName = searchParams.get('sheet')
  const id        = searchParams.get('id')

  if (!sheetName || !id) return NextResponse.json({ error: 'Missing sheet or id' }, { status: 400 })

  const cfg = SHEET_CONFIG[sheetName]
  if (!cfg) return NextResponse.json({ error: 'Unknown sheet' }, { status: 400 })

  const perms = await getUserPermissions(session.userId, session.role)
  if (!hasPermission(perms, sheetName, 'can_delete')) return permErr()

  try {
    await query(`DELETE FROM \`${cfg.table}\` WHERE id = ?`, [id])
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
