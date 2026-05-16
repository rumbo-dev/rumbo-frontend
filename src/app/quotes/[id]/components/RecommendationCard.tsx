'use client'

import { Sparkles } from 'lucide-react'

interface Props {
  carrier: string
  reason: string
}

// Parsea el reason en bullets + paragraph. Detecta items "(1) ..., (2) ..., etc."
// y los convierte en lista. El resto va como párrafo introductorio.
function parseReason(reason: string): { intro: string; bullets: string[] } {
  const firstMatch = reason.match(/\(1\)/)
  if (!firstMatch || firstMatch.index == null) {
    return { intro: reason, bullets: [] }
  }
  const intro = reason.slice(0, firstMatch.index).trim()
  const rest = reason.slice(firstMatch.index)
  const bullets = rest
    .split(/\((\d+)\)\s*/)
    .filter((s, idx) => idx > 0 && idx % 2 === 0 && s.trim().length > 0)
    .map((s) => s.trim().replace(/^[—–-]\s*/, ''))
  return { intro, bullets }
}

export default function RecommendationCard({ carrier, reason }: Props) {
  const { intro, bullets } = parseReason(reason)

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--rumbo-coral-soft), var(--surface-card))',
      border: '1px solid var(--rumbo-coral)',
      borderLeft: '4px solid var(--rumbo-coral)',
      borderRadius: '12px',
      padding: '24px 26px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'var(--rumbo-coral)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Sparkles size={16} />
        </div>
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
        }}>
          Por qué {carrier} es la mejor opción
        </h3>
      </div>

      {intro && (
        <p style={{
          fontSize: '13.5px',
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
          margin: '0 0 14px 0',
        }}>
          {intro}
        </p>
      )}

      {bullets.length > 0 && (
        <ol style={{
          margin: 0,
          paddingLeft: '20px',
          fontSize: '13.5px',
          lineHeight: 1.7,
          color: 'var(--text-secondary)',
        }}>
          {bullets.map((b, idx) => (
            <li key={idx} style={{ marginBottom: '6px' }}>{b}</li>
          ))}
        </ol>
      )}
    </div>
  )
}
