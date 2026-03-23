import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { SHEET_CONFIG } from '@/lib/sheetConfig'
import { query } from '@/lib/db'
import * as XLSX from 'xlsx'

// System columns never included in templates
const SKIP_COLS = new Set(['uploaded_by', 'upload_batch_id', 'created_at', 'updated_at', 'sr_no'])
const SKIP_SUFFIX = ['_hash']

function toHeader(col) {
  const overrides = { url: 'URL', urls: 'URLs', id: 'ID', ott: 'OTT', tat: 'TAT', tcrp: 'TCRP', sw: 'SW', ip: 'IP' }
  return col.split('_').map(w => overrides[w] || (w.charAt(0).toUpperCase() + w.slice(1))).join(' ')
}

function getHint(col, mysqlType) {
  const t = mysqlType.toLowerCase()
  if (col === 'id' || col.endsWith('_id')) return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (UUID)'
  if (t.startsWith('datetime')) return 'YYYY-MM-DD HH:MM:SS (IST)'
  if (t.startsWith('date'))     return 'YYYY-MM-DD (IST)'
  if (col.includes('url'))      return 'https://example.com'
  if (col.includes('status'))   return 'Pending / Removed / Down / Enforced'
  if (t.includes('bigint') || t.includes('int') || t.includes('decimal')) return '0'
  return ''
}

function styleHeader(ws, colCount) {
  for (let c = 0; c < colCount; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c })
    if (!ws[addr]) continue
    ws[addr].s = {
      font:      { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
      fill:      { fgColor: { rgb: '1E3A5F' } },
      alignment: { horizontal: 'center', wrapText: true },
      border: {
        bottom: { style: 'thin', color: { rgb: '7EB6FF' } }
      },
    }
  }
  const hint_row_addr_example = XLSX.utils.encode_cell({ r: 1, c: 0 })
  if (ws[hint_row_addr_example]) {
    for (let c = 0; c < colCount; c++) {
      const addr = XLSX.utils.encode_cell({ r: 1, c })
      if (!ws[addr]) continue
      ws[addr].s = { font: { italic: true, color: { rgb: '888888' }, sz: 9 }, fill: { fgColor: { rgb: 'F0F4FA' } } }
    }
  }
}

