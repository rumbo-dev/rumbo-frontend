'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Anchor, Calendar, TrendingUp, DollarSign, FileText, AlertTriangle, BarChart3 } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import type { Contract, ContractStatus } from '@/types/contract'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-ad432.up.railway.app'

const STATUS_CONFIG: Record<ContractStatus, { label: string; bg: string; fg: string; dot: string }> = {
  ACTIVE:         { label: 'Activo',         bg: 'var(--success-bg)', fg: 'var(--success-fg)', dot: 'var(--success-dot)' },
  EXPIRING_SOON:  { label: 'Vence pronto',   bg: 'var(--warning-bg)', fg: 'var(--warning-fg)', dot: 'var(--warning-dot)' },
  UNDERUTILIZED:  { label: 'Subutilizado',   bg: 'var(--info-bg)',    fg: 'var(--info-fg)',    dot: 'var(--info-dot)' },
  EXPIRED:        { label: 'Vencido',        bg: 'var(--neutral-bg)', fg: 'var(--neutral-fg)', dot: 'var(--neutral-dot)' },
}

function formatContainerType(type: string): string {
  const map: Record<string, string> = {
    FCL_20GP: "FCL 20'GP",
    FCL_40GP: "FCL 40'GP",
    FCL_40HC: "FCL 40'HC",
    FCL_40RF: "FCL 40'RF",
    LCL: 'LCL',
    AIR: 'Aéreo',
  }
  return map[type] || type
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
}

// Mock monthly usage data for the bar chart
function mockMonthlyUsage(contract: Contract): Array<{ month: string; teu: number }> {
  const monthly = contract.volumeUsedTeu / 6
  return [
    { month: 'Dic 25', teu: Math.round(monthly * 0.7) },
    { month: 'Ene 26', teu: Math.round(monthly * 0.85) },
    { month: 'Feb 26', teu: Math.round(monthly * 1.05) },
    { month: 'Mar 26', teu: Math.round(monthly * 1.2) },
    { month: 'Abr 26', teu: Math.round(monthly * 1.1) },
    { month: 'May 26', teu: Math.round(monthly * 1.1) },
  ]
}

