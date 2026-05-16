# Rumbo Frontend

## Quick orientation
Si es la primera vez que ves este repo, antes de tocar nada lee:
1. Este archivo entero
2. `src/app/today/page.tsx` (dashboard principal)
3. `src/app/operations/[id]/page.tsx` (detalle de operación — el archivo más complejo)
4. `src/components/AIChatButton.tsx` (chat AI con streaming)
5. `src/components/demo-mode/` (animación 65s para demos)

Después de leer, si vas a hacer un cambio no trivial, **proponé el plan antes de escribir código**.

## Stack
- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind para utilities; design tokens custom en `src/app/globals.css`
- Deploy: Vercel (auto-deploy desde `main`)
- URL prod: https://rumbo-frontend.vercel.app

## Backend que consume
- API base: `process.env.NEXT_PUBLIC_API_URL || 'https://web-production-ad432.up.railway.app'`
- Endpoints principales:
  - `GET /api/today` — dashboard data
  - `GET /api/operations/:id` — acepta UUID OR operationCode
  - `POST /api/ai/chat` — stream SSE
  - `GET /api/emails/drafts/:id` — drafts por operación
  - `POST /api/emails/send` — aprobar y enviar draft

## Páginas clave
- `/today`: dashboard "Hoy en Rumbo". Greeting + KPIs + 3 críticas + arrivingThisWeek + yesterdayStats
- `/operations/[id]`: detalle de operación con hero + journey + timeline + tasks + drafts. Acepta `OP-XXXX` o UUID en la URL.
- `/dashboard`: lista general de operaciones (más antigua, menos curada visualmente)
- `/email-processor`: vista de testing del pipeline AI (no demo-ready)

## Componentes clave
- `AIChatButton` (`src/components/AIChatButton.tsx`): floating chat con SSE streaming + react-markdown
- `DemoModeButton` + `DemoModeOverlay` (`src/components/demo-mode/`): animación 65s con 9 toasts secuenciados
- `HeroSection` (dentro de `/operations/[id]/page.tsx` línea ~333): pre-title uppercase + gradient title + data grid 4×2 + RouteMapReal compact
- `RouteMapReal` (`src/app/operations/[id]/RouteMapReal.tsx`): mapa con react-simple-maps (NO Leaflet)
- `TimelineNarrative` (dentro de `/operations/[id]/page.tsx`): mergea journeyStep.narrativeNote + timelineEvents en feed cronológico

## State actual
- **Single-tenant**: token JWT del demo user en `localStorage` con key `token`
- No hay signup público; login solo con demo user (`demo@example.com`)
- Frontend NO sabe sobre organizations (todavía)
- `subStatus` enum hardcoded en `SUB_STATUS_CONFIG` (línea ~109 de `operations/[id]/page.tsx`). Si seedeás operaciones desde backend con un subStatus no listado acá, el frontend crashea.

### subStatus values válidos (DEBE matchear backend)
NEW_QUOTE, QUOTE_REQUESTED, READY_TO_QUOTE, QUOTED, CONFIRMED, REJECTED,
BOOKING_PENDING, BOOKING_RECEIVED, BOOKING_CONFIRMED, DOCS_PENDING, DOCS_APPROVED,
ON_BOARD, DOCS_READY, ARRIVED, MANIFEST_PENDING, DESTINATION_PENDING, COMPLETED

## Convenciones del proyecto
- Build local antes de cada push: `npm run build`
- NUNCA usar `localStorage` para nada que no sea el token JWT (no persistente entre dispositivos)
- Preferir CSS variables (`var(--rumbo-navy)`, `var(--rumbo-coral)`, `var(--text-primary)`, etc.) sobre hardcoded colors
- Estilos inline en JSX OK para componentes únicos; extraer a `globals.css` solo cuando se reusan
- NO `git push --force`
- No mezclar features en un commit

## Bugs conocidos
- `TimelineNarrative` mergea timelineEvents + journeySteps.narrativeNote en un solo feed cronológico, pero para los journeySteps usa `new Date()` en vez de `completedAt`. Esto hace que los eventos del journey aparezcan con fecha = hoy. Workaround actual: vaciar el `narrativeNote` cuando duplica un timelineEvent.

## Próximas prioridades
1. **Signup/login real** cuando el backend tenga auth con organizationId
2. **Selector de organization** en el header (cuando haya multi-tenant)
3. **Onboarding wizard** de primera vez (post auth)
4. **Mejorar `/dashboard`** — hoy es la página menos curada
5. **Mapa Leaflet** (tachado en sesión anterior porque react-simple-maps cumple)

## Workflow para cambios no triviales
1. **Leé el código relevante** antes de proponer
2. **Proponé el plan** en chat
3. **Esperá aprobación**
4. **Implementá** mostrando diffs
5. **Build local** (`npm run build`) — el build prod es estricto, va a fallar con TS errors que dev tolera
6. **Commit con mensaje claro**
7. **Push** solo después de build limpio
