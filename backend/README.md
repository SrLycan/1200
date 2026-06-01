# Autos Quito CRM — Backend

NestJS 11 + TypeScript + Prisma + PostgreSQL/Supabase + Redis + BullMQ.

## Estructura

```
src/
├── main.ts                     # Bootstrap (helmet, cors, swagger, validation, filters)
├── app.module.ts               # Composición global
├── config/
│   └── app.config.ts           # Zod env validation
├── database/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── common/                     # Cross-cutting concerns
│   ├── decorators/             # @Public, @Roles, @CurrentUser
│   ├── filters/                # AllExceptionsFilter
│   ├── guards/                 # JwtAuthGuard, RolesGuard
│   ├── interceptors/           # Transform (envelope), Audit
│   ├── dto/                    # PaginationDto, helpers
│   └── services/               # SupabaseService
└── modules/
    ├── auth/                   # JWT + refresh rotation + RBAC
    ├── users/
    ├── leads/                  # Repo + Service + Scoring + Assignment + Listeners
    ├── conversations/
    ├── messages/               # BullMQ outbound queue
    ├── vehicles/
    ├── pipelines/              # Kanban + stages
    ├── activities/
    ├── notifications/
    ├── audit/                  # Event-driven audit log
    ├── integrations/           # WhatsApp + Instagram + webhook handler
    └── dashboard/              # KPIs

prisma/
├── schema.prisma               # 11 modelos + enums
└── seed.ts                     # Admin + pipeline stages
```

## Scripts

```bash
npm run start:dev        # dev con watch
npm run build            # compila a dist/
npm run start:prod       # producción
npm run lint
npm run test
npm run prisma:migrate   # migración dev
npm run prisma:deploy    # migración prod
npm run prisma:studio
npm run seed             # admin@autosquito.com / Admin12345!
```

## Endpoints clave

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/v1/auth/login` | Login (público) |
| POST | `/api/v1/auth/refresh` | Rota refresh token (público) |
| POST | `/api/v1/auth/logout` | Revoca todos los refresh tokens |
| GET | `/api/v1/users/me` | Usuario actual |
| GET/POST | `/api/v1/leads` | CRUD de leads (filtros, paginación) |
| PATCH | `/api/v1/leads/:id/stage/:stageId` | Mover en pipeline |
| GET | `/api/v1/pipelines/kanban` | Vista Kanban completa |
| GET/PATCH | `/api/v1/conversations` | Bandeja + asignación |
| POST | `/api/v1/messages` | Enviar mensaje (encola BullMQ) |
| GET/POST | `/api/v1/integrations/whatsapp/webhook` | Webhook WhatsApp Cloud API |
| GET/POST | `/api/v1/integrations/instagram/webhook` | Webhook Instagram Graph |
| GET | `/api/v1/dashboard/kpis` | KPIs principales |
| GET | `/api/v1/dashboard/docs` | Swagger (dev) |

## Arquitectura

- **Clean Architecture light**: Controller → Service → Repository → Prisma. Cada módulo expone solo su Service/Module.
- **Event-driven**: `EventEmitter2` para `lead.created`, `lead.stage_changed`, `lead.assigned`, `inbound.message`, `audit.action`.
- **Colas (BullMQ)**: `messages-outbound` con reintentos exponenciales — desacopla envío de canal externo.
- **RBAC**: 4 roles (`ADMIN`, `GERENCIA`, `SUPERVISOR`, `ASESOR`) vía `@Roles()` + `RolesGuard`.
- **Validación**: `class-validator` + `class-transformer` (whitelist + transform). Env validada con Zod al boot.
- **Seguridad**: helmet, cors restringido, throttler global, argon2 password hashing, refresh token hash en DB con rotación.
- **Observabilidad**: pino + pino-pretty (dev) + redacción de secretos; estructura lista para OpenTelemetry.
- **Audit**: cada mutación HTTP emite `audit.action` → `AuditListener` persiste en `audit_logs`.
