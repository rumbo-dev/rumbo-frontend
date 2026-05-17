'use client'

import { ExternalLink } from 'lucide-react'

export interface AgentActivityItem {
  agent: string
  action: string
  minutesAgo: number
  operationCode?: string
  decisionId?: string
}

interface Props {
  items: AgentActivityItem[]
  onItemClick?: (item: AgentActivityItem) => void
}

const AGENT_COLORS: Record<string, { bg: string; fg: string }> = {
  READ:   { bg: 'var(--rumbo-navy-soft)',  fg: 'var(--rumbo-navy)' },
  WATCH:  { bg: 'var(--warning-bg)',        fg: 'var(--warning-fg)' },
  CLEAR:  { bg: 'var(--success-bg)',        fg: 'var(--success-fg)' },
  QUOTE:  { bg: 'var(--rumbo-coral-soft)',  fg: 'var(--rumbo-coral)' },
  REPLY:  { bg: 'var(--info-bg)',           fg: 'var(--info-fg)' },
  RANK:   { bg: 'var(--neutral-bg)',        fg: 'var(--neutral-fg)' },
  GROWTH: { bg: '#F0EBFE',                  fg: '#6D4AC4' },
}

function timeAgoMin(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export default function AgentActivityFeed({ items, onItemClick }: Props) {
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
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          Agent activity
        </div>
        <div style={{
          fontSize: '12px',
          color: 'var(--text-tertiary)',
          marginTop: '3px',
        }}>
          Últimas {items.length} decisiones — click para ver razonamiento
        </div>
      </div>

      <div style={{
        maxHeight: '400px',
        overflowY: 'auto',
        padding: '4px 0',
      }}>
        {items.map((item, idx) => {
          const col = AGENT_COLORS[item.agent] || AGENT_COLORS.READ
          const clickable = !!(item.operationCode || item.decisionId)
          return (
            <button
              key={idx}
              onClick={() => clickable && onItemClick?.(item)}
              disabled={!clickable}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 18px',
                background: 'transparent',
                border: 'none',
                borderBottom: idx < items.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                cursor: clickable ? 'pointer' : 'default',
                textAlign: 'left',
                transition: 'background 120ms ease',
              }}
              onMouseEnter={(e) => {
                if (clickable) e.currentTarget.style.background = 'var(--surface-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <span style={{
                flexShrink: 0,
                padding: '3px 8px',
                background: col.bg,
                color: col.fg,
                borderRadius: '5px',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                marginTop: '2px',
              }}>
                {item.agent}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  lineHeight: 1.5,
                }}>
                  {item.action}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '4px',
                  fontSize: '11px',
                  color: 'var(--text-tertiary)',
                }}>
                  <span>hace {timeAgoMin(item.minutesAgo)}</span>
                  {item.operationCode && (
                    <span style={{
                      color: 'var(--rumbo-navy)',
                      fontWeight: 600,
                      fontFamily: 'ui-monospace, monospace',
                    }}>
                      {item.operationCode}
                    </span>
                  )}
                </div>
              </div>
              {clickable && (
                <ExternalLink size={13} style={{ color: 'var(--text-quaternary)', marginTop: '4px', flexShrink: 0 }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
