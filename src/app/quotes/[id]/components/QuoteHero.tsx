'use client'

import { ArrowLeft, Send, Snowflake } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Quote } from '@/types/quote'
import { STATUS_CONFIG, formatContainerType, timeAgo, channelLabel } from '../_helpers'

interface QuoteHeroProps {
  quote: Quote
  primaryCta?: { label: string; onClick: () => void }
}

export default function QuoteHero({ quote, primaryCta }: QuoteHeroProps) {
  const router = useRouter()
  const status = STATUS_CONFIG[quote.status]
  const isRefrigerated = quote.containerType === 'FCL_40RF' || quote.specialHandling?.toLowerCase().includes('refriger')

  const preTitleParts = [
    'COTIZACIÓN',
    formatContainerType(quote.containerType, quote.containerCount),
    quote.incoterm,
  ].filter(Boolean).join(' · ')

  return (
    <div style={{ marginBottom: '32px' }}>
      <button
        onClick={() => router.push('/quotes')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 0',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-tertiary)',
          fontSize: '13px',
          cursor: 'pointer',
          marginBottom: '16px',
        }}
      >
        <ArrowLeft size={14} />
        Volver a cotizaciones
      </button>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '24px',
      }}>
        <div>
          <div style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '8px',
          }}>
            {preTitleParts}
          </div>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 700,
            margin: 0,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, var(--rumbo-navy), var(--rumbo-coral))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: 'ui-monospace, monospace',
          }}>
            {quote.quoteCode}
          </h1>
          <p style={{
            fontSize: '15px',
            color: 'var(--text-secondary)',
            margin: '10px 0 0 0',
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>{quote.clientName}</strong>
            {quote.isNewClient && (
              <span style={{
                marginLeft: '8px',
                fontSize: '10px',
                fontWeight: 600,
                padding: '2px 6px',
                background: 'var(--rumbo-coral-soft)',
                color: 'var(--rumbo-coral)',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Cliente nuevo
              </span>
            )}
            {' · Recibido vía '}{channelLabel(quote.channel)}{' · hace '}{timeAgo(quote.receivedAt)}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              background: status.bg,
              color: status.fg,
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: status.dot }} />
              {status.label}
            </span>

            {quote.aiParsingConfidence != null && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                background: 'var(--rumbo-navy-soft)',
                color: 'var(--rumbo-navy)',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 600,
              }}>
                AI confidence {Math.round(quote.aiParsingConfidence * 100)}%
              </span>
            )}

            {isRefrigerated && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                background: 'var(--info-bg)',
                color: 'var(--info-fg)',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 600,
              }}>
                <Snowflake size={12} />
                Refrigerado
              </span>
            )}
          </div>
        </div>

        {primaryCta && (
          <button
            onClick={primaryCta.onClick}
            style={{
              padding: '12px 22px',
              background: 'linear-gradient(135deg, var(--rumbo-coral), var(--rumbo-coral-hover))',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(244, 122, 90, 0.3)',
              flexShrink: 0,
            }}
          >
            <Send size={14} />
            {primaryCta.label}
          </button>
        )}
      </div>
    </div>
  )
}
