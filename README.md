# Agendalo · Gestión de Turnos Profesional

> Plataforma SaaS de gestión de turnos construida con Next.js 15, Auth.js, Prisma y PostgreSQL. Proyecto de portafolio que demuestra arquitectura full-stack moderna.

<p align="center">
  <a href="https://turnos-app-web.vercel.app/login">Demo en vivo</a>
  <span> · </span>
  <a href="mailto:demo@turnos.com">Profesional: demo@turnos.com / demo123</a>
  <span> · </span>
  <a href="mailto:cliente@demo.com">Cliente: cliente@demo.com / demo123</a>
  <span> · </span>
  <a href="mailto:admin@turnos.com">Admin: admin@turnos.com / demo123</a>
</p>

---

##  Funcionalidades

| Área | Detalle |
|------|---------|
| **Auth** | Registro/inicio con email y contraseña, acceso por roles (Cliente / Profesional / Admin) |
| **Dashboard** | Turnos del día, pendientes, acciones de confirmar/cancelar/completar |
| **Disponibilidad** | CRUD de horarios semanales por profesional (día + franja horaria) |
| **Reserva pública** | Seleccioná un día, horarios disponibles, reservá al instante |
| **Calendario semanal** | Grilla con tarjetas de turnos por colores según estado |
| **Auto-completado** | Turnos pasados pendientes/confirmados se marcan como completados automáticamente |
| **Pulido** | Notificaciones toast, diálogos de confirmación, skeletons, estados vacíos, animaciones |
| **Modo oscuro** | Toggle con persistencia en localStorage |
| **Emails** | Confirmación al reservar y recordatorio de turnos del día siguiente |

##  Stack Tecnológico

```
Frontend     Next.js 15 (App Router) + React 19 + Tailwind CSS 3
Backend      Next.js API Routes (serverless)
Auth         Auth.js v5 (next-auth@beta) — Credentials, JWT
Base de datos PostgreSQL (Neon serverless)
ORM          Prisma 6
Monorepo     Turborepo + pnpm workspaces
Deploy       Vercel
Emails       Resend
Tests        Vitest + Playwright
```

##  Arquitectura

```
agendalo/
├── apps/
│   └── web/                  # Aplicación Next.js 15
│       ├── app/
│       │   ├── api/          # Rutas REST API
│       │   ├── book/[id]/    # Página pública de reserva
│       │   ├── dashboard/    # Dashboard profesional + calendario + disponibilidad
│       │   │   └── admin/    # Panel de administración
│       │   ├── appointments/ # Lista de turnos (vista cliente y profesional)
│       │   ├── login/        # Inicio de sesión
│       │   └── register/     # Registro
│       ├── components/       # Componentes compartidos
│       ├── lib/              # Utilidades (emails, etc.)
│       └── middleware.ts     # Gate de autenticación (Edge-compatible)
├── packages/
│   ├── db/                   # Schema Prisma, cliente, migraciones, seed
│   ├── shared/               # Schemas Zod, constantes, utilidades de zona horaria
│   └── ui/                   # (reservado para primitivos UI compartidos)
├── turbo.json                # Pipeline de Turborepo
└── vercel.json               # Config de deploy en Vercel
```

### Modelo de datos

```
User ──→ Professional ──→ Availability
 │                           │
 └──→ Appointment ←──────────┘
       │
       └──→ Client (User)
```

- `User` con rol: `ADMIN`, `PROFESSIONAL` o `CLIENT`
- `Professional` extiende a User con teléfono, especialidad, descripción, duración
- `Availability` define franjas horarias semanales (día, hora inicio, hora fin)
- `Appointment` vincula cliente + profesional en una fecha y hora con estado

##  Cómo empezar

```bash
# Requisitos: Node.js >= 20, pnpm >= 9

# 1. Clonar e instalar
git clone https://github.com/francogodoyy/agendalo.git
cd agendalo
pnpm install

# 2. Variables de entorno
# Crear apps/web/.env y packages/db/.env:
#   DATABASE_URL=postgresql://...
#   AUTH_SECRET=tu-secreto
#   AUTH_URL=http://localhost:3000

# 3. Sincronizar schema y seed
pnpm db:push
pnpm db:seed

# 4. Iniciar servidor de desarrollo
pnpm dev
```

### Credenciales de demo

| Rol | Email | Contraseña |
|-----|-------|------------|
| Profesional | demo@turnos.com | demo123 |
| Cliente | cliente@demo.com | demo123 |
| Admin | admin@turnos.com | demo123 |

##  Deploy en Vercel

1. Conectá tu repo de GitHub a Vercel
2. Seteá **Root Directory** → `apps/web`
3. Agregá las variables de entorno (`DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY`)
4. Deploy — el hook `postinstall` corre `prisma generate` automáticamente

> **Nota**: Las migraciones deben aplicarse manualmente post-deploy:
> `npx prisma migrate deploy` apuntando a la DB de producción.

##  Capturas de pantalla

> *(Reemplazá con capturas reales de tu deploy)*

| | |
|---|---|
| **Landing** — buscá profesionales | **Reserva** — selección de día y horario |
| **Dashboard** — stats + pendientes | **Calendario** — grilla semanal |
| **Disponibilidad** — administrá horarios | **Perfil** — especialidad, teléfono, foto |

##  Decisiones técnicas

- **Monorepo**: Separación clara entre capa de datos, tipos compartidos y UI. Muestra madurez arquitectónica.
- **Sin backend separado**: Todo vive en API Routes de Next.js para deploy simple en Vercel.
- **Middleware Edge**: Solo verifica cookies (sin Prisma) para mantenerse bajo el límite de 1 MB.
- **Zona horaria Argentina**: Fechas en UTC, se muestran en `America/Argentina/Buenos_Aires`.
- **Auto-reserva permitida**: Los clientes pueden reservar todos los turnos futuros que quieran mientras no se superpongan.

##  Licencia

Franco Godoy
