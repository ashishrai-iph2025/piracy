/**
 * Timezone utilities
 * ─────────────────────────────────────────────────────────────────────────────
 * All datetimes in the database are stored in UTC.
 * Users enter/see datetimes in IST (Asia/Kolkata = UTC+5:30).
 *
 * UPLOAD / EDIT (input): IST → UTC  (subtract 5h 30m) before DB insert/update
 * DISPLAY / DOWNLOAD:    UTC → IST  (add 5h 30m) before showing to user
 * DATE-only columns:     No timezone conversion needed (just date, no time)
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000 // 5 hours 30 minutes in ms

// ─── IST → UTC (for saving to DB) ───────────────────────────────────────────

/**
 * Convert an IST datetime string entered by a user to UTC for DB storage.
 * Input : "2024-03-15 14:30:00"  (IST, as entered by user)
 * Output: "2024-03-15 09:00:00"  (UTC, to store in DB)
 * Returns null for empty/invalid input.
 */
export function istToUtc(val) {
  if (!val || String(val).trim() === '') return null
  const s = String(val).trim().replace(' ', 'T')
  // Append +05:30 offset so the JS engine treats this as IST
  const dt = new Date(s + '+05:30')
  if (isNaN(dt.getTime())) return null
  return dt.toISOString().slice(0, 19).replace('T', ' ')
}

// ─── UTC → IST (for display / download) ─────────────────────────────────────

/**
 * Convert a UTC datetime string from the DB to IST string.
 * Input : "2024-03-15 09:00:00"  (UTC, from DB)
 * Output: "2024-03-15 14:30:00"  (IST, for display)
 * Returns null for empty/invalid input.
 */
export function utcToIst(val) {
  if (!val) return null
  const s = String(val).trim()
  // Append Z so the JS engine treats this as UTC
  const dt = new Date(s.replace(' ', 'T') + 'Z')
  if (isNaN(dt.getTime())) return null
  // Format in IST (sv-SE locale gives ISO-like "YYYY-MM-DD HH:MM:SS")
  return dt.toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' }).slice(0, 19)
}

/**
 * UTC → IST date-only string "YYYY-MM-DD" (for date-type input fields in UI).
 */
export function utcToIstDate(val) {
  const ist = utcToIst(val)
  return ist ? ist.slice(0, 10) : null
}

/**
 * UTC → IST datetime string truncated to minutes "YYYY-MM-DD HH:MM"
 * (for datetime-local inputs in the edit modal).
 */
export function utcToIstForInput(val) {
  const ist = utcToIst(val)
  return ist ? ist.slice(0, 16) : ''
}

/**
 * UTC → IST date only for a date-type input "YYYY-MM-DD".
 */
export function utcToIstDateForInput(val) {
  return utcToIstDate(val) || ''
}

/**
 * UTC → human-readable IST string for table display.
 * Output example: "15 Mar 2024, 14:30"
 */
export function utcToIstDisplay(val, type = 'datetime') {
  if (!val) return '—'
  const s = String(val).trim()
  const dt = new Date(s.replace(' ', 'T') + 'Z')
  if (isNaN(dt.getTime())) return String(val).slice(0, 10)
  if (type === 'date') {
    return dt.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' })
  }
  return dt.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}
