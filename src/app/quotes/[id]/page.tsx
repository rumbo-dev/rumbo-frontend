'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertTriangle, FileText, Send, Clock } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import type { Quote } from '@/types/quote'

import QuoteHero from './components/QuoteHero'
import ParsedDataGrid from './components/ParsedDataGrid'
import OriginalMessageCollapsible from './components/OriginalMessageCollapsible'
import CarrierComparisonTable from './components/CarrierComparisonTable'
import RecommendationCard from './components/RecommendationCard'
import MarkupCalculator from './components/MarkupCalculator'
import SurchargesBlock from './components/SurchargesBlock'
import DraftEmailCard from './components/DraftEmailCard'
import QuoteSidebar from './components/QuoteSidebar'
import AgentDecisionModal from '@/components/AgentDecisionModal'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://web-production-ad432.up.railway.app'

interface AgentActivityItem {
  agent: string
  text: string
  minutesAgo: number
  decisionId?: string
}

// Agent activity feed per quote — hardcoded for demo.
// decisionId matches IDs seeded by scripts/seed-agent-decisions.ts when applicable.
function agentActivityFor(quote: Quote): AgentActivityItem[] {
  if (quote.quoteCode === 'Q-0204') {
    return [
      { agent: 'READ',   text: 'Parseó email entrante con 10 campos · confidence 98%',           minutesAgo: 80, decisionId: 'ad-008' },
      { agent: 'READ',   text: 'Matched cliente Andes Trading SA en CRM · 3 ops históricas',     minutesAgo: 80 },
      { agent: 'QUOTE',  text: 'Consultó rates MSC, Maersk, Hapag-Lloyd, CMA-CGM',               minutesAgo: 12 },
      { agent: 'QUOTE',  text: 'Comparó contrato vs spot · MSC contrato ganador por relación',   minutesAgo: 10, decisionId: 'ad-010' },
      { agent: 'QUOTE',  text: 'Generó draft de email con tono cordial tuteo',                   minutesAgo: 8 },
    ]
  }
  if (quote.quoteCode === 'Q-0203') {
    return [
      { agent: 'READ',  text: 'Parsing WhatsApp · cliente identificado: Quest Industries', minutesAgo: 14 },
      { agent: 'READ',  text: 'Datos incompletos · 6 fields faltantes',                    minutesAgo: 13 },
      { agent: 'QUOTE', text: 'Generó draft pidiendo info al cliente',                     minutesAgo: 10, decisionId: 'ad-004' },
    ]
  }
  if (quote.quoteCode === 'Q-0207') {
    return [
      { agent: 'READ',   text: 'Cliente respondió con data completa',          minutesAgo: 2880 },
      { agent: 'QUOTE',  text: 'Cotizó vs MSC, Maersk, COSCO · ganó Maersk',   minutesAgo: 2850 },
      { agent: 'REPLY',  text: 'Quote enviada al cliente',                     minutesAgo: 2840, decisionId: 'ad-005' },
    ]
  }
  return [
    { agent: 'READ', text: 'Parsing data de la solicitud', minutesAgo: 60 },
  ]
}

// ============================================================================
// PAGE
// ============================================================================

