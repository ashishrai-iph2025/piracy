import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'

export async function GET(req) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25')))
  const offset = (page - 1) * limit

  try {
    const [countResult] = await query('SELECT COUNT(*) as total FROM user_activity')
    const total = countResult.total

    const rows = await query(
      'SELECT * FROM user_activity ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    )

    return NextResponse.json({
      data: rows, total, page, limit,
      pages: Math.ceil(total / limit)
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
