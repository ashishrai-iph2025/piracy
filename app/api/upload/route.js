import { NextResponse } from 'next/server'
import { getSession, getUserPermissions, hasPermission, logActivity } from '@/lib/session'
import { getPool } from '@/lib/db'
import { SHEET_CONFIG } from '@/lib/sheetConfig'
import { istToUtc } from '@/lib/timezone'
import * as XLSX from 'xlsx'

function sessionErr() { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
function permErr() { return NextResponse.json({ error: 'Permission denied' }, { status: 403 }) }

// Normalize a header string for fuzzy matching
function normalizeH(h) {
  return String(h || '').toLowerCase().replace(/[\s\-\/\\()&#]+/g, '_').replace(/[^a-z0-9_]/g, '').replace(/_+/g, '_').trim()
}

function excelSerialToDate(serial) {
  if (!serial || typeof serial !== 'number') return null
  const utcDays = Math.floor(serial - 25569)
  const utcValue = utcDays * 86400
  const dt = new Date(utcValue * 1000)
  return dt.toISOString().slice(0, 19).replace('T', ' ')
}

function parseDate(val) {
  if (!val) return null
  if (typeof val === 'number') return excelSerialToDate(val)
  if (val instanceof Date) return val.toISOString().slice(0, 19).replace('T', ' ')
  const s = String(val).trim()
  if (!s || s === '—' || s === '-') return null
  const d = new Date(s)
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 19).replace('T', ' ')
  return null
}

function parseNumber(val) {
  if (val === null || val === undefined || val === '') return null
  const n = parseFloat(String(val).replace(/,/g, ''))
  return isNaN(n) ? null : n
}

export async function POST(req) {
  const session = getSession()
  if (!session) return sessionErr()

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const sheetName = formData.get('sheet')

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!sheetName) return NextResponse.json({ error: 'No sheet specified' }, { status: 400 })

    const cfg = SHEET_CONFIG[sheetName]
    if (!cfg) return NextResponse.json({ error: 'Unknown sheet: ' + sheetName }, { status: 400 })

    // Permission check
    const perms = await getUserPermissions(session.userId, session.role)
    if (!hasPermission(perms, sheetName, 'can_upload')) return permErr()

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse workbook
    const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true })

    // Find the sheet tab matching sheetName
    let ws = wb.Sheets[sheetName]
    if (!ws) {
      // Try partial match
      const match = wb.SheetNames.find(n => n.trim().toLowerCase() === sheetName.toLowerCase())
      if (match) ws = wb.Sheets[match]
    }
    if (!ws) {
      return NextResponse.json({
        error: `Sheet tab "${sheetName}" not found in file. Available tabs: ${wb.SheetNames.join(', ')}`
      }, { status: 400 })
    }

    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
    if (rows.length < 2) return NextResponse.json({ error: 'File has no data rows' }, { status: 400 })

    const headers = rows[0].map(h => String(h || '').trim())
    const normHeaders = headers.map(normalizeH)

    // Build column mapping: cfg.key -> column index in Excel
    const colMap = {}

    for (const colDef of cfg.columns) {
      if (colDef.key === 'id') continue
      if (colDef.ottIndex !== undefined) {
        // OTT duplicate headers - map by occurrence index
        const normTarget = normalizeH(colDef.excel)
        let found = 0
        for (let i = 0; i < normHeaders.length; i++) {
          if (normHeaders[i] === normTarget || normHeaders[i].includes(normTarget) || normTarget.includes(normHeaders[i])) {
            if (found === colDef.ottIndex) { colMap[colDef.key] = i; break }
            found++
          }
        }
        // Fallback: direct DB column name match (e.g. "OTT Platform 1" → ott_platform_1)
        if (colMap[colDef.key] === undefined) {
          const normKey = normalizeH(colDef.key)
          const di = normHeaders.findIndex(h => h === normKey)
          if (di !== -1) colMap[colDef.key] = di
        }
        continue
      }
      const normTarget = normalizeH(colDef.excel || colDef.label)
      // Exact match first
      let idx = normHeaders.indexOf(normTarget)
      if (idx === -1) {
        idx = normHeaders.findIndex(h => h === normTarget || h.includes(normTarget) || normTarget.includes(h))
      }
      // Final fallback: direct DB column key name (supports templates generated from SHOW COLUMNS)
      if (idx === -1) {
        const normKey = normalizeH(colDef.key)
        idx = normHeaders.findIndex(h => h === normKey)
      }
      if (idx !== -1) colMap[colDef.key] = idx
    }

    const pool = getPool()
    const table = cfg.table
    const uniqueUrlCol = cfg.uniqueUrlCol
    const batchId = require('crypto').randomBytes(8).toString('hex')

    let inserted = 0, updated = 0, skipped = 0, duplicates = 0, errors = 0
    const errorLog = []

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.every(cell => cell === '' || cell === null || cell === undefined)) continue

      const rowData = { uploaded_by: session.userId, upload_batch_id: batchId }

      for (const colDef of cfg.columns) {
        if (colDef.key === 'id') continue
        const idx = colMap[colDef.key]
        if (idx === undefined || idx === null) continue
        let val = row[idx]

        if (val === '' || val === null || val === undefined) {
          rowData[colDef.key] = null
          continue
        }

        if (colDef.type === 'datetime') {
          // User uploads in IST — convert to UTC for DB storage
          rowData[colDef.key] = istToUtc(parseDate(val))
        } else if (colDef.type === 'date') {
          // Date-only: no timezone conversion, just parse
          rowData[colDef.key] = parseDate(val) ? String(parseDate(val)).slice(0, 10) : null
        } else if (colDef.type === 'number') {
          rowData[colDef.key] = parseNumber(val)
        } else {
          rowData[colDef.key] = String(val).trim() || null
        }
      }

      // URL uniqueness: skip rows without the unique URL
      const urlVal = rowData[uniqueUrlCol]
      if (!urlVal) { skipped++; continue }

      const cols = Object.keys(rowData)
      const vals = cols.map(k => rowData[k])
      const placeholders = cols.map(() => '?').join(', ')
      // ON DUPLICATE KEY UPDATE — update all except the unique hash column
      const updateSet = cols
        .filter(c => c !== uniqueUrlCol)
        .map(c => `\`${c}\` = VALUES(\`${c}\`)`)
        .join(', ')

      try {
        const [result] = await pool.execute(
          `INSERT INTO \`${table}\` (${cols.map(c => `\`${c}\``).join(', ')}) VALUES (${placeholders})
           ON DUPLICATE KEY UPDATE ${updateSet || `\`${uniqueUrlCol}\` = \`${uniqueUrlCol}\``}`,
          vals
        )
        if (result.affectedRows === 1) inserted++
        else if (result.affectedRows === 2) updated++  // 2 = row existed and was updated
        else duplicates++
      } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') { duplicates++; continue }
        errors++
        if (errorLog.length < 5) errorLog.push(`Row ${i}: ${e.message}`)
      }
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    await logActivity(session.userId, session.userName, 'upload', {
      sheetName, fileName: file.name,
      recordsCount: inserted + updated,
      ipAddress: ip,
      details: { inserted, updated, skipped, duplicates, errors }
    })

    return NextResponse.json({
      success: true,
      inserted, updated, skipped, duplicates, errors,
      total: rows.length - 1,
      batchId,
      message: `Processed ${rows.length - 1} rows: ${inserted} new, ${updated} updated, ${duplicates} duplicate URLs skipped, ${skipped} skipped (no URL), ${errors} errors`,
      errorLog: errorLog.length ? errorLog : undefined,
    })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed: ' + err.message }, { status: 500 })
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";