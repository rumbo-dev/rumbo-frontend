'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MoreHorizontal, Send, Mail, FileText, AlertCircle, Check, Sparkles, Container, Anchor, MapPin, Clock, ChevronRight, ChevronDown, Edit3, X, Activity, Calendar, MessageSquare } from 'lucide-react'
import { StatusBadge, Button, Card, TeamAvatar, getCountryFlag, getCountryNameES } from '@/components/index'
import Sidebar from '@/components/Sidebar'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// ============================================================================
// TYPES
// ============================================================================

interface Operation {
  id: string
  operationCode: string
  containerNumber?: string | null
  status: string
  subStatus: string
  currentOwner: string
  awaitingFor?: string | null
  isActionRequired?: boolean
  actionRequiredFrom?: string | null
  actionRequiredReason?: string | null
  isDelayed?: boolean
  delayReason?: string | null
  originPort?: string | null
  originCountry?: string | null
  destinationPort?: string | null
  destinationCountry?: string | null
  weightKg?: number | null
  cbm?: number | null
  incoterm?: string | null
  mode?: string
  clientName: string
  clientEmail?: string
  shippingLine?: string | null
  vessel?: string | null
  bookingNumber?: string | null
  blNumber?: string | null
  costEstimate?: number | null
  costActual?: number | null
  eta?: string | null
  etd?: string | null
  priority: string
  notes?: string | null
  createdAt: string
  tasks: Task[]
  journeySteps: JourneyStep[]
  timelineEvents: TimelineEvent[]
}

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  actionType?: string
  responsibleTeam?: string
  responsibleParty?: string
  emailIntent?: string
  createdByAi: boolean
  aiConfidence?: number
  aiReasoning?: string
  createdAt: string
}

interface JourneyStep {
  id: string
  stepNumber: number
  stepName: string
  description?: string
  status: string
  narrativeNote?: string | null
  estimatedDate?: string | null
  actualDate?: string | null
}

interface TimelineEvent {
  id: string
  title: string
  description?: string
  eventType: string
  source?: string
  sourceTeam?: string
  timestamp: string
}

interface EmailDraft {
  id: string
  to: string
  subject: string
  body: string
  status: 'DRAFT' | 'APPROVED' | 'SENT' | 'REJECTED'
  aiReasoning?: string
  recipientType?: string
  intent?: string
  createdAt: string
}

// ============================================================================
// CONFIG
// ============================================================================

// Sub-status display config: label + color
const SUB_STATUS_CONFIG: Record<string, { label: string; bg: string; fg: string; dotColor: string }> = {
  // QUOTING
  NEW_QUOTE: { label: 'Nueva cotización', bg: '#EEF1F8', fg: '#1E3A7B', dotColor: '#1E3A7B' },
  QUOTE_REQUESTED: { label: 'Cotización solicitada', bg: '#EEF1F8', fg: '#1E3A7B', dotColor: '#1E3A7B' },
  READY_TO_QUOTE: { label: 'Lista para cotizar', bg: '#EEF1F8', fg: '#1E3A7B', dotColor: '#1E3A7B' },
  QUOTED: { label: 'Cotizada', bg: '#FFFBEB', fg: '#854F0B', dotColor: '#EF9F27' },
  CONFIRMED: { label: 'Confirmada', bg: '#ECFDF5', fg: '#047857', dotColor: '#047857' },
  REJECTED: { label: 'Rechazada', bg: '#FCEBEB', fg: '#A32D2D', dotColor: '#A32D2D' },
  // BOOKING
  BOOKING_PENDING: { label: 'Booking pendiente', bg: '#FFF1EC', fg: '#993C1D', dotColor: '#F47A5A' },
  BOOKING_RECEIVED: { label: 'Booking recibido', bg: '#FFF1EC', fg: '#993C1D', dotColor: '#F47A5A' },
  BOOKING_CONFIRMED: { label: 'Booking confirmado', bg: '#ECFDF5', fg: '#047857', dotColor: '#047857' },
  DOCS_PENDING: { label: 'Documentos pendientes', bg: '#FFFBEB', fg: '#854F0B', dotColor: '#EF9F27' },
  DOCS_APPROVED: { label: 'Documentos aprobados', bg: '#ECFDF5', fg: '#047857', dotColor: '#047857' },
  // IN_TRANSIT
  ON_BOARD: { label: 'A bordo', bg: '#EEF1F8', fg: '#1E3A7B', dotColor: '#1E3A7B' },
  DOCS_READY: { label: 'Documentos listos', bg: '#ECFDF5', fg: '#047857', dotColor: '#047857' },
  // AT_DESTINATION
  ARRIVED: { label: 'Arribada', bg: '#ECFDF5', fg: '#047857', dotColor: '#047857' },
  MANIFEST_PENDING: { label: 'Manifiesto pendiente', bg: '#FFFBEB', fg: '#854F0B', dotColor: '#EF9F27' },
  DESTINATION_PENDING: { label: 'Pendiente en destino', bg: '#FFFBEB', fg: '#854F0B', dotColor: '#EF9F27' },
  // CLOSED
  COMPLETED: { label: 'Completada', bg: '#F1EFE8', fg: '#5F5E5A', dotColor: '#888780' },
}

