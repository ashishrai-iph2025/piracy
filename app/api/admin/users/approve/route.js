import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'
import { sendApprovalEmail, sendRejectionEmail } from '@/lib/email'
import crypto from 'crypto'

function requireAdmin(session) {
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'superadmin' && session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }
  return null
}

// Generate a readable 10-char password: 2 upper + 4 lower + 2 digit + 2 symbol
function generatePassword() {
  const upper  = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower  = 'abcdefghjkmnpqrstuvwxyz'
  const digits = '23456789'
  const syms   = '!@#$%'
  const pick   = (s, n) => Array.from({ length: n }, () => s[Math.floor(Math.random() * s.length)])
  const chars  = [...pick(upper, 2), ...pick(lower, 4), ...pick(digits, 2), ...pick(syms, 2)]
  // shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

export async function POST(req) {
  const session = getSession()
  const err = requireAdmin(session)
  if (err) return err

  try {
    const { user_id, action, reason } = await req.json()
    if (!user_id || !action) return NextResponse.json({ error: 'Missing user_id or action' }, { status: 400 })
    if (action !== 'approve' && action !== 'reject') return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 })

    const users = await query(
      'SELECT id, first_name, last_name, email, username, status FROM users WHERE id = ?',
      [user_id]
    )
    if (!users.length) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    const user = users[0]

    if (action === 'approve') {
      // Generate a new secure password and update it in DB
      const plainPass = generatePassword()
      const hash = crypto.createHash('sha256').update(plainPass).digest('hex')
      await query(
        'UPDATE users SET status = ?, is_active = 1, password = ? WHERE id = ?',
        ['active', hash, user_id]
      )

      try {
        await sendApprovalEmail({
          toEmail: user.email,
          toName: `${user.first_name} ${user.last_name}`,
          username: user.username,
          password: plainPass,
        })
      } catch (emailErr) {
        console.error('Approval email failed:', emailErr.message)
        // Approval is done — just warn about the email failure
        return NextResponse.json({ success: true, emailWarning: `Account approved but email failed: ${emailErr.message}` })
      }
    } else {
      await query('UPDATE users SET status = ?, is_active = 0 WHERE id = ?', ['rejected', user_id])

      try {
        await sendRejectionEmail({
          toEmail: user.email,
          toName: `${user.first_name} ${user.last_name}`,
          reason: reason || '',
        })
      } catch (emailErr) {
        console.error('Rejection email failed:', emailErr.message)
        return NextResponse.json({ success: true, emailWarning: `Account rejected but email failed: ${emailErr.message}` })
      }
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
