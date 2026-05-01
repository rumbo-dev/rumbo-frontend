'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('demo123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password })
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img
            src="/logo-rumbo.png"
            alt="Rumbo"
            style={{ height: '48px', width: 'auto', display: 'inline-block' }}
          />
          <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
            Freight forwarding platform
          </div>
        </div>

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '32px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Sign in</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '0 0 24px 0' }}>
            Welcome back. Enter your credentials to continue.
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', height: '36px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '14px', background: 'var(--surface-card)' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', height: '36px', padding: '0 12px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '14px', background: 'var(--surface-card)' }}
              />
            </div>

            {error && (
              <div style={{ background: 'var(--danger-bg)', color: 'var(--danger-fg)', padding: '10px 12px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '36px',
                background: 'var(--rumbo-navy)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'background 120ms ease',
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'var(--rumbo-navy-hover)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'var(--rumbo-navy)')}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-quaternary)', marginTop: '24px' }}>
          Demo credentials are pre-filled
        </div>
      </div>
    </div>
  )
}
