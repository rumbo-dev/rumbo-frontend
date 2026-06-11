'use client'

import { useEffect, useState } from 'react'
import {
  Sparkles, Send, X, ChevronDown, ChevronUp, AlertTriangle, Info,
  Mail, MessageCircle, Eye, Activity, Search, ArrowUpDown, TrendingUp, FileText,
} from 'lucide-react'
import type { Attachment as AttachmentT } from './AttachmentsList'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-ad432.up.railway.app'

export interface SuggestedTask {
  id: string
  operationId: string
  type: string
  priority: 'urgent' | 'high' | 'medium' | 'low' | string
  agentSource?: string | null
  isInformational: boolean
  title: string
  description?: string | null
  draftSubject?: string | null
  draftTo?: string | null
  draftCc?: string | null
  draftBody?: string | null
  actionLabel?: string | null
  confidence?: number | null
  attachmentIds: string[]
  attachments: AttachmentT[]
  status: string
  createdAt: string
}

interface Props {
  operationId: string
}

// Color por priority (border + accent en la card)
const PRIORITY_STYLES: Record<string, { border: string; bg: string; label: string }> = {
  urgent: { border: 'var(--danger-fg)',  bg: 'var(--danger-bg)',  label: 'Urgente'  },
  high:   { border: 'var(--rumbo-coral)', bg: 'var(--rumbo-coral-soft)', label: 'Alta' },
  medium: { border: 'var(--warning-fg)', bg: 'var(--warning-bg)', label: 'Media'    },
  low:    { border: 'var(--info-fg)',    bg: 'var(--info-bg)',    label: 'Baja'     },
}

