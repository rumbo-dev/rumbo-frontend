'use client'

import { useEffect, useState } from 'react'
import { X, Eye, GitBranch, Lightbulb, Send, Zap, Bot, Clock } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-ad432.up.railway.app'

interface AgentDecision {
  id: string
  agentName: string
  decisionType: string
  inputData: { label?: string; body?: string } | null
  outputData: {
    reasoning?: string
    alternatives?: Array<{ option: string; why_rejected: string }>
    action?: string
    summary?: string
  } | null
  confidence: number | null
  modelUsed: string | null
  wasAutoApplied: boolean
  latencyMs: number | null
  tokensInput: number | null
  tokensOutput: number | null
  createdAt: string
  operation?: { operationCode: string; clientName: string } | null
}

const AGENT_COLORS: Record<string, { bg: string; fg: string }> = {
  READ:   { bg: 'var(--rumbo-navy-soft)', fg: 'var(--rumbo-navy)' },
  WATCH:  { bg: 'var(--warning-bg)',       fg: 'var(--warning-fg)' },
  CLEAR:  { bg: 'var(--success-bg)',       fg: 'var(--success-fg)' },
  QUOTE:  { bg: 'var(--rumbo-coral-soft)', fg: 'var(--rumbo-coral)' },
  REPLY:  { bg: 'var(--info-bg)',          fg: 'var(--info-fg)' },
  RANK:   { bg: 'var(--neutral-bg)',       fg: 'var(--neutral-fg)' },
  GROWTH: { bg: '#F0EBFE',                 fg: '#6D4AC4' },
}

interface Props {
  decisionId: string
  onClose: () => void
}

