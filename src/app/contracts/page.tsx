'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Anchor, TrendingUp, AlertTriangle, Clock, FileText } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import type { Contract, ContractStatus } from '@/types/contract'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-ad432.up.railway.app'

const STATUS_CONFIG: Record<ContractStatus, { label: string; bg: string; fg: string; dot: string }> = {
  ACTIVE:         { label: 'Activo',         bg: 'var(--success-bg)', fg: 'var(--success-fg)', dot: 'var(--success-dot)' },
  EXPIRING_SOON:  { label: 'Vence pronto',   bg: 'var(--warning-bg)', fg: 'var(--warning-fg)', dot: 'var(--warning-dot)' },
  UNDERUTILIZED:  { label: 'Subutilizado',   bg: 'var(--info-bg)',    fg: 'var(--info-fg)',    dot: 'var(--info-dot)' },
  EXPIRED:        { label: 'Vencido',        bg: 'var(--neutral-bg)', fg: 'var(--neutral-fg)', dot: 'var(--neutral-dot)' },
}

const STATUS_FILTERS: Array<{ value: 'ALL' | ContractStatus; label: string }> = [
  { value: 'ALL',            label: 'Todos' },
  { value: 'ACTIVE',         label: 'Activos' },
  { value: 'EXPIRING_SOON',  label: 'Vencen pronto' },
  { value: 'UNDERUTILIZED',  label: 'Subutilizados' },
  { value: 'EXPIRED',        label: 'Vencidos' },
]

function formatContainerType(type: string): string {
  const map: Record<string, string> = {
    FCL_20GP: "20'GP",
    FCL_40GP: "40'GP",
    FCL_40HC: "40'HC",
    FCL_40RF: "40'RF",
    LCL: 'LCL',
    AIR: 'Aéreo',
  }
  return map[type] || type
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export default function ContractsPage() {
  const router = useRouter()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'ALL' | ContractStatus>('ALL')
  const [carrierFilter, setCarrierFilter] = useState<string>('ALL')

  useEffect(() => {
    fetch(`${API_URL}/api/contracts`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then((d) => { if (Array.isArray(d)) setContracts(d as Contract[]); else setError('Respuesta inválida') })
      .catch((err) => setError(err.message || 'Error de red'))
      .finally(() => setLoading(false))
  }, [])

  const carriers = useMemo(() => {
    const set = new Set(contracts.map((c) => c.carrier))
    return ['ALL', ...Array.from(set).sort()]
  }, [contracts])

  const filtered = useMemo(() => {
    return contracts.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false
      if (carrierFilter !== 'ALL' && c.carrier !== carrierFilter) return false
      return true
    })
  }, [contracts, statusFilter, carrierFilter])

  const totalCommitted = contracts.reduce((sum, c) => c.status !== 'EXPIRED' ? sum + c.volumeCommittedTeu : sum, 0)
  const totalUsed = contracts.reduce((sum, c) => c.status !== 'EXPIRED' ? sum + c.volumeUsedTeu : sum, 0)
  const expiringCount = contracts.filter((c) => c.status === 'EXPIRING_SOON').length
  const underutilizedCount = contracts.filter((c) => c.status === 'UNDERUTILIZED').length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-app)' }}>
      <Sidebar />
      <main style={{ marginLeft: '240px', padding: '40px 48px', maxWidth: '1400px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Contratos <span style={{ color: 'var(--rumbo-coral)' }}>·</span>{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--rumbo-navy), var(--rumbo-coral))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Pricing
            </span>
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-tertiary)', margin: '8px 0 0 0' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>{contracts.length}</strong> contratos
            {' · '}
            <strong style={{ color: 'var(--text-secondary)' }}>{expiringCount}</strong> vencen pronto
            {' · '}
            <strong style={{ color: 'var(--text-secondary)' }}>{underutilizedCount}</strong> subutilizados
          </p>
        </div>

        {error && !loading && (
          <div style={{
            marginBottom: '24px',
            padding: '14px 18px',
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-fg)',
            borderLeft: '4px solid var(--danger-fg)',
            borderRadius: '10px',
            color: 'var(--danger-fg)',
            fontSize: '13px',
          }}>
            <strong>No se pudieron cargar los contratos.</strong> {error}.
          </div>
        )}

        {/* KPIs */}
        <Section icon={<TrendingUp size={18} />} title="Resumen" subtitle="Volumen comprometido vs utilizado en contratos activos">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '14px',
          }}>
            <KpiCard icon={<Anchor size={16} />} label="Total comprometido" value={`${totalCommitted.toLocaleString()} TEU`} subtext="en contratos no vencidos" accent="navy" />
            <KpiCard icon={<TrendingUp size={16} />} label="Total utilizado" value={`${totalUsed.toLocaleString()} TEU`} subtext={`${totalCommitted > 0 ? Math.round((totalUsed / totalCommitted) * 100) : 0}% de utilización`} accent="coral" />
            <KpiCard icon={<Clock size={16} />} label="Vencen 30 días" value={expiringCount.toString()} subtext="renegociar ya" accent="coral" />
            <KpiCard icon={<AlertTriangle size={16} />} label="Subutilizados" value={underutilizedCount.toString()} subtext="riesgo de penalty" accent="navy" />
          </div>
        </Section>

        <Section icon={<FileText size={18} />} title="Contratos" subtitle={loading ? 'Cargando...' : `${filtered.length} de ${contracts.length}`}>
          {/* Filters */}
          <div style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '10px',
            padding: '16px 20px',
            marginBottom: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <FilterRow label="Estado" value={statusFilter} onChange={(v) => setStatusFilter(v as any)} options={STATUS_FILTERS.map((f) => ({ value: f.value, label: f.label }))} />
            <FilterRow label="Carrier" value={carrierFilter} onChange={setCarrierFilter} options={carriers.map((c) => ({ value: c, label: c === 'ALL' ? 'Todos' : c }))} />
          </div>

          {/* Table */}
          {loading && (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              background: 'var(--surface-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '10px',
              color: 'var(--text-tertiary)',
            }}>
              Cargando contratos...
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              background: 'var(--surface-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '10px',
              color: 'var(--text-tertiary)',
            }}>
              No hay contratos que coincidan con estos filtros.
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border-default)' }}>
                    <Th>Carrier</Th>
                    <Th>Contrato</Th>
                    <Th>Ruta</Th>
                    <Th>Tipo de contenedor</Th>
                    <Th align="right">Tarifa</Th>
                    <Th>Uso</Th>
                    <Th>Vigente hasta</Th>
                    <Th>Estado</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <ContractRow key={c.id} contract={c} onClick={() => router.push(`/contracts/${c.contractNumber}`)} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </main>
    </div>
  )
}

