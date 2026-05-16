'use client'

import { Send, Edit3, MessageCircle, Mail } from 'lucide-react'

interface Props {
  subject: string | null | undefined
  body: string | null | undefined
  channel: string
  confidence?: number | null
  onApprove?: () => void
  onEdit?: () => void
  onAskMore?: () => void
}

export default function DraftEmailCard({ subject, body, channel, confidence, onApprove, onEdit, onAskMore }: Props) {
  if (!body) return null
  const isEmail = channel === 'EMAIL'
  const ChannelIcon = isEmail ? Mail : MessageCircle

  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px 22px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--rumbo-navy-soft)',
            color: 'var(--rumbo-navy)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <ChannelIcon size={16} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Draft AI · {channel === 'EMAIL' ? 'Email' : channel === 'WHATSAPP' ? 'WhatsApp' : 'Web'}
            </div>
            {subject && (
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {subject}
              </div>
            )}
          </div>
        </div>
        {confidence != null && (
          <span style={{
            padding: '4px 10px',
            background: 'var(--success-bg)',
            color: 'var(--success-fg)',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 600,
            flexShrink: 0,
          }}>
            {Math.round(confidence * 100)}% confidence
          </span>
        )}
      </div>

      <div style={{ padding: '20px 22px' }}>
        <pre style={{
          margin: 0,
          fontFamily: 'inherit',
          fontSize: '13.5px',
          lineHeight: 1.6,
          color: 'var(--text-primary)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {body}
        </pre>
      </div>

      <div style={{
        padding: '14px 22px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        gap: '10px',
        background: 'var(--surface-hover)',
      }}>
        <button
          onClick={onApprove}
          style={{
            padding: '10px 18px',
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
          <Send size={13} />
          Aprobar y enviar
        </button>
        <button
          onClick={onEdit}
          style={{
            padding: '10px 16px',
            background: 'var(--surface-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-strong)',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Edit3 size={13} />
          Editar
        </button>
        <button
          onClick={onAskMore}
          style={{
            padding: '10px 16px',
            background: 'var(--surface-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-strong)',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Pedir info adicional
        </button>
      </div>
    </div>
  )
}
