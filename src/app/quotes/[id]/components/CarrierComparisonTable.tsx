'use client'

import { Star } from 'lucide-react'
import type { CarrierOption } from '@/types/quote'
import { formatUsd } from '../_helpers'

interface Props {
  carriers: CarrierOption[]
}

export default function CarrierComparisonTable({ carriers }: Props) {
  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{
            background: 'var(--surface-hover)',
            borderBottom: '1px solid var(--border-default)',
          }}>
            <Th>Carrier</Th>
            <Th>Vía</Th>
            <Th align="right">Transit</Th>
            <Th align="right">Sailings/sem</Th>
            <Th align="right">On-time 12m</Th>
            <Th align="right">Rate contrato</Th>
            <Th align="right">Spot</Th>
            <Th align="right">Tu costo</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {carriers.map((c) => (
            <tr
              key={c.name}
              style={{
                borderBottom: '1px solid var(--border-subtle)',
                background: c.isRecommended ? 'var(--rumbo-coral-soft)' : 'transparent',
                transition: 'background 120ms ease',
              }}
              onMouseEnter={(e) => {
                if (!c.isRecommended) e.currentTarget.style.background = 'var(--surface-hover)'
              }}
              onMouseLeave={(e) => {
                if (!c.isRecommended) e.currentTarget.style.background = 'transparent'
              }}
            >
              <td style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
                  {c.isRecommended && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      background: 'var(--rumbo-coral)',
                      color: 'white',
                      borderRadius: '999px',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      <Star size={9} fill="white" />
                      Recomendado
                    </span>
                  )}
                </div>
              </td>
              <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                {c.via === 'transshipment' ? (
                  <span title={c.viaDetail || ''}>
                    Transbordo
                    {c.viaDetail && <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{c.viaDetail}</div>}
                  </span>
                ) : 'Directo'}
              </td>
              <td style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                {c.transitDays}d
              </td>
              <td style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                {c.sailingsPerWeek}
              </td>
              <td style={{ padding: '14px 16px', textAlign: 'right', color: c.onTimePct12m >= 90 ? 'var(--success-fg)' : c.onTimePct12m >= 85 ? 'var(--text-primary)' : 'var(--warning-fg)' }}>
                {c.onTimePct12m}%
              </td>
              <td style={{ padding: '14px 16px', textAlign: 'right', color: c.contractRate ? 'var(--text-primary)' : 'var(--text-quaternary)', fontWeight: c.contractRate ? 600 : 400 }}>
                {c.contractRate ? formatUsd(c.contractRate) : '—'}
                {c.contractRef && (
                  <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', marginTop: '2px', fontWeight: 400 }}>
                    {c.contractRef}
                  </div>
                )}
              </td>
              <td style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                {formatUsd(c.spotRate)}
              </td>
              <td style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 700 }}>
                {formatUsd(c.yourFinalCost)}
              </td>
              <td style={{ padding: '14px 16px', fontSize: '11.5px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                {c.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th style={{
      padding: '12px 16px',
      textAlign: align,
      fontSize: '10.5px',
      fontWeight: 600,
      color: 'var(--text-tertiary)',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </th>
  )
}
