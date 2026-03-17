'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

/*
 * IpHouseLoader
 * Props:
 *   show    — boolean (controls visibility, with min 2s enforcement)
 *   overlay — wrap in a full absolute overlay
 *   text    — optional label below logo
 *   size    — 'sm' | 'md' | 'lg'
 *   minMs   — minimum visible duration in ms (default 2000)
 */
export default function IpHouseLoader({ show = true, overlay = false, text = '', size = 'md', minMs = 1000 }) {
  const [visible, setVisible]   = useState(show)
  const [animOut, setAnimOut]   = useState(false)
  const startRef  = useRef(null)
  const timerRef  = useRef(null)

  useEffect(() => {
    if (show) {
      clearTimeout(timerRef.current)
      startRef.current = Date.now()
      setAnimOut(false)
      setVisible(true)
    } else {
      const elapsed   = Date.now() - (startRef.current || 0)
      const remaining = Math.max(0, minMs - elapsed)
      timerRef.current = setTimeout(() => {
        setAnimOut(true)
        // fade-out takes 400ms then fully unmount
        setTimeout(() => setVisible(false), 400)
      }, remaining)
    }
    return () => clearTimeout(timerRef.current)
  }, [show, minMs])

  if (!visible) return null

  const logoW = { sm: 110, md: 150, lg: 190 }[size] || 150
  const logoH = Math.round(logoW * 0.26)
  const barW  = logoW + 20

  const inner = (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      gap:            '20px',
      animation:      animOut ? 'iphFadeOut 0.4s ease forwards' : 'iphFadeIn 0.35s ease',
    }}>

      {/* Logo card */}
      <div style={{
        background:    'var(--bg-card, #131d2e)',
        border:        '1px solid var(--border, #1e2e45)',
        borderRadius:  '20px',
        padding:       '24px 32px',
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:           '20px',
        boxShadow:     '0 12px 40px rgba(0,0,0,0.35)',
        minWidth:      `${barW + 40}px`,
      }}>

        {/* Logo — theme-aware via CSS class */}
        <div className="iph-logo-wrap" style={{ lineHeight: 0, animation: 'iphBreath 2s ease-in-out infinite' }}>
          <Image
            src="/ip-house-logo.svg"
            alt="IP House"
            width={logoW}
            height={logoH}
            className="iph-logo-img"
            style={{ objectFit: 'contain', display: 'block' }}
            priority
          />
        </div>

        {/* Progress bar track */}
        <div style={{
          width:        `${barW}px`,
          height:       '3px',
          background:   'var(--border, #1e2e45)',
          borderRadius: '99px',
          overflow:     'hidden',
        }}>
          <div style={{
            height:     '100%',
            width:      '45%',
            background: 'linear-gradient(90deg, var(--accent, #3b82f6), #60a5fa)',
            borderRadius: '99px',
            animation:  'iphProgress 1.4s cubic-bezier(0.4,0,0.2,1) infinite',
          }} />
        </div>

        {/* Label */}
        {text && (
          <span style={{
            fontSize:      '11px',
            fontWeight:    '600',
            color:         'var(--text-muted, #4a6080)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily:    'Inter, DM Sans, Arial, sans-serif',
          }}>{text}</span>
        )}
      </div>

      <style>{`
        /* Theme-aware logo colour */
        [data-mode="dark"]  .iph-logo-img { filter: brightness(0) invert(1); }
        [data-mode="light"] .iph-logo-img { filter: none; }

        @keyframes iphFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1);    }
        }
        @keyframes iphFadeOut {
          from { opacity: 1; transform: scale(1);    }
          to   { opacity: 0; transform: scale(0.96); }
        }
        @keyframes iphBreath {
          0%, 100% { opacity: 1;   transform: scale(1);    }
          50%      { opacity: 0.7; transform: scale(0.96); }
        }
        @keyframes iphProgress {
          0%   { transform: translateX(-110%); }
          100% { transform: translateX(${Math.round(barW / 0.45) + barW}px); }
        }
      `}</style>
    </div>
  )

  if (!overlay) return inner

  return (
    <div style={{
      position:        'absolute',
      inset:           0,
      background:      'rgba(11,17,32,0.78)',
      backdropFilter:  'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      zIndex:          20,
      borderRadius:    'inherit',
      animation:       animOut ? 'iphFadeOut 0.4s ease forwards' : 'iphFadeIn 0.35s ease',
    }}>
      {inner}
    </div>
  )
}
