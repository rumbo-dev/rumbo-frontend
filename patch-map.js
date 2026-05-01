const fs = require('fs');
const filePath = 'src/app/operations/[id]/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Add import (only if not already present)
if (!content.includes("import RouteMapReal")) {
  content = content.replace(
    /import \{ ArrowLeft/,
    "import RouteMapReal from './RouteMapReal'\nimport { ArrowLeft"
  );
}

// Replace <RouteMap operation={operation} progress={progress} />
content = content.replace(
  /<RouteMap operation=\{operation\} progress=\{progress\} \/>/g,
  '<RouteMapReal operation={operation} progress={progress} />'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ Componente reemplazado');
