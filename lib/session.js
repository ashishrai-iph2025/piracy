import { cookies } from 'next/headers'
import { query } from '@/lib/db'

const SESSION_COOKIE = 'piracy_session'

export function getSession() {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)
  if (!sessionCookie) return null
  try {
    const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
    const session = JSON.parse(decoded)
    if (!session.userId) return null
    if (session.lastActivity && Date.now() - session.lastActivity > 30 * 60 * 1000) return null
    return session
  } catch { return null }
}

export async function logActivity(userId, userName, action, opts = {}) {
  try {
    const { sheetName, fileName, recordsCount, recordId, ipAddress, details } = opts
    await query(
      `INSERT INTO user_activity (user_id, user_name, action, sheet_name, file_name, records_count, record_id, ip_address, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, userName, action,
       sheetName || null, fileName || null, recordsCount || 0,
       recordId || null, ipAddress || null,
       details ? JSON.stringify(details) : null]
    )
  } catch (e) { console.error('Activity log error:', e.message) }
}

// Get permissions for a user — null means superadmin (all access)
export async function getUserPermissions(userId, role) {
  if (role === 'superadmin' || role === 'admin') return null // full access
  const rows = await query(
    `SELECT m.name as module_name, p.can_view, p.can_upload, p.can_edit, p.can_delete, p.can_bulk_update, p.can_export
     FROM user_module_permissions p
     JOIN modules m ON m.id = p.module_id
     WHERE p.user_id = ?`,
    [userId]
  )
  const map = {}
  for (const r of rows) map[r.module_name] = r
  return map
}

export function hasPermission(permissions, moduleName, perm) {
  if (permissions === null) return true // admin/superadmin
  const p = permissions[moduleName]
  if (!p) return false
  return !!p[perm]
}

// Middleware-style auth for API routes
export function requireSession() {
  const session = getSession()
  if (!session) return null
  return session
}
