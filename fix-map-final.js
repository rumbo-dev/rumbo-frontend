const fs = require('fs');

const filePath = 'src/app/operations/[id]/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const newRouteMap = `function RouteMap({ operation, progress }: { operation: Operation; progress: number }) {
  const ports: Record<string, [number, number]> = {
    CN: [121.5, 30.3], AR: [-58.3, -34.6], BR: [-43.2, -22.9], CL: [-71.6, -33.0],
    PE: [-77.2, -12.0], UY: [-56.2, -34.9], US: [-87.6, 30.2], DE: [8.6, 53.5],
    NL: [4.3, 51.9], ES: [-3.7, 40.4], IT: [12.6, 41.1], JP: [139.8, 35.0],
    KR: [126.9, 37.4], IN: [72.8, 19.0], AE: [54.3, 25.1], TR: [28.9, 41.0],
  };

  const toSVG = ([lon, lat]: [number, number]): [number, number] => [
    ((lon + 180) / 360) * 1000,
    ((90 - lat) / 180) * 300,
  ];

  const [oX, oY] = toSVG(ports[operation.originCountry || 'CN'] || [121.5, 30.3]);
  const [dX, dY] = toSVG(ports[operation.destinationCountry || 'AR'] || [-58.3, -34.6]);

  const mX = (oX + dX) / 2;
  const mY = Math.min(oY, dY) - 60;
  const t = progress;
  const cX = (1-t)*(1-t)*oX + 2*(1-t)*t*mX + t*t*dX;
  const cY = (1-t)*(1-t)*oY + 2*(1-t)*t*mY + t*t*dY;

  const statusColor = { CLOSED: '#888780', IN_TRANSIT: '#1E3A7B', AT_DESTINATION: '#047857' }[operation.status] || '#F47A5A';
  const statusText = { QUOTING: 'Pendiente', BOOKING: 'En booking', IN_TRANSIT: 'En tránsito', AT_DESTINATION: 'En destino', CLOSED: 'Finalizada' }[operation.status] || '';

  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ position: 'relative', height: '320px', background: '#EAF1F8' }}>
        <svg viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
          {/* Grid */}
          {[...Array(13)].map((_, i) => <line key={\`v\${i}\`} x1={(i/12)*1000} y1={0} x2={(i/12)*1000} y2={300} stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" />)}
          {[...Array(7)].map((_, i) => <line key={\`h\${i}\`} x1={0} y1={(i/6)*300} x2={1000} y2={(i/6)*300} stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" />)}

          {/* Continent shapes (simplified) */}
          <g fill="#F4F1E8" stroke="#E0DCCF" strokeWidth="0.5" opacity="0.7">
            {/* East Asia */}
            <path d="M 840 60 Q 920 50 1000 80 Q 1000 180 950 220 Q 900 200 880 130 Q 840 90 840 60 Z" />
            {/* Europe */}
            <path d="M 540 70 Q 650 60 700 100 Q 690 160 600 170 Q 550 150 540 110 Z" />
            {/* Africa */}
            <path d="M 600 150 Q 700 140 750 200 Q 730 270 650 280 Q 600 250 600 150 Z" />
            {/* North America */}
            <path d="M 80 80 Q 200 60 240 140 Q 220 180 140 190 Q 100 150 80 100 Z" />
            {/* South America */}
            <path d="M 220 180 Q 310 170 340 280 Q 280 310 220 290 Z" />
            {/* India */}
            <path d="M 820 180 Q 860 170 880 220 Q 860 250 820 240 Z" />
          </g>

          {/* Route pending */}
          <path d={\`M \${oX} \${oY} Q \${mX} \${mY} \${dX} \${dY}\`} stroke="#D0D0D0" strokeWidth="2" fill="none" strokeDasharray="5 4" opacity="0.5" />

          {/* Route traveled */}
          {progress > 0.01 && <path d={\`M \${oX} \${oY} Q \${mX} \${mY} \${cX} \${cY}\`} stroke={statusColor} strokeWidth="3" fill="none" opacity="0.9" strokeLinecap="round" />}

          {/* Origin */}
          <circle cx={oX} cy={oY} r="12" fill="white" stroke={statusColor} strokeWidth="3" />
          <circle cx={oX} cy={oY} r="5" fill={statusColor} />
          <text x={oX} y={oY - 24} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-primary)">{operation.originCountry}</text>

          {/* Destination */}
          <circle cx={dX} cy={dY} r="12" fill="white" stroke={statusColor} strokeWidth="3" />
          <circle cx={dX} cy={dY} r="5" fill={statusColor} />
          <text x={dX} y={dY + 26} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-primary)">{operation.destinationCountry}</text>

          {/* Container */}
          {operation.status !== 'QUOTING' && operation.status !== 'CLOSED' && (
            <>
              <circle cx={cX} cy={cY} r="18" fill={statusColor} opacity="0.12" />
              <circle cx={cX} cy={cY} r="12" fill={statusColor} />
              <g transform={\`translate(\${cX - 8}, \${cY - 4})\`}>
                <rect x="0" y="0" width="16" height="8" rx="1" stroke="white" strokeWidth="1.2" fill="none" />
                <line x1="3" y1="0" x2="3" y2="8" stroke="white" strokeWidth="1" />
                <line x1="8" y1="0" x2="8" y2="8" stroke="white" strokeWidth="1" />
                <line x1="13" y1="0" x2="13" y2="8" stroke="white" strokeWidth="1" />
              </g>
            </>
          )}
        </svg>

        {/* Status badge */}
        <div style={{ position: 'absolute', top: '14px', left: '14px', background: 'white', padding: '7px 11px', borderRadius: '8px', border: '0.5px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 500, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor }} />
          <span style={{ color: 'var(--text-primary)' }}>{statusText}</span>
        </div>
      </div>
      <RouteMetrics operation={operation} progress={progress} />
    </div>
  );
}`;

const start = content.indexOf('function RouteMap({');
const end = content.indexOf('\nfunction RouteMetrics', start);

if (start === -1 || end === -1) {
  console.error('❌ No se encontró RouteMap');
  process.exit(1);
}

const newContent = content.substring(0, start) + newRouteMap + '\n' + content.substring(end);
fs.writeFileSync(filePath, newContent, 'utf-8');
console.log('✅ Mapa actualizado');
