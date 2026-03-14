import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { query } from '@/lib/db'

export async function GET() {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('piracy_session')
  if (!sessionCookie) return NextResponse.json({ authenticated: false }, { status: 401 })

  try {
    const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
    const session = JSON.parse(decoded)
    if (!session.userId) return NextResponse.json({ authenticated: false }, { status: 401 })
    if (session.lastActivity && Date.now() - session.lastActivity > 30 * 60 * 1000)
      return NextResponse.json({ authenticated: false, expired: true }, { status: 401 })

    let role = session.role || 'user'
    try {
      const rows = await query('SELECT role, is_active FROM users WHERE id = ?', [session.userId])
      if (!rows.length || !rows[0].is_active) return NextResponse.json({ authenticated: false }, { status: 401 })
      role = rows[0].role
    } catch {}

    // Get viewable modules (null = all for admin/superadmin)
    let viewableModules = null
    if (role !== 'admin' && role !== 'superadmin') {
      try {
        const modRows = await query(
          `SELECT m.name FROM user_module_permissions p
           JOIN modules m ON m.id = p.module_id
           WHERE p.user_id = ? AND p.can_view = 1`,
          [session.userId]
        )
        viewableModules = modRows.map(r => r.name)
      } catch { viewableModules = null }
    }

    const updatedSession = { ...session, lastActivity: Date.now(), role }
    const response = NextResponse.json({ authenticated: true, userId: session.userId, userName: session.userName, role, viewableModules })
    response.cookies.set('piracy_session', Buffer.from(JSON.stringify(updatedSession)).toString('base64'), {
      httpOnly: true, sameSite: 'lax', maxAge: 60 * 30, path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
