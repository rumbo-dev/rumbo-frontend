'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Surcharge } from '@/types/quote'
import { formatUsd, formatUsdWithSuffix } from '../_helpers'

interface Props {
  surcharges: Surcharge[]
  total: number
  quoteFinalUsd: number
}

export default function SurchargesBlock({ surcharges, total, quoteFinalUsd }: Props) {
  const [open, setOpen] = useState(true)

  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '16px 22px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Surcharges
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            {surcharges.length} items · total {formatUsd(total)}
          </span>
        </div>
      </button>

      {open && (
        <div style={{ padding: '0 22px 18px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ paddingTop: '10px' }}>
            {surcharges.map((s, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  padding: '10px 0',
                  borderBottom: idx < surcharges.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                <div>
                  <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {s.name}
                  </div>
                  {s.description && (
                    <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      {s.description}
                    </div>
                  )}
                </div>
                <div style={{
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: s.amount === 0 ? 'var(--text-tertiary)' : 'var(--text-primary)',
                  fontFamily: 'ui-monospace, monospace',
                }}>
                  {formatUsd(s.amount)}
                </div>
              </div>
            ))}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              padding: '14px 0 6px',
              borderTop: '2px solid var(--border-default)',
              marginTop: '8px',
            }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Total surcharges
              </span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'ui-monospace, monospace' }}>
                {formatUsd(total)}
              </span>
            </div>
          </div>

          <div style={{
            marginTop: '14px',
            padding: '16px 18px',
            background: 'linear-gradient(135deg, var(--rumbo-coral-soft), var(--surface-card))',
            border: '1px solid var(--rumbo-coral)',
            borderRadius: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}>
            <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
              Quote final al cliente con surcharges:
            </span>
            <span style={{
              fontSize: '26px',
              fontWeight: 700,
              color: 'var(--rumbo-coral)',
              letterSpacing: '-0.02em',
            }}>
              {formatUsdWithSuffix(quoteFinalUsd)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
