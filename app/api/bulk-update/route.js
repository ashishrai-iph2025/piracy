import { NextResponse } from 'next/server'
import { getSession, getUserPermissions, hasPermission, logActivity } from '@/lib/session'
import { getPool, query } from '@/lib/db'
import { SHEET_CONFIG, REMOVAL_STATUSES } from '@/lib/sheetConfig'
import * as XLSX from 'xlsx'

function sessionErr() { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
function permErr() { return NextResponse.json({ error: 'Permission denied' }, { status: 403 }) }

function parseDate(val) {
  if (!val) return null
  if (val instanceof Date) return val.toISOString().slice(0, 19).replace('T', ' ')
  if (typeof val === 'number') {
    const utcDays = Math.floor(val - 25569)
    const dt = new Date(utcDays * 86400 * 1000)
    return isNaN(dt) ? null : dt.toISOString().slice(0, 19).replace('T', ' ')
  }
  const s = String(val).trim()
  if (!s || s === '-' || s === '—') return null
  const d = new Date(s)
  return isNaN(d) ? null : d.toISOString().slice(0, 19).replace('T', ' ')
}

// POST: bulk status update for selected IDs
export async function POST(req) {
  const session = getSession()
  if (!session) return sessionErr()

  const contentType = req.headers.get('content-type') || ''

  // --- Excel bulk update by ID (multipart) ---
  if (contentType.includes('multipart/form-data')) {
    try {
      const formData = await req.formData()
      const file = formData.get('file')
      const sheetName = formData.get('sheet')

      if (!file || !sheetName) return NextResponse.json({ error: 'Missing file or sheet' }, { status: 400 })
      const cfg = SHEET_CONFIG[sheetName]
      if (!cfg) return NextResponse.json({ error: 'Unknown sheet' }, { status: 400 })

      const perms = await getUserPermissions(session.userId, session.role)
      if (!hasPermission(perms, sheetName, 'can_bulk_update')) return permErr()

      const arrayBuffer = await file.arrayBuffer()
      const wb = XLSX.read(Buffer.from(arrayBuffer), { type: 'buffer', cellDates: true })
      let ws = wb.Sheets[sheetName] || wb.Sheets[wb.SheetNames[0]]

      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      if (rows.length < 2) return NextResponse.json({ error: 'No data rows' }, { status: 400 })

      const headers = rows[0].map(h => String(h || '').trim().toLowerCase())
      const idIdx = headers.findIndex(h => h === 'id')
      if (idIdx === -1) return NextResponse.json({ error: 'Excel file must have an "id" column for bulk update' }, { status: 400 })

      const pool = getPool()
      const allowedCols = cfg.columns.map(c => c.key).filter(k => k !== 'id')

      // Map Excel headers to column keys
      const colKeyMap = {} // excel col index -> db col key
      const normHeaders = headers.map(h => h.replace(/[\s\-\/\\()&#]+/g, '_').replace(/[^a-z0-9_]/g, ''))
      for (const colDef of cfg.columns) {
        if (colDef.key === 'id') continue
        const normLabel = (colDef.label || '').toLowerCase().replace(/[\s\-\/\\()&#]+/g, '_').replace(/[^a-z0-9_]/g, '')
        const normExcel = (colDef.excel || '').toLowerCase().replace(/[\s\-\/\\()&#]+/g, '_').replace(/[^a-z0-9_]/g, '')
        const idx = normHeaders.findIndex(h => h === normLabel || h === normExcel || h === colDef.key)
        if (idx !== -1 && idx !== idIdx) colKeyMap[idx] = colDef.key
      }

      let updated = 0, skipped = 0, errors = 0
      const errorLog = []

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        const idVal = parseInt(row[idIdx])
        if (!idVal || isNaN(idVal)) { skipped++; continue }

        const updateData = {}
        for (const [idxStr, colKey] of Object.entries(colKeyMap)) {
          const idx = parseInt(idxStr)
          let val = row[idx]
          if (val === '' || val === null || val === undefined) continue
          const colDef = cfg.columns.find(c => c.key === colKey)
          if (colDef?.type === 'datetime' || colDef?.type === 'date') {
            val = parseDate(val)
          } else if (colDef?.type === 'number') {
            val = parseFloat(String(val).replace(/,/g, '')) || null
          } else {
            val = String(val).trim() || null
          }
          if (val !== null) updateData[colKey] = val
        }

        if (!Object.keys(updateData).length) { skipped++; continue }

        // Check URL uniqueness if URL col is being updated
        const urlCol = cfg.uniqueUrlCol
        if (urlCol && updateData[urlCol]) {
          const existing = await query(
            `SELECT id FROM \`${cfg.table}\` WHERE \`${urlCol}\` = ? AND id != ?`,
            [updateData[urlCol], idVal]
          )
          if (existing.length) {
            errors++
            if (errorLog.length < 5) errorLog.push(`Row ${i+1} (ID ${idVal}): duplicate URL`)
            continue
          }
        }

        try {
          const setClauses = Object.keys(updateData).map(k => `\`${k}\` = ?`).join(', ')
          const vals = [...Object.values(updateData), idVal]
          const [result] = await pool.execute(
            `UPDATE \`${cfg.table}\` SET ${setClauses}, updated_at = NOW() WHERE id = ?`, vals
          )
          if (result.affectedRows > 0) updated++
          else skipped++
        } catch (e) {
          errors++
          if (errorLog.length < 5) errorLog.push(`Row ${i+1}: ${e.message}`)
        }
      }

      const ip = req.headers.get('x-forwarded-for') || 'unknown'
      await logActivity(session.userId, session.userName, 'bulk_update_excel', {
        sheetName, fileName: file.name, recordsCount: updated, ipAddress: ip
      })

      return NextResponse.json({
        success: true, updated, skipped, errors,
        total: rows.length - 1,
        message: `Processed ${rows.length - 1} rows: ${updated} updated, ${skipped} skipped, ${errors} errors`,
        errorLog: errorLog.length ? errorLog : undefined,
      })
    } catch (err) {
      console.error('Bulk Excel update error:', err)
      return NextResponse.json({ error: 'Bulk update failed: ' + err.message }, { status: 500 })
    }
  }

  // --- JSON: bulk status update for selected IDs ---
  try {
    const body = await req.json()
    const { sheet: sheetName, ids, removal_status, removal_timestamp, fields } = body

    if (!sheetName || !ids?.length) return NextResponse.json({ error: 'Missing sheet or ids' }, { status: 400 })
    const cfg = SHEET_CONFIG[sheetName]
    if (!cfg) return NextResponse.json({ error: 'Unknown sheet' }, { status: 400 })

    const perms = await getUserPermissions(session.userId, session.role)
    if (!hasPermission(perms, sheetName, 'can_bulk_update')) return permErr()

    // Build update fields
    const updateData = {}
    if (removal_status) updateData.removal_status = removal_status
    if (removal_timestamp) updateData.removal_timestamp = removal_timestamp

    // Allow arbitrary field updates if provided by admin
    if (fields && typeof fields === 'object') {
      const allowedCols = cfg.columns.map(c => c.key).filter(k => k !== 'id')
      for (const [k, v] of Object.entries(fields)) {
        if (allowedCols.includes(k)) updateData[k] = v === '' ? null : v
      }
    }

    if (!Object.keys(updateData).length) return NextResponse.json({ error: 'No update data provided' }, { status: 400 })

    const pool = getPool()
    let updated = 0, errors = 0

    const setClauses = Object.keys(updateData).map(k => `\`${k}\` = ?`).join(', ')

    for (const id of ids) {
      try {
        const vals = [...Object.values(updateData), id]
        const [result] = await pool.execute(
          `UPDATE \`${cfg.table}\` SET ${setClauses}, updated_at = NOW() WHERE id = ?`, vals
        )
        if (result.affectedRows > 0) updated++
      } catch (e) {
        errors++
      }
    }

    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    await logActivity(session.userId, session.userName, 'bulk_status_update', {
      sheetName, recordsCount: updated, ipAddress: ip,
      details: { ids, updateData }
    })

    return NextResponse.json({
      success: true, updated, errors,
      message: `${updated} records updated${errors ? `, ${errors} errors` : ''}`
    })
  } catch (err) {
    console.error('Bulk update error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
