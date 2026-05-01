'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolsUsed?: string[]
}

const SUGGESTED_QUESTIONS = [
  '¿Qué operaciones están demoradas?',
  '¿Cuál es mi exposición financiera?',
  'Resumime cómo viene este mes',
  'Compará MSC vs Maersk',
]

const TOOL_NAMES: Record<string, string> = {
  'get_operations': 'consultando operaciones',
  'get_operation_details': 'leyendo detalles',
  'find_operations_with_issues': 'buscando problemas',
  'calculate_financial_exposure': 'calculando exposición',
  'compare_carriers': 'comparando carriers',
}

export default function AIChatButton() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [currentTool, setCurrentTool] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentTool])

  const sendMessage = async (question: string) => {
    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content: question }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setCurrentTool(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      const toolsUsed: string[] = []

      const assistantMsgId = `assistant-${Date.now()}`
      setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }])

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'tool_use') {
              setCurrentTool(TOOL_NAMES[data.tool] || data.tool)
              toolsUsed.push(data.tool)
            } else if (data.type === 'response_chunk') {
              assistantContent += data.content
              setMessages(prev => prev.map(m =>
                m.id === assistantMsgId ? { ...m, content: assistantContent, toolsUsed } : m
              ))
              setCurrentTool(null)
            } else if (data.type === 'error') {
              setMessages(prev => prev.map(m =>
                m.id === assistantMsgId ? { ...m, content: 'Error: ' + data.message } : m
              ))
            }
          } catch (e) {}
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Error de conexión. Intentá de nuevo.',
      }])
    } finally {
      setLoading(false)
      setCurrentTool(null)
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '14px 20px',
          background: 'linear-gradient(135deg, var(--rumbo-navy), var(--rumbo-coral))',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: 'var(--shadow-lg)',
          zIndex: 50,
          transition: 'transform 200ms ease',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="currentColor"/>
        </svg>
        Preguntale a Rumbo
      </button>

      {/* Modal */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface-card)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '720px',
              height: '80vh',
              maxHeight: '720px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-popover)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--rumbo-navy), var(--rumbo-coral))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Preguntale a Rumbo
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    Tu asistente operativo en lenguaje natural
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                color: 'var(--text-tertiary)',
                display: 'flex',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
              {messages.length === 0 ? (
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Probá con estas preguntas:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(q)}
                        style={{
                          padding: '12px 16px',
                          background: 'var(--surface-app)',
                          border: '1px solid var(--border-default)',
                          borderRadius: '10px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '13.5px',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div style={{
                        maxWidth: '85%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: msg.role === 'user' ? 'var(--rumbo-navy)' : 'var(--surface-app)',
                        color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                        fontSize: '14px',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-wrap',
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {currentTool && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: 'var(--rumbo-coral-soft)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: 'var(--rumbo-coral-hover)',
                      alignSelf: 'flex-start',
                    }}>
                      Rumbo está {currentTool}...
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (input.trim() && !loading) sendMessage(input.trim())
              }}
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-default)',
                display: 'flex',
                gap: '8px',
              }}
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Preguntá lo que quieras..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: '1px solid var(--border-default)',
                  borderRadius: '10px',
                  outline: 'none',
                  background: 'var(--surface-card)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                style={{
                  padding: '12px 16px',
                  background: 'var(--rumbo-navy)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: !input.trim() || loading ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
