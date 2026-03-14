/**
 * DB Index Optimization API
 * GET  /api/admin/db-optimize          → returns index recommendations report
 * POST /api/admin/db-optimize          → applies all missing indexes
 *
 * Dashboard slow query analysis:
 * ─────────────────────────────────────────────────────────────────────────────
 * The dashboard runs these query patterns per module:
 *   1. SELECT COUNT(*), SUM(removal_status IN (...)) FROM <table> WHERE <dateCol> BETWEEN ? AND ?
 *   2. SELECT <countryCol>, COUNT(*), SUM(...) FROM <table> WHERE <dateCol>... GROUP BY <countryCol>
 *   3. SELECT <platformCol>, COUNT(*), SUM(...) FROM <table> WHERE <dateCol>... GROUP BY <platformCol>
 *
 * Optimal indexes per table:
 *   • (<dateCol>)                         — covers date-range filter
 *   • (<dateCol>, removal_status)         — covering index for COUNT + SUM in date range
 *   • (<countryCol>, removal_status)      — covering for GROUP BY country + SUM
 *   • (<platformCol>, removal_status)     — covering for GROUP BY platform + SUM
 *   • (removal_status)                    — for global totals without date filter
 */

import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'

const INDEX_PLAN = [
  // social_media
  { table: 'social_media', name: 'idx_sm_ts',              cols: 'identification_timestamp' },
  { table: 'social_media', name: 'idx_sm_ts_status',       cols: 'identification_timestamp, removal_status' },
  { table: 'social_media', name: 'idx_sm_country_status',  cols: 'country, removal_status' },
  { table: 'social_media', name: 'idx_sm_platform_status', cols: 'platform, removal_status' },
  { table: 'social_media', name: 'idx_sm_status',          cols: 'removal_status' },
  { table: 'social_media', name: 'idx_sm_brand',           cols: 'iptv_brands(100)' },
  { table: 'social_media', name: 'idx_sm_term',            cols: 'search_term_used(100)' },

  // marketplace
  { table: 'marketplace', name: 'idx_mp_ts',              cols: 'identification_timestamp' },
  { table: 'marketplace', name: 'idx_mp_ts_status',       cols: 'identification_timestamp, removal_status' },
  { table: 'marketplace', name: 'idx_mp_country_status',  cols: 'country, removal_status' },
  { table: 'marketplace', name: 'idx_mp_platform_status', cols: 'platform, removal_status' },
  { table: 'marketplace', name: 'idx_mp_status',          cols: 'removal_status' },
  { table: 'marketplace', name: 'idx_mp_brand',           cols: 'iptv_brands(100)' },
  { table: 'marketplace', name: 'idx_mp_term',            cols: 'search_term_used(100)' },

  // unauthorized_search_result
  { table: 'unauthorized_search_result', name: 'idx_usr_date',    cols: 'date_of_identification' },
  { table: 'unauthorized_search_result', name: 'idx_usr_status',  cols: 'removal_status' },
  { table: 'unauthorized_search_result', name: 'idx_usr_market',  cols: 'market_scanned, removal_status' },

  // ads_tutorials_social_media
  { table: 'ads_tutorials_social_media', name: 'idx_ats_date',     cols: 'date_of_identification' },
  { table: 'ads_tutorials_social_media', name: 'idx_ats_status',   cols: 'removal_status' },
  { table: 'ads_tutorials_social_media', name: 'idx_ats_platform', cols: 'platform_name, removal_status' },

  // password_sharing_social_media
  { table: 'password_sharing_social_media', name: 'idx_pss_date',     cols: 'date_of_identification' },
  { table: 'password_sharing_social_media', name: 'idx_pss_status',   cols: 'removal_status' },
  { table: 'password_sharing_social_media', name: 'idx_pss_platform', cols: 'platform_name, removal_status' },

  // password_sharing_marketplace
  { table: 'password_sharing_marketplace', name: 'idx_psm_date',     cols: 'date_of_identification' },
  { table: 'password_sharing_marketplace', name: 'idx_psm_status',   cols: 'removal_status' },
  { table: 'password_sharing_marketplace', name: 'idx_psm_platform', cols: 'platform_name, removal_status' },

  // iptv_apps_internet
  { table: 'iptv_apps_internet', name: 'idx_iai_date',    cols: 'identification_date' },
  { table: 'iptv_apps_internet', name: 'idx_iai_status',  cols: 'removal_status' },
  { table: 'iptv_apps_internet', name: 'idx_iai_country', cols: 'market_country, removal_status' },

  // iptv_apps_apps
  { table: 'iptv_apps_apps', name: 'idx_iaa_date',    cols: 'identification_date' },
  { table: 'iptv_apps_apps', name: 'idx_iaa_status',  cols: 'removal_status' },
  { table: 'iptv_apps_apps', name: 'idx_iaa_market',  cols: 'market, removal_status' },
  { table: 'iptv_apps_apps', name: 'idx_iaa_platform',cols: 'platform, removal_status' },

  // iptv_apps_social_media
  { table: 'iptv_apps_social_media', name: 'idx_ias_date',    cols: 'identification_date' },
  { table: 'iptv_apps_social_media', name: 'idx_ias_status',  cols: 'removal_status' },
  { table: 'iptv_apps_social_media', name: 'idx_ias_country', cols: 'market_country, removal_status' },

  // iptv_apps_marketplace
  { table: 'iptv_apps_marketplace', name: 'idx_iamp_date',     cols: 'identification_date' },
  { table: 'iptv_apps_marketplace', name: 'idx_iamp_status',   cols: 'removal_status' },
  { table: 'iptv_apps_marketplace', name: 'idx_iamp_country',  cols: 'market_country, removal_status' },
  { table: 'iptv_apps_marketplace', name: 'idx_iamp_platform', cols: 'platform, removal_status' },

  // iptv_apps_meta_ads
  { table: 'iptv_apps_meta_ads', name: 'idx_ima_date',     cols: 'identification_date' },
  { table: 'iptv_apps_meta_ads', name: 'idx_ima_status',   cols: 'removal_status' },
  { table: 'iptv_apps_meta_ads', name: 'idx_ima_country',  cols: 'market_country, removal_status' },
  { table: 'iptv_apps_meta_ads', name: 'idx_ima_platform', cols: 'platform, removal_status' },
]

