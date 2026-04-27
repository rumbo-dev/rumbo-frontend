'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Task {
  id: string
  title: string
  description: string
  priority: string
  status: string
  createdByAi: boolean
  aiConfidence?: number
  estimatedCost?: number
  dueDate?: string
}

interface JourneyStep {
  id: string
  stepNumber: number
  stepName: string
  status: string
  estimatedDate?: string
  actualDate?: string
}

interface TimelineEvent {
  id: string
  title: string
  timestamp: string
  location?: string
}

interface Operation {
  id: string
  operationCode: string
  containerNumber: string
  clientName: string
  originPort: string
  destinationPort: string
  weightKg: number
  incoterm: string
  shippingLine: string
  costEstimate: number
  eta?: string
  tasks: Task[]
  journeySteps: JourneyStep[]
  timelineEvents: TimelineEvent[]
}

export default function OperationDetail({ params }: { params: { id: string } }) {
  const [operation, setOperation] = useState<Operation | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string>('')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (t) {
      setToken(t)
      fetchOperation(t)
    }
  }, [])

  const fetchOperation = async (authToken: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/operations/${params.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      setOperation(response.data.data)
    } catch (error) {
      console.error('Error fetching operation:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    setUpdating(taskId)
    try {
      await axios.patch(`${API_URL}/api/tasks/${taskId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (operation) {
        setOperation({
          ...operation,
          tasks: operation.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t),
        })
      }
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    )
  }

  if (!operation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Operación no encontrada</p>
      </div>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
      case 'CRITICAL':
        return 'bg-red-100 text-red-700'
      case 'NORMAL':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-green-100 text-green-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700'
      case 'PENDING':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-900 text-sm font-semibold mb-3 inline-block">
            ← Volver al Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{operation.containerNumber}</h1>
              <p className="text-gray-500 mt-1">{operation.operationCode} · {operation.clientName}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">${(operation.costEstimate / 1000).toFixed(1)}k</p>
              <p className="text-xs text-gray-500 mt-1">Costo estimado</p>
            </div>
          </div>
        </div>
      </header>

      {/* Journey Progress */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-sm font-semibold text-gray-600 uppercase mb-4">Recorrido del Shipment</h2>
          <div className="flex justify-between items-center gap-2">
            {operation.journeySteps.map((step, idx) => (
              <div key={step.id} className="flex-1 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white mb-2 ${
                  step.status === 'COMPLETED' ? 'bg-green-500' :
                  step.status === 'CURRENT' ? 'bg-blue-500' :
                  'bg-gray-300'
                }`}>
                  {step.status === 'COMPLETED' ? '✓' : step.status === 'CURRENT' ? '●' : '○'}
                </div>
                <p className="text-xs font-semibold text-center text-gray-700">{step.stepName}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Operation Info */}
          <div className="lg:col-span-2">
            {/* Operation Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Detalles del Shipment</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Puerto Origen</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{operation.originPort}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Puerto Destino</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{operation.destinationPort}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Peso</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{operation.weightKg.toLocaleString()} kg</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Incoterm</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{operation.incoterm}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Línea Marítima</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{operation.shippingLine}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Cliente</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{operation.clientName}</p>
                </div>
              </div>
            </div>

            {/* AI Tasks */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Tareas Recomendadas (IA)</h2>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-semibold">
                    {operation.tasks.filter(t => t.createdByAi).length} por IA
                  </span>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {operation.tasks.map(task => (
                  <div key={task.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ml-4 ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4 text-xs">
                        {task.createdByAi && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">IA Confianza:</span>
                            <span className="font-semibold text-gray-900">{(task.aiConfidence || 0 * 100).toFixed(0)}%</span>
                          </div>
                        )}
                        {task.estimatedCost && (
                          <div className="text-gray-500">
                            Est: <span className="font-semibold text-gray-900">${task.estimatedCost}</span>
                          </div>
                        )}
                      </div>

                      <select
                        value={task.status}
                        onChange={e => updateTaskStatus(task.id, e.target.value)}
                        disabled={updating === task.id}
                        className="text-xs font-semibold px-3 py-1 border border-gray-300 rounded bg-white cursor-pointer"
                      >
                        <option value="PENDING">Pendiente</option>
                        <option value="IN_PROGRESS">En Progreso</option>
                        <option value="COMPLETED">Completado</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {[
                  { name: 'Booking Confirmado', date: '2024-01-15', status: 'done' },
                  { name: 'Recepción en puerto', date: '2024-01-22', status: 'done' },
                  { name: 'En océano', date: 'En curso', status: 'current' },
                  { name: 'Arribo estimado', date: operation.eta || '+14 días', status: 'pending' },
                  { name: 'Desembarque', date: 'Por confirmar', status: 'pending' },
                  { name: 'Entrega final', date: 'Por confirmar', status: 'pending' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        item.status === 'done' ? 'bg-green-500' :
                        item.status === 'current' ? 'bg-blue-500' :
                        'bg-gray-300'
                      }`} />
                      {idx < 5 && <div className={`w-0.5 h-12 mt-2 ${
                        item.status === 'done' ? 'bg-green-500' : 'bg-gray-300'
                      }`} />}
                    </div>
                    <div className="pb-2">
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