const STATUS_TO_PROGRESS: Record<string, number> = {
  QUOTING: 0,
  BOOKING: 0.05,
  IN_TRANSIT: 0.5,  // dummy mid-transit; in V2 we use real tracking
  AT_DESTINATION: 0.95,
  CLOSED: 1.0,
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function OperationPage() {
  const params = useParams()
  const router = useRouter()
  const operationId = params.id as string

  const [operation, setOperation] = useState<Operation | null>(null)
  const [drafts, setDrafts] = useState<EmailDraft[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOperation()
    fetchDrafts()
  }, [operationId])

  const fetchOperation = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/operations/${operationId}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed')
      setOperation(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDrafts = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/emails/drafts/${operationId}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setDrafts(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  const handleApprove = async (draftId: string) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`${API_URL}/api/emails/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ draftId }),
      })
      fetchDrafts()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface-app)' }}>
        <Sidebar />
        <div style={{ marginLeft: '240px', padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          Cargando...
        </div>
      </div>
    )
  }

  if (!operation) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface-app)' }}>
        <Sidebar />
        <div style={{ marginLeft: '240px', padding: '32px', textAlign: 'center' }}>
          Operación no encontrada
        </div>
      </div>
    )
  }

  const subStatusInfo = SUB_STATUS_CONFIG[operation.subStatus] || SUB_STATUS_CONFIG.BOOKING_PENDING
  const progress = STATUS_TO_PROGRESS[operation.status] ?? 0.1

  const pendingTasks = operation.tasks.filter((t) => t.status === 'PENDING')
  const aiTasks = pendingTasks.filter((t) => t.createdByAi)
  const pendingDrafts = drafts.filter((d) => d.status === 'DRAFT')
  const totalSuggestions = pendingDrafts.length + aiTasks.length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-app)' }}>
      <Sidebar />

      <div style={{ marginLeft: '240px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 40px 48px' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
            <button
              onClick={() => router.push('/dashboard')}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 0, fontSize: '13px' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
            >
              Operaciones
            </button>
            <ChevronRight size={12} />
            <span style={{ color: 'var(--text-primary)' }}>{operation.operationCode}</span>
          </div>

          {/* ============ HERO ============ */}
          <HeroSection operation={operation} subStatusInfo={subStatusInfo} progress={progress} />

          {/* ============ TWO-COLUMN GRID: Suggestions + Timeline ============ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px', marginTop: '20px' }}>

            {/* LEFT: AI Suggestions */}
            <SectionCard
              title="Sugerencias de Rumbo"
              subtitle={
                totalSuggestions === 0
                  ? 'Sin nuevas acciones por revisar'
                  : `${totalSuggestions} ${totalSuggestions === 1 ? 'lista para revisar' : 'listas para revisar'}`
              }
              icon={<Sparkles size={15} strokeWidth={1.8} />}
              iconBg="linear-gradient(135deg, var(--rumbo-navy), var(--rumbo-coral))"
              iconColor="white"
            >
              {totalSuggestions === 0 ? (
                <EmptyStateInline
                  icon={<Sparkles size={24} strokeWidth={1.5} style={{ color: 'var(--text-quaternary)' }} />}
                  title="Todo al día"
                  description="Rumbo no detectó acciones pendientes en esta operación. Cuando llegue una nueva comunicación, las sugerencias aparecerán acá."
                />
              ) : (
                <div>
                  {pendingDrafts.map((draft) => (
                    <DraftItem key={draft.id} draft={draft} onApprove={() => handleApprove(draft.id)} />
                  ))}
                  {aiTasks.map((task) => (
                    <TaskSuggestionItem key={task.id} task={task} />
                  ))}
                </div>
              )}
            </SectionCard>

            {/* RIGHT: Timeline */}
            <SectionCard
              title="Timeline de la operación"
              subtitle="Eventos clave"
              icon={<Activity size={15} strokeWidth={1.8} />}
              iconBg="var(--surface-muted)"
              iconColor="var(--text-secondary)"
            >
              {operation.timelineEvents.length === 0 && operation.journeySteps.filter((s) => s.narrativeNote).length === 0 ? (
                <EmptyStateInline
                  icon={<Activity size={24} strokeWidth={1.5} style={{ color: 'var(--text-quaternary)' }} />}
                  title="Sin actividad aún"
                  description="Los eventos de la operación aparecerán acá a medida que sucedan."
                />
              ) : (
                <TimelineNarrative events={operation.timelineEvents} journeySteps={operation.journeySteps} />
              )}
            </SectionCard>

          </div>

          {/* ============ DOCUMENTS (full width) ============ */}
          <div style={{ marginTop: '20px' }}>
            <SectionCard
              title="Documentos"
              subtitle="BL, factura, packing list"
              icon={<FileText size={15} strokeWidth={1.8} />}
              iconBg="var(--surface-muted)"
              iconColor="var(--text-secondary)"
            >
              <DocumentsList />
            </SectionCard>
          </div>

          {/* ============ COMUNICACIONES (collapsed, at the end) ============ */}
          <div style={{ marginTop: '20px' }}>
            <CommunicationsSection />
          </div>

        </div>
      </div>
    </div>
  )
}

// ============================================================================
// HERO SECTION
// ============================================================================

function HeroSection({ operation, subStatusInfo, progress }: { operation: Operation; subStatusInfo: any; progress: number }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--surface-card) 0%, #FAFAF7 100%)',
      border: '1px solid var(--border-default)',
      borderRadius: '16px',
      padding: '28px 32px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top row: title + identity + actions */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              {operation.operationCode}
            </h1>
            {/* Status pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: subStatusInfo.bg,
              borderRadius: '6px',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: subStatusInfo.dotColor }} />
              <span style={{ fontSize: '12px', fontWeight: 500, color: subStatusInfo.fg }}>
                {subStatusInfo.label}
              </span>
            </div>
            {/* Owner */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'var(--surface-muted)', borderRadius: '6px' }}>
              <TeamAvatar team={operation.currentOwner} size="sm" />
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                {getTeamLabel(operation.currentOwner)}
              </span>
            </div>
            {/* Delayed flag */}
            {operation.isDelayed && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#FCEBEB', borderRadius: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#A32D2D' }}>Demorada</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 500 }}>{operation.clientName}</span>
            <span style={{ color: 'var(--text-quaternary)' }}>·</span>
            <span>{operation.mode || 'FCL'}</span>
            {operation.incoterm && (
              <>
                <span style={{ color: 'var(--text-quaternary)' }}>·</span>
                <span>{operation.incoterm}</span>
              </>
            )}
            <span style={{ color: 'var(--text-quaternary)' }}>·</span>
            <span style={{ color: 'var(--text-tertiary)' }}>Creada {formatShortDate(operation.createdAt)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <Button variant="secondary" size="sm">
            <Edit3 size={13} />
            Editar
          </Button>
          <Button size="sm">
            <Send size={13} />
            Acciones
          </Button>
        </div>
      </div>

      {/* ROUTE MAP */}
      <RouteMap operation={operation} progress={progress} />

      {/* Key data strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '24px',
        marginTop: '20px',
        padding: '16px 20px',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
      }}>
        <DataPoint label="Carrier" value={operation.shippingLine || '—'} />
        <DataPoint label="Vessel" value={operation.vessel || '—'} />
        <DataPoint label="Container" value={operation.containerNumber || '—'} mono />
        <DataPoint label="BL" value={operation.blNumber || '—'} mono />
        <DataPoint label="Peso · Vol" value={operation.weightKg ? `${operation.weightKg.toLocaleString()} kg${operation.cbm ? ` · ${operation.cbm} m³` : ''}` : '—'} />
      </div>
    </div>
  )
}

function DataPoint({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px', fontWeight: 500 }}>
        {label}
      </div>
      <div style={{
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--text-primary)',
        fontFamily: mono ? 'ui-monospace, "SF Mono", Menlo, monospace' : 'inherit',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {value}
      </div>
    </div>
  )
}

// ============================================================================
// ROUTE MAP — SVG world map with route arc
// ============================================================================

function RouteMap({ operation, progress }: { operation: Operation; progress: number }) {
  // Real port coordinates (lon/lat)
  const ports: Record<string, { lon: number; lat: number }> = {
    CN: { lon: 121.5, lat: 30.3 },
    AR: { lon: -58.3, lat: -34.6 },
    BR: { lon: -43.2, lat: -22.9 },
    CL: { lon: -71.6, lat: -33.0 },
    PE: { lon: -77.2, lat: -12.0 },
    UY: { lon: -56.2, lat: -34.9 },
    US: { lon: -87.6, lat: 30.2 },
    DE: { lon: 8.6, lat: 53.5 },
    NL: { lon: 4.3, lat: 51.9 },
    ES: { lon: -3.7, lat: 40.4 },
    IT: { lon: 12.6, lat: 41.1 },
    JP: { lon: 139.8, lat: 35.0 },
    KR: { lon: 126.9, lat: 37.4 },
    IN: { lon: 72.8, lat: 19.0 },
    AE: { lon: 54.3, lat: 25.1 },
    TR: { lon: 28.9, lat: 41.0 },
  }

  const toSVGPoint = (lon: number, lat: number): [number, number] => {
    const x = ((lon + 180) / 360) * 1000
    const y = ((90 - lat) / 180) * 300
    return [x, y]
  }

  const originData = ports[operation.originCountry || 'CN'] || { lon: 121.5, lat: 30.3 }
  const destData = ports[operation.destinationCountry || 'AR'] || { lon: -58.3, lat: -34.6 }

  const [originX, originY] = toSVGPoint(originData.lon, originData.lat)
  const [destX, destY] = toSVGPoint(destData.lon, destData.lat)

  // Great circle arc
  const midX = (originX + destX) / 2
  const midY = Math.min(originY, destY) - 60

  // Bezier curve position
  const t = progress
  const containerX = (1 - t) * (1 - t) * originX + 2 * (1 - t) * t * midX + t * t * destX
  const containerY = (1 - t) * (1 - t) * originY + 2 * (1 - t) * t * midY + t * t * destY

  // Status
  const statusText = {
    QUOTING: 'Pendiente cotización',
    BOOKING: 'En booking',
    IN_TRANSIT: 'En tránsito',
    AT_DESTINATION: 'En destino',
    CLOSED: 'Finalizada',
  }[operation.status] || ''

  const statusColor = {
    CLOSED: '#888780',
    IN_TRANSIT: '#1E3A7B',
    AT_DESTINATION: '#047857',
  }[operation.status] || '#F47A5A'

  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'relative', height: '320px', background: 'linear-gradient(135deg, #E3F2FD 0%, #ECE7F1 100%)' }}>
        <svg viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
          {/* Grid */}
          {[...Array(13)].map((_, i) => {
            const x = (i / 12) * 1000
            return <line key={`vline${i}`} x1={x} y1={0} x2={x} y2={300} stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" />
          })}
          {[...Array(7)].map((_, i) => {
            const y = (i / 6) * 300
            return <line key={`hline${i}`} x1={0} y1={y} x2={1000} y2={y} stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" />
          })}

          {/* Route pending (dashed) */}
          <path d={`M ${originX} ${originY} Q ${midX} ${midY} ${destX} ${destY}`} stroke="#E0E0E0" strokeWidth="2" fill="none" strokeDasharray="5 4" opacity="0.6" />

          {/* Route traveled (solid) */}
          {progress > 0.01 && (
            <path d={`M ${originX} ${originY} Q ${midX} ${midY} ${containerX} ${containerY}`} stroke={statusColor} strokeWidth="2.5" fill="none" opacity="0.85" />
          )}

          {/* Origin */}
          <circle cx={originX} cy={originY} r="8" fill="white" stroke={statusColor} strokeWidth="2.5" />
          <circle cx={originX} cy={originY} r="3" fill={statusColor} />
          <text x={originX} y={originY - 18} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--text-primary)">
            {operation.originCountry}
          </text>

          {/* Destination */}
          <circle cx={destX} cy={destY} r="8" fill="white" stroke={statusColor} strokeWidth="2.5" />
          <circle cx={destX} cy={destY} r="3" fill={statusColor} />
          <text x={destX} y={destY + 20} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--text-primary)">
            {operation.destinationCountry}
          </text>

          {/* Container */}
          {operation.status !== 'QUOTING' && operation.status !== 'CLOSED' && (
            <>
              <circle cx={containerX} cy={containerY} r="22" fill={statusColor} opacity="0.15" />
              <circle cx={containerX} cy={containerY} r="16" fill={statusColor} />
              <g transform={`translate(${containerX - 9}, ${containerY - 5})`}>
                <rect x="0" y="0" width="18" height="10" rx="1" stroke="white" strokeWidth="1.5" fill="none" />
                <line x1="4" y1="0" x2="4" y2="10" stroke="white" strokeWidth="1" />
                <line x1="9" y1="0" x2="9" y2="10" stroke="white" strokeWidth="1" />
                <line x1="14" y1="0" x2="14" y2="10" stroke="white" strokeWidth="1" />
              </g>
            </>
          )}
        </svg>

        {/* Status badge */}
        <div style={{
          position: 'absolute',
          top: '14px',
          left: '14px',
          background: 'white',
          padding: '7px 11px',
          borderRadius: '8px',
          border: '0.5px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          fontWeight: 500,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor }} />
          <span style={{ color: 'var(--text-primary)' }}>{statusText}</span>
        </div>
      </div>

      {/* Route metrics */}
      <RouteMetrics operation={operation} progress={progress} />
    </div>
  )
}

function RouteMetrics({ operation, progress }: { operation: Operation; progress: number }) {
  const etaInfo = getETAInfo(operation.eta)
  const etdInfo = getETAInfo(operation.etd)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      padding: '14px 20px',
      gap: '24px',
      borderTop: '1px solid var(--border-subtle)',
      background: '#FAFAF7',
    }}>
      <SmallMetric label="ETD" value={etdInfo.primary} secondary={etdInfo.secondary} />
      <SmallMetric label="ETA" value={etaInfo.primary} secondary={etaInfo.secondary} highlight={!operation.isDelayed && etaInfo.primary !== '—'} />
      <SmallMetric label="Progreso" value={`${Math.round(progress * 100)}%`} secondary={progress < 1 ? 'En curso' : 'Completado'} />
      <SmallMetric label="Booking" value={operation.bookingNumber || '—'} mono />
    </div>
  )
}

function SmallMetric({ label, value, secondary, mono, highlight }: { label: string; value: string; secondary?: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px', fontWeight: 500 }}>
        {label}
      </div>
      <div style={{
        fontSize: '13px',
        fontWeight: 600,
        color: highlight ? 'var(--rumbo-coral)' : 'var(--text-primary)',
        fontFamily: mono ? 'ui-monospace, monospace' : 'inherit',
      }}>
        {value}
      </div>
      {secondary && (
        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
          {secondary}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// SECTION CARD
// ============================================================================

function SectionCard({ title, subtitle, icon, iconBg, iconColor, children }: { title: string; subtitle?: string; icon: ReactNode; iconBg: string; iconColor: string; children: ReactNode }) {
  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '28px',
          height: '28px',
          background: iconBg,
          color: iconColor,
          borderRadius: '7px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
          {subtitle && <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '1px' }}>{subtitle}</div>}
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}

function EmptyStateInline({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ marginBottom: '10px', display: 'inline-flex' }}>{icon}</div>
      <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', maxWidth: '280px', margin: '0 auto', lineHeight: '18px' }}>{description}</div>
    </div>
  )
}

// ============================================================================
// SUGGESTION ITEMS
// ============================================================================

function DraftItem({ draft, onApprove }: { draft: EmailDraft; onApprove: () => void }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '7px',
          background: 'var(--rumbo-coral-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Mail size={13} style={{ color: 'var(--rumbo-coral)' }} strokeWidth={2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
            Borrador de email
          </div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>
            {draft.subject}
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
            Para: {draft.to || <em style={{ color: 'var(--rumbo-coral)' }}>Falta destinatario</em>}
          </div>
          <div
            onClick={() => setExpanded(!expanded)}
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              padding: '12px 14px',
              background: 'var(--surface-app)',
              borderRadius: '8px',
              cursor: 'pointer',
              maxHeight: expanded ? 'none' : '72px',
              overflow: 'hidden',
              whiteSpace: 'pre-wrap',
              lineHeight: '20px',
              border: '1px solid var(--border-subtle)',
              position: 'relative',
            }}
          >
            {draft.body}
          </div>
          {draft.body.length > 150 && (
            <button onClick={() => setExpanded(!expanded)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', fontSize: '12px', cursor: 'pointer', padding: '4px 0', marginTop: '4px' }}>
              {expanded ? 'Ver menos' : 'Ver más'}
            </button>
          )}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <Button variant="secondary" size="sm">
              <Edit3 size={12} />
              Editar
            </Button>
            <Button size="sm" onClick={onApprove}>
              <Send size={12} />
              Aprobar y enviar
            </Button>
            <button style={{
              height: '28px',
              padding: '0 10px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary)',
              fontSize: '12px',
              cursor: 'pointer',
              borderRadius: '6px',
            }}>
              Descartar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TaskSuggestionItem({ task }: { task: Task }) {
  const priorityColor = task.priority === 'HIGH' || task.priority === 'CRITICAL' ? '#A32D2D' : task.priority === 'LOW' ? '#5F5E5A' : '#854F0B'
  const priorityBg = task.priority === 'HIGH' || task.priority === 'CRITICAL' ? '#FCEBEB' : task.priority === 'LOW' ? '#F1EFE8' : '#FFFBEB'

  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '7px',
          background: priorityBg,
          color: priorityColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <AlertCircle size={13} strokeWidth={2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tarea sugerida
            </span>
            {task.priority && (
              <span style={{ fontSize: '10px', fontWeight: 600, color: priorityColor, background: priorityBg, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {priorityLabel(task.priority)}
              </span>
            )}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {task.title}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '19px', marginBottom: '8px' }}>
            {task.description}
          </div>
          {task.aiConfidence !== undefined && (
            <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={11} strokeWidth={1.8} />
              <span>Rumbo · {Math.round(task.aiConfidence * 100)}% de confianza</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="sm">
              <X size={12} />
              Descartar
            </Button>
            <Button size="sm">
              <Check size={12} />
              Aceptar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// TIMELINE NARRATIVE
// ============================================================================

function TimelineNarrative({ events, journeySteps }: { events: TimelineEvent[]; journeySteps: JourneyStep[] }) {
  // Combine events + journey steps with narrative notes into one chronological feed
  const items = [
    ...events.map((e) => ({
      id: e.id,
      timestamp: e.timestamp,
      title: e.title,
      description: e.description,
      type: 'event' as const,
      eventType: e.eventType,
      sourceTeam: e.sourceTeam,
    })),
    ...journeySteps
      .filter((s) => s.narrativeNote)
      .map((s) => ({
        id: `js-${s.id}`,
        timestamp: s.actualDate || new Date().toISOString(),
        title: s.stepName,
        description: s.narrativeNote || '',
        type: 'step' as const,
        eventType: 'STEP_COMPLETED',
        sourceTeam: undefined,
      })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div style={{ padding: '4px 0' }}>
      {items.map((item, idx) => (
        <div key={item.id} style={{ display: 'flex', gap: '14px', padding: '14px 20px', position: 'relative' }}>
          {/* Vertical line */}
          {idx < items.length - 1 && (
            <div style={{
              position: 'absolute',
              left: '32px',
              top: '32px',
              bottom: '-14px',
              width: '1px',
              background: 'var(--border-default)',
            }} />
          )}
          {/* Dot */}
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: getEventColor(item.eventType),
            border: '2px solid var(--surface-card)',
            boxShadow: '0 0 0 1px var(--border-default)',
            flexShrink: 0,
            marginTop: '5px',
            marginLeft: '12px',
          }} />
          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>
              {item.title}
            </div>
            {item.description && (
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '19px', marginBottom: '4px' }}>
                {item.description}
              </div>
            )}
            <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{formatDateTime(item.timestamp)}</span>
              {item.sourceTeam && (
                <>
                  <span>·</span>
                  <span>{getTeamLabel(item.sourceTeam)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// DOCUMENTS LIST (placeholder for now)
// ============================================================================

function DocumentsList() {
  return (
    <EmptyStateInline
      icon={<FileText size={24} strokeWidth={1.5} style={{ color: 'var(--text-quaternary)' }} />}
      title="Sin documentos aún"
      description="BL, factura comercial y packing list aparecerán acá cuando lleguen."
    />
  )
}

// ============================================================================
// COMUNICACIONES (collapsible — at the bottom of the page)
// ============================================================================

function CommunicationsSection() {
  const [expanded, setExpanded] = useState(false)
  const totalCount = 0  // placeholder — wired to backend later

  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: '16px 20px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textAlign: 'left',
          transition: 'background 120ms ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <div style={{
          width: '28px',
          height: '28px',
          background: 'var(--surface-muted)',
          color: 'var(--text-secondary)',
          borderRadius: '7px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <MessageSquare size={15} strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Comunicaciones
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '1px' }}>
            Mails, WhatsApp y llamadas registradas — Rumbo ya leyó esto por vos
          </div>
        </div>
        {totalCount > 0 && (
          <div style={{
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--text-tertiary)',
            background: 'var(--surface-muted)',
            padding: '3px 9px',
            borderRadius: '12px',
            marginRight: '8px',
          }}>
            {totalCount}
          </div>
        )}
        <ChevronDown
          size={16}
          style={{
            color: 'var(--text-tertiary)',
            transition: 'transform 200ms ease',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
          }}
        />
      </button>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <EmptyStateInline
            icon={<MessageSquare size={24} strokeWidth={1.5} style={{ color: 'var(--text-quaternary)' }} />}
            title="Sin comunicaciones registradas"
            description="Los mails, WhatsApp y llamadas vinculadas a esta operación aparecerán acá."
          />
        </div>
      )}
    </div>
  )
}

// ============================================================================
// HELPERS
// ============================================================================

function formatShortDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function getETAInfo(dateStr?: string | null): { primary: string; secondary?: string } {
  if (!dateStr) return { primary: '—' }
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const formatted = date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
  if (diffDays < 0) return { primary: formatted, secondary: `hace ${Math.abs(diffDays)} días` }
  if (diffDays === 0) return { primary: formatted, secondary: 'hoy' }
  return { primary: formatted, secondary: `en ${diffDays} días` }
}

function truncate(s: string, max: number): string {
  if (!s) return ''
  return s.length > max ? s.substring(0, max - 1) + '…' : s
}

function getTeamLabel(team: string): string {
  const labels: Record<string, string> = { SALES: 'Sales', PRICING: 'Pricing', CUSTOMER: 'Customer', OPS: 'Operaciones' }
  return labels[team] || team
}

function priorityLabel(p: string): string {
  const labels: Record<string, string> = { CRITICAL: 'Crítica', HIGH: 'Alta', MEDIUM: 'Media', NORMAL: 'Normal', LOW: 'Baja' }
  return labels[p] || p
}

function getEventColor(eventType: string): string {
  const colors: Record<string, string> = {
    OPERATION_CREATED: '#1E3A7B',
    STATUS_CHANGED: '#F47A5A',
    EMAIL_SENT: '#1E3A7B',
    EMAIL_RECEIVED: '#888780',
    DOCUMENT_RECEIVED: '#047857',
    TASK_COMPLETED: '#047857',
    STEP_COMPLETED: '#047857',
    NOTE_ADDED: '#888780',
  }
  return colors[eventType] || '#888780'
}
