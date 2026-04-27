'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Ship, MapPin, Weight, DollarSign, Mail } from 'lucide-react'
import { EmailDraftCard } from '@/components/EmailDraftCard'

interface Operation {
  id: string
  operationCode: string
  containerNumber: string
  status: string
  currentStage: string
  originPort: string
  originCountry: string
  destinationPort: string
  destinationCountry: string
  weightKg: number
  incoterm: string
  clientName: string
  costEstimate: number
  costActual?: number
  eta?: string
  priority: string
  notes?: string
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
  createdByAi: boolean
  aiConfidence?: number
}

interface JourneyStep {
  id: string
  stepNumber: number
  stepName: string
  status: string
  actualDate?: string
}

interface TimelineEvent {
  id: string
  title: string
  eventType: string
  timestamp: string
}

interface EmailDraft {
  id: string
  to: string
  subject: string
  body: string
  status: 'DRAFT' | 'APPROVED' | 'SENT' | 'REJECTED'
  aiGenerated: boolean
  aiReasoning?: string
  sentAt?: string
  createdAt: string
}

export default function OperationPage() {
  const params = useParams()
  const router = useRouter()
  const operationId = params.id as string

  const [operation, setOperation] = useState<Operation | null>(null)
  const [drafts, setDrafts] = useState<EmailDraft[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOperation()
    fetchDrafts()
  }, [operationId])

  const fetchOperation = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/operations/${operationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Failed to fetch operation')
      const data = await response.json()
      setOperation(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const fetchDrafts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/emails/drafts/${operationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setDrafts(data)
      }
    } catch (err) {
      console.error('Failed to fetch drafts:', err)
    }
  }

  const handleApproveDraft = async (draftId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/emails/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ draftId }),
      })
      if (!response.ok) throw new Error('Failed to send email')
      await fetchDrafts()
    } catch (err) {
      console.error('Error sending email:', err)
    }
  }

  if (loading) return <div className="p-8 text-center">Cargando...</div>
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>
  if (!operation) return <div className="p-8 text-center">Operación no encontrada</div>

  const statusColors = {
    DRAFT: 'text-amber-700 bg-amber-50',
    ACTIVE: 'text-emerald-700 bg-emerald-50',
    COMPLETED: 'text-blue-700 bg-blue-50',
  }

  const priorityColors = {
    LOW: 'text-gray-700 bg-gray-50',
    NORMAL: 'text-blue-700 bg-blue-50',
    HIGH: 'text-orange-700 bg-orange-50',
    CRITICAL: 'text-red-700 bg-red-50',
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)' }}>
      <div className="sticky top-0 z-40 border-b border-gray-200/50 bg-white/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Operaciones</span>
          </button>
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Operación</p>
            <p className="text-lg font-bold text-gray-900">{operation.operationCode}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div
          className="mb-8 rounded-3xl border-2 border-gray-200/50 p-8 backdrop-blur-sm"
          style={{ background: 'linear-gradient(135deg, rgba(18, 40, 76, 0.05), rgba(232, 133, 106, 0.05))' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white/60 p-3 backdrop-blur-sm">
                <Ship className="h-5 w-5" style={{ color: '#12284C' }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Container</p>
                <p className="text-sm font-bold text-gray-900">{operation.containerNumber}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white/60 p-3 backdrop-blur-sm">
                <MapPin className="h-5 w-5" style={{ color: '#12284C' }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ruta</p>
                <p className="text-sm font-bold text-gray-900">
                  {operation.originPort} → {operation.destinationPort}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white/60 p-3 backdrop-blur-sm">
                <Weight className="h-5 w-5" style={{ color: '#12284C' }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Peso</p>
                <p className="text-sm font-bold text-gray-900">{operation.weightKg.toLocaleString()} kg</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white/60 p-3 backdrop-blur-sm">
                <DollarSign className="h-5 w-5" style={{ color: '#12284C' }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Costo estimado</p>
                <p className="text-sm font-bold text-gray-900">${operation.costEstimate.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-xs font-semibold ${statusColors[operation.status as keyof typeof statusColors]}`}>
              {operation.status}
            </span>
            <span className={`px-4 py-2 rounded-full text-xs font-semibold ${priorityColors[operation.priority as keyof typeof priorityColors]}`}>
              Prioridad: {operation.priority}
            </span>
            <span className="px-4 py-2 rounded-full text-xs font-semibold text-blue-700 bg-blue-50">
              Stage: {operation.currentStage}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">📧 Emails Sugeridos</h2>
              <p className="text-sm text-gray-600">
                {drafts.length === 0
                  ? 'No hay emails sugeridos todavía'
                  : `${drafts.length} email${drafts.length !== 1 ? 's' : ''} disponible${drafts.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            <div className="space-y-4">
              {drafts.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Cuando IA detecte un email, verás los drafts aquí</p>
                </div>
              ) : (
                drafts.map((draft) => (
                  <EmailDraftCard key={draft.id} draft={draft} onApprove={handleApproveDraft} onReject={() => {}} />
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">✓ Tareas</h3>
              <div className="space-y-3">
                {operation.tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="rounded-xl bg-white p-4 border border-gray-200/50 hover:border-gray-300 transition-all">
                    <p className="text-sm font-semibold text-gray-900 mb-1">{task.title}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-600">{task.status}</span>
                      {task.createdByAi && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">AI</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">🚢 Recorrido</h3>
              <div className="space-y-2">
                {operation.journeySteps.map((step) => (
                  <div key={step.id} className="flex items-center gap-3 text-sm">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        background: step.status === 'COMPLETED' ? '#0EA874' : step.status === 'IN_PROGRESS' ? '#E8856A' : '#E5E7EB',
                      }}
                    />
                    <span className={step.status === 'COMPLETED' ? 'text-gray-900 font-semibold' : 'text-gray-600'}>{step.stepName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Timeline</h2>
          <div className="rounded-2xl border-2 border-gray-200/50 bg-white p-6">
            <div className="space-y-4">
              {operation.timelineEvents.slice(0, 8).map((event) => (
                <div key={event.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="text-xs text-gray-500 font-semibold w-24 shrink-0">
                    {new Date(event.timestamp).toLocaleDateString('es-AR')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-500">{event.eventType}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
