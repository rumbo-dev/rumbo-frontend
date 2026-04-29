'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Search, Plus, Mail, Package, AlertTriangle, Clock, ChevronDown, Check } from 'lucide-react'
import { StatusBadge, Button, EmptyState, SkeletonRow, getCountryFlag, getCountryNameES } from '@/components/index'
import EmailIntakeModal from '@/components/EmailIntakeModal'
import Sidebar from '@/components/Sidebar'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Task {
  id: string
  title: string
  status: string
  priority: string
  createdByAi: boolean
}

interface Operation {
  id: string
  operationCode: string
  containerNumber: string
  clientName: string
  originPort: string
  originCountry: string
  destinationPort: string
  destinationCountry: string
  weightKg: number
  status: string
  priority: string
  eta?: string
  shippingLine: string
  incoterm: string
  mode?: string
  tasks?: Task[]
}

type StatusFilter = 'ACTIVE' | 'IN_TRANSIT' | 'PENDING' | 'COMPLETED'
type AlertFilter = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ACTIVE', label: 'Activa' },
  { value: 'IN_TRANSIT', label: 'En tránsito' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'COMPLETED', label: 'Completada' },
]

const ALERT_OPTIONS: { value: AlertFilter; label: string }[] = [
  { value: 'HIGH', label: 'Alta' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'LOW', label: 'Baja' },
  { value: 'NONE', label: 'Sin alertas' },
]

