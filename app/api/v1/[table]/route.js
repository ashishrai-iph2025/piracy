import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// Allowed tables + which column to use for date/title filtering
const TABLE_CONFIG = {
  unauthorized_search_result:    { dateCol: 'date_of_identification', titleCols: ['title', 'keyword', 'website', 'pirate_website_brand'] },
  ads_tutorials_social_media:    { dateCol: 'date_of_identification', titleCols: ['title', 'channel_page_profile_name', 'pirate_brand', 'platform_name'] },
  password_sharing_social_media: { dateCol: 'date_of_identification', titleCols: ['channel_page_profile_name', 'seller_name', 'platform_name'] },
  password_sharing_marketplace:  { dateCol: 'date_of_identification', titleCols: ['listing_title', 'seller_name', 'platform_name'] },
  iptv_apps_internet:            { dateCol: 'identification_date',    titleCols: ['iptv_application_name', 'source_domain', 'content_owner'] },
  iptv_apps_apps:                { dateCol: 'identification_date',    titleCols: ['iptv_application_name', 'developer_name', 'platform'] },
  iptv_apps_social_media:        { dateCol: 'identification_date',    titleCols: ['iptv_application_name', 'channel_page_profile_name', 'copyright_owner'] },
  iptv_apps_marketplace:         { dateCol: 'identification_date',    titleCols: ['iptv_application_name', 'post_title', 'copyright_owner'] },
  iptv_apps_meta_ads:            { dateCol: 'identification_date',    titleCols: ['iptv_application_name', 'post_title', 'copyright_owner'] },
}

// System columns stripped from API responses
const STRIP_COLS = new Set(['uploaded_by', 'upload_batch_id'])
const STRIP_SUFFIX = ['_hash', '_timestamp']

async function validateToken(req) {
  const auth  = req.headers.get('authorization') || ''
  const token = auth.replace(/^bearer\s+/i, '').trim()
  if (!token) return null

  try {
    const rows = await query(
      `SELECT id, user_id, user_name, is_active, expires_at
       FROM api_tokens WHERE token = ? LIMIT 1`,
      [token]
    )
    if (!rows.length) return null
    const t = rows[0]
    if (!t.is_active) return null
    if (t.expires_at && new Date(t.expires_at) < new Date()) return null
    await query('UPDATE api_tokens SET last_used_at = NOW() WHERE id = ?', [t.id])
    return t
  } catch { return null }
}

async function logUsage(tokenId, endpoint, params, ip, statusCode) {
  try {
    await query(
      'INSERT INTO api_token_usage (token_id, endpoint, params, ip_address, status_code) VALUES (?, ?, ?, ?, ?)',
      [tokenId, endpoint, JSON.stringify(params), ip, statusCode]
    )
  } catch {}
}

export async function GET(req, { params }) {
  const tableName = params.table
  const cfg = TABLE_CONFIG[tableName]

  if (!cfg) {
    return NextResponse.json({
      error: `Unknown table: "${tableName}"`,
      available_tables: Object.keys(TABLE_CONFIG),
    }, { status: 404 })
  }

  const tokenData = await validateToken(req)
  if (!tokenData) {
    return NextResponse.json(
      { error: 'Unauthorized — provide a valid Bearer token via Authorization header' },
      { status: 401 }
    )
  }

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const endpoint = `GET /api/v1/${tableName}`

  const { searchParams } = new URL(req.url)
  const dateFrom = searchParams.get('date_from') || null
  const dateTo   = searchParams.get('date_to')   || null
  const title    = searchParams.get('title')      || null
  const page     = Math.max(1, parseInt(searchParams.get('page')  || '1'))
  const limit    = Math.min(1000, Math.max(1, parseInt(searchParams.get('limit') || '100')))
  const offset   = (page - 1) * limit

  const conditions = []
  const values     = []

  if (dateFrom) {
    conditions.push(`\`${cfg.dateCol}\` >= ?`)
    values.push(dateFrom)
  }
  if (dateTo) {
    conditions.push(`\`${cfg.dateCol}\` <= ?`)
    values.push(dateTo + ' 23:59:59')
  }
  if (title) {
    const titleCond = cfg.titleCols
      .filter(c => c)
      .map(c => `\`${c}\` LIKE ?`)
      .join(' OR ')
    if (titleCond) {
      conditions.push(`(${titleCond})`)
      cfg.titleCols.filter(c => c).forEach(() => values.push(`%${title}%`))
    }
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  try {
    const [{ total }] = await query(
      `SELECT COUNT(*) AS total FROM \`${tableName}\` ${where}`,
      values
    )

    const rows = await query(
      `SELECT * FROM \`${tableName}\` ${where}
       ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    )

    // Clean system columns
    const data = rows.map(row => {
      const r = { ...row }
      for (const k of Object.keys(r)) {
        if (STRIP_COLS.has(k) || STRIP_SUFFIX.some(s => k.endsWith(s))) delete r[k]
      }
      return r
    })

    const responsePayload = {
      success: true,
      table:   tableName,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      filters: { date_from: dateFrom, date_to: dateTo, title },
      data,
    }

    await logUsage(tokenData.id, endpoint, { dateFrom, dateTo, title, page, limit }, ip, 200)

    return NextResponse.json(responsePayload)
  } catch (err) {
    await logUsage(tokenData.id, endpoint, {}, ip, 500)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
