'use client'

import { useRouter, usePathname } from 'next/navigation'
import { LayoutGrid, DollarSign, BarChart3, Plus, Settings, ChevronRight, Sun } from 'lucide-react'

interface SidebarProps {
  onNewOperation?: () => void
}

export default function Sidebar({ onNewOperation }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const isTodayActive = pathname === '/today'
  const isDashboardActive = pathname === '/dashboard' || pathname?.startsWith('/operations')

  return (
    <aside
      style={{
        width: '240px',
        height: '100vh',
        background: 'var(--surface-card)',
        borderRight: '1px solid var(--border-default)',
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
      }}
    >
      {/* Logo section */}
      <div
        style={{
          height: '64px',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <img src="/logo-icon.png" alt="Rumbo" style={{ height: '26px', width: 'auto' }} />
        <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          Rumbo
        </span>
      </div>

      {/* Main nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <button
          onClick={() => router.push('/today')}
          style={{
            width: '100%',
            padding: '12px 14px',
            marginBottom: '10px',
            background: isTodayActive
              ? 'linear-gradient(135deg, var(--rumbo-navy), var(--rumbo-coral))'
              : 'linear-gradient(135deg, var(--rumbo-navy-soft), var(--rumbo-coral-soft))',
            color: isTodayActive ? 'white' : 'var(--rumbo-navy)',
            border: isTodayActive ? 'none' : '1px solid var(--border-default)',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13.5px',
            fontWeight: 600,
            textAlign: 'left',
            transition: 'all 200ms ease',
            boxShadow: isTodayActive ? 'var(--shadow-md)' : 'none',
          }}
        >
          <Sun size={17} strokeWidth={2} />
          <div style={{ flex: 1 }}>
            <div>Hoy en Rumbo</div>
            <div style={{
              fontSize: '11px',
              fontWeight: 400,
              opacity: 0.85,
              marginTop: '1px',
            }}>
              Lo que necesita atención
            </div>
          </div>
        </button>

        <NavItem
          icon={<LayoutGrid size={17} strokeWidth={1.8} />}
          label="Dashboard"
          active={isDashboardActive}
          onClick={() => router.push('/dashboard')}
        />
        <NavItem icon={<DollarSign size={17} strokeWidth={1.8} />} label="Pricing" onClick={() => {}} />
        <NavItem icon={<BarChart3 size={17} strokeWidth={1.8} />} label="Reportes" onClick={() => {}} />

        <div style={{ height: '8px' }} />

        <NavItem
          icon={<Plus size={17} strokeWidth={2} />}
          label="Nueva operación"
          accent
          onClick={onNewOperation || (() => {})}
        />
      </nav>

      {/* Bottom section */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border-subtle)' }}>
        <NavItem icon={<Settings size={17} strokeWidth={1.8} />} label="Configuración" onClick={() => {}} />

        <div
          style={{
            marginTop: '8px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background 120ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--rumbo-navy) 0%, var(--rumbo-coral) 140%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            JP
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Juan Pérez
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Operations</div>
          </div>
          <ChevronRight size={14} style={{ color: 'var(--text-quaternary)', flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  )
}

function NavItem({
  icon,
  label,
  active,
  accent,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  accent?: boolean
  onClick: () => void
}) {
  const baseStyle: React.CSSProperties = {
    height: '36px',
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 120ms ease',
    fontSize: '13.5px',
    fontWeight: 500,
    userSelect: 'none',
  }

  let style: React.CSSProperties = { ...baseStyle, color: 'var(--text-secondary)' }

  if (active) {
    style = {
      ...baseStyle,
      background: 'var(--rumbo-coral-soft)',
      color: 'var(--rumbo-navy)',
      fontWeight: 600,
    }
  } else if (accent) {
    style = {
      ...baseStyle,
      color: 'var(--rumbo-coral)',
      fontWeight: 600,
    }
  }

  return (
    <div
      onClick={onClick}
      style={style}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = 'var(--surface-hover)'
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent'
      }}
    >
      <span style={{ display: 'inline-flex', color: active ? 'var(--rumbo-coral)' : accent ? 'var(--rumbo-coral)' : 'var(--text-tertiary)' }}>
        {icon}
      </span>
      <span>{label}</span>
    </div>
  )
}
