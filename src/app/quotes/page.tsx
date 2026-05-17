'use client'

import { useEffect, useMemo, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  Mail,
  MessageCircle,
  Globe,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Ship,
  FileText,
  Send,
  TrendingUp,
  Inbox,
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import DemoModeButton from '@/components/demo-mode/DemoModeButton'
import { Toast, DemoSummary } from '@/components/demo-mode/DemoModeOverlay'
import { getCountryFlag } from '@/components/index'
import type { Quote, QuoteStatus, QuoteChannel } from '@/types/quote'

// Default a Railway prod (mismo patrón que /today). Override con
// NEXT_PUBLIC_API_URL para apuntar a backend local en dev.
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://web-production-ad432.up.railway.app'

// ============================================================================
// DEMO MODE — secuencia de 90s para /quotes
// ============================================================================

const QUOTES_TOASTS: Toast[] = [
  { delaySec: 0,  type: 'info',    icon: <Mail size={16} />,          title: "Email entrante de Jorge Méndez (Andes Trading SA): cotización 1×40'HC Hamburgo → Buenos Aires" },
  { delaySec: 8,  type: 'working', icon: <Bot size={16} />,           title: 'READ parseando email · Cliente identificado: Andes Trading SA (recurrente, 3 operaciones cerradas este año)' },
  { delaySec: 15, type: 'success', icon: <CheckCircle2 size={16} />,  title: 'READ extracted 8 campos · 98% confidence · Repuestos automotores, NCM 8708.30.90, 18,400 kg, FOB' },
  { delaySec: 22, type: 'working', icon: <FileText size={16} />,      title: 'QUOTE consultando contratos internos · Contratos activos detectados: CTR-MSC-2026-Q2 + CTR-HL-2026-H1' },
  { delaySec: 30, type: 'working', icon: <Ship size={16} />,          title: 'QUOTE consultando tarifas spot · MSC, Maersk, Hapag-Lloyd, CMA-CGM' },
  { delaySec: 38, type: 'success', icon: <CheckCircle2 size={16} />,  title: 'QUOTE comparando 4 opciones · Mejor combinación: MSC contrato $3,800 (preserva 240 TEU comprometidos)' },
  { delaySec: 48, type: 'info',    icon: <AlertTriangle size={16} />, title: 'QUOTE evaluando alternativas · Maersk spot $3,720 descartado (no preserva contrato)' },
  { delaySec: 58, type: 'working', icon: <Bot size={16} />,           title: 'QUOTE calculando surcharges Hamburgo-BUE · BAF $180, THC $335, doc fee $85, ISPS $25' },
  { delaySec: 68, type: 'working', icon: <Bot size={16} />,           title: 'QUOTE generando borrador de email · Tono ajustado para cliente recurrente (tutea)' },
  { delaySec: 78, type: 'working', icon: <Bot size={16} />,           title: 'QUOTE aplicando markup 12% (histórico de Andes Trading: 10-15%)' },
  { delaySec: 85, type: 'success', icon: <CheckCircle2 size={16} />,  title: 'Cotización lista: $4,881 USD final · 4 carriers comparados · 1m 30s total' },
]

const QUOTES_SUMMARY: DemoSummary = {
  eyebrow: '1 minuto 30 segundos',
  title: '45 minutos ahorrados vs manual',
  body: (
    <>
      Rumbo procesó <strong>el email de Andes Trading</strong>, comparó{' '}
      <strong>4 carriers</strong>, recomendó MSC para preservar el contrato anual,
      calculó surcharges y dejó el draft listo en sales con{' '}
      <strong>$4,881 USD finales</strong>.
      <br />
      <br />
      <strong>Tiempo del operador: 0 minutos.</strong>
    </>
  ),
}

// ============================================================================
// CONFIG: STATUS → estilo + label
// ============================================================================

const STATUS_CONFIG: Record<QuoteStatus, { label: string; bg: string; fg: string; dot: string }> = {
  WAITING_FOR_DATA:     { label: 'Esperando info',     bg: 'var(--warning-bg)', fg: 'var(--warning-fg)', dot: 'var(--warning-dot)' },
  READY_TO_QUOTE:       { label: 'Lista para cotizar', bg: 'var(--success-bg)', fg: 'var(--success-fg)', dot: 'var(--success-dot)' },
  QUOTED_DRAFT:         { label: 'Cotizada (draft)',   bg: 'var(--info-bg)',    fg: 'var(--info-fg)',    dot: 'var(--info-dot)' },
  SENT_AWAITING_CLIENT: { label: 'Enviada',            bg: 'var(--neutral-bg)', fg: 'var(--neutral-fg)', dot: 'var(--neutral-dot)' },
  ACCEPTED:             { label: 'Aceptada',           bg: 'var(--success-bg)', fg: 'var(--success-fg)', dot: 'var(--success-dot)' },
  LOST:                 { label: 'Perdida',            bg: 'var(--danger-bg)',  fg: 'var(--danger-fg)',  dot: 'var(--danger-dot)' },
}

const CHANNEL_CONFIG: Record<QuoteChannel, { label: string; icon: ReactNode }> = {
  EMAIL:    { label: 'Email',    icon: <Mail size={13} /> },
  WHATSAPP: { label: 'WhatsApp', icon: <MessageCircle size={13} /> },
  WEB_FORM: { label: 'Web',      icon: <Globe size={13} /> },
}

const ACTION_BY_STATUS: Record<QuoteStatus, string> = {
  WAITING_FOR_DATA:     'Pedir info',
  READY_TO_QUOTE:       'Cotizar',
  QUOTED_DRAFT:         'Aprobar y enviar',
  SENT_AWAITING_CLIENT: 'Follow-up',
  ACCEPTED:             'Ver',
  LOST:                 'Ver',
}

// ============================================================================
// FILTERS
// ============================================================================

type StatusFilter = 'ALL' | 'WAITING' | 'READY' | 'SENT' | 'CLOSED'
type ClientFilter = 'ALL' | 'RECURRING' | 'NEW'
type ChannelFilter = 'ALL' | QuoteChannel

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string; statuses: QuoteStatus[] }> = [
  { value: 'ALL',     label: 'Todos',               statuses: [] },
  { value: 'WAITING', label: 'Esperando info',      statuses: ['WAITING_FOR_DATA'] },
  { value: 'READY',   label: 'Listas para cotizar', statuses: ['READY_TO_QUOTE'] },
  { value: 'SENT',    label: 'Enviadas',            statuses: ['QUOTED_DRAFT', 'SENT_AWAITING_CLIENT'] },
  { value: 'CLOSED',  label: 'Cerradas',            statuses: ['ACCEPTED', 'LOST'] },
]

