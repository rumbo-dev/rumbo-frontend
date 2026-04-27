'use client'

import { ReactNode } from 'react'

const STATUS_CONFIGS: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-yellow-50', text: 'text-amber-700', label: 'Pendiente' },
  IN_PROGRESS: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'En Progreso' },
  COMPLETED: { bg: 'bg-emerald-50', text: 'text-green-700', label: 'Completado' },
  BLOCKED: { bg: 'bg-red-50', text: 'text-red-700', label: 'Bloqueado' },
  IN_TRANSIT: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'En Tránsito' },
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Borrador' },
  ACTIVE: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Activa' },
  CURRENT: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Actual' },
}

export function StatusBadge({ status, size = 'md' }: { status: string; size?: 'sm' | 'md' | 'lg' }) {
  const config = STATUS_CONFIGS[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status }
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-1' : size === 'lg' ? 'text-sm px-4 py-2' : 'text-sm px-3 py-1.5'
  return <span className={`${config.bg} ${config.text} ${sizeClass} rounded-lg font-semibold inline-block`}>{config.label}</span>
}

const PRIORITY_CONFIGS: Record<string, { bg: string; text: string; label: string }> = {
  LOW: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Baja' },
  NORMAL: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Normal' },
  HIGH: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Alta' },
  CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', label: 'Crítica' },
}

export function PriorityBadge({ priority }: { priority: string }) {
  const config = PRIORITY_CONFIGS[priority] || { bg: 'bg-gray-100', text: 'text-gray-700', label: priority }
  return <span className={`${config.bg} ${config.text} text-xs px-2 py-1 rounded-lg font-semibold inline-block`}>{config.label}</span>
}

export function KPICard({ label, value, subtext, accentColor = '#12284C' }: { label: string; value: string | number; subtext?: string; accentColor?: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 border border-gray-200/50 hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        <div className="w-1 h-12 rounded-full" style={{ background: accentColor }} />
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
      </div>
    </div>
  )
}

export function TaskCard({ title, type, priority, status, aiConfidence, onStatusChange }: any) {
  return (
    <div className="rounded-xl bg-white p-4 border border-gray-200/50">
      <p className="font-semibold text-gray-900">{title}</p>
      <div className="flex gap-2 mt-2">
        <StatusBadge status={status} size="sm" />
        <PriorityBadge priority={priority} />
      </div>
    </div>
  )
}

export function Timeline({ events }: { events: any[] }) {
  return (
    <div className="space-y-3">
      {events.map((e, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
          <div>
            <p className="font-medium text-sm">{e.title}</p>
            <p className="text-xs text-gray-500">{e.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function JourneyStep({ steps }: { steps: any[] }) {
  return (
    <div className="space-y-2">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-3 text-sm">
          <div className="h-3 w-3 rounded-full" style={{ background: s.status === 'COMPLETED' ? '#0EA874' : s.status === 'CURRENT' ? '#E8856A' : '#E5E7EB' }} />
          <span>{s.stepName}</span>
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
      {icon}
      <p className="text-gray-900 font-semibold">{title}</p>
      {description && <p className="text-gray-600 text-sm mt-1">{description}</p>}
      {action}
    </div>
  )
}

export function SkeletonCard() {
  return <div className="rounded-xl bg-gray-100 animate-pulse h-24" />
}
