'use client'

import { Mail, Star, Users } from 'lucide-react'

export interface Stakeholder {
  name: string
  email: string
  company: string
  role: string
  isPrimary?: boolean
}

interface Props {
  stakeholders: Stakeholder[]
  title?: string
}

// Color por empresa (consistente entre apariciones)
const COMPANY_COLORS: Record<string, { bg: string; fg: string; border: string }> = {
  'Chic Parisien':         { bg: 'var(--rumbo-coral-soft)', fg: 'var(--rumbo-coral)', border: '#F47A5A40' },
  'Murchison':              { bg: 'var(--rumbo-navy-soft)',  fg: 'var(--rumbo-navy)',  border: '#1E3A7B40' },
  'Parisi NGB':             { bg: 'var(--warning-bg)',        fg: 'var(--warning-fg)',  border: '#B4530940' },
  'Parisi Global Shipping': { bg: 'var(--warning-bg)',        fg: 'var(--warning-fg)',  border: '#B4530940' },
  'Onboard BSAS':           { bg: 'var(--info-bg)',           fg: 'var(--info-fg)',     border: '#1E40AF40' },
  'Onboard':                { bg: 'var(--info-bg)',           fg: 'var(--info-fg)',     border: '#1E40AF40' },
  default:                  { bg: 'var(--neutral-bg)',        fg: 'var(--neutral-fg)',  border: '#9CA3AF40' },
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function StakeholdersPanel({ stakeholders, title = 'Actores de la operación' }: Props) {
  // Agrupar por empresa, ordenando para que las primary aparezcan primero dentro de cada grupo
  const byCompany: Record<string, Stakeholder[]> = {}
  for (const s of stakeholders) {
    const key = s.company || 'Sin empresa'
    if (!byCompany[key]) byCompany[key] = []
    byCompany[key].push(s)
  }
  for (const key of Object.keys(byCompany)) {
    byCompany[key].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
  }

  // Orden de empresas: cliente primero, forwarder, agente, despachante
  const COMPANY_ORDER = ['Chic Parisien', 'Murchison', 'Parisi NGB', 'Parisi Global Shipping', 'Onboard BSAS', 'Onboard']
  const sortedCompanies = Object.keys(byCompany).sort((a, b) => {
    const ai = COMPANY_ORDER.indexOf(a)
    const bi = COMPANY_ORDER.indexOf(b)
    if (ai === -1 && bi === -1) return a.localeCompare(b)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--surface-hover)',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <Users size={14} style={{ color: 'var(--rumbo-coral)' }} />
        <div>
          <div style={{
            fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {title}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '3px' }}>
            {stakeholders.length} contactos · {sortedCompanies.length} empresas
          </div>
        </div>
      </div>

      <div style={{ padding: '4px 0' }}>
        {sortedCompanies.map((company, ci) => {
          const col = COMPANY_COLORS[company] || COMPANY_COLORS.default
          const members = byCompany[company]
          return (
            <div
              key={company}
              style={{
                padding: '14px 18px',
                borderBottom: ci < sortedCompanies.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <span style={{
                  padding: '3px 8px',
                  background: col.bg,
                  color: col.fg,
                  borderRadius: '5px',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  {company}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  {members.length} {members.length === 1 ? 'contacto' : 'contactos'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {members.map((s) => (
                  <div
                    key={s.email}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      background: s.isPrimary ? col.bg : 'transparent',
                      border: s.isPrimary ? `1px solid ${col.border}` : '1px solid transparent',
                      borderRadius: '8px',
                      transition: 'background 120ms ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!s.isPrimary) e.currentTarget.style.background = 'var(--surface-hover)'
                    }}
                    onMouseLeave={(e) => {
                      if (!s.isPrimary) e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: col.bg, color: col.fg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {initialsOf(s.name)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: s.isPrimary ? 700 : 600,
                          color: 'var(--text-primary)',
                        }}>
                          {s.name}
                        </span>
                        {s.isPrimary && (
                          <Star size={11} fill={col.fg} stroke={col.fg} style={{ flexShrink: 0 }} />
                        )}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '1px' }}>
                        {s.role}
                      </div>
                    </div>

                    <a
                      href={`mailto:${s.email}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 8px',
                        fontSize: '11px',
                        color: 'var(--text-tertiary)',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        transition: 'all 120ms ease',
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--rumbo-navy)'
                        e.currentTarget.style.background = 'var(--rumbo-navy-soft)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-tertiary)'
                        e.currentTarget.style.background = 'transparent'
                      }}
                      title={s.email}
                    >
                      <Mail size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