// ============================================================================
// HELPERS
// ============================================================================

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} min`
  const hours = Math.floor(mins / 60)
  const remMins = mins % 60
  if (hours < 24) return remMins > 0 ? `${hours}h ${remMins}min` : `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

function formatContainerType(type?: string | null, count?: number | null): string {
  if (!type) return '—'
  const c = count || 1
  const map: Record<string, string> = {
    FCL_20GP: `FCL ${c}×20'GP`,
    FCL_40GP: `FCL ${c}×40'GP`,
    FCL_40HC: `FCL ${c}×40'HC`,
    FCL_40RF: `FCL ${c}×40'RF`,
    LCL:      'LCL',
    AIR:      'Aéreo',
  }
  return map[type] || `${type}${c > 1 ? ` ×${c}` : ''}`
}

function formatRoute(quote: Quote): string {
  const o = quote.origin || '—'
  const d = quote.destination || '—'
  const oFlag = quote.originCountry ? getCountryFlag(quote.originCountry) + ' ' : ''
  const dFlag = quote.destinationCountry ? getCountryFlag(quote.destinationCountry) + ' ' : ''
  return `${oFlag}${o} → ${dFlag}${d}`
}

function formatUsd(n?: number | null): string {
  if (n == null) return '—'
  return `USD ${n.toLocaleString('en-US')}`
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function QuotesPage() {
  const router = useRouter()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [clientFilter, setClientFilter] = useState<ClientFilter>('ALL')
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('ALL')

  useEffect(() => {
    fetch(`${API_URL}/api/quotes`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} from ${API_URL}/api/quotes`)
        return r.json()
      })
      .then((d) => {
        if (Array.isArray(d)) {
          setQuotes(d as Quote[])
        } else {
          console.error('Expected array from /api/quotes, got:', d)
          setError('Respuesta inválida del servidor')
        }
      })
      .catch((err) => {
        console.error('Failed to fetch quotes:', err)
        setError(err.message || 'Error de red')
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return quotes.filter((q) => {
      const statusEntry = STATUS_FILTERS.find((f) => f.value === statusFilter)!
      if (statusFilter !== 'ALL' && !statusEntry.statuses.includes(q.status)) return false
      if (clientFilter === 'RECURRING' && q.isNewClient) return false
      if (clientFilter === 'NEW' && !q.isNewClient) return false
      if (channelFilter !== 'ALL' && q.channel !== channelFilter) return false
      return true
    })
  }, [quotes, statusFilter, clientFilter, channelFilter])

  const activeCount = quotes.filter((q) => q.status !== 'ACCEPTED' && q.status !== 'LOST').length
  const awaitingCount = quotes.filter((q) => q.status === 'SENT_AWAITING_CLIENT').length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-app)' }}>
      <Sidebar />

      <main style={{ marginLeft: '240px', padding: '40px 48px', maxWidth: '1280px' }}>
        {/* ============ HEADER ============ */}
        <div style={{
          marginBottom: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '24px',
        }}>
          <div>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.02em',
            }}>
              Cotizaciones <span style={{ color: 'var(--rumbo-coral)' }}>·</span>{' '}
              <span style={{
                background: 'linear-gradient(135deg, var(--rumbo-navy), var(--rumbo-coral))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Sales
              </span>
            </h1>
            <p style={{
              fontSize: '15px',
              color: 'var(--text-tertiary)',
              margin: '8px 0 0 0',
            }}>
              <strong style={{ color: 'var(--text-secondary)' }}>{activeCount}</strong> requests activas
              {' · '}
              <strong style={{ color: 'var(--text-secondary)' }}>{awaitingCount}</strong> esperando respuesta del cliente
            </p>
          </div>
          <DemoModeButton
            toasts={QUOTES_TOASTS}
            durationSec={90}
            summary={QUOTES_SUMMARY}
            label="Demo Mode · 90s"
          />
        </div>

        {/* ============ ERROR BANNER ============ */}
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
            <strong>No se pudieron cargar las cotizaciones.</strong> {error}.
            Verificá que el backend tenga el endpoint <code>/api/quotes</code> deployado.
          </div>
        )}

        {/* ============ SECTION: PERFORMANCE ============ */}
        <Section icon="✨" iconBg="var(--rumbo-coral-soft)" iconFg="var(--rumbo-coral)" title="Performance" subtitle="Lo que pasó hoy y lo que está en sales">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '14px',
          }}>
            <KpiCard label="Hoy" value="18" subtext="cotizaciones · 14h ahorradas" accent="navy" />
            <KpiCard label="Win rate 30d" value="31%" subtext="+7% vs trimestre" accent="coral" />
            <KpiCard label="Tiempo promedio" value="1m 40s" subtext="vs 45min manual" accent="navy" />
            <KpiCard label="En carrera" value="$87,400" subtext="USD activos" accent="coral" />
          </div>
        </Section>

        {/* ============ SECTION: LISTADO ============ */}
        <Section icon={<Inbox size={18} />} iconBg="var(--rumbo-navy-soft)" iconFg="var(--rumbo-navy)" title="Cotizaciones activas" subtitle={loading ? 'Cargando...' : `${filtered.length} de ${quotes.length} mostradas`}>
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
            <FilterRow
              label="Estado"
              value={statusFilter}
              options={STATUS_FILTERS.map((f) => ({ value: f.value, label: f.label }))}
              onChange={(v) => setStatusFilter(v as StatusFilter)}
            />
            <FilterRow
              label="Cliente"
              value={clientFilter}
              options={[
                { value: 'ALL',       label: 'Todos' },
                { value: 'RECURRING', label: 'Recurrentes' },
                { value: 'NEW',       label: 'Nuevos' },
              ]}
              onChange={(v) => setClientFilter(v as ClientFilter)}
            />
            <FilterRow
              label="Canal"
              value={channelFilter}
              options={[
                { value: 'ALL',      label: 'Todos' },
                { value: 'WHATSAPP', label: 'WhatsApp' },
                { value: 'EMAIL',    label: 'Email' },
                { value: 'WEB_FORM', label: 'Web' },
              ]}
              onChange={(v) => setChannelFilter(v as ChannelFilter)}
            />
          </div>

          {/* Table / empty / loading */}
          {loading && (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              background: 'var(--surface-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '10px',
              color: 'var(--text-tertiary)',
              fontSize: '14px',
            }}>
              Cargando cotizaciones…
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              background: 'var(--surface-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '10px',
              color: 'var(--text-tertiary)',
              fontSize: '14px',
            }}>
              No hay cotizaciones que coincidan con estos filtros.
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
                  <tr style={{
                    background: 'var(--surface-hover)',
                    borderBottom: '1px solid var(--border-default)',
                  }}>
                    <Th>Status</Th>
                    <Th>Quote</Th>
                    <Th>Cliente</Th>
                    <Th>Ruta</Th>
                    <Th>Tipo</Th>
                    <Th>Canal</Th>
                    <Th>Recibido</Th>
                    <Th align="right">Cotización</Th>
                    <Th align="right">Acción</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((q) => (
                    <QuoteRow key={q.id} quote={q} onClick={() => router.push(`/quotes/${q.quoteCode}`)} />
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

// ============================================================================
// SUB-COMPONENTES
// ============================================================================

function Section({
  icon,
  iconBg,
  iconFg,
  title,
  subtitle,
  children,
}: {
  icon: ReactNode
  iconBg: string
  iconFg: string
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <section style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: iconBg,
          color: iconFg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <h2 style={{
            fontSize: '17px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
            letterSpacing: '-0.01em',
          }}>
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

function KpiCard({
  label,
  value,
  subtext,
  accent = 'navy',
}: {
  label: string
  value: string
  subtext: string
  accent?: 'navy' | 'coral'
}) {
  const accentColor = accent === 'coral' ? 'var(--rumbo-coral)' : 'var(--rumbo-navy)'
  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: '12px',
      padding: '20px 22px',
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
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--text-tertiary)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '10px',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '30px',
        fontWeight: 700,
        color: 'var(--text-primary)',
        lineHeight: 1,
        letterSpacing: '-0.02em',
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '12.5px',
        color: 'var(--text-tertiary)',
        marginTop: '10px',
        lineHeight: 1.4,
      }}>
        {subtext}
      </div>
    </div>
  )
}

function FilterRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (v: string) => void
}) {
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
                boxShadow: active ? '0 1px 3px rgba(30, 58, 123, 0.25)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'var(--surface-hover)'
                  e.currentTarget.style.borderColor = 'var(--rumbo-navy)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'var(--surface-card)'
                  e.currentTarget.style.borderColor = 'var(--border-strong)'
                }
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

function Th({ children, align = 'left' }: { children: ReactNode; align?: 'left' | 'right' }) {
  return (
    <th style={{
      padding: '12px 16px',
      textAlign: align,
      fontSize: '11px',
      fontWeight: 600,
      color: 'var(--text-tertiary)',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
    }}>
      {children}
    </th>
  )
}

function QuoteRow({ quote, onClick }: { quote: Quote; onClick: () => void }) {
  const status = STATUS_CONFIG[quote.status]
  const channel = CHANNEL_CONFIG[quote.channel]
  const action = ACTION_BY_STATUS[quote.status]

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
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: status.dot }} />
          {status.label}
        </span>
      </td>
      <td style={{ padding: '14px 16px', fontFamily: 'ui-monospace, monospace', fontSize: '12.5px', color: 'var(--text-primary)', fontWeight: 600 }}>
        {quote.quoteCode}
      </td>
      <td style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{quote.clientName}</span>
          {quote.isNewClient && (
            <span style={{
              fontSize: '10px',
              fontWeight: 600,
              padding: '2px 6px',
              background: 'var(--rumbo-coral-soft)',
              color: 'var(--rumbo-coral)',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Nuevo
            </span>
          )}
        </div>
      </td>
      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
        {formatRoute(quote)}
      </td>
      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
        {formatContainerType(quote.containerType, quote.containerCount)}
      </td>
      <td style={{ padding: '14px 16px' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 8px',
          background: 'var(--neutral-bg)',
          color: 'var(--neutral-fg)',
          borderRadius: '6px',
          fontSize: '11.5px',
          fontWeight: 500,
        }}>
          {channel.icon}
          {channel.label}
        </span>
      </td>
      <td style={{ padding: '14px 16px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
        hace {timeAgo(quote.receivedAt)}
      </td>
      <td style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
        {formatUsd(quote.quoteFinalUsd)}
      </td>
      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '5px 10px',
          background: 'var(--rumbo-navy-soft)',
          color: 'var(--rumbo-navy)',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
        }}>
          <Send size={11} />
          {action}
        </span>
      </td>
    </tr>
  )
}
