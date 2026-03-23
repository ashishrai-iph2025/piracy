import { NextResponse } from 'next/server'
import { getSession, getUserPermissions, hasPermission } from '@/lib/session'
import { query } from '@/lib/db'
import { SHEET_CONFIG } from '@/lib/sheetConfig'
import { utcToIst, utcToIstDate } from '@/lib/timezone'

function escapeCSV(val) {
  if (val === null || val === undefined) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

// Convert a DB row's datetime/date columns from UTC to IST before CSV export
function convertRowToIst(row, columns) {
  const out = { ...row }
  for (const col of columns) {
    if (!out[col.key] && out[col.key] !== 0) continue
    if (col.type === 'datetime') out[col.key] = utcToIst(out[col.key]) ?? out[col.key]
    else if (col.type === 'date') out[col.key] = utcToIstDate(out[col.key]) ?? out[col.key]
  }
  return out
}

export async function GET(req) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const sheetName   = searchParams.get('sheet') || ''
  const dateFrom    = searchParams.get('date_from')    || ''
  const dateTo      = searchParams.get('date_to')      || ''
  const titleFilter = searchParams.get('title_filter') || ''
  const ownerFilter = searchParams.get('owner_filter') || ''

  const cfg = SHEET_CONFIG[sheetName]
  if (!cfg) return NextResponse.json({ error: 'Unknown sheet' }, { status: 400 })

  const perms = await getUserPermissions(session.userId, session.role)
  if (!hasPermission(perms, sheetName, 'can_export')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  // Auto-detect which columns to use for each filter
  const cols        = cfg.columns
  const dateColKey  = cols.find(c =>
    (c.type === 'datetime' || c.type === 'date') &&
    (c.key.includes('identification') || c.key.startsWith('date_of'))
  )?.key
  const titleColKey = cols.find(c =>
    ['title', 'iptv_application_name', 'channel_page_profile_name', 'listing_title'].includes(c.key)
  )?.key
  const ownerColKey = cols.find(c =>
    ['copyright_owner', 'content_owner'].includes(c.key)
  )?.key

  // Mandate date_from if dateColKey exists
  if (dateColKey && !dateFrom) {
    return NextResponse.json({ error: 'Start date is required' }, { status: 400 })
  }

  // Build WHERE
  const conditions = []
  const params     = []

  if (dateFrom && dateColKey) {
    conditions.push(`\`${dateColKey}\` >= ?`)
    params.push(dateFrom)
  }
  if (dateTo && dateColKey) {
    conditions.push(`\`${dateColKey}\` <= ?`)
    params.push(dateTo + ' 23:59:59')
  }
  if (titleFilter && titleColKey) {
    conditions.push(`\`${titleColKey}\` LIKE ?`)
    params.push(`%${titleFilter}%`)
  }
  if (ownerFilter && ownerColKey) {
    conditions.push(`\`${ownerColKey}\` LIKE ?`)
    params.push(`%${ownerFilter}%`)
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  try {
    const rows = await query(
      `SELECT * FROM \`${cfg.table}\` ${whereClause} ORDER BY created_at DESC`,
      params
    )

    if (!rows.length) {
      return new Response('No records found for the selected filters.', { status: 404 })
    }

    const headers  = Object.keys(rows[0])
    const csvLines = [
      '\uFEFF' + headers.map(escapeCSV).join(','),
      ...rows.map(row => {
        const converted = convertRowToIst(row, cols)
        return headers.map(h => escapeCSV(converted[h])).join(',')
      })
    ]

    const csv        = csvLines.join('\r\n')
    const dateSuffix = dateFrom ? `_${dateFrom}` : ''
    const filename   = `${cfg.table}${dateSuffix}_export.csv`

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    return NextResponse.json({ error: 'Download failed: ' + err.message }, { status: 500 })
  }
}
