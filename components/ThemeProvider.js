'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
  theme: 'blue', setTheme: () => {},
  mode: 'dark',  toggleMode: () => {},
  customColor: '#3b82f6', setCustomColor: () => {},
})

export const useTheme = () => useContext(ThemeContext)

export const THEMES = [
  { id: 'blue',   label: 'Blue',   color: '#3b82f6' },
  { id: 'purple', label: 'Purple', color: '#8b5cf6' },
  { id: 'green',  label: 'Green',  color: '#10b981' },
  { id: 'rose',   label: 'Rose',   color: '#f43f5e' },
  { id: 'teal',   label: 'Teal',   color: '#14b8a6' },
  { id: 'orange', label: 'Orange', color: '#f97316' },
  { id: 'cyan',   label: 'Cyan',   color: '#06b6d4' },
  { id: 'indigo', label: 'Indigo', color: '#6366f1' },
  { id: 'pink',   label: 'Pink',   color: '#ec4899' },
  { id: 'yellow', label: 'Yellow', color: '#eab308' },
  { id: 'red',    label: 'Red',    color: '#ef4444' },
  { id: 'lime',   label: 'Lime',   color: '#84cc16' },
]

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) }
}

function applyCustomColor(hex) {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return
  const { r, g, b } = hexToRgb(hex)
  const toHex = (r, g, b) => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
  const dark  = toHex(Math.round(r * 0.72), Math.round(g * 0.72), Math.round(b * 0.72))
  const light = toHex(Math.min(255, r + Math.round((255 - r) * 0.28)), Math.min(255, g + Math.round((255 - g) * 0.28)), Math.min(255, b + Math.round((255 - b) * 0.28)))
  const el = document.documentElement
  el.style.setProperty('--accent',       hex)
  el.style.setProperty('--accent-dark',  dark)
  el.style.setProperty('--accent-light', light)
  el.style.setProperty('--accent-glow',  `rgba(${r},${g},${b},0.15)`)
}

// Only user-specific keys are used. Generic keys are never written to.
function lsKey(suffix, uid) { return `piracy-${suffix}-${uid}` }

function applyToDOM(t, m, cc) {
  document.documentElement.setAttribute('data-theme', t)
  document.documentElement.setAttribute('data-mode',  m)
  if (t === 'custom') applyCustomColor(cc)
}

export default function ThemeProvider({ children }) {
  const [theme,       setThemeState]      = useState('blue')
  const [mode,        setModeState]       = useState('dark')
  const [customColor, setCustomColorState]= useState('#3b82f6')
  const [userId,      setUserId]          = useState(null)

  useEffect(() => {
    // 1. Fast initial render: use the last logged-in user's cached prefs.
    //    `piracy-last-user` stores the userId of whoever logged in last on this browser.
    const lastUid = localStorage.getItem('piracy-last-user')
    if (lastUid) {
      const t  = localStorage.getItem(lsKey('theme',  lastUid)) || 'blue'
      const m  = localStorage.getItem(lsKey('mode',   lastUid)) || 'dark'
      const cc = localStorage.getItem(lsKey('custom', lastUid)) || '#3b82f6'
      applyToDOM(t, m, cc)
      setThemeState(t); setModeState(m); setCustomColorState(cc)
    }

    // 2. Fetch server prefs — always authoritative, corrects any wrong-user cache.
    fetch('/api/preferences')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d || d.error) return // not logged in — keep defaults
        const uid = String(d.userId)
        const t   = d.theme       || 'blue'
        const m   = d.mode        || 'dark'
        const cc  = d.customColor || '#3b82f6'

        setUserId(uid)
        setThemeState(t); setModeState(m); setCustomColorState(cc)

        // Always apply — this corrects the theme if a different user logged in
        applyToDOM(t, m, cc)

        // Persist under this user's own keys + mark them as the last user
        localStorage.setItem(lsKey('theme',  uid), t)
        localStorage.setItem(lsKey('mode',   uid), m)
        localStorage.setItem(lsKey('custom', uid), cc)
        localStorage.setItem('piracy-last-user', uid)
      })
      .catch(() => { /* offline — initial render state is good enough */ })
  }, [])

  function persistLocally(t, m, cc, uid) {
    if (!uid) return
    localStorage.setItem(lsKey('theme',  uid), t)
    localStorage.setItem(lsKey('mode',   uid), m)
    localStorage.setItem(lsKey('custom', uid), cc)
    // keep last-user in sync so next page load is instant for this user
    localStorage.setItem('piracy-last-user', uid)
  }

  async function savePrefs(t, m, cc) {
    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: t, mode: m, customColor: cc }),
      })
    } catch { /* silent */ }
  }

  function setTheme(t) {
    setThemeState(t)
    applyToDOM(t, mode, customColor)
    persistLocally(t, mode, customColor, userId)
    savePrefs(t, mode, customColor)
  }

  function setCustomColor(hex) {
    setCustomColorState(hex)
    setThemeState('custom')
    applyToDOM('custom', mode, hex)
    persistLocally('custom', mode, hex, userId)
    savePrefs('custom', mode, hex)
  }

  function toggleMode() {
    const next = mode === 'dark' ? 'light' : 'dark'
    setModeState(next)
    applyToDOM(theme, next, customColor)
    persistLocally(theme, next, customColor, userId)
    savePrefs(theme, next, customColor)
  }

  function setMode(m) {
    if (m === mode) return
    setModeState(m)
    applyToDOM(theme, m, customColor)
    persistLocally(theme, m, customColor, userId)
    savePrefs(theme, m, customColor)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mode, toggleMode, setMode, customColor, setCustomColor }}>
      {children}
    </ThemeContext.Provider>
  )
}
