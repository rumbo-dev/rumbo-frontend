'use client'

import { TrendingUp, Star, Mail, FileText, Activity, ExternalLink } from 'lucide-react'
import type { Quote } from '@/types/quote'

interface AgentActivityItem {
  agent: string
  text: string
  minutesAgo: number
  decisionId?: string
}

interface Props {
  quote: Quote
  agentActivity: AgentActivityItem[]
  onAgentClick?: (decisionId: string | undefined) => void
}

const AGENT_COLORS: Record<string, { bg: string; fg: string }> = {
  READ:   { bg: 'var(--rumbo-navy-soft)', fg: 'var(--rumbo-navy)' },
  WATCH:  { bg: 'var(--warning-bg)',      fg: 'var(--warning-fg)' },
  CLEAR:  { bg: 'var(--success-bg)',      fg: 'var(--success-fg)' },
  QUOTE:  { bg: 'var(--rumbo-coral-soft)', fg: 'var(--rumbo-coral)' },
  REPLY:  { bg: 'var(--info-bg)',         fg: 'var(--info-fg)' },
  RANK:   { bg: 'var(--neutral-bg)',      fg: 'var(--neutral-fg)' },
  GROWTH: { bg: '#F0EBFE',                 fg: '#6D4AC4' },
}

function timeAgoMin(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export default function QuoteSidebar({ quote, agentActivity, onAgentClick }: Props) {
  return (
    <aside style={{
      position: 'sticky',
      top: '40px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
    }}>
      {/* Histórico del cliente */}
      <SideCard icon={<TrendingUp size={14} />} title="Histórico del cliente">
        {quote.isNewClient ? (
          <div style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
            Sin histórico — cliente nuevo
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {quote.clientHistoryWinRate != null && (
              <Stat label="Win rate" value={`${Math.round(quote.clientHistoryWinRate * 100)}%`} />
            )}
            {quote.clientPreferredCarrier && (
              <Stat label="Carrier preferido" value={quote.clientPreferredCarrier} icon={<Star size={11} fill="currentColor" />} />
            )}
            {quote.clientAverageMarkup != null && (
              <Stat label="Markup promedio" value={`${quote.clientAverageMarkup}%`} />
            )}
          </div>
        )}
      </SideCard>

      {/* Acciones rápidas */}
      <SideCard icon={<FileText size={14} />} title="Acciones rápidas">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <QuickAction label="Ver operaciones del cliente" />
          <QuickAction label="Histórico de cotizaciones" />
          <QuickAction label="Notas internas" />
        </div>
      </SideCard>

      {/* Agent activity */}
      <SideCard icon={<Activity size={14} />} title="Agent activity">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {agentActivity.map((item, idx) => {
            const col = AGENT_COLORS[item.agent] || AGENT_COLORS.READ
            return (
              <button
                key={idx}
                onClick={() => onAgentClick?.(item.decisionId)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '8px',
                  background: 'transparent',
                  border: '1px solid transparent',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 120ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface-hover)'
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'transparent'
                }}
              >
                <span style={{
                  flexShrink: 0,
                  padding: '2px 7px',
                  background: col.bg,
                  color: col.fg,
                  borderRadius: '4px',
                  fontSize: '9.5px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  marginTop: '1px',
                }}>
                  {item.agent}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {item.text}
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    hace {timeAgoMin(item.minutesAgo)}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </SideCard>
    </aside>
  )
}

function SideCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: '10px',
      padding: '14px 16px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '12px',
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--text-tertiary)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        {icon}
        {title}
      </div>
      {children}
    </div>
  )
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        {icon}{value}
      </span>
    </div>
  )
}

function QuickAction({ label }: { label: string }) {
  return (
    <button
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 10px',
        background: 'transparent',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12.5px',
        color: 'var(--text-secondary)',
        textAlign: 'left',
        transition: 'all 120ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--surface-hover)'
        e.currentTarget.style.borderColor = 'var(--border-default)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.borderColor = 'var(--border-subtle)'
      }}
    >
      {label}
      <ExternalLink size={11} style={{ color: 'var(--text-quaternary)' }} />
    </button>
  )
}
