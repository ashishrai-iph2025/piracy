import nodemailer from 'nodemailer'
import { query } from './db'

// Fetch active SMTP config for a given purpose from DB
async function getSmtpConfig(purpose = 'notification') {
  const rows = await query(
    'SELECT * FROM email_config WHERE purpose = ? AND is_active = 1 ORDER BY id DESC LIMIT 1',
    [purpose]
  )
  return rows[0] || null
}

// Build a transporter from a DB config row
function buildTransporter(cfg) {
  return nodemailer.createTransport({
    host: cfg.smtp_host,
    port: cfg.smtp_port,
    secure: Boolean(cfg.smtp_secure),
    auth: { user: cfg.smtp_user, pass: cfg.smtp_pass },
  })
}

export async function sendApprovalEmail({ toEmail, toName, username, password }) {
  const cfg = await getSmtpConfig('notification')
  if (!cfg) throw new Error('No active email config found for purpose: notification')

  const transporter = buildTransporter(cfg)

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f8fafc;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);padding:28px 32px;text-align:center;">
        <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
          <span style="font-size:24px;">✅</span>
        </div>
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Account Approved!</h1>
        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Piracy Monitoring System</p>
      </div>
      <div style="padding:28px 32px;background:#fff;">
        <p style="color:#374151;font-size:15px;margin:0 0 20px;">Hi <strong>${toName}</strong>,</p>
        <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 24px;">
          Your account registration has been <strong style="color:#22c55e;">approved</strong> by an administrator.
          You can now log in using the credentials below.
        </p>
        <div style="background:#f1f5f9;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
          <div style="margin-bottom:12px;">
            <span style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;">Username</span>
            <div style="font-size:16px;font-weight:700;color:#1e293b;margin-top:4px;font-family:monospace;">${username}</div>
          </div>
          <div>
            <span style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;">Password</span>
            <div style="font-size:16px;font-weight:700;color:#1e293b;margin-top:4px;font-family:monospace;">${password}</div>
          </div>
        </div>
        <p style="color:#64748b;font-size:13px;margin:0 0 8px;">
          For security, please change your password after your first login.
        </p>
        <div style="text-align:center;margin-top:28px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login"
             style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">
            Login Now →
          </a>
        </div>
      </div>
      <div style="padding:16px 32px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">${cfg.from_name} · This is an automated message, please do not reply.</p>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: `"${cfg.from_name}" <${cfg.from_email}>`,
    to: toEmail,
    subject: '✅ Your account has been approved — Login credentials inside',
    html,
  })
}

export async function sendRejectionEmail({ toEmail, toName, reason }) {
  const cfg = await getSmtpConfig('notification')
  if (!cfg) throw new Error('No active email config found for purpose: notification')

  const transporter = buildTransporter(cfg)

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f8fafc;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#ef4444,#b91c1c);padding:28px 32px;text-align:center;">
        <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
          <span style="font-size:24px;">❌</span>
        </div>
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Account Not Approved</h1>
        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Piracy Monitoring System</p>
      </div>
      <div style="padding:28px 32px;background:#fff;">
        <p style="color:#374151;font-size:15px;margin:0 0 20px;">Hi <strong>${toName}</strong>,</p>
        <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 24px;">
          We regret to inform you that your account registration request has been <strong style="color:#ef4444;">rejected</strong>.
        </p>
        ${reason ? `
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
          <span style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;">Reason</span>
          <p style="color:#374151;font-size:14px;margin:6px 0 0;">${reason}</p>
        </div>` : ''}
        <p style="color:#64748b;font-size:13px;margin:0;">
          If you believe this is a mistake, please contact your administrator directly.
        </p>
      </div>
      <div style="padding:16px 32px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">${cfg.from_name} · This is an automated message, please do not reply.</p>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: `"${cfg.from_name}" <${cfg.from_email}>`,
    to: toEmail,
    subject: 'Your account registration request — Update',
    html,
  })
}

export async function testEmailConfig(cfg) {
  const transporter = buildTransporter(cfg)
  await transporter.verify()
  return true
}
