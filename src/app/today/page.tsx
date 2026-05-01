'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

interface TodayData {
  user: { name: string }
  critical: Array<{
    id: string
    operationCode: string
    clientName: string
    headline: string
    impact: string
  }>
  pendingSuggestions: { total: number; estimatedMinutes: number }
  arrivingThisWeek: Array<{ date: string; label: string; operations: number; docsReady: number }>
  yesterdayStats: { emails: number; actions: number; closed: number; alerts: number }
}

export default function TodayPage() {
  const router = useRouter()
  const [data, setData] = useState<TodayData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-ad432.up.railway.app'
    fetch(`${apiUrl}/api/today`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(err => { console.error(err); setLoading(false) })
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buen día' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
  const dayLabel = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-app)' }}>
      <Sidebar />

      <main style={{ marginLeft: '240px', padding: '40px 48px', maxWidth: '1200px' }}>
        {/* Greeting */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            {greeting}, {data?.user.name || 'Agustín'} <span style={{ color: 'var(--rumbo-coral)' }}>👋</span>
          </h1>
          <p style={{
            fontSize: '15px',
            color: 'var(--text-tertiary)',
            margin: '6px 0 0 0',
            textTransform: 'capitalize',
          }}>
            {dayLabel}
          </p>
        </div>

        {loading && (
          <div style={{ padding: '40px', color: 'var(--text-tertiary)' }}>Cargando...</div>
        )}

        {!loading && data && (
          <>
            {/* CRITICAL */}
            {data.critical.length > 0 && (
              <Section
                iconBg="var(--danger-bg)"
                iconFg="var(--danger-fg)"
                icon="⚠"
                title="Operaciones críticas"
                subtitle={`${data.critical.length} requieren atención inmediata`}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {data.critical.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => router.push(`/operations/${item.operationCode}`)}
                      style={{
                        padding: '16px 20px',
                        background: 'var(--surface-card)',
                        border: '1px solid var(--border-default)',
                        borderLeft: '3px solid var(--danger-fg)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 150ms ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-1px)'
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--danger-fg)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: '4px',
                      }}>
                        {item.operationCode} · {item.clientName}
                      </div>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        marginBottom: '4px',
                      }}>
                        {item.headline}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--danger-fg)', fontWeight: 500 }}>
                        {item.impact}
                      </div>
                    </button>
                  ))}
                </div>
              </Section>
            )}

            {/* SUGGESTIONS */}
            <section style={{ marginBottom: '40px' }}>
              <div style={{
                padding: '24px',
                background: 'linear-gradient(135deg, var(--rumbo-navy-soft), var(--rumbo-coral-soft))',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, var(--rumbo-navy), var(--rumbo-coral))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                  }}>
                    ✨
                  </div>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {data.pendingSuggestions.total} sugerencias listas para aprobar
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Tiempo estimado: ~{data.pendingSuggestions.estimatedMinutes} minutos
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/dashboard')}
                  style={{
                    padding: '12px 24px',
                    background: 'var(--rumbo-navy)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  Procesar todas →
                </button>
              </div>
            </section>

            {/* ARRIVING */}
            {data.arrivingThisWeek.length > 0 && (
              <Section
                iconBg="var(--rumbo-coral-soft)"
                iconFg="var(--rumbo-coral)"
                icon="📅"
                title="Llegan esta semana"
                subtitle={`${data.arrivingThisWeek.reduce((acc, d) => acc + d.operations, 0)} operaciones en los próximos 7 días`}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(data.arrivingThisWeek.length, 5)}, 1fr)`,
                  gap: '12px',
                }}>
                  {data.arrivingThisWeek.map((day) => (
                    <div
                      key={day.date}
                      style={{
                        padding: '16px',
                        background: 'var(--surface-card)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '10px',
                      }}
                    >
                      <div style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--text-tertiary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}>
                        {day.label}
                      </div>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        margin: '6px 0',
                      }}>
                        {day.operations}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: day.docsReady < day.operations ? 'var(--danger-fg)' : 'var(--success-fg)',
                        fontWeight: 500,
                      }}>
                        {day.docsReady < day.operations ? '⚠ ' : '✓ '}
                        {day.docsReady}/{day.operations} docs OK
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* YESTERDAY */}
            <Section
              iconBg="var(--neutral-bg)"
              iconFg="var(--neutral-fg)"
              icon="📊"
              title="Resumen de ayer"
              subtitle="Lo que pasó mientras dormías"
            >
              <div style={{
                padding: '20px',
                background: 'var(--surface-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '20px',
              }}>
                <Stat label="Emails procesados" value={data.yesterdayStats.emails} />
                <Stat label="Acciones aprobadas" value={data.yesterdayStats.actions} />
                <Stat label="Operaciones cerradas" value={data.yesterdayStats.closed} />
                <Stat label="Alertas atendidas" value={data.yesterdayStats.alerts} highlight={data.yesterdayStats.alerts > 0} />
              </div>
            </Section>
          </>
        )}
      </main>
    </div>
  )
}

function Section({ icon, iconBg, iconFg, title, subtitle, children }: any) {
  return (
    <section style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: iconBg,
          color: iconFg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
        }}>
          {icon}
        </div>
        <div>
          <h2 style={{
            fontSize: '17px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
            letterSpacing: '-0.01em',
          }}>
            {title}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
            {subtitle}
          </p>
        </div>
      </div>
      {children}
    </section>
  )
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div>
      <div style={{
        fontSize: '32px',
        fontWeight: 700,
        color: highlight ? 'var(--rumbo-coral)' : 'var(--text-primary)',
        lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '12px',
        color: 'var(--text-tertiary)',
        marginTop: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}>
        {label}
      </div>
    </div>
  )
}
