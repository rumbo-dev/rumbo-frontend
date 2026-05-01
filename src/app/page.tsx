'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const RUMBO_NAVY = '#1E3A7B'
const RUMBO_CORAL = '#F47A5A'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-ad432.up.railway.app'
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al iniciar sesión')
      }

      const data = await res.json()
      localStorage.setItem('token', data.token)
      router.push('/today')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1.1fr 1fr',
      background: '#FAFAF7',
    }}>
      {/* ============ LEFT: BRANDING ============ */}
      <div style={{
        background: `linear-gradient(135deg, ${RUMBO_NAVY} 0%, #2D4A8A 50%, ${RUMBO_CORAL} 130%)`,
        padding: '48px 64px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
      }}>
        {/* Decorative wave/circle */}
        <div style={{
          position: 'absolute',
          top: '-200px',
          right: '-200px',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,122,90,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-100px',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Top: Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <RumboLogoBranded />
        </div>

        {/* Center: Tagline + frase */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '520px' }}>
          <h1 style={{
            fontSize: '52px',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            margin: 0,
            marginBottom: '20px',
            color: 'white',
          }}>
            El sistema operativo del freight forwarding moderno.
          </h1>
          <p style={{
            fontSize: '18px',
            lineHeight: 1.5,
            opacity: 0.85,
            margin: 0,
            marginBottom: '40px',
            fontWeight: 400,
          }}>
            Menos mails. Más operaciones. Tu equipo enfocado en lo que importa, mientras Rumbo se encarga del resto.
          </p>

          {/* Mockup card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '14px',
            padding: '20px 22px',
            color: '#1A1A1A',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(10px)',
            transform: 'rotate(-1deg)',
            border: '1px solid rgba(255,255,255,0.4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: `linear-gradient(135deg, ${RUMBO_NAVY}, ${RUMBO_CORAL})`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}>
                ✨
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Sugerencia de Rumbo
                </div>
                <div style={{ fontSize: '13px', fontWeight: 500, marginTop: '2px' }}>
                  3 acciones detectadas en OP-2024-0142
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12.5px', color: '#444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: RUMBO_CORAL }} />
                Confirmar ETD con agente de origen
              </div>
              <div style={{ fontSize: '12.5px', color: '#444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: RUMBO_NAVY }} />
                Email listo para enviar al cliente
              </div>
              <div style={{ fontSize: '12.5px', color: '#444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#888' }} />
                Solicitar invoice y packing list
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Footer */}
        <div style={{ position: 'relative', zIndex: 1, fontSize: '13px', opacity: 0.7 }}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '8px' }}>
            <span>© 2026 Rumbo</span>
            <span>·</span>
            <span>Buenos Aires, Argentina</span>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</Link>
            <Link href="https://rumbo-ai.com" style={{ color: 'inherit', textDecoration: 'none' }}>rumbo-ai.com</Link>
          </div>
        </div>
      </div>

      {/* ============ RIGHT: LOGIN FORM ============ */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 64px',
        background: 'white',
      }}>
        <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#1A1A1A',
            margin: 0,
            marginBottom: '8px',
            letterSpacing: '-0.02em',
          }}>
            Iniciar sesión
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#6B6B6B',
            margin: 0,
            marginBottom: '40px',
          }}>
            Bienvenido de nuevo. Ingresá para acceder al panel.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#1A1A1A', marginBottom: '7px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: '15px',
                  border: '1px solid #E0DCCF',
                  borderRadius: '10px',
                  background: '#FAFAF7',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 150ms ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = RUMBO_NAVY)}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#E0DCCF')}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A' }}>
                  Contraseña
                </label>
                <Link href="/forgot-password" style={{ fontSize: '13px', color: RUMBO_NAVY, textDecoration: 'none', fontWeight: 500 }}>
                  ¿La olvidaste?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: '15px',
                  border: '1px solid #E0DCCF',
                  borderRadius: '10px',
                  background: '#FAFAF7',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 150ms ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = RUMBO_NAVY)}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#E0DCCF')}
              />
            </div>

            {error && (
              <div style={{
                padding: '12px 14px',
                background: '#FEE',
                border: '1px solid #FCC',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#A32D2D',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 600,
                color: 'white',
                background: loading ? '#999' : RUMBO_NAVY,
                border: 'none',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 150ms ease, transform 100ms ease',
                marginTop: '8px',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#162D5C' }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = RUMBO_NAVY }}
            >
              {loading ? 'Ingresando…' : 'Continuar →'}
            </button>
          </form>

          <div style={{
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #EFECE3',
            fontSize: '13px',
            color: '#6B6B6B',
            textAlign: 'center',
          }}>
            ¿No tenés cuenta?{' '}
            <Link href="/signup" style={{ color: RUMBO_NAVY, fontWeight: 500, textDecoration: 'none' }}>
              Solicitá acceso
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// RUMBO LOGO — Provisional brand logo with route symbol + wordmark
// Designed to work on dark gradient background (white text + symbol)
// ============================================================================

function RumboLogoBranded() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px' }}>
      {/* Symbol: route from origin (navy) to destination (coral) */}
      <div style={{
        width: '64px',
        height: '64px',
        background: 'white',
        borderRadius: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
      }}>
        <svg width="38" height="38" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Curved route line */}
          <path
            d="M 10 12 Q 22 12 26 28"
            stroke="#1E3A7B"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
          {/* Origin point */}
          <circle cx="10" cy="12" r="4" fill="#1E3A7B" />
          {/* Destination point — coral accent */}
          <circle cx="26" cy="28" r="4.5" fill="#F47A5A" />
          <circle cx="26" cy="28" r="2" fill="white" />
        </svg>
      </div>

      {/* Wordmark */}
      <span style={{
        fontSize: '38px',
        fontWeight: 700,
        letterSpacing: '-0.025em',
        color: 'white',
        lineHeight: 1,
      }}>
        Rumbo
      </span>
    </div>
  )
}
