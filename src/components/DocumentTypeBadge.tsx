'use client'

interface Props { type: string }

const TYPE_CONFIG: Record<string, { label: string; bg: string; fg: string }> = {
  HBL_DRAFT:        { label: 'HBL · Draft',          bg: 'var(--warning-bg)',       fg: 'var(--warning-fg)' },
  MBL_DRAFT:        { label: 'MBL · Draft',          bg: 'var(--warning-bg)',       fg: 'var(--warning-fg)' },
  BL_TLX_RELEASE:   { label: 'BL · Telex Release',   bg: 'var(--success-bg)',       fg: 'var(--success-fg)' },
  ARRIVAL_NOTICE:   { label: 'Arrival Notice',       bg: 'var(--info-bg)',          fg: 'var(--info-fg)' },
  DEBIT_NOTE:       { label: 'Nota de Débito',       bg: 'var(--danger-bg)',        fg: 'var(--danger-fg)' },
  GUARANTEE:        { label: 'Carta de Garantía',    bg: 'var(--rumbo-navy-soft)',  fg: 'var(--rumbo-navy)' },
  COMMERCIAL_INVOICE: { label: 'Factura Comercial',  bg: 'var(--neutral-bg)',       fg: 'var(--neutral-fg)' },
  PACKING_LIST:     { label: 'Packing List',         bg: 'var(--neutral-bg)',       fg: 'var(--neutral-fg)' },
  OTHER:            { label: 'Documento',            bg: 'var(--neutral-bg)',       fg: 'var(--neutral-fg)' },
}

export default function DocumentTypeBadge({ type }: Props) {
  const cfg = TYPE_CONFIG[type] || { label: type, bg: 'var(--neutral-bg)', fg: 'var(--neutral-fg)' }
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 8px',
      background: cfg.bg,
      color: cfg.fg,
      borderRadius: '4px',
      fontSize: '10.5px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  )
}