export default function QuoteDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [openDecisionId, setOpenDecisionId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/api/quotes/${id}`)
      .then((r) => {
        if (r.status === 404) throw new Error('NOT_FOUND')
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d) => setQuote(d as Quote))
      .catch((err) => setError(err.message || 'Error de red'))
      .finally(() => setLoading(false))
  }, [id])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  if (loading) {
    return (
      <Shell>
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          Cargando cotización…
        </div>
      </Shell>
    )
  }

  if (error === 'NOT_FOUND' || !quote) {
    return (
      <Shell>
        <div style={{
          padding: '60px',
          textAlign: 'center',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
        }}>
          <AlertTriangle size={32} style={{ color: 'var(--warning-fg)', margin: '0 auto 12px' }} />
          <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>Cotización no encontrada</h2>
          <p style={{ margin: '8px 0 20px', color: 'var(--text-tertiary)', fontSize: '13px' }}>
            La quote <code>{id}</code> no existe o no tenés acceso.
          </p>
          <button
            onClick={() => router.push('/quotes')}
            style={{
              padding: '10px 20px',
              background: 'var(--rumbo-navy)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Volver a cotizaciones
          </button>
        </div>
      </Shell>
    )
  }

  if (error) {
    return (
      <Shell>
        <div style={{
          padding: '20px',
          background: 'var(--danger-bg)',
          border: '1px solid var(--danger-fg)',
          borderRadius: '10px',
          color: 'var(--danger-fg)',
        }}>
          Error cargando la cotización: {error}
        </div>
      </Shell>
    )
  }

  const agentActivity = agentActivityFor(quote)
  const lane = quote.origin && quote.destination ? `${quote.origin}-${quote.destination}` : ''

  // ============ RENDER POR STATUS ============
  const isFullQuoteRender =
    quote.recommendedCarrier &&
    quote.carrierComparison &&
    Array.isArray(quote.carrierComparison) &&
    quote.carrierComparison.length > 0 &&
    quote.surchargesBreakdown &&
    Array.isArray(quote.surchargesBreakdown)

  return (
    <Shell>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 300px',
        gap: '32px',
        alignItems: 'start',
      }}>
        <div style={{ minWidth: 0 }}>
          <QuoteHero
            quote={quote}
            primaryCta={
              quote.status === 'QUOTED_DRAFT'
                ? { label: 'Aprobar y enviar quote', onClick: () => showToast('Quote enviada a ' + quote.clientName + '. Status actualizado.') }
                : undefined
            }
          />

          {/* ============ STATUS-CONDITIONAL CONTENT ============ */}

          {/* WAITING_FOR_DATA — Q-0203 */}
          {quote.status === 'WAITING_FOR_DATA' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <SectionTitle icon={<FileText size={16} />} title="Datos parseados" subtitle="Lo que Rumbo extrajo del mensaje del cliente" />
              <ParsedDataGrid quote={quote} />

              <SectionTitle icon={<Clock size={16} />} title="Mensaje original" subtitle={`Recibido vía ${quote.channel}`} />
              <OriginalMessageCollapsible message={quote.originalMessage} channel={quote.channel} defaultOpen />

              <SectionTitle icon={<Send size={16} />} title="Borrador pidiendo info" subtitle="Generado por Rumbo, listo para aprobar" />
              <DraftEmailCard
                subject={quote.draftSubject}
                body={quote.draftBody}
                channel={quote.channel}
                confidence={quote.draftAiConfidence}
                onApprove={() => showToast('Mensaje enviado a ' + quote.clientName)}
                onEdit={() => showToast('Editor: próximamente')}
                onAskMore={() => showToast('Próximamente')}
              />
            </div>
          )}

          {/* SENT_AWAITING_CLIENT — Q-0207 */}
          {quote.status === 'SENT_AWAITING_CLIENT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <SectionTitle icon={<FileText size={16} />} title="Datos del shipment" subtitle="" />
              <ParsedDataGrid quote={quote} />

              <SectionTitle icon={<Send size={16} />} title="Quote enviada" subtitle={`Esperando respuesta del cliente`} />
              <div style={{
                padding: '20px 22px',
                background: 'linear-gradient(135deg, var(--rumbo-navy-soft), var(--surface-card))',
                border: '1px solid var(--rumbo-navy)',
                borderLeft: '4px solid var(--rumbo-navy)',
                borderRadius: '12px',
              }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                  Cotización enviada al cliente
                </div>
                <div style={{ fontSize: '30px', fontWeight: 700, color: 'var(--rumbo-navy)', marginTop: '6px', letterSpacing: '-0.02em' }}>
                  USD {quote.quoteFinalUsd?.toLocaleString('en-US')}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Carrier recomendado: <strong>{quote.recommendedCarrier}</strong> · Vigencia: {quote.quoteValidDays} días
                </div>
                <button
                  onClick={() => showToast('Follow-up enviado al cliente')}
                  style={{
                    marginTop: '14px',
                    padding: '10px 18px',
                    background: 'var(--rumbo-navy)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Mandar follow-up
                </button>
              </div>

              {quote.draftBody && (
                <>
                  <SectionTitle icon={<Send size={16} />} title="Email enviado al cliente" subtitle="" />
                  <DraftEmailCard
                    subject={quote.draftSubject}
                    body={quote.draftBody}
                    channel={quote.channel}
                    confidence={null}
                    onApprove={() => showToast('Ya enviado')}
                    onEdit={() => showToast('Próximamente')}
                    onAskMore={() => showToast('Próximamente')}
                  />
                </>
              )}
            </div>
          )}

          {/* READY_TO_QUOTE sin recommended → new client */}
          {quote.status === 'READY_TO_QUOTE' && !quote.recommendedCarrier && quote.isNewClient && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <SectionTitle icon={<FileText size={16} />} title="Datos parseados" subtitle="Lo que Rumbo extrajo del formulario" />
              <ParsedDataGrid quote={quote} />

              <SectionTitle icon={<Clock size={16} />} title="Mensaje original" subtitle="" />
              <OriginalMessageCollapsible message={quote.originalMessage} channel={quote.channel} />

              <div style={{
                padding: '24px 26px',
                background: 'linear-gradient(135deg, var(--warning-bg), var(--surface-card))',
                border: '1px solid var(--warning-fg)',
                borderLeft: '4px solid var(--warning-fg)',
                borderRadius: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <AlertTriangle size={18} style={{ color: 'var(--warning-fg)' }} />
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Validar referencias comerciales antes de cotizar
                  </h3>
                </div>
                <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Cliente nuevo sin histórico operativo. Antes de armar la cotización, recomendamos
                  validar referencias comerciales, capacidad de pago y track record con otros forwarders.
                  Una vez validado, Rumbo arma la comparación de carriers y el draft de respuesta.
                </p>
              </div>
            </div>
          )}

          {/* READY_TO_QUOTE sin recommended → recurring client (Q-0206 RF) */}
          {quote.status === 'READY_TO_QUOTE' && !quote.recommendedCarrier && !quote.isNewClient && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <SectionTitle icon={<FileText size={16} />} title="Datos parseados" subtitle="" />
              <ParsedDataGrid quote={quote} />

              <SectionTitle icon={<Clock size={16} />} title="Mensaje original" subtitle="" />
              <OriginalMessageCollapsible message={quote.originalMessage} channel={quote.channel} />

              <div style={{
                padding: '24px 26px',
                background: 'linear-gradient(135deg, var(--rumbo-navy-soft), var(--surface-card))',
                border: '1px solid var(--rumbo-navy)',
                borderLeft: '4px solid var(--rumbo-navy)',
                borderRadius: '12px',
              }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Cotización en preparación
                </h3>
                <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Rumbo está consultando rates con carriers para esta lane.
                  {quote.specialHandling && (
                    <> Atención especial: <strong>{quote.specialHandling}</strong>.</>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* FULL render — Q-0204 (QUOTED_DRAFT) o cualquier otro con datos completos */}
          {isFullQuoteRender && quote.status !== 'WAITING_FOR_DATA' && quote.status !== 'SENT_AWAITING_CLIENT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <SectionTitle icon={<FileText size={16} />} title="Datos parseados por Rumbo" subtitle="Extraídos del email entrante" />
              <ParsedDataGrid quote={quote} />

              <SectionTitle icon={<Clock size={16} />} title="Mensaje original" subtitle={`Recibido vía ${quote.channel} hace ${Math.round((Date.now() - new Date(quote.receivedAt).getTime()) / 60000)} minutos`} />
              <OriginalMessageCollapsible message={quote.originalMessage} channel={quote.channel} />

              <SectionTitle icon={<FileText size={16} />} title="Comparación de carriers" subtitle="4 opciones consultadas en contrato y spot" />
              <CarrierComparisonTable carriers={quote.carrierComparison!} />

              {quote.recommendedReason && (
                <RecommendationCard carrier={quote.recommendedCarrier!} reason={quote.recommendedReason} />
              )}

              {quote.baseCarrierCost != null && quote.surchargesTotal != null && (
                <MarkupCalculator
                  baseCarrierCost={quote.baseCarrierCost}
                  surchargesTotal={quote.surchargesTotal}
                  initialMarkupPercent={quote.markupPercent || 12}
                  clientName={quote.clientName}
                  clientAverageMarkup={quote.clientAverageMarkup}
                  lane={lane}
                  containerType={quote.containerType || ''}
                />
              )}

              {quote.surchargesBreakdown && Array.isArray(quote.surchargesBreakdown) && quote.quoteFinalUsd && (
                <SurchargesBlock
                  surcharges={quote.surchargesBreakdown}
                  total={quote.surchargesTotal || 0}
                  quoteFinalUsd={quote.quoteFinalUsd}
                />
              )}

              {quote.draftBody && (
                <DraftEmailCard
                  subject={quote.draftSubject}
                  body={quote.draftBody}
                  channel={quote.channel}
                  confidence={quote.draftAiConfidence}
                  onApprove={() => showToast('Quote enviada a ' + quote.clientName + '. Status actualizado.')}
                  onEdit={() => showToast('Editor: próximamente')}
                  onAskMore={() => showToast('Próximamente')}
                />
              )}
            </div>
          )}
        </div>

        <QuoteSidebar
          quote={quote}
          agentActivity={agentActivity}
          onAgentClick={(decisionId) => {
            if (decisionId) {
              setOpenDecisionId(decisionId)
            } else {
              showToast('Próximamente')
            }
          }}
        />
      </div>

      {openDecisionId && (
        <AgentDecisionModal
          decisionId={openDecisionId}
          onClose={() => setOpenDecisionId(null)}
        />
      )}

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '14px 22px',
          background: 'var(--text-primary)',
          color: 'white',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 500,
          boxShadow: 'var(--shadow-lg)',
          zIndex: 100,
          animation: 'slideInRight 0.3s ease-out',
        }}>
          {toast}
        </div>
      )}
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-app)' }}>
      <Sidebar />
      <main style={{ marginLeft: '240px', padding: '40px 48px', maxWidth: '1400px' }}>
        {children}
      </main>
    </div>
  )
}

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '8px',
        background: 'var(--rumbo-navy-soft)',
        color: 'var(--rumbo-navy)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-tertiary)' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
