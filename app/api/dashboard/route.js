import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { query } from '@/lib/db'
import { SHEET_CONFIG } from '@/lib/sheetConfig'

function getSession() {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('piracy_session')
  if (!sessionCookie) return null
  try {
    const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
    const session = JSON.parse(decoded)
    if (!session.userId) return null
    if (Date.now() - session.lastActivity > 30 * 60 * 1000) return null
    return session
  } catch { return null }
}

// Per-module metadata for dashboard aggregation
const MODULE_META = {
  'Unauthorized Search Result':   { dateCol: 'date_of_identification', countryCol: 'market_scanned',  platformCol: 'search_engine' },
  'Ads Tutorials- Social Media':  { dateCol: 'date_of_identification', countryCol: 'market_scanned',  platformCol: 'platform_name' },
  'Password Sharing-Social Med.': { dateCol: 'date_of_identification', countryCol: 'seller_country',  platformCol: 'platform_name' },
  'Password Sharing-Marketplace': { dateCol: 'date_of_identification', countryCol: 'seller_country',  platformCol: 'platform_name' },
  'IPTV & Apps - Internet':       { dateCol: 'identification_date',    countryCol: 'market_country',  platformCol: 'intermediary_type' },
  'IPTV & Apps - Apps':           { dateCol: 'identification_date',    countryCol: 'market',          platformCol: 'platform' },
  'IPTV & Apps - Social Media':   { dateCol: 'identification_date',    countryCol: 'market_country',  platformCol: null },
  'IPTV & Apps - Marketplace':    { dateCol: 'identification_date',    countryCol: 'market_country',  platformCol: 'platform' },
  'Marketplace':                  { dateCol: 'identification_timestamp', countryCol: 'country',       platformCol: 'platform' },
  'Social Media':                 { dateCol: 'identification_timestamp', countryCol: 'country',       platformCol: 'platform' },
  'IPTV & Apps - Meta Ads':       { dateCol: 'identification_date',    countryCol: 'market_country',  platformCol: 'platform' },
}

const ACTIONED = `removal_status IN ('Removed','Down','Suspended','Approved','Enforced')`

function sanitizeDate(d) {
  return /^\d{4}-\d{2}-\d{2}$/.test(d || '') ? d : ''
}

function buildWhere(dateCol, from, to) {
  const parts = []
  if (from) parts.push(`\`${dateCol}\` >= '${from}'`)
  if (to)   parts.push(`\`${dateCol}\` <= '${to} 23:59:59'`)
  return parts.length ? `WHERE ${parts.join(' AND ')}` : ''
}

export async function GET(req) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const from = sanitizeDate(searchParams.get('from'))
  const to   = sanitizeDate(searchParams.get('to'))
  const modulesParam = searchParams.get('modules') || ''

  // Get user's role & viewable modules
  let viewableModules = null // null = all (admin)
  try {
    const userRows = await query('SELECT role FROM users WHERE id = ?', [session.userId])
    const role = userRows[0]?.role || 'user'
    if (role !== 'admin' && role !== 'superadmin') {
      const perms = await query(
        `SELECT m.name FROM user_module_permissions ump
         JOIN modules m ON m.id = ump.module_id
         WHERE ump.user_id = ? AND ump.can_view = 1`,
        [session.userId]
      )
      viewableModules = perms.map(p => p.name)
    }
  } catch { /* if permissions table missing, treat as admin */ }

  const allKeys = Object.keys(MODULE_META)
  const accessibleKeys = viewableModules === null
    ? allKeys
    : allKeys.filter(k => viewableModules.includes(k))

  const requestedKeys = modulesParam
    ? modulesParam.split(',').map(k => k.trim()).filter(k => accessibleKeys.includes(k))
    : accessibleKeys

  if (!requestedKeys.length) {
    return NextResponse.json({
      stats: { totalIdent: 0, totalActioned: 0, actionRate: '0.0', moduleCount: 0 },
      modules: [], countries: [], accessibleModules: accessibleKeys,
    })
  }

  try {
    // 3 queries per module: totals, countries, platforms — all in parallel
    const allQueries = requestedKeys.flatMap(key => {
      const cfg  = SHEET_CONFIG[key]
      const meta = MODULE_META[key]
      if (!cfg || !meta) return [Promise.resolve([{ cnt: 0, actioned: 0 }]), Promise.resolve([]), Promise.resolve([])]
      const table = cfg.table
      const where = buildWhere(meta.dateCol, from, to)
      return [
        query(`SELECT COUNT(*) as cnt, SUM(${ACTIONED}) as actioned FROM \`${table}\` ${where}`),
        meta.countryCol
          ? query(`SELECT \`${meta.countryCol}\` as country, COUNT(*) as cnt, SUM(${ACTIONED}) as actioned FROM \`${table}\` ${where} GROUP BY \`${meta.countryCol}\` ORDER BY cnt DESC LIMIT 10`)
          : Promise.resolve([]),
        meta.platformCol
          ? query(`SELECT \`${meta.platformCol}\` as platform, COUNT(*) as cnt, SUM(${ACTIONED}) as actioned FROM \`${table}\` ${where} GROUP BY \`${meta.platformCol}\` ORDER BY cnt DESC LIMIT 10`)
          : Promise.resolve([]),
      ]
    })

    const results = await Promise.all(allQueries)

    const modules = []
    const countryMap = {}

    requestedKeys.forEach((key, i) => {
      const cfg       = SHEET_CONFIG[key]
      const offset    = i * 3
      const totalRow  = results[offset]?.[0] || {}
      const countryRows  = results[offset + 1] || []
      const platformRows = results[offset + 2] || []

      const total    = parseInt(totalRow.cnt)      || 0
      const actioned = parseInt(totalRow.actioned) || 0

      const countries = countryRows.map(r => ({
        country:  r.country  || 'Unknown',
        cnt:      parseInt(r.cnt)      || 0,
        actioned: parseInt(r.actioned) || 0,
      }))

      countries.forEach(r => {
        if (!countryMap[r.country]) countryMap[r.country] = { country: r.country, total: 0, actioned: 0 }
        countryMap[r.country].total   += r.cnt
        countryMap[r.country].actioned += r.actioned
      })

      modules.push({
        key,
        label:      cfg.label,
        icon:       cfg.icon,
        color:      cfg.color,
        total,
        actioned,
        actionRate: total ? ((actioned / total) * 100).toFixed(1) : '0.0',
        countries:  countries.slice(0, 5),
        platforms:  platformRows.slice(0, 8).map(r => ({
          platform: r.platform || 'Unknown',
          cnt:      parseInt(r.cnt)      || 0,
          actioned: parseInt(r.actioned) || 0,
        })),
      })
    })

    const totalIdent    = modules.reduce((s, m) => s + m.total,    0)
    const totalActioned = modules.reduce((s, m) => s + m.actioned,  0)
    const countries     = Object.values(countryMap).sort((a, b) => b.total - a.total).slice(0, 15)

    return NextResponse.json({
      stats: {
        totalIdent,
        totalActioned,
        actionRate:  totalIdent ? ((totalActioned / totalIdent) * 100).toFixed(1) : '0.0',
        moduleCount: modules.length,
      },
      modules,
      countries,
      accessibleModules: accessibleKeys,
    })
  } catch (err) {
    console.error('Dashboard error:', err)
    return NextResponse.json({ error: 'Database error: ' + err.message }, { status: 500 })
  }
}
