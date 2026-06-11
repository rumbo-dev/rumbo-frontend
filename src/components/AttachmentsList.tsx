'use client'

import { FileText, FileSpreadsheet, FileImage, FileArchive, File, ExternalLink, Calendar } from 'lucide-react'
import DocumentTypeBadge from './DocumentTypeBadge'

export interface Attachment {
  id: string
  filename: string
  storedPath: string
  mimeType: string
  sizeBytes: number
  documentType?: string | null
  description?: string | null
  source?: string | null
  receivedAt?: string | null
  publicUrl: string
}

interface Props {
  attachments: Attachment[]
  title?: string
  subtitle?: string
  emptyHint?: string
}

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  agent_origin:      { label: 'Agente origen',     color: 'var(--rumbo-coral)' },
  carrier:           { label: 'Carrier',            color: 'var(--rumbo-navy)' },
  customer:          { label: 'Cliente',            color: 'var(--success-fg)' },
  destination_agent: { label: 'Despachante destino', color: 'var(--info-fg)' },
  forwarder:         { label: 'Forwarder',          color: 'var(--warning-fg)' },
}

function iconForMime(mime: string) {
  if (mime.startsWith('image/')) return <FileImage size={18} />
  if (mime === 'application/pdf') return <FileText size={18} />
  if (mime.includes('spreadsheet') || mime.includes('excel')) return <FileSpreadsheet size={18} />
  if (mime.includes('zip') || mime.includes('compressed')) return <FileArchive size={18} />
  return <File size={18} />
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatDate(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AttachmentsList({
  attachments,
  title = 'Documentos asociados',
  subtitle,
  emptyHint = 'No hay documentos adjuntos.',
}: Props) {
  return (
    <section style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'var(--rumbo-coral-soft)', color: 'var(--rumbo-coral)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FileText size={18} />
        </div>
        <div>
          <h2 style={{
            fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)',
            margin: 0, letterSpacing: '-0.01em',
          }}>{title}</h2>
          {subtitle && (
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {attachments.length === 0 ? (
        <div style={{
          padding: '24px', background: 'var(--surface-card)',
          border: '1px dashed var(--border-strong)', borderRadius: '10px',
          color: 'var(--text-tertiary)', fontSize: '13px', textAlign: 'center',
        }}>
          {emptyHint}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {attachments.map((att) => {
            const source = att.source ? SOURCE_LABELS[att.source] : null
            return (
              <a
                key={att.id}
                href={att.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '14px 18px',
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 150ms ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--rumbo-coral)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '8px',
                  background: 'var(--rumbo-coral-soft)', color: 'var(--rumbo-coral)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {iconForMime(att.mimeType)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    {att.documentType && <DocumentTypeBadge type={att.documentType} />}
                    {source && (
                      <span style={{
                        padding: '2px 8px',
                        background: 'var(--surface-muted)',
                        color: source.color,
                        borderRadius: '4px',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        {source.label}
                      </span>
                    )}
                  </div>

                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {att.filename}
                  </div>

                  {att.description && (
                    <div style={{
                      fontSize: '12.5px',
                      color: 'var(--text-secondary)',
                      marginBottom: '6px',
                    }}>
                      {att.description}
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '11.5px',
                    color: 'var(--text-tertiary)',
                  }}>
                    {att.receivedAt && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={11} />
                        {formatDate(att.receivedAt)}
                      </span>
                    )}
                    <span>{formatSize(att.sizeBytes)}</span>
                  </div>
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '12px', fontWeight: 600,
                  color: 'var(--rumbo-navy)',
                  flexShrink: 0, alignSelf: 'center',
                }}>
                  Ver <ExternalLink size={12} />
                </div>
              </a>
            )
          })}
        </div>
      )}
    </section>
  )
}