// Color + label + icon por type/agent
const AGENT_STYLES: Record<string, { bg: string; fg: string; icon: React.ReactNode }> = {
  REPLY:  { bg: 'var(--info-bg)',          fg: 'var(--info-fg)',     icon: <Mail size={11} /> },
  QUOTE:  { bg: 'var(--rumbo-coral-soft)', fg: 'var(--rumbo-coral)', icon: <Sparkles size={11} /> },
  WATCH:  { bg: 'var(--warning-bg)',        fg: 'var(--warning-fg)',  icon: <Eye size={11} /> },
  CLEAR:  { bg: 'var(--success-bg)',        fg: 'var(--success-fg)',  icon: <Search size={11} /> },
  READ:   { bg: 'var(--rumbo-navy-soft)',  fg: 'var(--rumbo-navy)',  icon: <Activity size={11} /> },
  RANK:   { bg: 'var(--neutral-bg)',        fg: 'var(--neutral-fg)',  icon: <ArrowUpDown size={11} /> },
  GROWTH: { bg: '#F0EBFE',                  fg: '#6D4AC4',            icon: <TrendingUp size={11} /> },
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

export default function SuggestedTasksPanel({ operationId }: Props) {
  const [tasks, setTasks] = useState<SuggestedTask[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let cancelled = false
    fetch(`${API_URL}/api/operations/${operationId}/suggested-tasks`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { if (!cancelled) { setTasks(data); setLoading(false) } })
      .catch(() => { if (!cancelled) { setTasks([]); setLoading(false) } })
    return () => { cancelled = true }
  }, [operationId])

  if (loading || !tasks || tasks.length === 0) return null

  const urgentCount = tasks.filter((t) => t.priority === 'urgent').length

  return (
    <section style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--rumbo-navy), var(--rumbo-coral))',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles size={17} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 style={{
              fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)',
              margin: 0, letterSpacing: '-0.01em',
            }}>
              Tareas sugeridas · {tasks.length}
            </h2>
            {urgentCount > 0 && (
              <span style={{
                padding: '3px 10px',
                background: 'var(--danger-fg)',
                color: 'white',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <AlertTriangle size={11} />
                {urgentCount} urgente{urgentCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '3px 0 0 0' }}>
            Rumbo detectó {tasks.length} acciones para esta operación. Revisalas y aprobá las que correspondan.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {tasks.map((task) => {
          const pri = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium
          const agent = AGENT_STYLES[task.type] || AGENT_STYLES.READ
          const isExpanded = expanded[task.id] ?? (task.priority === 'urgent') // urgentes empiezan expandidas
          const hasDraft = !!task.draftBody

          return (
            <div
              key={task.id}
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border-default)',
                borderLeft: `4px solid ${pri.border}`,
                borderRadius: '10px',
                overflow: 'hidden',
                opacity: task.isInformational ? 0.92 : 1,
              }}
            >
              {/* Header */}
              <div style={{ padding: '14px 18px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '3px 8px',
                    background: agent.bg, color: agent.fg,
                    borderRadius: '5px',
                    fontSize: '10.5px', fontWeight: 700,
                    letterSpacing: '0.06em',
                  }}>
                    {agent.icon} {task.type}
                  </span>
                  <span style={{
                    padding: '3px 8px',
                    background: pri.bg, color: pri.border,
                    borderRadius: '999px',
                    fontSize: '10.5px', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {pri.label}
                  </span>
                  {task.isInformational && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '3px 8px',
                      background: 'var(--neutral-bg)', color: 'var(--neutral-fg)',
                      borderRadius: '5px',
                      fontSize: '10.5px', fontWeight: 600,
                    }}>
                      <Info size={10} /> Informativo
                    </span>
                  )}
                  {task.confidence != null && (
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: '11px',
                      color: 'var(--text-tertiary)',
                    }}>
                      {task.confidence}% confidence
                    </span>
                  )}
                </div>

                <div style={{
                  fontSize: '14.5px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: task.description ? '4px' : 0,
                  lineHeight: 1.4,
                }}>
                  {task.title}
                </div>
                {task.description && (
                  <div style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                  }}>
                    {task.description}
                  </div>
                )}
              </div>

              {/* Draft section */}
              {hasDraft && (
                <div style={{
                  borderTop: '1px solid var(--border-subtle)',
                  background: 'var(--surface-hover)',
                }}>
                  {/* Draft meta — siempre visible si hay draft */}
                  <div style={{ padding: '10px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', minWidth: '36px' }}>To</span>
                      <span style={{ fontSize: '12.5px', color: 'var(--text-primary)' }}>{task.draftTo}</span>
                    </div>
                    {task.draftCc && (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', minWidth: '36px' }}>Cc</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{task.draftCc}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', minWidth: '36px' }}>Asunto</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{task.draftSubject}</span>
                    </div>
                  </div>

                  {/* Toggle ver draft body */}
                  <button
                    onClick={() => setExpanded((s) => ({ ...s, [task.id]: !isExpanded }))}
                    style={{
                      width: '100%',
                      padding: '8px 18px',
                      background: 'transparent',
                      border: 'none',
                      borderTop: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <span>{isExpanded ? 'Ocultar mensaje' : 'Ver mensaje completo'}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {isExpanded && (
                    <div style={{
                      padding: '12px 18px 16px',
                      borderTop: '1px solid var(--border-subtle)',
                      background: 'var(--surface-card)',
                    }}>
                      <pre style={{
                        margin: 0,
                        fontFamily: 'inherit',
                        fontSize: '13px',
                        lineHeight: 1.55,
                        color: 'var(--text-primary)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        maxHeight: '320px',
                        overflowY: 'auto',
                      }}>
                        {task.draftBody}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Attachments */}
              {task.attachments && task.attachments.length > 0 && (
                <div style={{
                  padding: '10px 18px',
                  background: 'var(--surface-card)',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}>
                    Adjuntos
                  </span>
                  {task.attachments.map((a) => (
                    <a
                      key={a.id}
                      href={a.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 9px',
                        background: 'var(--rumbo-coral-soft)',
                        color: 'var(--rumbo-coral)',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        textDecoration: 'none',
                        transition: 'background 120ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--rumbo-coral)') && void (e.currentTarget.style.color = 'white')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--rumbo-coral-soft)') && void (e.currentTarget.style.color = 'var(--rumbo-coral)')}
                      title={`${a.filename} · ${formatBytes(a.sizeBytes)}`}
                    >
                      <FileText size={11} />
                      {a.filename}
                    </a>
                  ))}
                </div>
              )}

              {/* CTA bar */}
              <div style={{
                padding: '12px 18px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                gap: '8px',
                background: 'var(--surface-card)',
              }}>
                {hasDraft ? (
                  <button
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, var(--rumbo-coral), var(--rumbo-coral-hover))',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(244, 122, 90, 0.25)',
                    }}
                  >
                    <Send size={12} />
                    Aprobar y enviar
                  </button>
                ) : task.isInformational ? (
                  <button
                    style={{
                      padding: '8px 16px',
                      background: 'var(--surface-hover)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    {task.actionLabel || 'Ver detalle'}
                  </button>
                ) : (
                  <button
                    style={{
                      padding: '8px 16px',
                      background: 'var(--rumbo-navy)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {task.actionLabel || 'Ejecutar'}
                  </button>
                )}
                <button
                  style={{
                    padding: '8px 14px',
                    background: 'transparent',
                    color: 'var(--text-tertiary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <X size={12} />
                  Descartar
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
