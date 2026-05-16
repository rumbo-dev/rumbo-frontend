'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, MessageSquare } from 'lucide-react'

interface Props {
  message: string
  channel: string
  defaultOpen?: boolean
}

export default function OriginalMessageCollapsible({ message, channel, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: '10px',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '14px 18px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13.5px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          textAlign: 'left',
        }}
      >
        <MessageSquare size={15} style={{ color: 'var(--text-tertiary)' }} />
        <span style={{ flex: 1 }}>Mensaje original del cliente ({channel})</span>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {open && (
        <div style={{
          padding: '0 18px 18px',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '14px',
        }}>
          <pre style={{
            margin: 0,
            fontFamily: 'inherit',
            fontSize: '13.5px',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {message}
          </pre>
        </div>
      )}
    </div>
  )
}
