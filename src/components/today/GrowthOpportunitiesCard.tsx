'use client'

import { TrendingUp, AlertCircle, MapPin, Clock } from 'lucide-react'

export interface GrowthOpportunity {
  type: string  // 'churn_risk' | 'lane_expansion' | 'lost_quote'
  client: string
  message: string
}

interface Props {
  opportunities: GrowthOpportunity[]
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  churn_risk:     { icon: <AlertCircle size={14} />, label: 'Riesgo de churn',     color: 'var(--danger-fg)' },
  lane_expansion: { icon: <MapPin size={14} />,      label: 'Expansión de lane',   color: 'var(--success-fg)' },
  lost_quote:     { icon: <Clock size={14} />,       label: 'Quote perdida',       color: 'var(--warning-fg)' },
}

export default function GrowthOpportunitiesCard({ opportunities }: Props) {
  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: '12px',
      overflow: 'hidden',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--surface-hover)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <TrendingUp size={14} style={{ color: 'var(--rumbo-coral)' }} />
        <div>
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            Oportunidades de crecimiento
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-tertiary)',
            marginTop: '3px',
          }}>
            {opportunities.length} sugerencias detectadas
          </div>
        </div>
      </div>

      <div style={{ padding: '4px 0' }}>
        {opportunities.map((opp, idx) => {
          const cfg = TYPE_CONFIG[opp.type] || { icon: <TrendingUp size={14} />, label: opp.type, color: 'var(--text-secondary)' }
          return (
            <div
              key={idx}
              style={{
                padding: '14px 18px',
                borderBottom: idx < opportunities.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                cursor: 'pointer',
                transition: 'background 120ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ color: cfg.color, display: 'inline-flex' }}>{cfg.icon}</span>
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: cfg.color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  {cfg.label}
                </span>
              </div>
              <div style={{
                fontSize: '13.5px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '3px',
              }}>
                {opp.client}
              </div>
              <div style={{
                fontSize: '12.5px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}>
                {opp.message}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
