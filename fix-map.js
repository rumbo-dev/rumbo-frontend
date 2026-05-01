const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/operations/[id]/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Find and replace the entire RouteMap function
const start = content.indexOf('function RouteMap({');
const end = content.indexOf('\nfunction RouteMetrics', start);

if (start === -1 || end === -1) {
  console.error('Could not find RouteMap function');
  process.exit(1);
}

const newRouteMap = `function RouteMap({ operation, progress }: { operation: Operation; progress: number }) {
  const SVG_W = 1000;
  const SVG_H = 300;

  // Real port coordinates (lon/lat)
  const ports: Record<string, [number, number]> = {
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
  };

  const toSVG = ([lon, lat]: [number, number]): [number, number] => [
    ((lon + 180) / 360) * SVG_W,
    ((90 - lat) / 180) * SVG_H,
  ];

  const [oX, oY] = toSVG(ports[operation.originCountry || 'CN'] || [121.5, 30.3]);
  const [dX, dY] = toSVG(ports[operation.destinationCountry || 'AR'] || [-58.3, -34.6]);

  const mX = (oX + dX) / 2;
  const mY = Math.min(oY, dY) - 60;
  const t = progress;
  const cX = (1-t)*(1-t)*oX + 2*(1-t)*t*mX + t*t*dX;
  const cY = (1-t)*(1-t)*oY + 2*(1-t)*t*mY + t*t*dY;

  const statusColor = { CLOSED: '#888780', IN_TRANSIT: '#1E3A7B', AT_DESTINATION: '#047857' }[operation.status] || '#F47A5A';
  const statusText = { QUOTING: 'Pendiente cotización', BOOKING: 'En booking', IN_TRANSIT: 'En tránsito', AT_DESTINATION: 'En destino', CLOSED: 'Finalizada' }[operation.status] || '';

  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ position: 'relative', height: '320px', background: 'linear-gradient(135deg, #E3F2FD 0%, #ECE7F1 100%)' }}>
        <svg viewBox={\`0 0 \${SVG_W} \${SVG_H}\`} style={{ width: '100%', height: '100%', display: 'block' }}>
          {/* Pending route */}
          <path d={\`M \${oX} \${oY} Q \${mX} \${mY} \${dX} \${dY}\`} stroke="#E0E0E0" strokeWidth="2" fill="none" strokeDasharray="5 4" opacity="0.6" />
          
          {/* Traveled route */}
          {progress > 0.01 && <path d={\`M \${oX} \${oY} Q \${mX} \${mY} \${cX} \${cY}\`} stroke={statusColor} strokeWidth="2.5" fill="none" opacity="0.85" />}
          
          {/* Origin */}
          <circle cx={oX} cy={oY} r="8" fill="white" stroke={statusColor} strokeWidth="2.5" />
          <circle cx={oX} cy={oY} r="3" fill={statusColor} />
          <text x={oX} y={oY - 18} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--text-primary)">{operation.originCountry}</text>
          
          {/* Destination */}
          <circle cx={dX} cy={dY} r="8" fill="white" stroke={statusColor} strokeWidth="2.5" />
          <circle cx={dX} cy={dY} r="3" fill={statusColor} />
          <text x={dX} y={dY + 20} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--text-primary)">{operation.destinationCountry}</text>
          
          {/* Container */}
          {operation.status !== 'QUOTING' && operation.status !== 'CLOSED' && (
            <>
              <circle cx={cX} cy={cY} r="22" fill={statusColor} opacity="0.15" />
              <circle cx={cX} cy={cY} r="16" fill={statusColor} />
              <g transform={\`translate(\${cX - 9}, \${cY - 5})\`}>
                <rect x="0" y="0" width="18" height="10" rx="1" stroke="white" strokeWidth="1.5" fill="none" />
                <line x1="4" y1="0" x2="4" y2="10" stroke="white" strokeWidth="1" />
                <line x1="9" y1="0" x2="9" y2="10" stroke="white" strokeWidth="1" />
                <line x1="14" y1="0" x2="14" y2="10" stroke="white" strokeWidth="1" />
              </g>
            </>
          )}
        </svg>
        <div style={{ position: 'absolute', top: '14px', left: '14px', background: 'white', padding: '7px 11px', borderRadius: '8px', border: '0.5px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 500, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor }} />
          <span style={{ color: 'var(--text-primary)' }}>{statusText}</span>
        </div>
      </div>
      <RouteMetrics operation={operation} progress={progress} />
    </div>
  );
}`;

const newContent = content.substring(0, start) + newRouteMap + '\n' + content.substring(end);

fs.writeFileSync(filePath, newContent, 'utf-8');
console.log('✅ RouteMap reemplazado correctamente');
