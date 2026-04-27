'use client'

// ============ REUSABLE COMPONENTS ============

// Status Badge Component
export function StatusBadge({ 
  status, 
  size = 'md' 
}: { 
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'IN_TRANSIT' | 'DRAFT'
  size?: 'sm' | 'md' | 'lg'
}) {
  const configs = {
    PENDING: { bg: 'bg-yellow-50', text: 'text-amber-700', label: 'Pendiente' },
    IN_PROGRESS: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'En Progreso' },
    COMPLETED: { bg: 'bg-emerald-50', text: 'text-green-700', label: 'Completado' },
    BLOCKED: { bg: 'bg-red-50', text: 'text-red-700', label: 'Bloqueado' },
    IN_TRANSIT: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'En Tránsito' },
    DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Borrador' },
  }
  
  const config = configs[status]
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-1' : size === 'lg' ? 'text-sm px-4 py-2' : 'text-sm px-3 py-1.5'
  
  return (
    <span className={`${config.bg} ${config.text} ${sizeClass} rounded-lg font-semibold inline-block`}>
      {config.label}
    </span>
  )
}

// Priority Badge Component
export function PriorityBadge({ 
  priority 
}: { 
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'
}) {
  const configs = {
    LOW: { bg: 'bg-green-50', text: 'text-green-700', label: 'Baja' },
    NORMAL: { bg: 'bg-yellow-50', text: 'text-amber-700', label: 'Normal' },
    HIGH: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Alta' },
    CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', label: 'Crítica' },
  }
  
  const config = configs[priority]
  
  return (
    <span className={`${config.bg} ${config.text} text-xs px-3 py-1 rounded-lg font-semibold inline-block`}>
      {config.label}
    </span>
  )
}

// KPI Card Component
export function KPICard({
  label,
  value,
  subtext,
  icon,
  accentColor = 'coral'
}: {
  label: string
  value: string | number
  subtext?: string
  icon?: string
  accentColor?: 'coral' | 'green' | 'amber' | 'red'
}) {
  const accentClasses = {
    coral: 'border-l-[#E8856A]',
    green: 'border-l-[#0EA874]',
    amber: 'border-l-[#F59E0B]',
    red: 'border-l-[#E54A41]',
  }
  
  const textClasses = {
    coral: 'text-[#E8856A]',
    green: 'text-[#0EA874]',
    amber: 'text-[#F59E0B]',
    red: 'text-[#E54A41]',
  }
  
  return (
    <div className={`bg-white rounded-2xl p-6 border border-rumbo-border shadow-sm ${accentClasses[accentColor]} border-l-4`}>
      <p className="text-xs uppercase tracking-wide font-semibold text-gray-600 mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        {icon && <span className="text-2xl">{icon}</span>}
        <p className="text-4xl font-bold text-rumbo-navy">{value}</p>
      </div>
      {subtext && <p className={`text-sm font-medium mt-2 ${textClasses[accentColor]}`}>{subtext}</p>}
    </div>
  )
}

// Task Card Component (Reusable for different task types)
export function TaskCard({
  title,
  description,
  priority,
  status,
  type,
  aiConfidence,
  estimatedCost,
  onStatusChange,
}: {
  title: string
  description: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'
  type?: 'DOCUMENTATION' | 'CUSTOMS' | 'COORDINATION' | 'TRACKING' | 'PAYMENT' | 'OTHER'
  aiConfidence?: number
  estimatedCost?: number
  onStatusChange?: (newStatus: string) => void
}) {
  const icons = {
    DOCUMENTATION: '📋',
    CUSTOMS: '✈️',
    COORDINATION: '📞',
    TRACKING: '📍',
    PAYMENT: '💳',
    OTHER: '📌',
  }
  
  return (
    <div className="bg-white rounded-xl p-6 border border-rumbo-border hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {type && <span className="text-xl">{icons[type]}</span>}
            <h3 className="text-lg font-bold text-rumbo-navy">{title}</h3>
          </div>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <PriorityBadge priority={priority} />
      </div>
      
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-rumbo-border">
        <div className="flex gap-4 text-sm">
          {aiConfidence !== undefined && (
            <span className="text-gray-600">
              IA: <strong className="font-bold text-rumbo-navy">{Math.round(aiConfidence * 100)}%</strong>
            </span>
          )}
          {estimatedCost !== undefined && (
            <span className="text-gray-600">
              Cost: <strong className="font-bold text-rumbo-navy">${estimatedCost.toLocaleString()}</strong>
            </span>
          )}
        </div>
        
        <select
          value={status}
          onChange={(e) => onStatusChange?.(e.target.value)}
          className="text-xs font-semibold px-3 py-1.5 border border-rumbo-border rounded-lg bg-white text-rumbo-navy cursor-pointer"
        >
          <option value="PENDING">Pendiente</option>
          <option value="IN_PROGRESS">En Progreso</option>
          <option value="COMPLETED">Completado</option>
          <option value="BLOCKED">Bloqueado</option>
        </select>
      </div>
    </div>
  )
}

// Timeline Component
export function Timeline({
  events,
}: {
  events: Array<{
    id: string
    title: string
    date: string
    status: 'completed' | 'current' | 'pending'
  }>
}) {
  return (
    <div className="space-y-4">
      {events.map((event, idx) => (
        <div key={event.id} className="flex gap-3">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                event.status === 'completed'
                  ? 'bg-rumbo-green'
                  : event.status === 'current'
                  ? 'bg-rumbo-coral'
                  : 'bg-gray-300'
              }`}
            />
            {idx < events.length - 1 && (
              <div
                className={`w-0.5 h-8 ${
                  event.status === 'completed' ? 'bg-rumbo-green' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
          <div className="pb-2">
            <p className="text-sm font-semibold text-rumbo-navy">{event.title}</p>
            <p className="text-xs text-gray-500 mt-1">{event.date}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Journey Step Component
export function JourneyStep({
  steps,
}: {
  steps: Array<{
    id: string
    name: string
    status: 'completed' | 'current' | 'pending'
  }>
}) {
  return (
    <div className="flex justify-between items-center gap-1">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex-1 flex flex-col items-center">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${
              step.status === 'completed'
                ? 'bg-rumbo-green text-white'
                : step.status === 'current'
                ? 'bg-rumbo-coral text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step.status === 'completed' ? '✓' : step.status === 'current' ? '●' : '○'}
          </div>
          <p className="text-xs text-center font-semibold text-rumbo-navy">{step.name}</p>
          
          {idx < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-1 absolute left-[calc(50%+20px)] w-[calc(100%-40px)] ${
                step.status === 'completed' ? 'bg-rumbo-green' : 'bg-gray-300'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// Empty State Component
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-rumbo-navy mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-sm">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

// Loading Skeleton
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-6 border border-rumbo-border animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-full mb-3" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>
  )
}
