'use client'

import { useState, useMemo } from 'react'
import { formatUsd } from '../_helpers'

interface Props {
  baseCarrierCost: number
  surchargesTotal: number
  initialMarkupPercent: number
  clientName: string
  clientAverageMarkup?: number | null
  lane: string
  containerType: string
}

type MarkupMode = 'PERCENT' | 'USD'

export default function MarkupCalculator({
  baseCarrierCost,
  surchargesTotal,
  initialMarkupPercent,
  clientName,
  clientAverageMarkup,
  lane,
  containerType,
}: Props) {
  const [markupMode, setMarkupMode] = useState<MarkupMode>('PERCENT')
  const [markupPercent, setMarkupPercent] = useState(initialMarkupPercent)
  const [markupUsd, setMarkupUsd] = useState(
    Math.round((baseCarrierCost * initialMarkupPercent) / 100),
  )

  const markupAmount = useMemo(() => {
    if (markupMode === 'PERCENT') return Math.round((baseCarrierCost * markupPercent) / 100)
    return markupUsd
  }, [markupMode, markupPercent, markupUsd, baseCarrierCost])

  const effectivePercent = useMemo(() => {
    return ((markupAmount / baseCarrierCost) * 100).toFixed(1)
  }, [markupAmount, baseCarrierCost])

  const quoteFinal = baseCarrierCost + markupAmount + surchargesTotal

  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: '12px',
      padding: '22px 24px',
    }}>
      <h3 style={{
        margin: '0 0 18px 0',
        fontSize: '14px',
        fontWeight: 700,
        color: 'var(--text-primary)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        Pricing y markup
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        alignItems: 'end',
      }}>
        {/* Costo carrier */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', fontWeight: 600 }}>
            Costo carrier
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-secondary)', lineHeight: 1 }}>
            {formatUsd(baseCarrierCost)}
          </div>
        </div>

        {/* Markup input */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', fontWeight: 600 }}>
            Markup
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="number"
              min="0"
              step={markupMode === 'PERCENT' ? '0.5' : '50'}
              value={markupMode === 'PERCENT' ? markupPercent : markupUsd}
              onChange={(e) => {
                const v = parseFloat(e.target.value) || 0
                if (markupMode === 'PERCENT') setMarkupPercent(v)
                else setMarkupUsd(v)
              }}
              style={{
                width: '80px',
                padding: '8px 10px',
                background: 'var(--surface-app)',
                border: '1px solid var(--border-strong)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <select
              value={markupMode}
              onChange={(e) => setMarkupMode(e.target.value as MarkupMode)}
              style={{
                padding: '8px 10px',
                background: 'var(--surface-app)',
                border: '1px solid var(--border-strong)',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="PERCENT">%</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        {/* Quote final */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', fontWeight: 600 }}>
            Quote final al cliente
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--rumbo-coral)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}>
            {formatUsd(quoteFinal)}
          </div>
        </div>

        {/* Margen Rumbo */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', fontWeight: 600 }}>
            Margen Rumbo
          </div>
          <div style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--rumbo-navy)',
            lineHeight: 1,
          }}>
            {formatUsd(markupAmount)}
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-tertiary)', marginLeft: '6px' }}>
              ({effectivePercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Footer histórico */}
      <div style={{
        marginTop: '18px',
        paddingTop: '14px',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '12px',
        color: 'var(--text-tertiary)',
        lineHeight: 1.6,
      }}>
        {clientAverageMarkup != null && (
          <div>
            • Histórico de markup a <strong style={{ color: 'var(--text-secondary)' }}>{clientName}</strong>: {clientAverageMarkup}% promedio · {initialMarkupPercent}% recomendado
          </div>
        )}
        <div>
          • Markup mediano de mercado <strong style={{ color: 'var(--text-secondary)' }}>{lane}</strong> {containerType}: 13.5%
        </div>
      </div>
    </div>
  )
}
