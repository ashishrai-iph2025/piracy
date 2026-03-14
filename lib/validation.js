/**
 * Global validation utilities — import these wherever form validation is needed.
 * Rules:
 *   - Date fields must not be in the future (identification/enforcement dates)
 *   - Required fields must not be empty
 *   - URL fields must be valid URLs
 */

/** Validate a date/datetime string — returns an error message or null */
export function validateDate(value, { required = false, noFuture = true, label = 'Date' } = {}) {
  if (!value || String(value).trim() === '') {
    return required ? `${label} is required` : null
  }
  const d = new Date(value)
  if (isNaN(d.getTime())) return `${label} is not a valid date`
  if (noFuture) {
    const today = new Date()
    today.setHours(23, 59, 59, 999) // allow today
    if (d > today) return `${label} cannot be a future date`
  }
  return null
}

/** Validate a URL string — returns an error message or null */
export function validateUrl(value, { required = false, label = 'URL' } = {}) {
  if (!value || String(value).trim() === '') {
    return required ? `${label} is required` : null
  }
  try {
    new URL(value)
    return null
  } catch {
    return `${label} must be a valid URL (include https://…)`
  }
}

/** Validate a required text field */
export function validateRequired(value, label = 'Field') {
  if (!value || String(value).trim() === '') return `${label} is required`
  return null
}

/**
 * Validate an entire form based on SHEET_CONFIG column definitions.
 * Returns an object of { [columnKey]: errorMessage } for failing fields.
 *
 * Rules applied automatically:
 *  - date / datetime → no future dates
 *  - url column that matches uniqueUrlCol → required + valid URL
 *  - all other url columns → valid URL if non-empty
 *
 * @param {Object} formData  - { [key]: value }
 * @param {Array}  columns   - column definitions from SHEET_CONFIG
 * @param {string} uniqueUrlCol - the module's required unique URL column key
 * @returns {Object} errors  - empty object means valid
 */
export function validateForm(formData, columns, uniqueUrlCol) {
  const errors = {}

  for (const col of columns) {
    if (col.key === 'id') continue
    const value = formData[col.key]

    if (col.type === 'date' || col.type === 'datetime') {
      const err = validateDate(value, { noFuture: true, label: col.label })
      if (err) errors[col.key] = err
    }

    if (col.type === 'url') {
      const isRequired = col.key === uniqueUrlCol
      const err = validateUrl(value, { required: isRequired, label: col.label })
      if (err) errors[col.key] = err
    }
  }

  return errors
}
