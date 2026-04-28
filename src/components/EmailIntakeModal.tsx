'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from './index'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface EmailIntakeModalProps {
  onClose: () => void
}

export default function EmailIntakeModal({ onClose }: EmailIntakeModalProps) {
  const router = useRouter()
  const [rawEmail, setRawEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'input' | 'processing' | 'success' | 'error'>('input')
  const [currentStep, setCurrentStep] = useState(0)
  const [operationId, setOperationId] = useState('')

  const steps = [
    'Reading email...',
    'Extracting shipment details...',
    'Generating action items...',
    'Drafting response...',
  ]

  const handleProcess = async () => {
    if (!rawEmail.trim()) {
      setError('Please paste an email first')
      return
    }

    setLoading(true)
    setError('')
    setStep('processing')
    setCurrentStep(0)

    // Animate steps
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1
        clearInterval(interval)
        return prev
      })
    }, 800)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/emails/process-and-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rawEmail }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to process email')
      }

      const result = await response.json()
      clearInterval(interval)
      setOperationId(result.operationId)
      setStep('success')

      // Navigate after 1.5s
      setTimeout(() => {
        router.push(`/operations/${result.operationId}`)
      }, 1500)
    } catch (err: any) {
      clearInterval(interval)
      setError(err.message)
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '32px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface-card)',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: '700px',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'var(--rumbo-coral-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Mail size={20} style={{ color: 'var(--rumbo-coral)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Process email
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
                Paste a shipment email and let AI extract the details
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {step === 'input' && (
            <>
              <label
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Email content
              </label>
              <textarea
                value={rawEmail}
                onChange={(e) => setRawEmail(e.target.value)}
                placeholder="Paste the full email here (including headers, body, everything)..."
                style={{
                  width: '100%',
                  minHeight: '300px',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-default)',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  background: 'var(--surface-app)',
                  color: 'var(--text-primary)',
                  resize: 'vertical',
                }}
              />
              {error && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px 12px',
                    background: 'var(--danger-bg)',
                    color: 'var(--danger-fg)',
                    borderRadius: '6px',
                    fontSize: '13px',
                  }}
                >
                  {error}
                </div>
              )}
            </>
          )}

          {step === 'processing' && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <Loader2
                size={40}
                style={{ color: 'var(--rumbo-coral)', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }}
              />
              <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Processing email...
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '300px', margin: '0 auto' }}>
                {steps.map((stepText, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      color: idx <= currentStep ? 'var(--text-primary)' : 'var(--text-quaternary)',
                      transition: 'color 200ms ease',
                    }}
                  >
                    {idx < currentStep ? (
                      <CheckCircle2 size={14} style={{ color: 'var(--success-fg)' }} />
                    ) : idx === currentStep ? (
                      <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid var(--border-default)' }} />
                    )}
                    {stepText}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'success' && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <CheckCircle2 size={48} style={{ color: 'var(--success-fg)', margin: '0 auto 16px' }} />
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Email processed successfully
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                Redirecting to operation details...
              </div>
            </div>
          )}

          {step === 'error' && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <AlertCircle size={48} style={{ color: 'var(--danger-fg)', margin: '0 auto 16px' }} />
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Processing failed
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--text-tertiary)',
                  background: 'var(--danger-bg)',
                  padding: '12px',
                  borderRadius: '6px',
                  marginTop: '12px',
                }}
              >
                {error}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
          }}
        >
          {step === 'input' && (
            <>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleProcess} disabled={!rawEmail.trim()}>
                <Mail size={14} />
                Analyze with AI
              </Button>
            </>
          )}
          {step === 'error' && (
            <>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button onClick={() => { setStep('input'); setError(''); }}>
                Try again
              </Button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
