'use client'

import { ReactNode } from 'react'

// ============ STATUS BADGE ============
const STATUS_CONFIGS: Record<string, { bg: string; fg: string; dot: string; label: string }> = {
  IN_TRANSIT: { bg: 'var(--info-bg)', fg: 'var(--info-fg)', dot: 'var(--info-dot)', label: 'En tránsito' },
  ACTIVE: { bg: 'var(--info-bg)', fg: 'var(--info-fg)', dot: 'var(--info-dot)', label: 'Activa' },
  IN_PROGRESS: { bg: 'var(--info-bg)', fg: 'var(--info-fg)', dot: 'var(--info-dot)', label: 'En progreso' },
  COMPLETED: { bg: 'var(--success-bg)', fg: 'var(--success-fg)', dot: 'var(--success-dot)', label: 'Completada' },
  PENDING: { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)', dot: 'var(--warning-dot)', label: 'Pendiente' },
  DRAFT: { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)', dot: 'var(--warning-dot)', label: 'Borrador' },
  BLOCKED: { bg: 'var(--danger-bg)', fg: 'var(--danger-fg)', dot: 'var(--danger-dot)', label: 'Bloqueada' },
  CRITICAL: { bg: 'var(--danger-bg)', fg: 'var(--danger-fg)', dot: 'var(--danger-dot)', label: 'Crítica' },
  CURRENT: { bg: 'var(--info-bg)', fg: 'var(--info-fg)', dot: 'var(--info-dot)', label: 'Actual' },
  CLOSED: { bg: 'var(--neutral-bg)', fg: 'var(--neutral-fg)', dot: 'var(--neutral-dot)', label: 'Cerrada' },
}

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIGS[status] || { bg: 'var(--neutral-bg)', fg: 'var(--neutral-fg)', dot: 'var(--neutral-dot)', label: status }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 font-medium"
      style={{
        height: '22px',
        background: config.bg,
        color: config.fg,
        fontSize: '12px',
        lineHeight: '22px',
      }}
    >
      <span className="rounded-full" style={{ width: '6px', height: '6px', background: config.dot }} />
      {config.label}
    </span>
  )
}

// ============ PRIORITY BADGE ============
const PRIORITY_CONFIGS: Record<string, { bg: string; fg: string; dot: string; label: string }> = {
  LOW: { bg: 'var(--info-bg)', fg: 'var(--info-fg)', dot: 'var(--info-dot)', label: 'Baja' },
  NORMAL: { bg: 'var(--neutral-bg)', fg: 'var(--neutral-fg)', dot: 'var(--neutral-dot)', label: 'Normal' },
  MEDIUM: { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)', dot: 'var(--warning-dot)', label: 'Media' },
  HIGH: { bg: 'var(--danger-bg)', fg: 'var(--danger-fg)', dot: 'var(--danger-dot)', label: 'Alta' },
  CRITICAL: { bg: 'var(--danger-bg)', fg: 'var(--danger-fg)', dot: 'var(--danger-dot)', label: 'Crítica' },
}

export function PriorityBadge({ priority }: { priority: string }) {
  const config = PRIORITY_CONFIGS[priority] || PRIORITY_CONFIGS.NORMAL
  return (
    <span
      className="inline-flex items-center rounded-md px-2 font-medium"
      style={{
        height: '20px',
        background: config.bg,
        color: config.fg,
        fontSize: '11px',
        lineHeight: '20px',
      }}
    >
      {config.label}
    </span>
  )
}

// ============ ALERT BADGE (nuevo - para columna de alertas) ============
export function AlertBadge({ count, priority }: { count: number; priority: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const config = PRIORITY_CONFIGS[priority] || PRIORITY_CONFIGS.NORMAL
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md font-medium"
      style={{
        height: '24px',
        padding: '0 10px',
        background: config.bg,
        color: config.fg,
        fontSize: '12px',
        fontWeight: 500,
      }}
    >
      <span className="rounded-full" style={{ width: '6px', height: '6px', background: config.dot }} />
      {count} {config.label.toLowerCase()}
    </span>
  )
}

