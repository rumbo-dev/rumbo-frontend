// Helpers compartidos por los componentes del detalle de Quote.

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} min`
  const hours = Math.floor(mins / 60)
  const remMins = mins % 60
  if (hours < 24) return remMins > 0 ? `${hours}h ${remMins}min` : `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

export function formatContainerType(type?: string | null, count?: number | null): string {
  if (!type) return '—'
  const c = count || 1
  const map: Record<string, string> = {
    FCL_20GP: `FCL ${c}×20'GP`,
    FCL_40GP: `FCL ${c}×40'GP`,
    FCL_40HC: `FCL ${c}×40'HC`,
    FCL_40RF: `FCL ${c}×40'RF`,
    LCL: 'LCL',
    AIR: 'Aéreo',
  }
  return map[type] || `${type}${c > 1 ? ` ×${c}` : ''}`
}

export function formatUsd(n?: number | null): string {
  if (n == null) return '—'
  return `$${n.toLocaleString('en-US')}`
}

export function formatUsdWithSuffix(n?: number | null): string {
  if (n == null) return '—'
  return `USD ${n.toLocaleString('en-US')}`
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function channelLabel(channel: string): string {
  return { EMAIL: 'Email', WHATSAPP: 'WhatsApp', WEB_FORM: 'Web' }[channel] || channel
}

export const STATUS_CONFIG: Record<string, { label: string; bg: string; fg: string; dot: string }> = {
  WAITING_FOR_DATA: { label: 'Esperando info', bg: 'var(--warning-bg)', fg: 'var(--warning-fg)', dot: 'var(--warning-dot)' },
  READY_TO_QUOTE: { label: 'Lista para cotizar', bg: 'var(--success-bg)', fg: 'var(--success-fg)', dot: 'var(--success-dot)' },
  QUOTED_DRAFT: { label: 'Cotizada (draft)', bg: 'var(--info-bg)', fg: 'var(--info-fg)', dot: 'var(--info-dot)' },
  SENT_AWAITING_CLIENT: { label: 'Enviada', bg: 'var(--neutral-bg)', fg: 'var(--neutral-fg)', dot: 'var(--neutral-dot)' },
  ACCEPTED: { label: 'Aceptada', bg: 'var(--success-bg)', fg: 'var(--success-fg)', dot: 'var(--success-dot)' },
  LOST: { label: 'Perdida', bg: 'var(--danger-bg)', fg: 'var(--danger-fg)', dot: 'var(--danger-dot)' },
}