export async function GET(req) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const sheetName = searchParams.get('sheet')
  const type      = searchParams.get('type') || 'upload' // 'upload' | 'update'

  if (!sheetName || !SHEET_CONFIG[sheetName]) {
    return NextResponse.json({ error: 'Invalid sheet name' }, { status: 400 })
  }

  const cfg = SHEET_CONFIG[sheetName]
  const dbCols = await query(`SHOW COLUMNS FROM \`${cfg.table}\``)

  const wb = XLSX.utils.book_new()

  // ── Main data sheet ────────────────────────────────────────────────────────
  let uploadCols
  if (type === 'update') {
    // Bulk UPDATE template: include id first, then all updatable columns
    const idCol = dbCols.find(c => c.Field === 'id')
    const rest  = dbCols.filter(c => c.Field !== 'id' && !SKIP_COLS.has(c.Field) && !SKIP_SUFFIX.some(s => c.Field.endsWith(s)))
    uploadCols = idCol ? [idCol, ...rest] : rest
  } else {
    // Bulk INSERT template: exclude id and system cols
    uploadCols = dbCols.filter(c => c.Field !== 'id' && !SKIP_COLS.has(c.Field) && !SKIP_SUFFIX.some(s => c.Field.endsWith(s)))
  }

  // ── Apply saved template column config (order + visibility) ────────────────
  try {
    const savedCfg = await query(
      'SELECT column_keys FROM template_column_config WHERE sheet_name = ? AND template_type = ?',
      [sheetName, type]
    )
    if (savedCfg.length) {
      const savedKeys = JSON.parse(savedCfg[0].column_keys)
      const colMap = Object.fromEntries(uploadCols.map(c => [c.Field, c]))
      // For update template: always keep id first regardless of saved order
      if (type === 'update') {
        const idCol = uploadCols.find(c => c.Field === 'id')
        const rest  = savedKeys.filter(k => k !== 'id' && colMap[k]).map(k => colMap[k])
        uploadCols  = idCol ? [idCol, ...rest] : rest
      } else {
        uploadCols = savedKeys.filter(k => colMap[k]).map(k => colMap[k])
      }
    }
  } catch (_) { /* if table missing, fall back to default */ }

  const headers = uploadCols.map(c => toHeader(c.Field))
  const hints   = uploadCols.map(c => getHint(c.Field, c.Type))

  // Sample row for update template to illustrate id usage
  const rows = [headers, hints]
  if (type === 'update') {
    rows.push(uploadCols.map((c, i) => i === 0 ? 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' : ''))  // example UUID row
  }

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = headers.map((h, i) => ({ wch: Math.max(h.length + 4, 18) }))
  ws['!freeze'] = { xSplit: 0, ySplit: 1 }

  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31))

  // ── Instructions sheet ─────────────────────────────────────────────────────
  const instructions = type === 'update' ? [
    ['BULK UPDATE INSTRUCTIONS', ''],
    ['', ''],
    ['Purpose', 'Update existing records in the system using their database ID.'],
    ['', ''],
    ['STEP 1', 'Download existing data first: use the Download button → CSV export.'],
    ['STEP 2', 'Open this template. Column A is the ID column (UUID) — this is REQUIRED for every row.'],
    ['STEP 3', 'Fill in the UUID of the record you want to update (copy from CSV export — column "id").'],
    ['STEP 4', 'Fill in ONLY the columns you want to change. Leave others blank to keep existing values.'],
    ['STEP 5', 'Save as .xlsx and upload via "Bulk Update" button.'],
    ['', ''],
    ['IMPORTANT', 'Rows without a valid UUID in the ID column will be skipped.'],
    ['IMPORTANT', 'Duplicate URLs will be rejected to prevent data conflicts.'],
    ['IMPORTANT', 'Date columns must be in IST (Asia/Kolkata) timezone — system converts to UTC.'],
    ['', ''],
    ['Date Format', 'YYYY-MM-DD HH:MM:SS  e.g. 2024-03-15 14:30:00 (IST)'],
    ['Status Values', 'Pending, Removed, Enforced, Not Removed, Under Review, Down, Suspended, Approved'],
    ['URL Format', 'Must start with http:// or https://'],
    ['', ''],
    ['Module', sheetName],
    ['Table', cfg.table],
  ] : [
    ['BULK UPLOAD INSTRUCTIONS', ''],
    ['', ''],
    ['Purpose', 'Upload new records into the system via Excel file.'],
    ['', ''],
    ['STEP 1', 'Fill data in the first sheet starting from row 3 (row 1 = headers, row 2 = format hints).'],
    ['STEP 2', 'Do NOT modify the header row (row 1).'],
    ['STEP 3', `The "${cfg.uniqueUrlCol ? toHeader(cfg.uniqueUrlCol) : 'URL'}" column is required — rows without it will be skipped.`],
    ['STEP 4', 'If a URL already exists in the database, the row will be updated (not duplicated).'],
    ['STEP 5', 'Save as .xlsx and upload via the "Upload Data" button.'],
    ['', ''],
    ['IMPORTANT', 'Date columns must be in IST (Asia/Kolkata) timezone — system converts to UTC automatically.'],
    ['IMPORTANT', 'Future dates are not allowed for identification/enforcement date columns.'],
    ['', ''],
    ['Date Format', 'YYYY-MM-DD HH:MM:SS  e.g. 2024-03-15 14:30:00 (IST)'],
    ['Status Values', 'Pending, Removed, Enforced, Not Removed, Under Review, Down, Suspended, Approved'],
    ['URL Format', 'Must start with http:// or https://'],
    ['', ''],
    ['Module', sheetName],
    ['Table', cfg.table],
    ['Unique Key Column', cfg.uniqueUrlCol || '—'],
  ]

  const wsInstr = XLSX.utils.aoa_to_sheet(instructions)
  wsInstr['!cols'] = [{ wch: 30 }, { wch: 80 }]
  // Bold the title
  if (wsInstr['A1']) wsInstr['A1'].s = { font: { bold: true, sz: 13, color: { rgb: '1E3A5F' } } }
  XLSX.utils.book_append_sheet(wb, wsInstr, 'Instructions')

  const buf      = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx', cellStyles: true })
  const safeName = sheetName.replace(/[^a-z0-9]/gi, '_')
  const suffix   = type === 'update' ? '_bulk_update_template' : '_upload_template'

  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${safeName}${suffix}.xlsx"`,
    },
  })
}
