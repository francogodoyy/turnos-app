# TurnosApp · Appointment Management SaaS

> A production-grade appointment scheduling platform built with Next.js 15, Auth.js, Prisma, and PostgreSQL. Designed as a portfolio piece demonstrating modern full-stack architecture.

<p align="center">
  <a href="https://turnos-app.vercel.app">🌐 Live Demo</a>
  <span> · </span>
  <a href="mailto:demo@turnos.com">Demo: demo@turnos.com / demo123</a>
  <span> · </span>
  <a href="mailto:cliente@demo.com">Client: cliente@demo.com / demo123</a>
</p>

---

## ✨ Features

| Area | Details |
|------|---------|
| **Auth** | Register/login with credentials, role-based access (Client / Professional) |
| **Dashboard** | Today's count, pending appointments, confirm/cancel/complete actions |
| **Availability** | CRUD weekly schedule per professional (day + time ranges) |
| **Booking** | Public booking flow — pick a day, see available slots, reserve instantly |
| **Schedule** | Weekly calendar grid with color-coded appointment cards |
| **Auto-complete** | Past pending/confirmed appointments auto-mark as completed |
| **Polish** | Toast notifications, confirm dialogs, skeleton loading, empty states, fade-in animations |

## 🧱 Tech Stack

```
Frontend     Next.js 15 (App Router) + React 19 + Tailwind CSS 3
Backend      Next.js API Routes (serverless)
Auth         Auth.js v5 (next-auth@beta) — Credentials provider, JWT
Database     PostgreSQL (Neon serverless)
ORM          Prisma 6
Monorepo     Turborepo + pnpm workspaces
Deploy       Vercel
```

## 🏗️ Architecture

```
turnos-app/
├── apps/
│   └── web/                  # Next.js 15 application
│       ├── app/
│       │   ├── api/          # REST API routes
│       │   ├── book/[id]/    # Public booking page
│       │   ├── dashboard/    # Professional dashboard + schedule + availability
│       │   ├── appointments/ # Appointment list (client & pro views)
│       │   ├── login/        # Auth pages
│       │   └── register/
│       ├── components/       # Shared UI components
│       └── middleware.ts     # Edge-compatible auth gate
├── packages/
│   ├── db/                   # Prisma schema, client, migrations, seed
│   ├── shared/               # Zod schemas, constants, timezone utils
│   └── ui/                   # (reserved for shared UI primitives)
├── turbo.json                # Turborepo pipeline config
└── vercel.json               # Vercel deploy config
```

### Data Model

```
User ──→ Professional ──→ Availability
 │                           │
 └──→ Appointment ←──────────┘
       │
       └──→ Client (User)
```

- `User` has role: `ADMIN`, `PROFESSIONAL`, or `CLIENT`
- `Professional` extends User with phone, specialty, description, duration
- `Availability` defines weekly time slots (dayOfWeek, startTime, endTime)
- `Appointment` links client + professional at a specific datetime with status

## 🚀 Getting Started

```bash
# Prerequisites: Node.js >= 20, pnpm >= 9

# 1. Clone and install
git clone https://github.com/francogodoyy/turnos-app.git
cd turnos-app
pnpm install

# 2. Set environment variables
# Create apps/web/.env and packages/db/.env:
#   DATABASE_URL=postgresql://...
#   AUTH_SECRET=your-secret
#   AUTH_URL=http://localhost:3000

# 3. Push schema and seed
pnpm db:push
pnpm db:seed

# 4. Run dev server
pnpm dev
```

### Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Professional | demo@turnos.com | demo123 |
| Client | cliente@demo.com | demo123 |

## 🌐 Deployment

This project is designed for [Vercel](https://vercel.com):

1. Connect your GitHub repo to Vercel
2. Set **Root Directory** → `apps/web`
3. Configure environment variables (`DATABASE_URL`, `AUTH_SECRET`)
4. Deploy — the `postinstall` hook runs `prisma generate` automatically

> **Note**: Migrations must be applied manually after deployment:
> `npx prisma migrate deploy` pointed at your production DB.

## 📸 Screenshots

> *(Replace these with actual screenshots from your deployment)*

| | |
|---|---|
| **Landing page** — browse professionals | **Booking flow** — day + time selection |
| **Dashboard** — stats + pending appointments | **Schedule** — weekly calendar grid |
| **Availability management** — CRUD time slots | **Professional profile** — edit specialty & description |

## 🧪 Key Design Decisions

- **Monorepo**: Clean separation between database layer, shared types, and UI. Shows architectural maturity.
- **No separate backend**: Everything lives in Next.js API routes for simpler Vercel deployment.
- **Edge-compatible middleware**: Cookie-only auth check (no Prisma in Edge runtime) to stay under 1 MB limit.
- **Argentina timezone**: All dates stored in UTC, displayed in `America/Argentina/Buenos_Aires` — the app targets AR market.
- **Self-booking allowed**: Clients can book unlimited future appointments as long as time slots don't overlap.

## 📄 License

MIT
