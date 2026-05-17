'use client'

import { Mail, ShieldAlert, DollarSign, Clock } from 'lucide-react'

interface Kpis {
  processed24h: number
  exceptionsCaught: number
  costAvoidedMtd: number
  operatorHoursSaved: number
}

interface Props {
  kpis: Kpis
}

export default function PerformanceKpis({ kpis }: Props) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '14px',
    }}>
      <KpiCard
        icon={<Mail size={16} />}
        label="Procesados 24h"
        value={kpis.processed24h.toString()}
        subtext="emails + docs"
        accent="navy"
      />
      <KpiCard
        icon={<ShieldAlert size={16} />}
        label="Exceptions caught"
        value={kpis.exceptionsCaught.toString()}
        subtext="flagged por AI"
        accent="coral"
      />
      <KpiCard
        icon={<DollarSign size={16} />}
        label="Cost avoided MTD"
        value={`$${kpis.costAvoidedMtd.toLocaleString('en-US')}`}
        subtext="demurrage + multas + errores"
        accent="navy"
      />
      <KpiCard
        icon={<Clock size={16} />}
        label="Horas ahorradas"
        value={`${kpis.operatorHoursSaved}h`}
        subtext="al equipo este mes"
        accent="coral"
      />
    </div>
  )
}

function KpiCard({ icon, label, value, subtext, accent }: { icon: React.ReactNode; label: string; value: string; subtext: string; accent: 'navy' | 'coral' }) {
  const accentColor = accent === 'coral' ? 'var(--rumbo-coral)' : 'var(--rumbo-navy)'
  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: '12px',
      padding: '18px 20px',
      boxShadow: 'var(--shadow-sm)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: accentColor,
      }} />
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '10px',
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '7px',
          background: accent === 'coral' ? 'var(--rumbo-coral-soft)' : 'var(--rumbo-navy-soft)',
          color: accentColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          {label}
        </div>
      </div>
      <div style={{
        fontSize: '28px',
        fontWeight: 700,
        color: 'var(--text-primary)',
        lineHeight: 1,
        letterSpacing: '-0.02em',
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '12px',
        color: 'var(--text-tertiary)',
        marginTop: '8px',
      }}>
        {subtext}
      </div>
    </div>
  )
}