async function indexExists(tableName, indexName) {
  const rows = await query(
    `SELECT COUNT(*) as cnt FROM information_schema.statistics
     WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?`,
    [tableName, indexName]
  )
  return (rows[0]?.cnt || 0) > 0
}

export async function GET(req) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'admin' && session.role !== 'superadmin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  // Check which indexes exist
  const report = []
  for (const idx of INDEX_PLAN) {
    const exists = await indexExists(idx.table, idx.name)
    report.push({ ...idx, exists })
  }

  const missing = report.filter(r => !r.exists)
  return NextResponse.json({
    total: report.length,
    existing: report.filter(r => r.exists).length,
    missing: missing.length,
    report,
    recommendation: missing.length > 0
      ? `Apply ${missing.length} missing indexes via POST /api/admin/db-optimize to improve dashboard query speed.`
      : 'All recommended indexes are in place.',
  })
}

export async function POST(req) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'admin' && session.role !== 'superadmin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const results = []
  for (const idx of INDEX_PLAN) {
    const exists = await indexExists(idx.table, idx.name)
    if (exists) { results.push({ ...idx, status: 'already_exists' }); continue }
    try {
      await query(`CREATE INDEX \`${idx.name}\` ON \`${idx.table}\` (${idx.cols})`)
      results.push({ ...idx, status: 'created' })
    } catch (e) {
      results.push({ ...idx, status: 'error', error: e.message })
    }
  }

  const created = results.filter(r => r.status === 'created').length
  const errors  = results.filter(r => r.status === 'error').length
  return NextResponse.json({
    success: errors === 0,
    created,
    alreadyExisted: results.filter(r => r.status === 'already_exists').length,
    errors,
    results,
    message: `Created ${created} indexes. ${errors > 0 ? `${errors} failed.` : 'All done.'}`,
  })
}
