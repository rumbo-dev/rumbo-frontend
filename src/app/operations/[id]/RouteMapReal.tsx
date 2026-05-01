'use client'

// @ts-nocheck
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

interface Operation {
  status: string
  originCountry?: string | null
  destinationCountry?: string | null
  bookingNumber?: string | null
  etd?: string | null
  eta?: string | null
  isDelayed?: boolean
}

const PORTS: Record<string, [number, number]> = {
  CN: [121.5, 30.3],
  AR: [-58.3, -34.6],
  BR: [-43.2, -22.9],
  CL: [-71.6, -33.0],
  PE: [-77.2, -12.0],
  UY: [-56.2, -34.9],
  US: [-87.6, 30.2],
  DE: [8.6, 53.5],
  NL: [4.3, 51.9],
  ES: [-3.7, 40.4],
  IT: [12.6, 41.1],
  JP: [139.8, 35.0],
  KR: [126.9, 37.4],
  IN: [72.8, 19.0],
  AE: [54.3, 25.1],
  TR: [28.9, 41.0],
}

export default function RouteMapReal({ operation, progress }: { operation: Operation; progress: number }) {
  const origin = PORTS[operation.originCountry || 'CN'] || [121.5, 30.3]
  const dest = PORTS[operation.destinationCountry || 'AR'] || [-58.3, -34.6]

  const t = progress
  const containerLon = origin[0] + (dest[0] - origin[0]) * t
  const containerLat = origin[1] + (dest[1] - origin[1]) * t

  const statusColor =
    operation.status === 'CLOSED' ? '#888780' :
    operation.status === 'IN_TRANSIT' ? '#1E3A7B' :
    operation.status === 'AT_DESTINATION' ? '#047857' : '#F47A5A'

  const statusText =
    operation.status === 'QUOTING' ? 'Pendiente' :
    operation.status === 'BOOKING' ? 'En booking' :
    operation.status === 'IN_TRANSIT' ? 'En tránsito' :
    operation.status === 'AT_DESTINATION' ? 'En destino' :
    operation.status === 'CLOSED' ? 'Finalizada' : ''

  const showContainer = operation.status !== 'QUOTING' && operation.status !== 'CLOSED'

  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'relative', height: '320px', background: '#E8F1F8' }}>
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 145 }}
          width={1000}
          height={320}
          style={{ width: '100%', height: '100%' }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }: any) =>
              geographies.map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#F4F1E8"
                  stroke="#E0DCCF"
                  strokeWidth={0.4}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#F4F1E8' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Pending route (full path) */}
          <Line
            from={origin}
            to={dest}
            stroke="#C4C4C4"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray="4 4"
          />

          {/* Traveled route */}
          {progress > 0.01 && (
            <Line
              from={origin}
              to={[containerLon, containerLat]}
              stroke={statusColor}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          )}

          {/* Origin marker */}
          <Marker coordinates={origin}>
            <circle r={9} fill="white" stroke={statusColor} strokeWidth={2.5} />
            <circle r={4} fill={statusColor} />
            <text textAnchor="middle" y={-15} style={{ fontSize: 11, fontWeight: 700, fill: '#1A1A1A' }}>
              {operation.originCountry}
            </text>
          </Marker>

          {/* Destination marker */}
          <Marker coordinates={dest}>
            <circle r={9} fill="white" stroke={statusColor} strokeWidth={2.5} />
            <circle r={4} fill={statusColor} />
            <text textAnchor="middle" y={22} style={{ fontSize: 11, fontWeight: 700, fill: '#1A1A1A' }}>
              {operation.destinationCountry}
            </text>
          </Marker>

          {/* Container in transit */}
          {showContainer && (
            <Marker coordinates={[containerLon, containerLat]}>
              <circle r={20} fill={statusColor} opacity={0.15} />
              <circle r={14} fill={statusColor} />
              <g transform="translate(-9, -5)">
                <rect x="0" y="0" width="18" height="10" rx="1" stroke="white" strokeWidth="1.3" fill="none" />
                <line x1="4" y1="0" x2="4" y2="10" stroke="white" strokeWidth="1" />
                <line x1="9" y1="0" x2="9" y2="10" stroke="white" strokeWidth="1" />
                <line x1="14" y1="0" x2="14" y2="10" stroke="white" strokeWidth="1" />
              </g>
            </Marker>
          )}
        </ComposableMap>

        {/* Status badge */}
        <div style={{
          position: 'absolute',
          top: '14px',
          left: '14px',
          background: 'white',
          padding: '7px 11px',
          borderRadius: '8px',
          border: '0.5px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          fontWeight: 500,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor }} />
          <span style={{ color: 'var(--text-primary)' }}>{statusText}</span>
        </div>
      </div>
    </div>
  )
}