export default function Dashboard() {
  const router = useRouter()
  const [operations, setOperations] = useState<Operation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilters, setStatusFilters] = useState<StatusFilter[]>([])
  const [alertFilters, setAlertFilters] = useState<AlertFilter[]>([])
  const [heroFilter, setHeroFilter] = useState<'all_active' | 'critical' | 'eta_week' | null>(null)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showAlertDropdown, setShowAlertDropdown] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showEmailIntake, setShowEmailIntake] = useState(false)

  const [formData, setFormData] = useState({
    operationCode: '', containerNumber: '', originPort: '', originCountry: '',
    destinationPort: '', destinationCountry: '', weightKg: '', cbm: '',
    incoterm: 'FOB', mode: 'FCL', clientName: '', clientEmail: '',
    shippingLine: '', costEstimate: '', priority: 'NORMAL',
  })

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      router.push('/')
      return
    }
    fetchData(token)
  }, [])

  const fetchData = async (token: string) => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_URL}/api/operations`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setOperations(res.data || [])
    } catch (error) {
      console.error('Error fetching:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOperation = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      await axios.post(
        `${API_URL}/api/operations`,
        {
          ...formData,
          weightKg: parseFloat(formData.weightKg),
          cbm: formData.cbm ? parseFloat(formData.cbm) : undefined,
          costEstimate: parseFloat(formData.costEstimate),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setShowModal(false)
      fetchData(token)
    } catch (error) {
      console.error('Error creating:', error)
    }
  }

  const getAlertInfo = (op: Operation): { count: number; priority: 'HIGH' | 'MEDIUM' | 'LOW' | null; topTask?: string } => {
    if (!op.tasks) return { count: 0, priority: null }
    const aiPending = op.tasks.filter((t) => t.createdByAi && t.status === 'PENDING')
    if (aiPending.length === 0) return { count: 0, priority: null }
    
    // Sort by priority: HIGH/CRITICAL > MEDIUM/NORMAL > LOW
    const priorityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, NORMAL: 3, LOW: 4 }
    const sorted = [...aiPending].sort((a, b) => (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99))
    const topTask = sorted[0]?.title || ''
    
    const high = aiPending.filter((t) => t.priority === 'HIGH' || t.priority === 'CRITICAL').length
    const medium = aiPending.filter((t) => t.priority === 'MEDIUM' || t.priority === 'NORMAL').length
    const low = aiPending.filter((t) => t.priority === 'LOW').length
    
    if (high > 0) return { count: aiPending.length, priority: 'HIGH', topTask }
    if (medium > 0) return { count: aiPending.length, priority: 'MEDIUM', topTask }
    if (low > 0) return { count: aiPending.length, priority: 'LOW', topTask }
    return { count: 0, priority: null }
  }

  const getETA = (eta?: string): { primary: string; secondary?: string; daysAway?: number } => {
    if (!eta) return { primary: '—' }
    const date = new Date(eta)
    const now = new Date()
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const formatted = date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
    if (diffDays < 0) return { primary: formatted, secondary: `hace ${Math.abs(diffDays)} días`, daysAway: diffDays }
    if (diffDays === 0) return { primary: formatted, secondary: 'hoy', daysAway: 0 }
    return { primary: formatted, secondary: `en ${diffDays} días`, daysAway: diffDays }
  }

  const totalActive = operations.filter((op) => op.status !== 'COMPLETED' && op.status !== 'CLOSED').length
  const criticalCount = operations.filter((op) => getAlertInfo(op).priority === 'HIGH').length
  const etaThisWeek = operations.filter((op) => {
    const eta = getETA(op.eta)
    return eta.daysAway !== undefined && eta.daysAway >= 0 && eta.daysAway <= 7
  }).length

  const filteredOps = operations.filter((op) => {
    if (heroFilter === 'all_active' && (op.status === 'COMPLETED' || op.status === 'CLOSED')) return false
    if (heroFilter === 'critical' && getAlertInfo(op).priority !== 'HIGH') return false
    if (heroFilter === 'eta_week') {
      const eta = getETA(op.eta)
      if (eta.daysAway === undefined || eta.daysAway < 0 || eta.daysAway > 7) return false
    }
    if (statusFilters.length > 0 && !statusFilters.includes(op.status as StatusFilter)) return false
    if (alertFilters.length > 0) {
      const alerts = getAlertInfo(op)
      const matchesNone = alertFilters.includes('NONE') && alerts.count === 0
      const matchesPriority = alerts.priority && alertFilters.includes(alerts.priority as AlertFilter)
      if (!matchesNone && !matchesPriority) return false
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        op.operationCode.toLowerCase().includes(q) ||
        op.clientName.toLowerCase().includes(q) ||
        op.containerNumber.toLowerCase().includes(q) ||
        op.shippingLine.toLowerCase().includes(q)
      )
    }
    return true
  })

  const toggleStatusFilter = (value: StatusFilter) => {
    setStatusFilters((prev) => prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value])
  }

  const toggleAlertFilter = (value: AlertFilter) => {
    setAlertFilters((prev) => prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value])
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-app)' }}>
      <Sidebar onNewOperation={() => setShowModal(true)} />

      <div style={{ marginLeft: '240px' }}>
        <div style={{ maxWidth: '1680px', margin: '0 auto', padding: '32px 40px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: '32px', letterSpacing: '-0.01em' }}>
                Operaciones
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: '4px 0 0 0' }}>
                Centro de control de tus envíos en tiempo real
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="secondary" onClick={() => setShowEmailIntake(true)}>
                <Mail size={15} />
                Procesar email
              </Button>
              <Button onClick={() => setShowModal(true)}>
                <Plus size={15} strokeWidth={2.2} />
                Nueva operación
              </Button>
            </div>
          </div>

          {/* Hero stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
            <HeroBox
              icon={<Package size={20} strokeWidth={1.8} />}
              iconColor="var(--rumbo-navy)"
              iconBg="var(--rumbo-navy-soft)"
              value={totalActive}
              label="Operaciones activas"
              sublabel="En curso ahora"
              active={heroFilter === 'all_active'}
              onClick={() => setHeroFilter(heroFilter === 'all_active' ? null : 'all_active')}
            />
            <HeroBox
              icon={<AlertTriangle size={20} strokeWidth={1.8} />}
              iconColor="var(--danger-fg)"
              iconBg="var(--danger-bg)"
              value={criticalCount}
              label="Críticas"
              sublabel="Atender ahora"
              active={heroFilter === 'critical'}
              onClick={() => setHeroFilter(heroFilter === 'critical' ? null : 'critical')}
              valueColor="var(--danger-fg)"
            />
            <HeroBox
              icon={<Clock size={20} strokeWidth={1.8} />}
              iconColor="var(--rumbo-coral)"
              iconBg="var(--rumbo-coral-soft)"
              value={etaThisWeek}
              label="ETA esta semana"
              sublabel="Llegan en ≤7 días"
              active={heroFilter === 'eta_week'}
              onClick={() => setHeroFilter(heroFilter === 'eta_week' ? null : 'eta_week')}
              valueColor="var(--rumbo-coral)"
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ position: 'relative' }}>
              <FilterButton
                label="Estado"
                count={statusFilters.length}
                active={showStatusDropdown}
                onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowAlertDropdown(false); }}
              />
              {showStatusDropdown && (
                <FilterDropdown
                  options={STATUS_OPTIONS}
                  selected={statusFilters}
                  onToggle={(v) => toggleStatusFilter(v as StatusFilter)}
                  onClear={() => setStatusFilters([])}
                  onClose={() => setShowStatusDropdown(false)}
                />
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <FilterButton
                label="Alertas"
                count={alertFilters.length}
                active={showAlertDropdown}
                onClick={() => { setShowAlertDropdown(!showAlertDropdown); setShowStatusDropdown(false); }}
              />
              {showAlertDropdown && (
                <FilterDropdown
                  options={ALERT_OPTIONS}
                  selected={alertFilters}
                  onToggle={(v) => toggleAlertFilter(v as AlertFilter)}
                  onClear={() => setAlertFilters([])}
                  onClose={() => setShowAlertDropdown(false)}
                />
              )}
            </div>

            <div style={{ flex: 1 }} />

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '300px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Buscar operaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '34px',
                  padding: '0 12px 0 34px',
                  borderRadius: '7px',
                  border: '1px solid var(--border-default)',
                  background: 'var(--surface-card)',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {/* Active filters */}
          {(heroFilter || statusFilters.length > 0 || alertFilters.length > 0) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Filtros:</span>
              {heroFilter === 'all_active' && <ActiveFilterChip label="Solo activas" onRemove={() => setHeroFilter(null)} />}
              {heroFilter === 'critical' && <ActiveFilterChip label="Críticas" onRemove={() => setHeroFilter(null)} />}
              {heroFilter === 'eta_week' && <ActiveFilterChip label="ETA esta semana" onRemove={() => setHeroFilter(null)} />}
              {statusFilters.map((s) => (
                <ActiveFilterChip key={s} label={STATUS_OPTIONS.find((o) => o.value === s)?.label || s} onRemove={() => toggleStatusFilter(s)} />
              ))}
              {alertFilters.map((a) => (
                <ActiveFilterChip key={a} label={`Alerta ${ALERT_OPTIONS.find((o) => o.value === a)?.label || a}`} onRemove={() => toggleAlertFilter(a)} />
              ))}
              <button
                onClick={() => { setHeroFilter(null); setStatusFilters([]); setAlertFilters([]); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Limpiar todo
              </button>
            </div>
          )}

          {/* Table */}
          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 0.9fr 1fr 0.9fr 1.8fr', padding: '0 20px', height: '42px', alignItems: 'center', borderBottom: '1px solid var(--border-default)' }}>
              <HeaderCell>Operación</HeaderCell>
              <HeaderCell>Estado</HeaderCell>
              <HeaderCell>Carrier</HeaderCell>
              <HeaderCell>Origen</HeaderCell>
              <HeaderCell>ETA</HeaderCell>
              <HeaderCell>Próxima acción</HeaderCell>
            </div>

            {loading ? (
              <><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
            ) : filteredOps.length === 0 ? (
              <EmptyState
                title={operations.length === 0 ? "No hay operaciones aún" : "Sin resultados"}
                description={operations.length === 0 ? "Comenzá creando una operación o procesando un email" : "Probá ajustar los filtros"}
                action={operations.length === 0 ? (
                  <Button onClick={() => setShowModal(true)}><Plus size={15} />Nueva operación</Button>
                ) : (
                  <Button variant="secondary" onClick={() => { setHeroFilter(null); setStatusFilters([]); setAlertFilters([]); setSearchQuery(''); }}>Limpiar filtros</Button>
                )}
              />
            ) : (
              filteredOps.map((op, idx) => {
                const eta = getETA(op.eta)
                const alerts = getAlertInfo(op)
                const hasManyAlerts = alerts.count >= 5
                return (
                  <div
                    key={op.id}
                    onClick={() => router.push(`/operations/${op.id}`)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.6fr 1fr 0.9fr 1fr 0.9fr 1.8fr',
                      padding: '0 20px',
                      minHeight: '64px',
                      alignItems: 'center',
                      borderBottom: idx < filteredOps.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      cursor: 'pointer',
                      transition: 'background 100ms ease',
                      position: 'relative',
                      borderLeft: hasManyAlerts ? '3px solid var(--rumbo-coral)' : '3px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--surface-hover)'
                      if (!hasManyAlerts) e.currentTarget.style.borderLeft = '3px solid var(--rumbo-coral)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      if (!hasManyAlerts) e.currentTarget.style.borderLeft = '3px solid transparent'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{op.operationCode}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{op.clientName}</div>
                    </div>
                    <div><StatusBadge status={op.status} /></div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{op.shippingLine}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px', lineHeight: 1 }}>{getCountryFlag(op.originCountry)}</span>
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{getCountryNameES(op.originCountry)}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', color: eta.primary === '—' ? 'var(--text-quaternary)' : 'var(--text-primary)' }}>{eta.primary}</div>
                      {eta.secondary && (<div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{eta.secondary}</div>)}
                    </div>
                    <div>
                      <NextActionCell alerts={alerts} />
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {!loading && filteredOps.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
              <span>Mostrando {filteredOps.length} de {operations.length} operaciones</span>
            </div>
          )}
        </div>
      </div>

      {showEmailIntake && <EmailIntakeModal onClose={() => setShowEmailIntake(false)} />}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '32px' }} onClick={() => setShowModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface-card)', borderRadius: '10px', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-default)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Nueva operación</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '4px 0 0 0' }}>Creá un nuevo envío para hacer seguimiento</p>
            </div>
            <form onSubmit={handleCreateOperation} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FormField label="Código de operación" value={formData.operationCode} onChange={(v: string) => setFormData({ ...formData, operationCode: v })} required />
                <FormField label="Número de container" value={formData.containerNumber} onChange={(v: string) => setFormData({ ...formData, containerNumber: v })} required />
                <FormField label="Cliente" value={formData.clientName} onChange={(v: string) => setFormData({ ...formData, clientName: v })} required />
                <FormField label="Carrier" value={formData.shippingLine} onChange={(v: string) => setFormData({ ...formData, shippingLine: v })} required />
                <FormField label="Puerto de origen" value={formData.originPort} onChange={(v: string) => setFormData({ ...formData, originPort: v })} required />
                <FormField label="País de origen (ISO)" value={formData.originCountry} onChange={(v: string) => setFormData({ ...formData, originCountry: v })} required />
                <FormField label="Puerto de destino" value={formData.destinationPort} onChange={(v: string) => setFormData({ ...formData, destinationPort: v })} required />
                <FormField label="País de destino (ISO)" value={formData.destinationCountry} onChange={(v: string) => setFormData({ ...formData, destinationCountry: v })} required />
                <FormField label="Peso (kg)" value={formData.weightKg} onChange={(v: string) => setFormData({ ...formData, weightKg: v })} type="number" required />
                <FormField label="Costo estimado (USD)" value={formData.costEstimate} onChange={(v: string) => setFormData({ ...formData, costEstimate: v })} type="number" required />
                <FormSelect label="Incoterm" value={formData.incoterm} onChange={(v: string) => setFormData({ ...formData, incoterm: v })} options={['FOB', 'CIF', 'EXW', 'DDP']} />
                <FormSelect label="Modo" value={formData.mode} onChange={(v: string) => setFormData({ ...formData, mode: v })} options={['FCL', 'LCL', 'AIR', 'LAND']} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                <Button type="submit">Crear operación</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function NextActionCell({ alerts }: { alerts: { count: number; priority: 'HIGH' | 'MEDIUM' | 'LOW' | null; topTask?: string } }) {
  if (alerts.count === 0 || !alerts.priority) {
    return <span style={{ color: 'var(--text-quaternary)', fontSize: '14px' }}>—</span>
  }

  const dotColors = {
    HIGH: 'var(--danger-dot)',
    MEDIUM: 'var(--warning-dot)',
    LOW: 'var(--info-dot)',
  }

  const truncated = alerts.topTask && alerts.topTask.length > 42 
    ? alerts.topTask.substring(0, 42) + '...' 
    : alerts.topTask

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColors[alerts.priority], flexShrink: 0 }} />
      <span style={{ fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
        {truncated}
      </span>
      {alerts.count > 1 && (
        <span style={{
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--text-tertiary)',
          background: 'var(--surface-muted)',
          borderRadius: '4px',
          padding: '2px 6px',
          flexShrink: 0,
        }}>
          +{alerts.count - 1}
        </span>
      )}
    </div>
  )
}

function HeroBox({
  icon, iconColor, iconBg, value, label, sublabel, active, onClick, valueColor,
}: {
  icon: ReactNode
  iconColor: string
  iconBg: string
  value: number
  label: string
  sublabel: string
  active?: boolean
  onClick: () => void
  valueColor?: string
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'var(--surface-card)',
        border: active ? '1.5px solid var(--rumbo-navy)' : '1px solid var(--border-default)',
        borderRadius: '10px',
        padding: '18px 20px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 150ms ease',
        position: 'relative',
        boxShadow: active ? '0 0 0 3px color-mix(in srgb, var(--rumbo-navy) 8%, transparent)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = 'var(--border-strong)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = 'var(--border-default)'
          e.currentTarget.style.transform = 'translateY(0)'
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        {active && (
          <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--rumbo-navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Filtrado
          </div>
        )}
      </div>
      <div className="tabular-nums" style={{ fontSize: '28px', fontWeight: 600, color: valueColor || 'var(--text-primary)', lineHeight: '32px', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>{label}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{sublabel}</div>
    </button>
  )
}

function FilterButton({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: '34px',
        padding: '0 12px',
        borderRadius: '7px',
        border: '1px solid ' + (count > 0 ? 'var(--rumbo-navy)' : 'var(--border-default)'),
        background: count > 0 ? 'var(--rumbo-navy-soft)' : 'var(--surface-card)',
        color: count > 0 ? 'var(--rumbo-navy)' : 'var(--text-secondary)',
        fontSize: '13px',
        fontWeight: 500,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 120ms ease',
      }}
    >
      {label}
      {count > 0 && (
        <span style={{ background: 'var(--rumbo-navy)', color: 'white', borderRadius: '10px', padding: '0 6px', fontSize: '11px', fontWeight: 600, minWidth: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          {count}
        </span>
      )}
      <ChevronDown size={13} style={{ marginLeft: count > 0 ? '0' : '2px', transition: 'transform 150ms', transform: active ? 'rotate(180deg)' : 'rotate(0)' }} />
    </button>
  )
}

function FilterDropdown({ options, selected, onToggle, onClear, onClose }: { options: { value: string; label: string }[]; selected: string[]; onToggle: (v: string) => void; onClear: () => void; onClose: () => void }) {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 20 }} onClick={onClose} />
      <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: '8px', boxShadow: 'var(--shadow-popover)', minWidth: '200px', zIndex: 30, padding: '6px' }}>
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onToggle(opt.value)}
            style={{ width: '100%', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', transition: 'background 80ms' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1.5px solid ' + (selected.includes(opt.value) ? 'var(--rumbo-navy)' : 'var(--border-strong)'), background: selected.includes(opt.value) ? 'var(--rumbo-navy)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {selected.includes(opt.value) && <Check size={11} style={{ color: 'white' }} strokeWidth={3} />}
            </div>
            {opt.label}
          </button>
        ))}
        {selected.length > 0 && (
          <>
            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />
            <button
              onClick={onClear}
              style={{ width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', borderRadius: '6px', fontSize: '12px', color: 'var(--text-tertiary)', cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              Limpiar selección
            </button>
          </>
        )}
      </div>
    </>
  )
}

function ActiveFilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      style={{ height: '24px', padding: '0 8px 0 10px', borderRadius: '6px', background: 'var(--rumbo-navy-soft)', color: 'var(--rumbo-navy)', fontSize: '12px', fontWeight: 500, border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
    >
      {label}
      <span style={{ fontSize: '14px', lineHeight: 1, opacity: 0.7 }}>×</span>
    </button>
  )
}

function HeaderCell({ children, align = 'left' }: { children: ReactNode; align?: 'left' | 'right' }) {
  return (<div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: align }}>{children}</div>)
}

function FormField({ label, value, onChange, type = 'text', required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (<div><label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} style={{ width: '100%', height: '36px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '14px', background: 'var(--surface-card)' }} /></div>)
}

function FormSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (<div><label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', height: '36px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '14px', background: 'var(--surface-card)' }}>{options.map((o) => (<option key={o} value={o}>{o}</option>))}</select></div>)
}
