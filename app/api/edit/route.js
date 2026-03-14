import { NextResponse } from 'next/server'
import { getSession, getUserPermissions, hasPermission, logActivity } from '@/lib/session'
import { query } from '@/lib/db'
import { SHEET_CONFIG } from '@/lib/sheetConfig'
import { istToUtc, utcToIstForInput, utcToIstDateForInput } from '@/lib/timezone'

function sessionErr() { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
function permErr() { return NextResponse.json({ error: 'Permission denied' }, { status: 403 }) }

// GET: fetch single row for editing
export async function GET(req) {
  const session = getSession()
  if (!session) return sessionErr()

  const { searchParams } = new URL(req.url)
  const sheetName = searchParams.get('sheet')
  const id = parseInt(searchParams.get('id'))

  if (!sheetName || !id) return NextResponse.json({ error: 'Missing sheet or id' }, { status: 400 })
  const cfg = SHEET_CONFIG[sheetName]
  if (!cfg) return NextResponse.json({ error: 'Unknown sheet' }, { status: 400 })

  const perms = await getUserPermissions(session.userId, session.role)
  if (!hasPermission(perms, sheetName, 'can_edit')) return permErr()

  try {
    const rows = await query(`SELECT * FROM \`${cfg.table}\` WHERE id = ?`, [id])
    if (!rows.length) return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    // Convert UTC datetime values to IST for the edit modal display
    const row = { ...rows[0] }
    for (const col of cfg.columns) {
      if (col.key === 'id' || !row[col.key]) continue
      if (col.type === 'datetime') row[col.key] = utcToIstForInput(row[col.key])
      else if (col.type === 'date') row[col.key] = utcToIstDateForInput(row[col.key])
    }
    return NextResponse.json({ row, columns: cfg.columns })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PUT: update single row
export async function PUT(req) {
  const session = getSession()
  if (!session) return sessionErr()

  try {
    const body = await req.json()
    const { sheet: sheetName, id, data } = body

    if (!sheetName || !id || !data) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const cfg = SHEET_CONFIG[sheetName]
    if (!cfg) return NextResponse.json({ error: 'Unknown sheet' }, { status: 400 })

    const perms = await getUserPermissions(session.userId, session.role)
    if (!hasPermission(perms, sheetName, 'can_edit')) return permErr()

    // Sanitize: only allow columns defined in config (exclude id, hashes)
    const allowedKeys = cfg.columns.map(c => c.key).filter(k => k !== 'id')
    const filteredData = {}
    for (const colDef of cfg.columns) {
      const k = colDef.key
      if (k === 'id' || !(k in data)) continue
      const raw = data[k]
      if (raw === '' || raw === null || raw === undefined) {
        filteredData[k] = null
      } else if (colDef.type === 'datetime') {
        // User edits in IST — convert to UTC for DB storage
        filteredData[k] = istToUtc(raw)
      } else if (colDef.type === 'date') {
        filteredData[k] = String(raw).slice(0, 10)
      } else {
        filteredData[k] = raw
      }
    }

    if (!Object.keys(filteredData).length) return NextResponse.json({ error: 'No data to update' }, { status: 400 })

    // Check for unique URL conflict if URL field is being updated
    const urlCol = cfg.uniqueUrlCol
    if (urlCol && filteredData[urlCol]) {
      const existing = await query(
        `SELECT id FROM \`${cfg.table}\` WHERE \`${urlCol}\` = ? AND id != ?`,
        [filteredData[urlCol], id]
      )
      if (existing.length) {
        return NextResponse.json({
          error: `Duplicate ${urlCol}: this URL already exists in record #${existing[0].id}`
        }, { status: 409 })
      }
    }

    const setClauses = Object.keys(filteredData).map(k => `\`${k}\` = ?`).join(', ')
    const vals = [...Object.values(filteredData), id]
    await query(`UPDATE \`${cfg.table}\` SET ${setClauses}, updated_at = NOW() WHERE id = ?`, vals)

    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    await logActivity(session.userId, session.userName, 'edit', {
      sheetName, recordId: id, ipAddress: ip,
      details: { updatedFields: Object.keys(filteredData) }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Edit error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
