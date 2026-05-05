'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, AlertTriangle, Mail, FileText, Ship, Bot } from 'lucide-react'

type ToastType = 'info' | 'working' | 'success' | 'warning'

interface Toast {
  delaySec: number
  type: ToastType
  icon: React.ReactNode
  title: string
}

const TOASTS: Toast[] = [
  { delaySec: 2,  type: 'info',    icon: <Mail size={16} />,         title: 'Nuevo email recibido de MSC Mediterranean — confirmación de booking OP-23714' },
  { delaySec: 8,  type: 'working', icon: <Bot size={16} />,          title: 'Rumbo: parseando email... extrayendo container, vessel, ETD/ETA' },
  { delaySec: 14, type: 'success', icon: <CheckCircle2 size={16} />, title: 'Booking parseado — container TCLU8821704, vessel MSC Beatrice, ETA 6 May' },
  { delaySec: 22, type: 'working', icon: <FileText size={16} />,     title: 'PDF detectado: BL_TCLU8821704.pdf — corriendo extracción visual' },
  { delaySec: 30, type: 'warning', icon: <AlertTriangle size={16} />, title: 'Discrepancia detectada: BL dice 18,200 kg, email body dice 18,400 kg — flageado para operador' },
  { delaySec: 38, type: 'working', icon: <Ship size={16} />,         title: 'Verificando posición del vessel via MarineTraffic — MSC Beatrice en lat -12.1, lon -32.8' },
  { delaySec: 46, type: 'warning', icon: <AlertTriangle size={16} />, title: 'Demora de ETA detectada: vessel atrasado 48h vs schedule' },
  { delaySec: 54, type: 'working', icon: <Bot size={16} />,           title: 'Drafteando notificación al cliente en español — "Estimado Andes Trading, su container..."' },
  { delaySec: 62, type: 'success', icon: <CheckCircle2 size={16} />,  title: 'Borrador listo para aprobar — guardado en OP-23714' },
]

const TYPE_STYLES: Record<ToastType, { bg: string; fg: string; border: string }> = {
  info:    { bg: 'var(--rumbo-navy-soft)', fg: 'var(--rumbo-navy)',     border: 'var(--rumbo-navy)' },
  working: { bg: '#F0F4FF',                fg: '#4A5BC4',               border: '#4A5BC4' },
  success: { bg: 'var(--success-bg)',      fg: 'var(--success-fg)',     border: 'var(--success-fg)' },
  warning: { bg: 'var(--warning-bg)',      fg: 'var(--warning-fg)',     border: 'var(--warning-fg)' },
}

interface DemoModeOverlayProps {
  onComplete: () => void
}

export default function DemoModeOverlay({ onComplete }: DemoModeOverlayProps) {
  const [visibleToasts, setVisibleToasts] = useState<Toast[]>([])
  const [showSummary, setShowSummary] = useState(false)

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = []

    TOASTS.forEach((toast) => {
      const t = setTimeout(() => {
        setVisibleToasts((prev) => [...prev, toast])
      }, toast.delaySec * 1000)
      timeouts.push(t)
    })

    const summaryT = setTimeout(() => setShowSummary(true), 65 * 1000)
    timeouts.push(summaryT)

    return () => timeouts.forEach(clearTimeout)
  }, [])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.05)',
      pointerEvents: 'none',
      zIndex: 1000,
    }}>
      <div style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '420px',
        pointerEvents: 'auto',
      }}>
        {visibleToasts.slice(-5).map((toast, idx) => {
          const style = TYPE_STYLES[toast.type]
          return (
            <div
              key={`${toast.delaySec}-${idx}`}
              style={{
                background: 'white',
                border: `1px solid ${style.border}`,
                borderLeft: `4px solid ${style.border}`,
                borderRadius: '10px',
                padding: '12px 14px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                animation: 'slideInRight 0.3s ease-out',
              }}
            >
              <div style={{ color: style.fg, flexShrink: 0, marginTop: '2px' }}>
                {toast.icon}
              </div>
              <div style={{
                fontSize: '13px',
                lineHeight: 1.4,
                color: 'var(--text-primary)',
              }}>
                {toast.title}
              </div>
            </div>
          )
        })}
      </div>

      {showSummary && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px 40px',
            maxWidth: '480px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--rumbo-coral)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '8px',
            }}>
              Demo completo
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 16px 0',
            }}>
              Rumbo trabajó solo durante 65 segundos
            </h2>
            <div style={{
              fontSize: '15px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}>
              Procesó <strong>1 email</strong>, <strong>1 PDF</strong>,
              detectó <strong>1 alerta de demora</strong> y dejó
              <strong> 1 borrador listo</strong> para aprobar.
              <br /><br />
              <strong>Tiempo del operador: 0 minutos.</strong>
            </div>
            <button
              onClick={onComplete}
              style={{
                padding: '10px 24px',
                background: 'var(--rumbo-navy)',
                color: 'white',
                border: 'none',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
