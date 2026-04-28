'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Search, Plus, AlertCircle } from 'lucide-react'
import { StatusBadge, Button, EmptyState, SkeletonRow } from '@/components/index'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Task {
  id: string
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
  costEstimate: number
  status: string
  priority: string
  eta?: string
  shippingLine: string
  incoterm: string
  mode?: string
  tasks?: Task[]
}

export default function Dashboard() {
  const router = useRouter()
  const [operations, setOperations] = useState<Operation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [showModal, setShowModal] = useState(false)

  const [formData, setFormData] = useState({
    operationCode: '',
    containerNumber: '',
    originPort: '',
    originCountry: '',
    destinationPort: '',
    destinationCountry: '',
    weightKg: '',
    cbm: '',
    incoterm: 'FOB',
    mode: 'FCL',
    clientName: '',
    clientEmail: '',
    shippingLine: '',
    costEstimate: '',
    priority: 'NORMAL',
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

  const countAlerts = (op: Operation): number => {
    if (!op.tasks) return 0
    return op.tasks.filter((t) => t.createdByAi && (t.priority === 'HIGH' || t.priority === 'CRITICAL') && t.status === 'PENDING').length
  }

  const getETA = (eta?: string): { primary: string; secondary?: string } => {
    if (!eta) return { primary: '—' }
    const date = new Date(eta)
    const now = new Date()
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (diffDays < 0) return { primary: formatted, secondary: `${Math.abs(diffDays)}d ago` }
    if (diffDays === 0) return { primary: formatted, secondary: 'today' }
    return { primary: formatted, secondary: `in ${diffDays}d` }
  }

  const getCountryCode = (country: string): string => {
    const codes: Record<string, string> = {
      China: 'CN', Argentina: 'AR', Netherlands: 'NL', Germany: 'DE',
      'United States': 'US', Brazil: 'BR', Spain: 'ES', France: 'FR',
    }
    return codes[country] || country.substring(0, 2).toUpperCase()
  }

  const filteredOps = operations.filter((op) => {
    if (statusFilter !== 'ALL' && op.status !== statusFilter) return false
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-app)' }}>
      <nav style={{ height: '56px', background: 'var(--surface-card)', borderBottom: '1px solid var(--border-default)', padding: '0 32px', display: 'flex', alignItems: 'center' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginRight: '40px' }}>Rumbo</div>
        <div style={{ display: 'flex', gap: '4px', height: '56px', alignItems: 'center' }}>
          <NavLink active>Operations</NavLink>
          <NavLink>Analytics</NavLink>
          <NavLink>Settings</NavLink>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--rumbo-navy)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>D</div>
        </div>
      </nav>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: '32px' }}>Operations</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: '4px 0 0 0' }}>Manage and track your shipments in real-time</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} strokeWidth={2.2} />
            New operation
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FilterChip active={statusFilter === 'ALL'} onClick={() => setStatusFilter('ALL')}>All</FilterChip>
          <FilterChip active={statusFilter === 'ACTIVE'} onClick={() => setStatusFilter('ACTIVE')}>Active</FilterChip>
          <FilterChip active={statusFilter === 'IN_TRANSIT'} onClick={() => setStatusFilter('IN_TRANSIT')}>In transit</FilterChip>
          <FilterChip active={statusFilter === 'PENDING'} onClick={() => setStatusFilter('PENDING')}>Pending</FilterChip>
          <FilterChip active={statusFilter === 'COMPLETED'} onClick={() => setStatusFilter('COMPLETED')}>Completed</FilterChip>
          <div style={{ flex: 1 }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', color: 'var(--text-tertiary)' }} />
            <input type="text" placeholder="Search operations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', height: '32px', padding: '0 12px 0 34px', borderRadius: '6px', border: '1px solid var(--border-default)', background: 'var(--surface-card)', fontSize: '13px', color: 'var(--text-primary)' }} />
          </div>
        </div>

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 0.8fr 0.8fr 1fr 1fr 0.7fr', padding: '0 20px', height: '40px', alignItems: 'center', borderBottom: '1px solid var(--border-default)' }}>
            <HeaderCell>Operation</HeaderCell>
            <HeaderCell>Status</HeaderCell>
            <HeaderCell>Carrier</HeaderCell>
            <HeaderCell>Origin</HeaderCell>
            <HeaderCell>Destination</HeaderCell>
            <HeaderCell>ETA</HeaderCell>
            <HeaderCell>Type / Mode</HeaderCell>
            <HeaderCell align="right">Alerts</HeaderCell>
          </div>

          {loading ? (
            <><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
          ) : filteredOps.length === 0 ? (
            <EmptyState title="No operations found" description={searchQuery ? 'Try adjusting your search or filters' : 'Create your first operation to get started'} action={!searchQuery && (<Button onClick={() => setShowModal(true)}><Plus size={16} />New operation</Button>)} />
          ) : (
            filteredOps.map((op, idx) => {
              const eta = getETA(op.eta)
              const alerts = countAlerts(op)
              return (
                <div key={op.id} onClick={() => router.push(`/operations/${op.id}`)} style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 0.8fr 0.8fr 1fr 1fr 0.7fr', padding: '0 20px', minHeight: '64px', alignItems: 'center', borderBottom: idx < filteredOps.length - 1 ? '1px solid var(--border-subtle)' : 'none', cursor: 'pointer', transition: 'background 80ms ease' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{op.operationCode}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{op.clientName}</div>
                  </div>
                  <div><StatusBadge status={op.status} /></div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{op.shippingLine}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{getCountryCode(op.originCountry)}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{getCountryCode(op.destinationCountry)}</div>
                  <div>
                    <div style={{ fontSize: '14px', color: eta.primary === '—' ? 'var(--text-quaternary)' : 'var(--text-primary)' }}>{eta.primary}</div>
                    {eta.secondary && (<div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{eta.secondary}</div>)}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{op.incoterm} <span style={{ color: 'var(--text-quaternary)' }}>/</span> {op.mode || 'FCL'}</div>
                  <div style={{ textAlign: 'right' }}>
                    {alerts > 0 ? (<span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--warning-fg)', fontWeight: 500 }}><AlertCircle size={13} />{alerts}</span>) : (<span style={{ color: 'var(--text-quaternary)', fontSize: '14px' }}>—</span>)}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {!loading && filteredOps.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
            <span>Showing {filteredOps.length} of {operations.length} operations</span>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '32px' }} onClick={() => setShowModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface-card)', borderRadius: '8px', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-default)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>New operation</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '4px 0 0 0' }}>Create a new shipment to track</p>
            </div>
            <form onSubmit={handleCreateOperation} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FormField label="Operation code" value={formData.operationCode} onChange={(v: string) => setFormData({ ...formData, operationCode: v })} required />
                <FormField label="Container number" value={formData.containerNumber} onChange={(v: string) => setFormData({ ...formData, containerNumber: v })} required />
                <FormField label="Client" value={formData.clientName} onChange={(v: string) => setFormData({ ...formData, clientName: v })} required />
                <FormField label="Carrier" value={formData.shippingLine} onChange={(v: string) => setFormData({ ...formData, shippingLine: v })} required />
                <FormField label="Origin port" value={formData.originPort} onChange={(v: string) => setFormData({ ...formData, originPort: v })} required />
                <FormField label="Origin country" value={formData.originCountry} onChange={(v: string) => setFormData({ ...formData, originCountry: v })} required />
                <FormField label="Destination port" value={formData.destinationPort} onChange={(v: string) => setFormData({ ...formData, destinationPort: v })} required />
                <FormField label="Destination country" value={formData.destinationCountry} onChange={(v: string) => setFormData({ ...formData, destinationCountry: v })} required />
                <FormField label="Weight (kg)" value={formData.weightKg} onChange={(v: string) => setFormData({ ...formData, weightKg: v })} type="number" required />
                <FormField label="Cost estimate (USD)" value={formData.costEstimate} onChange={(v: string) => setFormData({ ...formData, costEstimate: v })} type="number" required />
                <FormSelect label="Incoterm" value={formData.incoterm} onChange={(v: string) => setFormData({ ...formData, incoterm: v })} options={['FOB', 'CIF', 'EXW', 'DDP']} />
                <FormSelect label="Mode" value={formData.mode} onChange={(v: string) => setFormData({ ...formData, mode: v })} options={['FCL', 'LCL', 'AIR', 'LAND']} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit">Create operation</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function NavLink({ children, active }: { children: ReactNode; active?: boolean }) {
  return (<div style={{ height: '56px', padding: '0 12px', display: 'inline-flex', alignItems: 'center', fontSize: '14px', fontWeight: 500, color: active ? 'var(--text-primary)' : 'var(--text-tertiary)', borderBottom: active ? '2px solid var(--rumbo-navy)' : '2px solid transparent', cursor: 'pointer' }}>{children}</div>)
}

function HeaderCell({ children, align = 'left' }: { children: ReactNode; align?: 'left' | 'right' }) {
  return (<div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: align }}>{children}</div>)
}

function FilterChip({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (<button onClick={onClick} style={{ height: '32px', padding: '0 12px', borderRadius: '6px', border: '1px solid ' + (active ? 'var(--rumbo-navy)' : 'var(--border-default)'), background: active ? 'var(--rumbo-navy)' : 'var(--surface-card)', color: active ? 'white' : 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 120ms ease' }}>{children}</button>)
}

function FormField({ label, value, onChange, type = 'text', required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (<div><label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} style={{ width: '100%', height: '36px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '14px', background: 'var(--surface-card)' }} /></div>)
}

function FormSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (<div><label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', height: '36px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '14px', background: 'var(--surface-card)' }}>{options.map((o) => (<option key={o} value={o}>{o}</option>))}</select></div>)
}
