import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'
import { SHEET_NAV, SHEET_CONFIG } from '@/lib/sheetConfig'

function requireAdmin(session) {
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'superadmin' && session.role !== 'admin')
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  return null
}

// GET ?user_id=X — fetch all module permissions for a user
export async function GET(req) {
  const session = getSession()
  const err = requireAdmin(session)
  if (err) return err

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('user_id')
  if (!userId) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

  try {
    // Auto-insert any SHEET_NAV modules not yet in the modules table (e.g. newly added ones)
    for (let i = 0; i < SHEET_NAV.length; i++) {
      const nav = SHEET_NAV[i]
      const cfg = SHEET_CONFIG[nav.key]
      if (!cfg) continue
      await query(
        `INSERT IGNORE INTO modules (name, label, route, db_table, icon, color, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nav.key, nav.label, `/${nav.key.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
         cfg.table, nav.icon, nav.color, i + 1]
      )
    }

    // Get all modules
    const modules = await query('SELECT * FROM modules WHERE is_active = 1 ORDER BY sort_order')

    // Get existing permissions for this user
    const perms = await query(
      `SELECT p.*, m.name as module_name FROM user_module_permissions p
       JOIN modules m ON m.id = p.module_id WHERE p.user_id = ?`,
      [userId]
    )
    const permMap = {}
    for (const p of perms) permMap[p.module_id] = p

    // Merge: fill defaults for modules without explicit permission row
    const result = modules.map(m => ({
      module_id: m.id,
      module_name: m.name,
      module_label: m.label,
      module_icon: m.icon,
      can_view: permMap[m.id]?.can_view ?? 0,
      can_upload: permMap[m.id]?.can_upload ?? 0,
      can_edit: permMap[m.id]?.can_edit ?? 0,
      can_delete: permMap[m.id]?.can_delete ?? 0,
      can_bulk_update: permMap[m.id]?.can_bulk_update ?? 0,
      can_export: permMap[m.id]?.can_export ?? 0,
    }))

    return NextResponse.json({ permissions: result })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST — save permissions for a user (full replace for given modules)
export async function POST(req) {
  const session = getSession()
  const err = requireAdmin(session)
  if (err) return err

  try {
    const body = await req.json()
    const { user_id, permissions } = body

    if (!user_id || !Array.isArray(permissions))
      return NextResponse.json({ error: 'Missing user_id or permissions' }, { status: 400 })

    for (const p of permissions) {
      const { module_id, can_view, can_upload, can_edit, can_delete, can_bulk_update, can_export } = p

      await query(
        `INSERT INTO user_module_permissions
           (user_id, module_id, can_view, can_upload, can_edit, can_delete, can_bulk_update, can_export, granted_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           can_view = VALUES(can_view),
           can_upload = VALUES(can_upload),
           can_edit = VALUES(can_edit),
           can_delete = VALUES(can_delete),
           can_bulk_update = VALUES(can_bulk_update),
           can_export = VALUES(can_export),
           granted_by = VALUES(granted_by),
           updated_at = NOW()`,
        [user_id, module_id,
         can_view ? 1 : 0, can_upload ? 1 : 0, can_edit ? 1 : 0,
         can_delete ? 1 : 0, can_bulk_update ? 1 : 0, can_export ? 1 : 0,
         session.userId]
      )
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
