import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

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

// GET /api/v1/modules
// Returns the list of modules the authenticated user has can_view permission for.
// Admins and superadmins get all active modules.
export async function GET(req) {
  const tokenData = await validateToken(req)
  if (!tokenData) {
    return NextResponse.json(
      { error: 'Unauthorized — provide a valid Bearer token via Authorization header' },
      { status: 401 }
    )
  }

  try {
    // Get the user's role
    const userRows = await query(
      'SELECT role FROM users WHERE id = ? LIMIT 1',
      [tokenData.user_id]
    )
    if (!userRows.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const role = userRows[0].role

    let modules

    let rows

    if (role === 'admin' || role === 'superadmin') {
      rows = await query(
        `SELECT name FROM modules WHERE is_active = 1 ORDER BY sort_order`
      )
    } else {
      rows = await query(
        `SELECT m.name
         FROM user_module_permissions p
         JOIN modules m ON m.id = p.module_id
         WHERE p.user_id = ? AND p.can_view = 1 AND m.is_active = 1
         ORDER BY m.sort_order`,
        [tokenData.user_id]
      )
    }

    return NextResponse.json({
      success: true,
      modules: rows.map(r => r.name),
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