// ============ BUTTON ============
type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger'
type ButtonSize = 'sm' | 'md'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  type = 'button',
  className = '',
}: {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
}) {
  const styles: Record<ButtonVariant, React.CSSProperties> = {
    primary: { background: 'var(--rumbo-navy)', color: 'white', border: 'none' },
    secondary: { background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-strong)' },
    tertiary: { background: 'transparent', color: 'var(--text-secondary)', border: 'none' },
    danger: { background: 'var(--danger-fg)', color: 'white', border: 'none' },
  }
  const heights = { sm: '30px', md: '36px' }
  const paddings = { sm: '0 12px', md: '0 14px' }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${className}`}
      style={{
        ...styles[variant],
        height: heights[size],
        padding: paddings[size],
        fontSize: '14px',
      }}
      onMouseEnter={(e) => {
        if (disabled) return
        if (variant === 'primary') e.currentTarget.style.background = 'var(--rumbo-navy-hover)'
        if (variant === 'secondary' || variant === 'tertiary') e.currentTarget.style.background = 'var(--surface-hover)'
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') e.currentTarget.style.background = 'var(--rumbo-navy)'
        if (variant === 'secondary' || variant === 'tertiary') e.currentTarget.style.background = 'transparent'
      }}
    >
      {children}
    </button>
  )
}

// ============ CARD ============
export function Card({ children, className = '', padding = true }: { children: ReactNode; className?: string; padding?: boolean }) {
  return (
    <div
      className={`rounded-lg ${padding ? 'p-6' : ''} ${className}`}
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
      }}
    >
      {children}
    </div>
  )
}

// ============ STAT ============
export function Stat({ label, value, subtext }: { label: string; value: string | number; subtext?: string }) {
  return (
    <div>
      <div
        className="font-medium"
        style={{
          fontSize: '12px',
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '6px',
        }}
      >
        {label}
      </div>
      <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '24px' }}>
        {value}
      </div>
      {subtext && (
        <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
          {subtext}
        </div>
      )}
    </div>
  )
}

export function KPICard({ label, value, subtext }: { label: string; value: string | number; subtext?: string; accentColor?: string }) {
  return (
    <Card>
      <Stat label={label} value={value} subtext={subtext} />
    </Card>
  )
}

// ============ EMPTY STATE ============
export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center" style={{ padding: '64px 24px' }}>
      {icon && <div style={{ color: 'var(--text-quaternary)', marginBottom: '16px' }}>{icon}</div>}
      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
      {description && (
        <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px', maxWidth: '320px' }}>
          {description}
        </div>
      )}
      {action && <div style={{ marginTop: '24px' }}>{action}</div>}
    </div>
  )
}

// ============ SKELETON ============
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="skeleton" style={{ height: '14px', width: '180px' }} />
      <div className="skeleton" style={{ height: '22px', width: '90px' }} />
      <div className="skeleton" style={{ height: '14px', width: '80px' }} />
      <div className="skeleton" style={{ height: '14px', width: '60px' }} />
      <div className="skeleton" style={{ height: '14px', width: '60px' }} />
    </div>
  )
}

export function SkeletonCard() {
  return <div className="skeleton" style={{ height: '120px' }} />
}

// ============ UTILS ============
export function getCountryFlag(code: string): string {
  if (!code || code.length !== 2) return '🏳️'
  const codePoints = code.toUpperCase().split('').map((c) => 127397 + c.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export function getCountryNameES(code: string): string {
  const names: Record<string, string> = {
    AR: 'Argentina', BR: 'Brasil', CL: 'Chile', UY: 'Uruguay', PY: 'Paraguay',
    PE: 'Perú', CO: 'Colombia', VE: 'Venezuela', EC: 'Ecuador', BO: 'Bolivia',
    MX: 'México', US: 'Estados Unidos', CA: 'Canadá',
    CN: 'China', JP: 'Japón', KR: 'Corea del Sur', IN: 'India', VN: 'Vietnam',
    TH: 'Tailandia', ID: 'Indonesia', PH: 'Filipinas', SG: 'Singapur', MY: 'Malasia',
    DE: 'Alemania', FR: 'Francia', IT: 'Italia', ES: 'España', PT: 'Portugal',
    NL: 'Países Bajos', BE: 'Bélgica', GB: 'Reino Unido', IE: 'Irlanda',
    PL: 'Polonia', SE: 'Suecia', NO: 'Noruega', DK: 'Dinamarca', FI: 'Finlandia',
    GR: 'Grecia', TR: 'Turquía', RU: 'Rusia', UA: 'Ucrania',
    AU: 'Australia', NZ: 'Nueva Zelanda', ZA: 'Sudáfrica', EG: 'Egipto',
    AE: 'Emiratos Árabes', SA: 'Arabia Saudita', IL: 'Israel',
  }
  return names[code?.toUpperCase()] || code
}

// ============ LEGACY (mantener para compatibilidad) ============
export function TaskCard({ title, status, priority }: any) {
  return (
    <Card padding={false} className="p-4">
      <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{title}</div>
      <div className="flex gap-2 mt-2">
        {status && <StatusBadge status={status} />}
        {priority && <PriorityBadge priority={priority} />}
      </div>
    </Card>
  )
}

export function Timeline({ events }: { events: any[] }) {
  return (
    <div>
      {events.map((e, i) => (
        <div key={i} className="flex gap-4" style={{ padding: '12px 0', borderBottom: i < events.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', width: '110px', flexShrink: 0 }}>{e.timestamp}</div>
          <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{e.title}</div>
        </div>
      ))}
    </div>
  )
}

export function JourneyStep({ steps }: { steps: any[] }) {
  return (
    <div className="space-y-3">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-3" style={{ fontSize: '13px' }}>
          <div
            className="rounded-full"
            style={{
              width: '8px',
              height: '8px',
              background: s.status === 'COMPLETED' ? 'var(--success-dot)' : s.status === 'CURRENT' || s.status === 'IN_PROGRESS' ? 'var(--info-dot)' : 'var(--border-strong)',
            }}
          />
          <span style={{ color: s.status === 'PENDING' ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>{s.stepName}</span>
        </div>
      ))}
    </div>
  )
}
