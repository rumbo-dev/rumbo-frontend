'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MoreHorizontal, Send, Mail, FileText, AlertCircle, Check } from 'lucide-react'
import { StatusBadge, Button, Card, Stat } from '@/components/index'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Operation {
  id: string
  operationCode: string
  containerNumber?: string | null
  status: string
  subStatus: string
  currentOwner: string
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
  costEstimate?: number | null
  costActual?: number | null
  eta?: string | null
  priority: string
  notes?: string | null
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
}

interface TimelineEvent {
  id: string
  title: string
  eventType: string
  timestamp: string
  description?: string
}

interface EmailDraft {
  id: string
  to: string
  subject: string
  body: string
  status: 'DRAFT' | 'APPROVED' | 'SENT' | 'REJECTED'
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface-app)', padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
        Loading...
      </div>
    )
  }

  if (!operation) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface-app)', padding: '32px', textAlign: 'center' }}>
        Operation not found
      </div>
    )
  }

  const pendingTasks = operation.tasks.filter((t) => t.status === 'PENDING')
  const aiTasks = pendingTasks.filter((t) => t.createdByAi)
  const pendingDrafts = drafts.filter((d) => d.status === 'DRAFT')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-app)' }}>
      {/* Top Nav */}
      <nav style={{ height: '56px', background: 'var(--surface-card)', borderBottom: '1px solid var(--border-default)', padding: '0 32px', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '40px' }}><img src='/logo-icon.png' alt='Rumbo' style={{ height: '24px', width: 'auto' }} /><span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Rumbo</span></div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--rumbo-navy)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>D</div>
        </div>
      </nav>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px' }}>
        {/* Back link */}
        <button
          onClick={() => router.push('/dashboard')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: 'var(--text-tertiary)', fontSize: '13px', cursor: 'pointer', padding: 0, marginBottom: '20px' }}
        >
          <ArrowLeft size={14} />
          Operations
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: '32px' }}>
              {operation.operationCode}
            </h1>
            <div style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              {operation.clientName} <span style={{ color: 'var(--text-quaternary)', margin: '0 6px' }}>·</span> Container {operation.containerNumber}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="sm">Edit</Button>
            <Button variant="secondary" size="sm">
              <MoreHorizontal size={14} />
            </Button>
          </div>
        </div>

        {/* Badges row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <StatusBadge status={operation.status} />
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', padding: '0 8px', height: '22px', display: 'inline-flex', alignItems: 'center', borderRadius: '6px', background: 'var(--surface-muted)' }}>
            {operation.incoterm} / {operation.mode || 'FCL'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', height: '22px', display: 'inline-flex', alignItems: 'center' }}>
            Priority: <span style={{ color: 'var(--text-primary)', fontWeight: 500, marginLeft: '4px' }}>{operation.priority}</span>
          </div>
        </div>

        {/* Stat strip */}
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
            <Stat
              label="Route"
              value={`${operation.originPort?.split(',')[0] || 'TBD'} → ${operation.destinationPort?.split(',')[0] || 'TBD'}`}
              subtext={`${operation.shippingLine}`}
            />
            <Stat
              label="ETA"
              value={formatDate(operation.eta)}
              subtext={operation.eta ? getRelativeDate(operation.eta) : 'Not scheduled'}
            />
            <Stat
              label="Cost"
              value={`$${operation.costEstimate.toLocaleString()}`}
              subtext={operation.costActual ? `Actual: $${operation.costActual.toLocaleString()}` : 'Estimate'}
            />
            <Stat
              label="Weight"
              value={`${operation.weightKg.toLocaleString()} kg`}
              subtext={operation.cbm ? `${operation.cbm} CBM` : undefined}
            />
          </div>
        </Card>

        {/* Two-column section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '16px', marginTop: '16px' }}>
          {/* AI Suggestions (left) */}
          <Card padding={false}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>AI suggestions</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
                  {pendingDrafts.length + aiTasks.length} pending review
                </p>
              </div>
            </div>

            {pendingDrafts.length === 0 && aiTasks.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <Mail size={28} style={{ color: 'var(--text-quaternary)', margin: '0 auto 12px' }} />
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>No suggestions yet</div>
                <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  AI will analyze incoming emails and suggest actions
                </div>
              </div>
            ) : (
              <div>
                {pendingDrafts.map((draft) => (
                  <DraftItem key={draft.id} draft={draft} onApprove={() => handleApprove(draft.id)} />
                ))}
                {aiTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            )}
          </Card>

          {/* Right column: Journey + Tasks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Card padding={false}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Journey</h2>
              </div>
              <div style={{ padding: '20px 24px' }}>
                {operation.journeySteps.map((step, idx) => (
                  <JourneyRow key={step.id} step={step} isLast={idx === operation.journeySteps.length - 1} />
                ))}
              </div>
            </Card>

            <Card padding={false}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Tasks</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
                  {pendingTasks.length} pending
                </p>
              </div>
              <div>
                {operation.tasks.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                    No tasks
                  </div>
                ) : (
                  operation.tasks.slice(0, 5).map((task) => (
                    <div key={task.id} style={{ padding: '14px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{task.title}</div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                        <StatusBadge status={task.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Activity */}
        <div style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>Activity</h2>
          <Card padding={false}>
            {operation.timelineEvents.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                No activity yet
              </div>
            ) : (
              operation.timelineEvents.slice(0, 10).map((event, idx) => (
                <div
                  key={event.id}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '14px 24px',
                    borderBottom: idx < Math.min(operation.timelineEvents.length, 10) - 1 ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', width: '120px', flexShrink: 0, paddingTop: '1px' }}>
                    {formatDateTime(event.timestamp)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{event.title}</div>
                    {event.description && (
                      <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{event.description}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function DraftItem({ draft, onApprove }: { draft: EmailDraft; onApprove: () => void }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--rumbo-coral-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Mail size={14} style={{ color: 'var(--rumbo-coral)' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
            Email draft
          </div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>
            {draft.subject}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
            To: {draft.to}
          </div>
          <div
            onClick={() => setExpanded(!expanded)}
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              padding: '10px 12px',
              background: 'var(--surface-app)',
              borderRadius: '6px',
              cursor: 'pointer',
              maxHeight: expanded ? 'none' : '60px',
              overflow: 'hidden',
              whiteSpace: 'pre-wrap',
              lineHeight: '20px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {draft.body}
          </div>
          {draft.body.length > 150 && (
            <button onClick={() => setExpanded(!expanded)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', fontSize: '12px', cursor: 'pointer', padding: '4px 0', marginTop: '4px' }}>
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <Button variant="secondary" size="sm">Reject</Button>
            <Button size="sm" onClick={onApprove}>
              <Send size={13} />
              Approve & send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TaskItem({ task }: { task: Task }) {
  return (
    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <AlertCircle size={14} style={{ color: 'var(--warning-fg)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
            Suggested task · {task.priority}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{task.title}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{task.description}</div>
          {task.aiConfidence && (
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
              AI · {Math.round(task.aiConfidence * 100)}% confidence
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <Button variant="secondary" size="sm">Dismiss</Button>
            <Button size="sm">
              <Check size={13} />
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function JourneyRow({ step, isLast }: { step: JourneyStep; isLast: boolean }) {
  const isCompleted = step.status === 'COMPLETED'
  const isCurrent = step.status === 'CURRENT' || step.status === 'IN_PROGRESS'
  const dotColor = isCompleted ? 'var(--success-dot)' : isCurrent ? 'var(--info-dot)' : 'var(--border-strong)'
  const labelColor = isCompleted || isCurrent ? 'var(--text-primary)' : 'var(--text-tertiary)'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', paddingBottom: isLast ? 0 : '14px' }}>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
        {!isLast && <div style={{ position: 'absolute', top: '8px', width: '1px', height: '20px', background: 'var(--border-default)' }} />}
      </div>
      <div style={{ flex: 1, fontSize: '13px', fontWeight: isCurrent ? 500 : 400, color: labelColor }}>
        {step.stepName}
      </div>
      {isCompleted && <span style={{ fontSize: '11px', color: 'var(--success-fg)', fontWeight: 500 }}>Done</span>}
      {isCurrent && <span style={{ fontSize: '11px', color: 'var(--info-fg)', fontWeight: 500 }}>Active</span>}
    </div>
  )
}

function getRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
  if (diffDays === 0) return 'today'
  return `in ${diffDays} days`
}
