'use client'

import { useState } from 'react'
import { Mail, Send, Check, Clock, X } from 'lucide-react'

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

interface EmailDraftCardProps {
  draft: EmailDraft
  onApprove: (draftId: string) => void
  onReject: (draftId: string) => void
  isLoading?: boolean
}

export function EmailDraftCard({ draft, onApprove, onReject, isLoading = false }: EmailDraftCardProps) {
  const [expanded, setExpanded] = useState(false)

  const statusConfig = {
    DRAFT: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: Clock, label: 'Borrador' },
    APPROVED: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: Check, label: 'Aprobado' },
    SENT: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: Send, label: 'Enviado' },
    REJECTED: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: X, label: 'Rechazado' },
  }

  const config = statusConfig[draft.status]
  const StatusIcon = config.icon

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border-2 backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${config.bg} ${config.border}`}
      style={{
        background: `linear-gradient(135deg, ${draft.status === 'DRAFT' ? 'rgba(245, 158, 11, 0.05)' : draft.status === 'SENT' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(96, 165, 250, 0.05)'}, rgba(255, 255, 255, 0.4))`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        className="absolute -right-20 -top-20 h-40 w-40 rounded-full blur-3xl opacity-20 transition-all duration-300 group-hover:opacity-30"
        style={{
          background:
            draft.status === 'DRAFT'
              ? 'linear-gradient(135deg, #F59E0B, #E8856A)'
              : draft.status === 'SENT'
                ? 'linear-gradient(135deg, #0EA874, #10B981)'
                : 'linear-gradient(135deg, #60A5FA, #3B82F6)',
        }}
      />

      <div className="relative p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/60 p-2.5 backdrop-blur-sm">
              <Mail className="h-5 w-5" style={{ color: '#12284C' }} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email Sugerido</p>
              <p className="truncate text-sm font-semibold text-gray-900">{draft.to}</p>
            </div>
          </div>

          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-sm ${config.text} ${config.bg}`}
            style={{ border: `1px solid currentColor`, opacity: 0.8 }}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {config.label}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Asunto</p>
          <p className="text-sm font-semibold text-gray-900">{draft.subject}</p>
        </div>

        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Vista previa</p>
          <div
            className={`rounded-xl bg-white/40 p-3 backdrop-blur-sm border border-white/50 transition-all duration-300 cursor-pointer hover:bg-white/50 ${
              expanded ? 'max-h-96' : 'max-h-24 overflow-hidden'
            }`}
            onClick={() => setExpanded(!expanded)}
          >
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-light">{draft.body}</p>
          </div>
          {draft.body.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              {expanded ? '▼ Mostrar menos' : '▲ Ver más'}
            </button>
          )}
        </div>

        {draft.aiReasoning && (
          <div className="mb-4 rounded-lg bg-blue-50/60 p-3 border border-blue-100/50">
            <p className="text-xs font-semibold text-blue-900 mb-1">💡 Razonamiento IA</p>
            <p className="text-xs text-blue-800 leading-relaxed">{draft.aiReasoning}</p>
          </div>
        )}

        {draft.status === 'DRAFT' && (
          <div className="flex gap-3">
            <button
              onClick={() => onReject(draft.id)}
              disabled={isLoading}
              className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 active:scale-95"
            >
              Rechazar
            </button>
            <button
              onClick={() => onApprove(draft.id)}
              disabled={isLoading}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #12284C, #1a3a5c)',
                boxShadow: '0 4px 15px rgba(18, 40, 76, 0.3)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(18, 40, 76, 0.4)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 4px 15px rgba(18, 40, 76, 0.3)')}
            >
              <div className="flex items-center justify-center gap-2">
                <Send className="h-4 w-4" />
                {isLoading ? 'Enviando...' : 'Aprobar y Enviar'}
              </div>
            </button>
          </div>
        )}

        {draft.status === 'SENT' && (
          <div className="rounded-xl bg-emerald-100/30 px-4 py-3 text-center">
            <p className="text-xs font-semibold text-emerald-700">
              ✓ Enviado {draft.sentAt ? new Date(draft.sentAt).toLocaleDateString('es-AR') : ''}
            </p>
          </div>
        )}

        {draft.status === 'REJECTED' && (
          <div className="rounded-xl bg-red-100/30 px-4 py-3 text-center">
            <p className="text-xs font-semibold text-red-700">✕ Rechazado</p>
          </div>
        )}
      </div>
    </div>
  )
}
