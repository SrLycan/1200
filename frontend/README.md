# Autos Quito CRM — Frontend

Next.js 15 (App Router) + React 19 + TypeScript + TailwindCSS + Shadcn-style UI + Zustand + React Query + Axios.

## Estructura

```
src/
├── app/
│   ├── layout.tsx              # Root layout (Providers + Toaster)
│   ├── globals.css             # Tailwind + design tokens
│   ├── page.tsx                # Redirige a /dashboard
│   ├── login/page.tsx          # Login público
│   └── (crm)/                  # Route group protegido
│       ├── layout.tsx          # AuthGuard + Sidebar + Topbar
│       ├── dashboard/page.tsx
│       ├── leads/page.tsx
│       ├── leads/[id]/page.tsx
│       ├── pipeline/page.tsx   # Kanban con drag & drop
│       ├── conversations/page.tsx
│       ├── vehicles/page.tsx
│       ├── notifications/page.tsx
│       └── settings/page.tsx
├── components/
│   ├── providers.tsx           # QueryClientProvider
│   ├── layout/                 # Sidebar, Topbar
│   └── ui/                     # Button, Card, Input, Badge (Shadcn-style)
├── modules/                    # Feature modules (self-contained)
│   ├── auth/
│   ├── dashboard/
│   ├── leads/
│   ├── pipeline/
│   └── conversations/
├── services/
│   └── http.ts                 # Axios + interceptor refresh-token
├── store/
│   └── auth.store.ts           # Zustand + persist
├── hooks/                      # Hooks compartidos
├── lib/                        # utils (cn, formatCurrency...)
├── types/                      # Tipos compartidos del dominio
└── middleware.ts               # Soft-gate de rutas
```

## Patrones

- **Feature-first**: cada módulo (`modules/<feature>`) trae su `services/`, `hooks/`, `components/` y opcionalmente `store/`. Las páginas de `app/` solo orquestan.
- **Server state**: React Query para todo lo remoto (cache, refetch, mutations, invalidations).
- **Client state**: Zustand (auth, UI), nada de prop-drilling.
- **HTTP**: Axios con interceptor de refresh-token rotativo + envelope unwrap.
- **UI**: Tailwind + componentes propios (Shadcn-style) y `cva` para variantes — sin instalar Radix UI completo.
- **Rutas protegidas**: `app/(crm)/` envuelto en `AuthGuard` client-side; sustituible por edge-middleware cookie-based en producción.

## Scripts

```bash
npm run dev          # http://localhost:3000
npm run build
npm run start
npm run lint
npm run typecheck
```
