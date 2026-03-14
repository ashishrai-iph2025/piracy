import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query } from '@/lib/db'

export async function GET() {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'superadmin' && session.role !== 'admin')
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  try {
    const modules = await query('SELECT * FROM modules ORDER BY sort_order')
    return NextResponse.json({ modules })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
