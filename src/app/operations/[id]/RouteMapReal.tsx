'use client'

// @ts-nocheck
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

interface Operation {
  status: string
  originCountry?: string | null
  destinationCountry?: string | null
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

interface Props {
  operation: Operation
  progress: number
  compact?: boolean
  projection?: 'equalEarth' | 'orthographic'
}

export default function RouteMapReal({
  operation,
  progress,
  compact = false,
  projection = 'equalEarth',
}: Props) {
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

  const centerLon = (origin[0] + dest[0]) / 2
  const centerLat = (origin[1] + dest[1]) / 2

  const projectionName = projection === 'orthographic' ? 'geoOrthographic' : 'geoEqualEarth'
  const projectionConfig =
    projection === 'orthographic'
      ? {
          rotate: [-centerLon, -centerLat, 0] as [number, number, number],
          scale: compact ? 200 : 280,
        }
      : {
          scale: compact ? 100 : 145,
          center: [centerLon * 0.3, centerLat * 0.3] as [number, number],
        }

  const width = compact ? 320 : 1000
  const height = compact ? 320 : 320

  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '12px',
      overflow: 'hidden',
      height: '100%',
      minHeight: compact ? '320px' : 'auto',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        position: 'relative',
        flex: 1,
        background: projection === 'orthographic'
          ? 'radial-gradient(circle at 50% 40%, #F0F7FD 0%, #D8E4F0 70%, #C5D4E5 100%)'
          : 'linear-gradient(135deg, #E3F2FD 0%, #ECE7F1 100%)',
        minHeight: '260px',
      }}>
        <ComposableMap
          projection={projectionName}
          projectionConfig={projectionConfig}
          width={width}
          height={height}
          style={{ width: '100%', height: '100%' }}
        >
          {projection === 'orthographic' && (
            <circle
              cx={width / 2}
              cy={height / 2}
              r={projectionConfig.scale}
              fill="#E8F1F8"
              stroke="#D0DCE8"
              strokeWidth="1"
            />
          )}

          <Geographies geography={geoUrl}>
            {({ geographies }: any) =>
              geographies.map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#F4F1E8"
                  stroke="#D8D2C0"
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

          <Line
            from={origin}
            to={dest}
            stroke="#B0B0B0"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray="4 4"
          />

          {progress > 0.01 && (
            <Line
              from={origin}
              to={[containerLon, containerLat]}
              stroke={statusColor}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          )}

          <Marker coordinates={origin}>
            <circle r={compact ? 7 : 9} fill="white" stroke={statusColor} strokeWidth={2.5} />
            <circle r={compact ? 3 : 4} fill={statusColor} />
            <text
              textAnchor="middle"
              y={compact ? -12 : -15}
              style={{ fontSize: compact ? 9 : 11, fontWeight: 700, fill: '#1A1A1A' }}
            >
              {operation.originCountry}
            </text>
          </Marker>

          <Marker coordinates={dest}>
            <circle r={compact ? 7 : 9} fill="white" stroke={statusColor} strokeWidth={2.5} />
            <circle r={compact ? 3 : 4} fill={statusColor} />
            <text
              textAnchor="middle"
              y={compact ? 17 : 22}
              style={{ fontSize: compact ? 9 : 11, fontWeight: 700, fill: '#1A1A1A' }}
            >
              {operation.destinationCountry}
            </text>
          </Marker>

          {showContainer && (
            <Marker coordinates={[containerLon, containerLat]}>
              <circle r={compact ? 14 : 20} fill={statusColor} opacity={0.15} />
              <circle r={compact ? 10 : 14} fill={statusColor} />
              <g transform={compact ? 'translate(-7, -4)' : 'translate(-9, -5)'}>
                <rect
                  x="0" y="0"
                  width={compact ? 14 : 18}
                  height={compact ? 8 : 10}
                  rx="1"
                  stroke="white"
                  strokeWidth="1.2"
                  fill="none"
                />
                <line x1={compact ? 3 : 4} y1="0" x2={compact ? 3 : 4} y2={compact ? 8 : 10} stroke="white" strokeWidth="1" />
                <line x1={compact ? 7 : 9} y1="0" x2={compact ? 7 : 9} y2={compact ? 8 : 10} stroke="white" strokeWidth="1" />
                <line x1={compact ? 11 : 14} y1="0" x2={compact ? 11 : 14} y2={compact ? 8 : 10} stroke="white" strokeWidth="1" />
              </g>
            </Marker>
          )}
        </ComposableMap>

        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'white',
          padding: '6px 10px',
          borderRadius: '7px',
          border: '0.5px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          fontSize: '11px',
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
