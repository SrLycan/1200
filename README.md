# Autos Quito CRM

CRM automotriz profesional construido con arquitectura **enterprise-level**, conectado a WhatsApp Business API, Instagram, Supabase y PostgreSQL.

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | Next.js 15 (App Router), React 19, TypeScript, TailwindCSS, Shadcn/UI, Zustand, React Query, Axios |
| Backend | NestJS 11, Node.js 20, TypeScript, Prisma ORM, PostgreSQL, Supabase, Redis, BullMQ, JWT |
| DevOps | Docker, Docker Compose, GitHub Actions |
| Observabilidad | Pino, OpenTelemetry-ready, Audit logs |

## Estructura raíz

```
1200/
├── backend/         # API NestJS (Clean Architecture)
├── frontend/        # App Next.js 15 (App Router + Modular)
├── docker-compose.yml
├── .env.example
├── ARCHITECTURE.md  # Documento arquitectónico completo
└── README.md
```

## Arranque rápido

```bash
# 1. Clonar y entrar
cd 1200

# 2. Variables de entorno
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Levantar infraestructura (Postgres + Redis)
docker compose up -d postgres redis

# 4. Backend
cd backend
npm install
npx prisma migrate dev --name init
npm run seed
npm run start:dev   # http://localhost:4000

# 5. Frontend (nueva terminal)
cd ../frontend
npm install
npm run dev         # http://localhost:3000
```

## Documentación

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — arquitectura completa, módulos, capas, decisiones técnicas, roadmap.
- [`backend/README.md`](./backend/README.md) — guía del backend.
- [`frontend/README.md`](./frontend/README.md) — guía del frontend.