export default function ContractDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/api/contracts/${id}`)
      .then((r) => {
        if (r.status === 404) throw new Error('NOT_FOUND')
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d) => setContract(d as Contract))
      .catch((err) => setError(err.message || 'Error de red'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Shell><div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Cargando contrato…</div></Shell>

  if (error === 'NOT_FOUND' || !contract) {
    return (
      <Shell>
        <div style={{ padding: '60px', textAlign: 'center', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: '12px' }}>
          <AlertTriangle size={32} style={{ color: 'var(--warning-fg)', margin: '0 auto 12px' }} />
          <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>Contrato no encontrado</h2>
          <p style={{ margin: '8px 0 20px', color: 'var(--text-tertiary)', fontSize: '13px' }}>
            <code>{id}</code> no existe.
          </p>
          <button
            onClick={() => router.push('/contracts')}
            style={{ padding: '10px 20px', background: 'var(--rumbo-navy)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            Volver a contratos
          </button>
        </div>
      </Shell>
    )
  }

  const status = STATUS_CONFIG[contract.status]
  const utilizationPct = contract.volumeCommittedTeu > 0
    ? Math.round((contract.volumeUsedTeu / contract.volumeCommittedTeu) * 100)
    : 0
  const remainingTeu = contract.volumeCommittedTeu - contract.volumeUsedTeu
  const monthly = mockMonthlyUsage(contract)
  const maxTeu = Math.max(...monthly.map((m) => m.teu)) || 1

  return (
    <Shell>
      <button
        onClick={() => router.push('/contracts')}
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
        Volver a contratos
      </button>

      {/* Hero */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          CONTRATO · {contract.carrier} · {formatContainerType(contract.containerType)}
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
          {contract.contractNumber}
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: '10px 0 0 0' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{contract.lane}</strong>
          {' · '}Vigencia: {formatDate(contract.validFrom)} → {formatDate(contract.validUntil)}
        </p>

        <div style={{ marginTop: '14px' }}>
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
        </div>
      </div>

      {/* Data grid */}
      <Section icon={<FileText size={16} />} title="Detalle del contrato">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <DataCell label="Carrier" value={contract.carrier} icon={<Anchor size={13} />} />
          <DataCell label="Container type" value={formatContainerType(contract.containerType)} />
          <DataCell label="Origen" value={contract.originPort} />
          <DataCell label="Destino" value={contract.destinationPort} />
          <DataCell label="Rate USD" value={`$${contract.rateUsd.toLocaleString()}`} icon={<DollarSign size={13} />} />
          <DataCell label="Volumen committed" value={`${contract.volumeCommittedTeu.toLocaleString()} TEU`} />
          <DataCell label="Vigencia desde" value={formatDate(contract.validFrom)} icon={<Calendar size={13} />} />
          <DataCell label="Vigencia hasta" value={formatDate(contract.validUntil)} icon={<Calendar size={13} />} />
        </div>
      </Section>

      {/* Utilization */}
      <Section icon={<TrendingUp size={16} />} title="Utilización" subtitle={`${contract.volumeUsedTeu} / ${contract.volumeCommittedTeu} TEU usados · ${utilizationPct}%`}>
        <div style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '24px 26px',
        }}>
          <div style={{
            height: '14px',
            background: 'var(--surface-app)',
            borderRadius: '999px',
            overflow: 'hidden',
            marginBottom: '12px',
          }}>
            <div style={{
              width: `${Math.min(utilizationPct, 100)}%`,
              height: '100%',
              background: utilizationPct > 95
                ? 'linear-gradient(90deg, var(--danger-fg), #DC2626)'
                : utilizationPct < 40
                  ? 'linear-gradient(90deg, var(--warning-fg), #D97706)'
                  : 'linear-gradient(90deg, var(--success-fg), #059669)',
              transition: 'width 300ms ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-tertiary)' }}>
            <span>0 TEU</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
              {remainingTeu > 0 ? `Quedan ${remainingTeu.toLocaleString()} TEU disponibles` : 'Volumen completado'}
            </span>
            <span>{contract.volumeCommittedTeu.toLocaleString()} TEU</span>
          </div>
        </div>
      </Section>

      {/* Monthly chart */}
      <Section icon={<BarChart3 size={16} />} title="Uso histórico" subtitle="TEUs ejecutados por mes (mock data)">
        <div style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <svg viewBox="0 0 600 180" style={{ width: '100%', height: '180px' }}>
            {monthly.map((m, idx) => {
              const barWidth = 60
              const gap = 30
              const x = idx * (barWidth + gap) + 20
              const heightRatio = m.teu / maxTeu
              const barHeight = heightRatio * 120
              const y = 140 - barHeight
              return (
                <g key={idx}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={idx === monthly.length - 1 ? 'var(--rumbo-coral)' : 'var(--rumbo-navy)'}
                    rx={4}
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 6}
                    textAnchor="middle"
                    fontSize="11"
                    fill="var(--text-secondary)"
                    fontWeight="600"
                  >
                    {m.teu}
                  </text>
                  <text
                    x={x + barWidth / 2}
                    y={160}
                    textAnchor="middle"
                    fontSize="10"
                    fill="var(--text-tertiary)"
                  >
                    {m.month}
                  </text>
                </g>
              )
            })}
            <line x1="0" y1="140" x2="600" y2="140" stroke="var(--border-default)" strokeWidth="1" />
          </svg>
        </div>
      </Section>

      {/* Operaciones asociadas (hardcoded for demo) */}
      <Section icon={<FileText size={16} />} title="Operaciones asociadas" subtitle="Operaciones que consumen volumen de este contrato">
        <div style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '16px 20px',
        }}>
          {contract.contractNumber === 'CTR-MSC-2026-Q2' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <AssociatedOp code="OP-23714" client="Andes Trading SA" teu={1} note="Cerrada · 1×40HC" />
              <AssociatedOp code="OP-0142" client="Importadora del Sur SA" teu={1} note="En tránsito · ETA 5 may" />
              <AssociatedOp code="Q-0204" client="Andes Trading SA" teu={1} note="Cotización pendiente · 1×40HC" />
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '12px 0' }}>
              No hay operaciones asociadas a este contrato en la ventana actual.
            </div>
          )}
        </div>
      </Section>

      {/* Notes */}
      {contract.notes && (
        <Section icon={<FileText size={16} />} title="Notas">
          <div style={{
            background: 'linear-gradient(135deg, var(--rumbo-navy-soft), var(--surface-card))',
            border: '1px solid var(--rumbo-navy)',
            borderLeft: '4px solid var(--rumbo-navy)',
            borderRadius: '12px',
            padding: '16px 20px',
            fontSize: '13.5px',
            color: 'var(--text-primary)',
            lineHeight: 1.6,
          }}>
            {contract.notes}
          </div>
        </Section>
      )}
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-app)' }}>
      <Sidebar />
      <main style={{ marginLeft: '240px', padding: '40px 48px', maxWidth: '1200px' }}>
        {children}
      </main>
    </div>
  )
}

function Section({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: 'var(--rumbo-navy-soft)',
          color: 'var(--rumbo-navy)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-tertiary)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  )
}

function DataCell({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
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
        {icon}{label}
      </div>
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  )
}

function AssociatedOp({ code, client, teu, note }: { code: string; client: string; teu: number; note: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 14px',
      background: 'var(--surface-app)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '8px',
    }}>
      <div>
        <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '12.5px', fontWeight: 600, color: 'var(--rumbo-navy)' }}>
          {code}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          {client} · {note}
        </div>
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
        {teu} TEU
      </div>
    </div>
  )
}
