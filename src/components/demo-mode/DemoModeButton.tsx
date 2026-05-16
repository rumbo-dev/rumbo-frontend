'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import DemoModeOverlay, { Toast, DemoSummary } from './DemoModeOverlay'

interface DemoModeButtonProps {
  toasts?: Toast[]
  durationSec?: number
  summary?: DemoSummary
  label?: string
}

export default function DemoModeButton({
  toasts,
  durationSec,
  summary,
  label = 'Demo Mode',
}: DemoModeButtonProps) {
  const [running, setRunning] = useState(false)

  return (
    <>
      <button
        onClick={() => setRunning(true)}
        disabled={running}
        style={{
          padding: '8px 14px',
          background: 'linear-gradient(135deg, var(--rumbo-navy), var(--rumbo-coral))',
          color: 'white',
          border: 'none',
          borderRadius: '999px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: running ? 'not-allowed' : 'pointer',
          opacity: running ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 2px 8px rgba(30, 58, 123, 0.2)',
        }}
      >
        <Play size={13} fill="white" />
        {running ? 'Demo en curso...' : label}
      </button>

      {running && (
        <DemoModeOverlay
          onComplete={() => setRunning(false)}
          toasts={toasts}
          durationSec={durationSec}
          summary={summary}
        />
      )}
    </>
  )
}
