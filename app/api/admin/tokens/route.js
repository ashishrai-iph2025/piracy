import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'

function adminOnly() {
  const s = getSession()
  if (!s) return { error: 'Unauthorized', status: 401 }
  if (s.role !== 'admin' && s.role !== 'superadmin') return { error: 'Forbidden', status: 403 }
  return { session: s }
}

// GET  — list all tokens with usage counts
export async function GET() {
  const { error, status } = adminOnly()
  if (error) return NextResponse.json({ error }, { status })

  try {
    const tokens = await query(`
      SELECT
        t.id, t.user_name, t.description, t.is_active,
        t.expires_at, t.last_used_at, t.created_at,
        COUNT(u.id) AS usage_count
      FROM api_tokens t
      LEFT JOIN api_token_usage u ON u.token_id = t.id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `)

    // Recent usage per token (last 10)
    const recentUsage = await query(`
      SELECT token_id, endpoint, params, ip_address, status_code, created_at
      FROM api_token_usage
      ORDER BY created_at DESC
      LIMIT 100
    `)

    return NextResponse.json({ tokens, recentUsage })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE — revoke (deactivate) a token
export async function DELETE(req) {
  const { error, status } = adminOnly()
  if (error) return NextResponse.json({ error }, { status })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  try {
    await query('UPDATE api_tokens SET is_active = 0 WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
