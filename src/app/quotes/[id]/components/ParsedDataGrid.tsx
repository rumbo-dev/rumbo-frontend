'use client'

import { Check } from 'lucide-react'
import type { Quote } from '@/types/quote'
import { getCountryFlag } from '@/components/index'
import { formatContainerType, formatDate } from '../_helpers'

interface FieldDef {
  key: string
  label: string
  value: string | null | undefined
  highlightMissing?: boolean
}

interface ParsedDataGridProps {
  quote: Quote
}

export default function ParsedDataGrid({ quote }: ParsedDataGridProps) {
  const parsed = (quote.aiParsedFields || {}) as Record<string, number>
  const missing = (quote.missingFields || []) as string[]
  const missingSet = new Set(missing)

  const fields: FieldDef[] = [
    {
      key: 'origin',
      label: 'Origen',
      value: quote.origin
        ? `${quote.originCountry ? getCountryFlag(quote.originCountry) + ' ' : ''}${quote.origin}`
        : null,
    },
    {
      key: 'destination',
      label: 'Destino',
      value: quote.destination
        ? `${quote.destinationCountry ? getCountryFlag(quote.destinationCountry) + ' ' : ''}${quote.destination}`
        : null,
    },
    { key: 'product', label: 'Producto', value: quote.product },
    { key: 'ncmCode', label: 'NCM', value: quote.ncmCode },
    {
      key: 'containerType',
      label: 'Tipo / Cantidad',
      value: formatContainerType(quote.containerType, quote.containerCount),
    },
    {
      key: 'weightKg',
      label: 'Peso / CBM',
      value:
        quote.weightKg || quote.cbm
          ? `${quote.weightKg ? quote.weightKg.toLocaleString('en-US') + ' kg' : '—'} · ${quote.cbm ? quote.cbm + ' m³' : '—'}`
          : null,
    },
    { key: 'incoterm', label: 'Incoterm', value: quote.incoterm },
    { key: 'readyDate', label: 'Ready', value: formatDate(quote.readyDate) },
  ]

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        padding: '20px',
      }}>
        {fields.map((f) => {
          const isMissing = missingSet.has(f.key) || f.value == null || f.value === '—'
          const confidence = parsed[f.key]
          const highConfidence = typeof confidence === 'number' && confidence >= 0.9
          return (
            <div key={f.key} style={{ minWidth: 0 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '10.5px',
                fontWeight: 600,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '6px',
              }}>
                {f.label}
                {highConfidence && !isMissing && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: 'var(--success-dot)',
                    color: 'white',
                  }}>
                    <Check size={9} strokeWidth={3} style={{ margin: 'auto' }} />
                  </span>
                )}
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: 500,
                color: isMissing ? 'var(--text-quaternary)' : 'var(--text-primary)',
                fontStyle: isMissing ? 'italic' : 'normal',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {isMissing ? 'Faltante' : f.value}
              </div>
            </div>
          )
        })}
      </div>

      {missing.length > 0 && (
        <div style={{
          marginTop: '12px',
          padding: '10px 14px',
          background: 'var(--warning-bg)',
          border: '1px solid var(--warning-fg)',
          borderLeft: '4px solid var(--warning-fg)',
          borderRadius: '8px',
          fontSize: '12.5px',
          color: 'var(--warning-fg)',
        }}>
          <strong>{missing.length} dato{missing.length > 1 ? 's' : ''} faltante{missing.length > 1 ? 's' : ''}:</strong>{' '}
          {missing.join(', ')}
        </div>
      )}
    </div>
  )
}