export default function AgentDecisionModal({ decisionId, onClose }: Props) {
  const [decision, setDecision] = useState<AgentDecision | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`${API_URL}/api/agent-decisions/${decisionId}`)
      .then((r) => {
        if (r.status === 404) throw new Error('No encontrado')
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d) => setDecision(d as AgentDecision))
      .catch((err) => setError(err.message || 'Error de red'))
      .finally(() => setLoading(false))
  }, [decisionId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 200ms ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface-card)',
          borderRadius: '16px',
          maxWidth: '720px',
          width: 'calc(100% - 48px)',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
          animation: 'slideUp 250ms ease',
        }}
      >
        {loading && (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            Cargando trace…
          </div>
        )}

        {error && !loading && (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'var(--danger-fg)', marginBottom: '14px' }}>{error}</p>
            <button onClick={onClose} style={btnPrimary}>Cerrar</button>
          </div>
        )}

        {decision && !loading && (
          <>
            <ModalHeader decision={decision} onClose={onClose} />
            <div style={{ padding: '0 32px 32px' }}>
              <Section icon={<Eye size={16} />} title="Lo que vi" subtitle="Input que recibió el agente">
                <div style={{
                  background: 'var(--surface-app)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  fontSize: '13px',
                }}>
                  {decision.inputData?.label && (
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      {decision.inputData.label}
                    </div>
                  )}
                  {decision.inputData?.body && (
                    <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {decision.inputData.body}
                    </div>
                  )}
                </div>
              </Section>

              {decision.outputData?.alternatives && decision.outputData.alternatives.length > 0 && (
                <Section icon={<GitBranch size={16} />} title="Lo que consideré" subtitle={`${decision.outputData.alternatives.length} alternativas evaluadas`}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {decision.outputData.alternatives.map((alt, idx) => (
                      <div key={idx} style={{
                        background: 'var(--surface-app)',
                        border: '1px solid var(--border-default)',
                        borderLeft: '3px solid var(--text-quaternary)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                      }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                          ↳ {alt.option}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                          <strong style={{ color: 'var(--text-secondary)' }}>Descartado:</strong> {alt.why_rejected}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {decision.outputData?.reasoning && (
                <Section icon={<Lightbulb size={16} />} title="Por qué decidí esto" subtitle="Razonamiento del agente">
                  <div style={{
                    background: 'linear-gradient(135deg, var(--rumbo-coral-soft), var(--surface-card))',
                    border: '1px solid var(--rumbo-coral)',
                    borderLeft: '4px solid var(--rumbo-coral)',
                    borderRadius: '10px',
                    padding: '16px 18px',
                    fontSize: '13.5px',
                    lineHeight: 1.65,
                    color: 'var(--text-primary)',
                  }}>
                    {decision.outputData.reasoning}
                  </div>
                </Section>
              )}

              {decision.outputData?.action && (
                <Section icon={<Send size={16} />} title="Lo que hice" subtitle="Acción ejecutada">
                  <div style={{
                    background: 'var(--surface-app)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    fontSize: '13px',
                  }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {decision.outputData.action}
                    </div>
                    {decision.outputData.summary && (
                      <div style={{ color: 'var(--text-secondary)', fontSize: '12.5px', lineHeight: 1.5 }}>
                        {decision.outputData.summary}
                      </div>
                    )}
                  </div>
                </Section>
              )}

              <ModalFooter decision={decision} />
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  )
}

function ModalHeader({ decision, onClose }: { decision: AgentDecision; onClose: () => void }) {
  const col = AGENT_COLORS[decision.agentName] || AGENT_COLORS.READ
  return (
    <div style={{
      padding: '24px 32px 16px',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      background: 'var(--surface-card)',
      zIndex: 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span style={{
              padding: '4px 10px',
              background: col.bg,
              color: col.fg,
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.06em',
            }}>
              {decision.agentName}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              {decision.decisionType.replace(/_/g, ' ')}
            </span>
            {decision.confidence != null && (
              <span style={{
                padding: '3px 10px',
                background: decision.confidence >= 0.9 ? 'var(--success-bg)' : 'var(--warning-bg)',
                color: decision.confidence >= 0.9 ? 'var(--success-fg)' : 'var(--warning-fg)',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 600,
              }}>
                {Math.round(decision.confidence * 100)}% confidence
              </span>
            )}
            {decision.wasAutoApplied && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 10px',
                background: 'var(--rumbo-navy-soft)',
                color: 'var(--rumbo-navy)',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 600,
              }}>
                <Zap size={11} />
                Auto-aplicado
              </span>
            )}
          </div>
          <h2 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
          }}>
            {decision.outputData?.action || decision.decisionType.replace(/_/g, ' ')}
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            background: 'transparent',
            border: 'none',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-tertiary)',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}

function ModalFooter({ decision }: { decision: AgentDecision }) {
  const ts = new Date(decision.createdAt)
  return (
    <div style={{
      marginTop: '24px',
      paddingTop: '16px',
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px',
      fontSize: '11.5px',
      color: 'var(--text-tertiary)',
    }}>
      <FooterStat icon={<Clock size={11} />} label="Timestamp" value={ts.toLocaleString('es-AR')} />
      {decision.modelUsed && <FooterStat icon={<Bot size={11} />} label="Modelo" value={decision.modelUsed} />}
      {decision.latencyMs != null && <FooterStat icon={<Zap size={11} />} label="Latencia" value={`${decision.latencyMs}ms`} />}
      {decision.tokensInput != null && (
        <FooterStat icon={null} label="Tokens" value={`${decision.tokensInput.toLocaleString()} in / ${(decision.tokensOutput || 0).toLocaleString()} out`} />
      )}
      {decision.operation && (
        <FooterStat
          icon={null}
          label="Operación"
          value={`${decision.operation.operationCode} · ${decision.operation.clientName}`}
        />
      )}
    </div>
  )
}

function FooterStat({ icon, label, value }: { icon: React.ReactNode | null; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '10px',
        color: 'var(--text-quaternary)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontWeight: 600,
      }}>
        {icon}
        {label}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
        {value}
      </div>
    </div>
  )
}

function Section({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ color: 'var(--text-tertiary)', display: 'inline-flex' }}>{icon}</span>
        <h3 style={{
          margin: 0,
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          {title}
        </h3>
        {subtitle && (
          <span style={{ fontSize: '11.5px', color: 'var(--text-quaternary)' }}>
            · {subtitle}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

const btnPrimary = {
  padding: '10px 18px',
  background: 'var(--rumbo-navy)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
}
