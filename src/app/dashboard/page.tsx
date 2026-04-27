'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { KPICard, StatusBadge } from '@/components/index'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Operation {
  id: string
  operationCode: string
  containerNumber: string
  clientName: string
  originPort: string
  destinationPort: string
  weightKg: number
  costEstimate: number
  status: string
  priority: string
  eta?: string
  shippingLine: string
}

interface KPIs {
  totalOperations: number
  inTransit: number
  pending: number
  completed: number
  avgCost: number
  totalRevenue: number
}

export default function Dashboard() {
  const [operations, setOperations] = useState<Operation[]>([])
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [token, setToken] = useState<string>('')
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
    clientName: '',
    clientEmail: '',
    shippingLine: '',
    costEstimate: '',
    priority: 'NORMAL',
  })

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (t) {
      setToken(t)
      fetchData(t)
    }
  }, [])

  const fetchData = async (authToken: string) => {
    try {
      const [opsRes, kpisRes] = await Promise.all([
        axios.get(`${API_URL}/api/operations`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        axios.get(`${API_URL}/api/dashboard/kpis`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ])

      setOperations(opsRes.data || [])
      setKpis(kpisRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOperation = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${API_URL}/api/operations`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setOperations([response.data, ...operations])
      setShowModal(false)
      setFormData({
        operationCode: '',
        containerNumber: '',
        originPort: '',
        originCountry: '',
        destinationPort: '',
        destinationCountry: '',
        weightKg: '',
        cbm: '',
        incoterm: 'FOB',
        clientName: '',
        clientEmail: '',
        shippingLine: '',
        costEstimate: '',
        priority: 'NORMAL',
      })
    } catch (error) {
      console.error('Error creating operation:', error)
      alert('Error creating operation')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'weightKg' || name === 'cbm' || name === 'costEstimate' ? parseFloat(value) || '' : value,
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rumbo-navy to-blue-900 flex items-center justify-center">
        <p className="text-white font-semibold text-lg">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rumbo-navy to-blue-900">
      {/* Navbar */}
      <nav className="bg-rumbo-navy border-b border-rumbo-coral/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rumbo-coral rounded-lg flex items-center justify-center font-bold text-white">R</div>
            <div>
              <h1 className="text-white font-bold text-xl">Rumbo</h1>
              <p className="text-xs text-gray-300 tracking-wider">FREIGHT OPERATIONS</p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token')
              window.location.href = '/'
            }}
            className="text-sm font-semibold text-gray-300 hover:text-rumbo-coral transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Buenos días, Martín</h2>
          <p className="text-gray-200 text-lg">Aquí está tu resumen de operaciones activas</p>
        </div>

        {/* KPI Cards */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              label="Total Operaciones"
              value={kpis.totalOperations}
              subtext="↑ 12% vs. mes pasado"
              accentColor="coral"
            />
            <KPICard
              label="En Tránsito"
              value={kpis.inTransit}
              subtext="ETA promedio: 8 días"
              accentColor="green"
            />
            <KPICard
              label="Pendientes"
              value={kpis.pending}
              subtext={`${Math.floor(kpis.pending * 0.4)} críticas`}
              accentColor="amber"
            />
            <KPICard
              label="Ingresos Mes"
              value={`$${(kpis.totalRevenue / 1000000).toFixed(1)}M`}
              subtext={`$${((kpis.totalRevenue * 0.27) / 1000).toFixed(0)}k en pipeline`}
              accentColor="green"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-rumbo-coral text-white font-bold rounded-lg hover:opacity-90 transition shadow-lg"
          >
            + Nueva Operación
          </button>
          <Link
            href="/email-processor"
            className="px-6 py-3 bg-white text-rumbo-navy font-bold rounded-lg hover:bg-gray-50 transition border-2 border-rumbo-navy"
          >
            📧 Procesar Email
          </Link>
        </div>

        {/* Operations Table */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
          <div className="px-8 py-6 border-b border-rumbo-border bg-rumbo-light">
            <h2 className="text-xl font-bold text-rumbo-navy">Operaciones Activas</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-rumbo-light border-b border-rumbo-border">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-wider text-rumbo-navy">Código</th>
                  <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-wider text-rumbo-navy">Cliente</th>
                  <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-wider text-rumbo-navy">Ruta</th>
                  <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-wider text-rumbo-navy">Peso</th>
                  <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-wider text-rumbo-navy">Línea</th>
                  <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-wider text-rumbo-navy">Status</th>
                  <th className="px-8 py-4 text-right text-xs font-bold uppercase tracking-wider text-rumbo-navy">Costo</th>
                  <th className="px-8 py-4 text-center text-xs font-bold uppercase tracking-wider text-rumbo-navy">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rumbo-border">
                {operations.map(op => (
                  <tr key={op.id} className="hover:bg-rumbo-light transition">
                    <td className="px-8 py-4 text-sm font-mono font-bold text-rumbo-navy">{op.operationCode}</td>
                    <td className="px-8 py-4 text-sm font-semibold text-rumbo-navy">{op.clientName}</td>
                    <td className="px-8 py-4 text-sm text-gray-600">
                      {op.originPort.split(',')[0]} → {op.destinationPort.split(',')[0]}
                    </td>
                    <td className="px-8 py-4 text-sm text-gray-600">{op.weightKg.toLocaleString()} kg</td>
                    <td className="px-8 py-4 text-sm text-gray-600">{op.shippingLine}</td>
                    <td className="px-8 py-4">
                      <StatusBadge status={op.status as any} size="sm" />
                    </td>
                    <td className="px-8 py-4 text-sm font-bold text-rumbo-navy text-right">${(op.costEstimate / 1000).toFixed(1)}k</td>
                    <td className="px-8 py-4 text-center">
                      <Link href={`/operations/${op.id}`} className="text-rumbo-coral hover:text-rumbo-navy font-bold text-sm transition">
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 border-b border-rumbo-border flex justify-between items-center sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-2xl font-bold text-rumbo-navy">Nueva Operación</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-rumbo-navy text-3xl font-light">×</button>
            </div>

            <form onSubmit={handleCreateOperation} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="operationCode" placeholder="Código (OP-2024-001)" value={formData.operationCode} onChange={handleInputChange} required className="border border-rumbo-border rounded-lg px-4 py-2 font-sans text-rumbo-navy" />
                <input type="text" name="containerNumber" placeholder="Container" value={formData.containerNumber} onChange={handleInputChange} required className="border border-rumbo-border rounded-lg px-4 py-2 font-sans text-rumbo-navy" />
                <input type="text" name="clientName" placeholder="Cliente" value={formData.clientName} onChange={handleInputChange} required className="border border-rumbo-border rounded-lg px-4 py-2 font-sans text-rumbo-navy" />
                <input type="email" name="clientEmail" placeholder="Email cliente (opcional)" value={formData.clientEmail} onChange={handleInputChange} className="border border-rumbo-border rounded-lg px-4 py-2 font-sans text-rumbo-navy" />
                <input type="text" name="originPort" placeholder="Puerto origen" value={formData.originPort} onChange={handleInputChange} required className="border border-rumbo-border rounded-lg px-4 py-2 font-sans text-rumbo-navy" />
                <input type="text" name="originCountry" placeholder="País origen (CN)" value={formData.originCountry} onChange={handleInputChange} required className="border border-rumbo-border rounded-lg px-4 py-2 font-sans text-rumbo-navy" />
                <input type="text" name="destinationPort" placeholder="Puerto destino" value={formData.destinationPort} onChange={handleInputChange} required className="border border-rumbo-border rounded-lg px-4 py-2 font-sans text-rumbo-navy" />
                <input type="text" name="destinationCountry" placeholder="País destino (AR)" value={formData.destinationCountry} onChange={handleInputChange} required className="border border-rumbo-border rounded-lg px-4 py-2 font-sans text-rumbo-navy" />
                <input type="number" name="weightKg" placeholder="Peso (kg)" value={formData.weightKg} onChange={handleInputChange} required className="border border-rumbo-border rounded-lg px-4 py-2 font-sans text-rumbo-navy" />
                <input type="number" name="cbm" placeholder="CBM (opcional)" value={formData.cbm} onChange={handleInputChange} className="border border-rumbo-border rounded-lg px-4 py-2 font-sans text-rumbo-navy" />
                <input type="text" name="shippingLine" placeholder="Línea marítima" value={formData.shippingLine} onChange={handleInputChange} required className="border border-rumbo-border rounded-lg px-4 py-2 font-sans text-rumbo-navy" />
                <select name="incoterm" value={formData.incoterm} onChange={handleInputChange} className="border border-rumbo-border rounded-lg px-4 py-2 font-sans text-rumbo-navy">
                  <option value="FOB">FOB</option>
                  <option value="CIF">CIF</option>
                  <option value="DDP">DDP</option>
                </select>
                <input type="number" name="costEstimate" placeholder="Costo estimado" value={formData.costEstimate} onChange={handleInputChange} required className="border border-rumbo-border rounded-lg px-4 py-2 font-sans text-rumbo-navy" />
                <select name="priority" value={formData.priority} onChange={handleInputChange} className="border border-rumbo-border rounded-lg px-4 py-2 font-sans text-rumbo-navy">
                  <option value="LOW">Baja</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">Alta</option>
                  <option value="CRITICAL">Crítica</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-6 border-t border-rumbo-border">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 border border-rumbo-border rounded-lg text-rumbo-navy font-semibold hover:bg-rumbo-light transition">
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2 bg-rumbo-coral text-white rounded-lg font-semibold hover:opacity-90 transition">
                  Crear Operación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
