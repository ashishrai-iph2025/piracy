import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'
import { SHEET_CONFIG } from '@/lib/sheetConfig'

export async function GET(req) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const sheetName = searchParams.get('sheet') || ''

  const cfg = SHEET_CONFIG[sheetName]
  if (!cfg) return NextResponse.json({ error: 'Unknown sheet' }, { status: 400 })

  const cols = cfg.columns

  const titleColKey = cols.find(c =>
    ['title', 'iptv_application_name', 'channel_page_profile_name', 'listing_title'].includes(c.key)
  )?.key

  const ownerColKey = cols.find(c =>
    ['copyright_owner', 'content_owner'].includes(c.key)
  )?.key

  const table = cfg.table

  async function getDistinct(colKey) {
    if (!colKey) return []
    const rows = await query(
      `SELECT DISTINCT \`${colKey}\` as val FROM \`${table}\`
       WHERE \`${colKey}\` IS NOT NULL AND \`${colKey}\` != ''
       ORDER BY \`${colKey}\` ASC
       LIMIT 500`
    )
    return rows.map(r => r.val).filter(Boolean)
  }

  try {
    const [titleOptions, ownerOptions] = await Promise.all([
      getDistinct(titleColKey),
      getDistinct(ownerColKey),
    ])

    return NextResponse.json({
      titleOptions,
      ownerOptions,
      titleCol: titleColKey ? cols.find(c => c.key === titleColKey)?.label : null,
      ownerCol: ownerColKey ? cols.find(c => c.key === ownerColKey)?.label : null,
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
