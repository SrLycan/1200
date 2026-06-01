# Autos Quito CRM — Arquitectura Enterprise

> Documento técnico para el equipo de ingeniería. Cubre estructura, decisiones,
> patrones, base de datos, seguridad, integraciones, DevOps y roadmap.

---

## 1. Visión general

Sistema CRM automotriz multicanal (WhatsApp + Instagram) con pipeline comercial,
asignación automática, scoring y dashboard ejecutivo. Diseñado para evolucionar
de **MVP single-tenant** → **SaaS multiempresa con IA comercial**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AUTOS QUITO CRM                                 │
├──────────────┬─────────────────────────────────────────┬───────────────┤
│   FRONTEND   │              BACKEND                    │   INFRA       │
│  Next.js 15  │  NestJS 11 · Prisma · BullMQ           │  PostgreSQL   │
│  React 19    │  REST + Webhooks + Workers              │  Redis        │
│  Zustand     │  Event-driven · RBAC · Auditoría        │  Supabase     │
│  React Query │                                         │  Docker       │
└──────┬───────┴──────┬──────────────────┬──────────────┴──────┬────────┘
       │              │                  │                     │
   localhost      JSON REST          Webhooks            Object storage
                                  (WhatsApp / IG)         (Supabase)
```

---

## 2. Estructura de carpetas (raíz)

```
1200/
├── backend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── config/             # Env validation (Zod)
│   │   ├── database/           # PrismaService global
│   │   ├── common/             # Guards, filters, interceptors, decorators, DTO
│   │   └── modules/            # Dominio
│   │       ├── auth/
│   │       ├── users/
│   │       ├── leads/
│   │       ├── conversations/
│   │       ├── messages/
│   │       ├── vehicles/
│   │       ├── pipelines/
│   │       ├── activities/
│   │       ├── notifications/
│   │       ├── audit/
│   │       ├── integrations/   # WhatsApp + Instagram + webhook handler
│   │       └── dashboard/
│   ├── prisma/                 # schema.prisma + seed.ts
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/                # App Router
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   └── (crm)/          # Route group protegido
│   │   ├── components/
│   │   │   ├── layout/         # Sidebar, Topbar
│   │   │   ├── ui/             # Shadcn-style primitives
│   │   │   └── providers.tsx
│   │   ├── modules/            # Feature-first
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── leads/
│   │   │   ├── pipeline/
│   │   │   └── conversations/
│   │   ├── services/http.ts    # Axios + refresh
│   │   ├── store/auth.store.ts # Zustand persistente
│   │   ├── lib/utils.ts
│   │   ├── hooks/
│   │   ├── types/
│   │   └── middleware.ts
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml          # postgres + redis + backend + frontend
├── .github/workflows/ci.yml
└── README.md
```

### Para qué sirve cada carpeta (resumen ejecutivo)

| Carpeta | Para qué | Contiene | Cómo escalar |
| --- | --- | --- | --- |
| `backend/src/config` | Validar env al boot | Zod schema + `registerAs` | Dividir por dominio (jwt.config.ts, db.config.ts) |
| `backend/src/database` | Acceso a DB | `PrismaService` (global) | Repository por módulo + transacciones |
| `backend/src/common` | Cross-cutting | Guards, interceptors, decorators | Mover utilidades repetidas aquí |
| `backend/src/modules/*` | Dominio aislado | `module + controller + service + repository + dto + listeners` | Cada módulo es candidato a microservicio futuro |
| `backend/prisma` | Schema + migraciones | `schema.prisma`, `migrations/`, `seed.ts` | Multi-schema y RLS de Supabase para multi-tenant |
| `frontend/src/app` | Rutas y layouts | Páginas server/client | Route groups por dominio, `parallel routes` para overlays |
| `frontend/src/modules/*` | Feature-first | Services, hooks, components privados | Cada feature evoluciona sin tocar siblings |
| `frontend/src/components/ui` | Primitivas | Button, Card, Input, Badge | Usar shadcn-cli para agregar más sin reinventar |
| `frontend/src/services` | Cliente HTTP | Axios + interceptors | Por módulo si crece (auth.api.ts, leads.api.ts) |
| `frontend/src/store` | State global | Zustand slices | Un store por dominio; evita un mega-store |

---

## 3. Arquitectura Backend (Clean light + Event-Driven)

```
HTTP Request
    │
    ▼
[Controller]  →  validation (class-validator)  +  guards (JwtAuth, Roles)
    │
    ▼
[Service]     →  orquesta casos de uso + emite eventos
    │
    ▼
[Repository]  →  encapsula Prisma queries
    │
    ▼
[Prisma]      →  PostgreSQL/Supabase

           EventEmitter2
                │
                ▼
       ┌────────┴────────┐
       ▼                 ▼
  [Listeners]      [BullMQ Queues]
  (notificación,   (envío externo,
   audit log,       sincronización
   side-effects)    pesada)
```

### Decisiones clave

- **Repository pattern selectivo**: aplicado en módulos con queries complejas (Leads). Otros módulos llaman a Prisma directo para velocidad — pragmático, no dogmático.
- **EventEmitter2 sincrónico para side-effects ligeros** (notificaciones, audit). Lo pesado (envío de WhatsApp, sincronización con CRM legacy) va a **BullMQ** con reintentos exponenciales.
- **Validación en frontera**: Zod en env, class-validator en DTOs HTTP. El dominio confía en sus inputs.
- **DTO ≠ Entity**: los DTOs son contratos HTTP, las entidades viven en Prisma. No los acoples.
- **Filtros y guards globales** registrados en `main.ts` y `APP_GUARD`/`APP_INTERCEPTOR`.
- **Errores normalizados**: `AllExceptionsFilter` produce `{ success, statusCode, error, timestamp }` consistente.

### Módulos y responsabilidades

| Módulo | Responsabilidad | Eventos que emite/escucha |
| --- | --- | --- |
| `auth` | Login, register, refresh rotation, logout | — |
| `users` | CRUD usuarios + RBAC | — |
| `leads` | Lead CRUD, scoring, asignación, transición de etapa | emite `lead.created`, `lead.updated`, `lead.assigned`, `lead.stage_changed` |
| `pipelines` | Etapas + Kanban | — |
| `conversations` | Bandeja, asignación, marcar leído | — |
| `messages` | Envío outbound vía cola BullMQ | usa `messages-outbound` queue |
| `vehicles` | Inventario | — |
| `activities` | Timeline de actividades del lead | escucha `lead.*` |
| `notifications` | Notificaciones in-app | escucha `lead.assigned`, `inbound.message` |
| `audit` | Audit log inmutable | escucha `audit.action` (emitido por `AuditInterceptor`) |
| `integrations` | Webhooks WhatsApp/IG + envío | emite `inbound.message` |
| `dashboard` | KPIs y reportes agregados | — |

---

## 4. Arquitectura Frontend (Feature-first + App Router)

```
app/
 ├── layout.tsx               ← Providers (React Query, Toaster)
 ├── login/                   ← público
 └── (crm)/                   ← route group, envuelto en AuthGuard
      ├── layout.tsx          ← Sidebar + Topbar
      ├── dashboard/
      ├── leads/[id]/
      ├── pipeline/
      ├── conversations/
      ├── vehicles/
      ├── notifications/
      └── settings/
```

### Reglas del juego

1. **Páginas (`app/`) son delgadas**: solo composición + suspense boundaries.
2. **Lógica vive en `modules/<feature>`** con `services/`, `hooks/`, `components/` propios.
3. **Server state**: React Query — `staleTime: 30s` por defecto, `refetchOnWindowFocus: false`.
4. **Client state**: Zustand — un slice por dominio (`auth.store.ts`, eventualmente `ui.store.ts`).
5. **HTTP**: Axios singleton con interceptor que rota refresh-token automáticamente al 401.
6. **Diseño**: tokens HSL en CSS variables → soporta light/dark con `class` strategy.
7. **Responsive**: container queries Tailwind + breakpoints `sm/md/lg/xl`. Sidebar colapsa en `<md`.

### Protección de rutas

Dos capas:
- **Soft-gate cliente**: `<AuthGuard>` redirige a `/login` si no hay sesión en Zustand.
- **Edge middleware** (`src/middleware.ts`): preparado para validar cookie HTTP-only cuando se migre desde localStorage (recomendado para producción).

---

## 5. Sistema de autenticación

| Componente | Implementación |
| --- | --- |
| Password storage | `argon2` (memoria 64MB, paralelismo 4 por defecto del lib) |
| Access token | JWT 15min, secreto separado (`JWT_ACCESS_SECRET`) |
| Refresh token | JWT 7d, secreto separado, **hasheado** (sha256) en `refresh_tokens`, rotación obligatoria en cada `/auth/refresh` |
| Revocación | Logout revoca todos los refresh tokens del usuario |
| Multi-dispositivo | Cada login crea su propio refresh token con `user_agent` + `ip_address` |
| RBAC | `@Roles(UserRole.ADMIN, ...)` + `RolesGuard` lee metadata vía `Reflector` |
| Decorador de identidad | `@CurrentUser('id')` extrae usuario inyectado por la estrategia |
| Endpoints públicos | `@Public()` marca y `JwtAuthGuard` lo respeta |

### Roles y matriz de permisos sugerida

| Acción | ADMIN | GERENCIA | SUPERVISOR | ASESOR |
| --- | :-: | :-: | :-: | :-: |
| Login | ✅ | ✅ | ✅ | ✅ |
| Ver dashboard | ✅ | ✅ | ✅ | ✅ |
| CRUD usuarios | ✅ | — | — | — |
| Cambiar rol | ✅ | — | — | — |
| Listar leads (todos) | ✅ | ✅ | ✅ | (solo asignados) |
| Crear lead | ✅ | ✅ | ✅ | ✅ |
| Reasignar lead | ✅ | ✅ | ✅ | — |
| Eliminar lead | ✅ | ✅ | — | — |
| Configurar pipeline | ✅ | ✅ | — | — |
| CRUD vehículos | ✅ | ✅ | ✅ | (solo lectura) |
| Webhooks integraciones | público (firmados) |

---

## 6. Base de datos

Postgres 16 / Supabase. Esquema en `backend/prisma/schema.prisma` (11 modelos, 9 enums).

### Tablas (resumen)

| Tabla | Cardinalidad | Índices clave |
| --- | --- | --- |
| `users` | M | `role`, `is_active`, unique `email`, unique `supabase_user_id` |
| `refresh_tokens` | M | `user_id`, `token_hash` |
| `leads` | M | `status`, `priority`, `owner_id`, `source`, `created_at`, `pipeline_stage_id`, unique `phone` |
| `pipeline_stages` | S | `order`, unique `slug` |
| `conversations` | M | unique `(channel, external_id)`, `lead_id`, `assigned_to_id`, `is_open`, `last_message_at` |
| `messages` | XXL | `(conversation_id, created_at)`, `external_id`, `direction`, `status` |
| `vehicles` | M | `(make, model)`, `status`, `price`, unique `vin` |
| `activities` | XL | `(lead_id, created_at)`, `user_id`, `type`, `scheduled_at` |
| `notifications` | XL | `(user_id, is_read)`, `created_at` |
| `audit_logs` | XL | `user_id`, `(entity, entity_id)`, `created_at` |

### Relaciones (ASCII ERD)

```
users ─┐
       ├─< refresh_tokens
       ├─< leads (owner)
       ├─< leads (createdBy)
       ├─< conversations (assignedTo)
       ├─< messages (sender)
       ├─< activities
       ├─< notifications
       └─< audit_logs

leads ─┬─< conversations
       ├─< activities
       ├─> pipeline_stages (stage)
       └─> vehicles (interest)

conversations ─< messages
```

### Buenas prácticas DB

- **Soft delete** (`deleted_at`) en `users`, `leads`, `vehicles` — evita perder historial comercial.
- **JSON columns** (`utm`, `customFields`, `raw`, `metadata`) para extensibilidad sin migraciones.
- **Índices compuestos** en patrones `(conversation_id, created_at)` para timelines.
- **Audit log inmutable** poblado vía interceptor → cumple SOX-like.
- **Para multi-tenant futuro**: añadir `tenant_id` a todos los modelos + RLS en Supabase.
- **Particionar `messages`** por mes cuando supere ~50M filas.

---

## 7. Sistema conversacional

```
WhatsApp Cloud API ──┐
                     │   POST /api/v1/integrations/whatsapp/webhook
Instagram Graph  ────┼──>  (verifica X-Hub-Signature-256)
                     │
                     ▼
            WebhookHandlerService
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
  ensure Lead   ensure Conv   persistInbound
  (autoassign)  (per channel)  (Message)
        │
        ▼
   emit('inbound.message')
        │
   ┌────┴────┐
   ▼         ▼
Notifications  (futuro: SLA timer, AI auto-respuesta)
```

**Envío outbound**:
```
UI → POST /messages → MessagesService.sendOutbound
                          │
                          ▼
                  Crea Message(status=PENDING)
                          │
                          ▼
                BullMQ queue "messages-outbound"
                          │
                          ▼
                  OutboundProcessor (worker)
                          │
                          ├─> WhatsappService.sendText
                          └─> InstagramService.sendText
                          │
                          ▼
                Update Message(status=SENT, externalId)
```

Por qué cola en lugar de llamada directa:
- Reintentos exponenciales sin perder mensajes.
- Backpressure: si Meta nos rate-limita, encolamos.
- Aísla la latencia externa del request del usuario.

**Asignación automática** (`LeadAssignmentService.pickOwner`):
- Round-robin entre `role=ASESOR` activos, balanceando por leads abiertos.
- v2: ponderar por load de conversaciones abiertas en Redis.

---

## 8. Pipeline comercial

7 etapas semilla (`prisma/seed.ts`):

```
[Lead nuevo] → [En triaje] → [Lead calificado] → [Cita agendada]
                                                       │
                                                       ▼
                                              [Negociación]
                                              │           │
                                              ▼           ▼
                                       [Venta cerrada]  [Lead perdido]
```

### Automatizaciones (vía eventos)

| Trigger | Acción |
| --- | --- |
| `lead.created` | Notificar asesor + crear `Activity(type=NOTE)` |
| `lead.stage_changed` | Crear `Activity(type=STAGE_CHANGE)` |
| `lead.assigned` | Notificar nuevo dueño |
| `inbound.message` | Notificar asignado + (futuro) marcar SLA |
| Cron diario (Fase 2) | Detectar leads sin movimiento >7d → mover a TRIAGE/LOST |

### Workflows futuros (Fase 2)

- **No-respuesta 24h** → mensaje de seguimiento automático.
- **Stage = APPOINTMENT** → crear evento en Google Calendar.
- **Stage = WON** → notificar gerencia + actualizar `vehicles.status=SOLD`.

---

## 9. Dashboard SaaS

Layout responsive:

```
┌────────┬──────────────────────────────────────────────┐
│  AQ    │  🔍 buscar global ............    🔔 (3)     │
│  CRM   ├──────────────────────────────────────────────┤
│        │                                              │
│ ●Dash  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐            │
│  Leads │  │KPI 1│ │KPI 2│ │KPI 3│ │KPI 4│            │
│ Pipln. │  └─────┘ └─────┘ └─────┘ └─────┘            │
│ Conv.  │                                              │
│ Veh.   │  ┌──────────────────┐  ┌─────────────────┐   │
│ Notif. │  │ Bar chart etapas │  │ Pie por canal   │   │
│ Setts. │  └──────────────────┘  └─────────────────┘   │
│        │                                              │
│ ─────  │  ┌──────────────────────────────────────┐    │
│ User   │  │ Tasa de conversión: 12.5%           │    │
│ Logout │  └──────────────────────────────────────┘    │
└────────┴──────────────────────────────────────────────┘
```

Componentes:
- `KpiCard` — métrica grande + icono + tono semántico
- `BarChart`/`PieChart` (recharts) — leads por etapa y por origen
- Kanban draggable nativo (HTML5 DnD, sin librería)
- Chat panel split-screen (lista + thread)

---

## 10. Dockerización

`docker-compose.yml` orquesta 4 servicios:

| Servicio | Imagen | Healthcheck | Volumen |
| --- | --- | --- | --- |
| `postgres` | postgres:16-alpine | `pg_isready` | `postgres_data` |
| `redis` | redis:7-alpine | `redis-cli ping` | `redis_data` |
| `backend` | build `./backend` (target dev) | depende healthy de pg+redis | hot-reload via bind mount |
| `frontend` | build `./frontend` (target dev) | depende de backend | hot-reload via bind mount |

Ambos Dockerfiles son **multistage** con targets `development`, `build`, `production` (producción con `tini` como PID 1, `node_modules` pruned).

Para producción real: cambiar `target` a `production` en el compose o usar imágenes pre-construidas en registry.

---

## 11. Variables de entorno

### Backend (`backend/.env`)
```env
NODE_ENV=development
PORT=4000
API_PREFIX=api/v1
CORS_ORIGINS=http://localhost:3000

DATABASE_URL=postgresql://user:pass@localhost:5432/autosquito_crm?schema=public
REDIS_URL=redis://localhost:6379

JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_ANON_KEY=...

WHATSAPP_TOKEN=...
WHATSAPP_PHONE_ID=...
WHATSAPP_VERIFY_TOKEN=...
WHATSAPP_WEBHOOK_SECRET=...

INSTAGRAM_TOKEN=...
INSTAGRAM_PAGE_ID=...
INSTAGRAM_VERIFY_TOKEN=...
INSTAGRAM_APP_SECRET=...
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Validación: el backend valida todo con Zod al boot — si falta un secreto crítico, no arranca.

---

## 12. Buenas prácticas enterprise

| Pilar | Implementación |
| --- | --- |
| **Clean Architecture** | Controllers delegan a Services; Services a Repositories; Repositories a Prisma. |
| **SOLID** | SRP por módulo; OCP vía eventos; ISP con DTOs específicos; DIP vía inyección de dependencias. |
| **Escalabilidad** | Stateless backend (sesión en JWT + refresh en DB), workers BullMQ horizontales, Redis como bus, Postgres con índices y particionable. |
| **Modularidad** | Cada feature aislada → fácil extracción a microservicio. |
| **Seguridad** | helmet, CORS allowlist, argon2, JWT separados access/refresh, rotación, hash de refresh en DB, throttler global, validación whitelist, redacción de secretos en logs, webhooks firmados (HMAC-SHA256). |
| **Performance** | Índices compuestos, paginación obligatoria, React Query con staleTime, código split por route group, transacciones batched (`$transaction`). |
| **Logging** | Pino estructurado + redacción + pretty en dev. Listo para drenar a Datadog/Loki. |
| **Auditoría** | Interceptor → evento → AuditService → `audit_logs` inmutable con `userId`, `entity`, `entityId`, `changes`, `ip`, `userAgent`. |
| **Testing** | Jest configurado backend; e2e config en `test/`. Frontend: añadir Playwright. |
| **CI** | GitHub Actions con jobs paralelos backend (lint + test + build con Postgres+Redis services) y frontend (lint + typecheck + build). |

---

## 13. Roadmap técnico

### Fase 1 — MVP (semanas 1-4)
- ✅ Backend NestJS con auth, leads, pipelines, conversaciones, integraciones
- ✅ Frontend Next.js con dashboard, leads, kanban, chat
- ✅ WhatsApp + Instagram funcionales con webhooks firmados
- ✅ Docker Compose levantando todo
- ✅ Seed con admin + etapas

### Fase 2 — Automatizaciones (semanas 5-8)
- Cron jobs (NestJS `@Schedule`) para SLA, leads dormidos, recordatorios
- Plantillas de WhatsApp pre-aprobadas (templates HSM)
- Workflows configurables (etapa → mensaje, etapa → tarea)
- Integración con Google Calendar para citas
- Notificaciones push real-time (WebSocket / Supabase realtime)
- Exportación CSV/Excel de leads
- Reportes históricos con filtros por rango

### Fase 3 — IA comercial (semanas 9-16)
- Auto-respuesta con LLM (clasifica intent, responde FAQs, calienta lead)
- Resumen automático de conversación al cerrar
- Lead scoring ML (entrenado con histórico de cierres)
- Transcripción de audios entrantes (Whisper)
- Análisis de sentiment por conversación
- Recomendador de vehículo según historial del lead

### Fase 4 — SaaS multiempresa (semanas 17-24)
- Multi-tenancy con `tenant_id` + RLS en Supabase
- Plan de facturación (Stripe) con feature flags por plan
- Onboarding self-service (registro de empresa, invitar usuarios)
- White-label (logo, colores, dominio personalizado)
- API pública versionada + API keys por tenant
- SLAs configurables por plan
- Métricas de uso por tenant para billing

---

## 14. Comandos iniciales

```bash
# Variables
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Infraestructura
docker compose up -d postgres redis

# Backend
cd backend
npm install
npx prisma migrate dev --name init
npm run seed                  # admin@autosquito.com / Admin12345!
npm run start:dev             # http://localhost:4000/api/v1
# Swagger: http://localhost:4000/api/v1/docs

# Frontend (otra terminal)
cd frontend
npm install
npm run dev                   # http://localhost:3000
```

### O todo con Docker Compose
```bash
docker compose up --build
```

---

## 15. Glosario rápido de decisiones

| Decisión | Por qué |
| --- | --- |
| NestJS sobre Express raw | DI, modularidad, ecosistema (Swagger, Bull, Passport) listos. |
| Prisma sobre TypeORM | Mejor DX, migraciones declarativas, type-safety end-to-end. |
| Zustand sobre Redux | API minimal; el dominio realmente complejo va a React Query, no a global state. |
| React Query sobre SWR | Mutations + invalidations + devtools maduros. |
| Axios sobre fetch | Interceptors nativos para refresh token; mejor manejo de errores. |
| Tailwind + Shadcn-style | Velocidad + componentes propios sin lock-in con una UI lib. |
| BullMQ sobre Bull/Agenda | Postgres no es bus de mensajes; Redis sí lo es. BullMQ es el sucesor moderno. |
| EventEmitter2 in-process | Suficiente para side-effects pequeños; cuando crezca → NATS/Kafka. |
| Supabase + Postgres puro | Postgres es el motor; Supabase suma auth federado, storage, realtime sin reescribir. |

---

**Construido pensando en producción, no en demo.** Cada decisión documentada arriba responde a una pregunta real que aparecerá en code review.
