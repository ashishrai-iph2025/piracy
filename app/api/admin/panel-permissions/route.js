import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS admin_panel_permissions (
      id         CHAR(36)    NOT NULL DEFAULT (UUID()) PRIMARY KEY,
      user_id    CHAR(36)    NOT NULL,
      tab_key    VARCHAR(50) NOT NULL,
      can_access TINYINT(1)  NOT NULL DEFAULT 0,
      granted_by CHAR(36),
      granted_at DATETIME    DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_user_tab (user_id, tab_key),
      INDEX idx_user (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)
}

// GET /api/admin/panel-permissions?user_id=X  (admin can query any user)
// GET /api/admin/panel-permissions?mine=1      (any authenticated user, own perms)
export async function GET(req) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await ensureTable()

  const { searchParams } = new URL(req.url)
  const mine   = searchParams.get('mine')
  const userId = mine ? session.userId : searchParams.get('user_id')

  if (!userId) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

  // Non-admin users can only query their own permissions
  const isAdmin = session.role === 'superadmin' || session.role === 'admin'
  if (!isAdmin && userId !== session.userId)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const rows = await query(
      'SELECT tab_key, can_access FROM admin_panel_permissions WHERE user_id = ?',
      [userId]
    )
    return NextResponse.json({ permissions: rows })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST — save panel permissions for a user (admin only)
// Body: { user_id, permissions: [{ tab_key, can_access }] }
export async function POST(req) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'superadmin' && session.role !== 'admin')
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  await ensureTable()

  try {
    const { user_id, permissions } = await req.json()
    if (!user_id || !Array.isArray(permissions))
      return NextResponse.json({ error: 'Missing user_id or permissions' }, { status: 400 })

    for (const p of permissions) {
      await query(
        `INSERT INTO admin_panel_permissions (user_id, tab_key, can_access, granted_by)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           can_access = VALUES(can_access),
           granted_by = VALUES(granted_by),
           updated_at = NOW()`,
        [user_id, p.tab_key, p.can_access ? 1 : 0, session.userId]
      )
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