function ContractRow({ contract, onClick }: { contract: Contract; onClick: () => void }) {
  const status = STATUS_CONFIG[contract.status]
  const utilizationPct = contract.volumeCommittedTeu > 0
    ? Math.round((contract.volumeUsedTeu / contract.volumeCommittedTeu) * 100)
    : 0
  const days = daysUntil(contract.validUntil)

  return (
    <tr
      onClick={onClick}
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        cursor: 'pointer',
        transition: 'background 120ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      <td style={{ padding: '14px 16px' }}>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{contract.carrier}</div>
      </td>
      <td style={{ padding: '14px 16px', fontFamily: 'ui-monospace, monospace', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
        {contract.contractNumber}
      </td>
      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
        {contract.lane}
      </td>
      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
        {formatContainerType(contract.containerType)}
      </td>
      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
        ${contract.rateUsd.toLocaleString()}
      </td>
      <td style={{ padding: '14px 16px', minWidth: '180px' }}>
        <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
          {contract.volumeUsedTeu} / {contract.volumeCommittedTeu} TEU · {utilizationPct}%
        </div>
        <div style={{
          height: '6px',
          background: 'var(--surface-app)',
          borderRadius: '999px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${Math.min(utilizationPct, 100)}%`,
            height: '100%',
            background: utilizationPct > 95
              ? 'var(--danger-fg)'
              : utilizationPct < 40
                ? 'var(--warning-fg)'
                : 'var(--success-fg)',
            transition: 'width 200ms ease',
          }} />
        </div>
      </td>
      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        <div style={{ fontSize: '12.5px' }}>{formatDate(contract.validUntil)}</div>
        {contract.status !== 'EXPIRED' && (
          <div style={{ fontSize: '10.5px', color: days < 45 ? 'var(--warning-fg)' : 'var(--text-tertiary)', marginTop: '2px' }}>
            {days > 0 ? `en ${days}d` : `hace ${-days}d`}
          </div>
        )}
      </td>
      <td style={{ padding: '14px 16px' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          background: status.bg,
          color: status.fg,
          borderRadius: '999px',
          fontSize: '11.5px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: status.dot }} />
          {status.label}
        </span>
      </td>
    </tr>
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
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: accentColor }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '7px',
          background: accent === 'coral' ? 'var(--rumbo-coral-soft)' : 'var(--rumbo-navy-soft)',
          color: accentColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
      <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
        {subtext}
      </div>
    </div>
  )
}

function FilterRow({ label, value, options, onChange }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={{
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--text-tertiary)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        minWidth: '70px',
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {options.map((opt) => {
          const active = opt.value === value
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              style={{
                padding: '7px 14px',
                background: active ? 'var(--rumbo-navy)' : 'var(--surface-card)',
                color: active ? 'white' : 'var(--text-secondary)',
                border: active ? '1px solid var(--rumbo-navy)' : '1px solid var(--border-strong)',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: active ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
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

function Section({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
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
          <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  )
}
