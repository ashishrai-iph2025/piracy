import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'
import { testEmailConfig } from '@/lib/email'

function requireAdmin(session) {
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'superadmin' && session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }
  return null
}

const PURPOSE_OPTIONS = [
  { value: 'notification', label: 'User Notifications (approval/rejection)' },
  { value: 'alert',        label: 'System Alerts' },
  { value: 'report',       label: 'Scheduled Reports' },
  { value: 'digest',       label: 'Activity Digest' },
  { value: 'other',        label: 'Other' },
]

export async function GET(req) {
  const session = getSession()
  const err = requireAdmin(session)
  if (err) return err

  try {
    const configs = await query('SELECT id, purpose, label, smtp_host, smtp_port, smtp_secure, smtp_user, from_name, from_email, is_active, updated_at FROM email_config ORDER BY id ASC')
    return NextResponse.json({ configs, purposes: PURPOSE_OPTIONS })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req) {
  const session = getSession()
  const err = requireAdmin(session)
  if (err) return err

  try {
    const body = await req.json()
    const { action, id, purpose, label, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass, from_name, from_email, is_active } = body

    // Test connection only — don't save
    if (action === 'test') {
      if (!smtp_host || !smtp_user || !smtp_pass) {
        return NextResponse.json({ error: 'Host, user and password are required for test' }, { status: 400 })
      }
      try {
        await testEmailConfig({ smtp_host, smtp_port: smtp_port || 587, smtp_secure: smtp_secure || 0, smtp_user, smtp_pass })
        return NextResponse.json({ success: true, message: 'SMTP connection verified successfully' })
      } catch (e) {
        return NextResponse.json({ success: false, message: `Connection failed: ${e.message}` })
      }
    }

    // Delete
    if (action === 'delete') {
      if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
      await query('DELETE FROM email_config WHERE id = ?', [id])
      return NextResponse.json({ success: true })
    }

    // Update existing (no password change if smtp_pass is blank)
    if (id) {
      const fields = { purpose, label, smtp_host, smtp_port, smtp_secure: smtp_secure ? 1 : 0, smtp_user, from_name, from_email, is_active: is_active ? 1 : 0 }
      if (smtp_pass) fields.smtp_pass = smtp_pass
      const setClauses = Object.keys(fields).map(k => `\`${k}\` = ?`).join(', ')
      await query(`UPDATE email_config SET ${setClauses} WHERE id = ?`, [...Object.values(fields), id])
      return NextResponse.json({ success: true })
    }

    // Insert new
    if (!smtp_pass) return NextResponse.json({ error: 'Password is required for new config' }, { status: 400 })
    await query(
      'INSERT INTO email_config (purpose, label, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass, from_name, from_email, is_active) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [purpose || 'notification', label || 'New Config', smtp_host, smtp_port || 587, smtp_secure ? 1 : 0, smtp_user, smtp_pass, from_name || 'Piracy System', from_email || smtp_user, is_active !== false ? 1 : 0]
    )
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
