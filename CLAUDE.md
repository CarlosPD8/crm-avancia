@AGENTS.md

# CRM Avancia — Documentación de Referencia

CRM interno SaaS para una empresa de automatizaciones con IA. Gestiona citas comerciales, leads, propuestas y búsqueda de prospectos. Desplegado en VPS propio con Docker + Caddy.

---

## Stack

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.6 |
| UI Runtime | React | 19.2.4 |
| Estilos | Tailwind CSS | v4 |
| ORM | Prisma | 5.22.0 |
| Base de datos | PostgreSQL | 16 |
| Validación | Zod | v4 |
| Formularios | react-hook-form + @hookform/resolvers | v7 |
| Fechas | date-fns | v4 |
| Iconos | lucide-react | v1 |
| Fuente | Plus Jakarta Sans (next/font/google) | — |

`next.config.ts`: `output: "standalone"`, `serverActions.bodySizeLimit: "100mb"`.

---

## Arquitectura y Patrones

### Server Components vs Client Components
- **Páginas** (`app/**/page.tsx`): Server Components. Hacen queries directas a Prisma y serializan `Date → string` antes de pasar props a Client Components.
- **Tablas, formularios, filtros**: Client Components (`"use client"`).
- **Regla**: nunca importar `prisma` en Client Components.

### Server Actions (`actions/`)
Patrón uniforme en todos los módulos:
```ts
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }
```
Firmas de ejemplo:
- `createAppointment(formData, newFiles: PendingFile[])`
- `updateAppointment(id, formData, newFiles: PendingFile[], removedFileIds: string[])`
- `deleteAppointment(id)` — también borra archivos en disco vía `deleteFiles()`

### Filtros por URL
Los filtros (estado, búsqueda, fechas) se guardan como search params (`?status=PENDING&q=empresa`). El Server Component los lee de `searchParams` y construye el `where` de Prisma. Los Client Components de filtros usan `useRouter().push()` para actualizar la URL.

### Doble clic para editar
En todas las tablas (`AppointmentsTable`, `LeadsTable`, `ProposalsTable`) el prop `onRowDoubleClick` navega a `/<módulo>/<id>`. La ruta `[id]` sirve tanto para crear (`id === "new"`) como para editar.

---

## Base de Datos — Modelos Prisma

```
User
  id, name, email (unique), role (ADMIN|AGENT), createdAt
  → appointments[]

Appointment
  id, companyName, contactName, email, phone?, date (DateTime), time (string "HH:MM")
  status (PENDING|CONFIRMED|DONE|CANCELLED), notes?, assignedTo? (FK User)
  → files[] (AppointmentFile), assignedUser?

AppointmentFile
  id, appointmentId (FK → Appointment, onDelete: Cascade)
  filename, originalName, size (Int), createdAt

Lead
  id, companyName, contactName, email, phone?, website?, industry
  source (LeadSource enum), status (LeadStatus enum), notes?
  → proposals[]

Proposal
  id, companyName, contactName, email, phone?, leadId? (FK Lead)
  status (DRAFT|SENT|NEGOTIATING|ACCEPTED|REJECTED)
  value (Float?), notes?, sentAt (DateTime?), createdAt, updatedAt
  → files[] (ProposalFile)

ProposalFile
  id, proposalId (FK → Proposal, onDelete: Cascade)
  filename, originalName, size (Int), createdAt

ProspectSearch
  id, industry, location, companySize?, keywords?, createdAt
```

**LeadSource enum**: MANUAL, GOOGLE_PLACES, LINKEDIN, APOLLO, CLAY, CLEARBIT, SERPAPI, REFERRAL, WEBSITE, OTHER

---

## Sistema de Archivos

### Upload (`POST /api/upload`)
- Acepta: PDF, Word, Excel, PowerPoint, JPG, PNG, WebP
- Límite: 100 MB por archivo
- Guarda en: `UPLOAD_DIR` (env var) → por defecto `<cwd>/uploads`; en producción `/app/uploads` (volumen Docker `crm_uploads`)
- Nombre en disco: `<timestamp>-<nombre_saneado>`
- Responde: `{ filename, originalName, size }`

### Descarga (`GET /api/files/[filename]`)
- Lee el archivo de `UPLOAD_DIR` y lo devuelve con el `Content-Type` correcto.

### Componente `FileUploadZone`
Props: `existingFiles: ExistingFile[]`, `pendingFiles: PendingFile[]`, `onPendingAdd`, `onPendingRemove`, `onExistingRemove`.
- Sube inmediatamente al seleccionar o soltar
- `PendingFile`: aún no guardado en BD (solo en `uploads/`)
- `ExistingFile`: ya guardado en BD (tiene `id`)
- Al guardar el formulario se pasan `newFiles[]` y `removedFileIds[]` a la Server Action

---

## Theming — Variables CSS (`app/globals.css`)

El diseño usa **exclusivamente CSS variables**. No hay colores hardcodeados de Tailwind.

| Variable | Light | Dark |
|---|---|---|
| `--bg` | `#EAE5D2` (crema) | `#0C1829` (azul marino) |
| `--bg-card` | `#FFFFFF` | `#112237` |
| `--bg-sidebar` | `#F8F7F2` | `#0E1E35` |
| `--bg-input` | `#EDE8D8` | `#0E1C2F` |
| `--bg-elevated` | `#F2EDE0` | `#172D47` |
| `--text-1` | `#1A1814` | `#E8F0FA` |
| `--text-2` | `#4A4540` | `#8AAFC8` |
| `--text-3` | `#9A948E` | `#4E7090` |
| `--accent` | `#C9950A` (dorado) | `#F0C040` |
| `--accent-foreground` | `#FFFFFF` | `#1A1000` |
| `--nav-active-bg` | `#1C1813` | `#F0C040` |
| `--nav-active-text` | `#FFFFFF` | `#1A1000` |
| `--border` | `#DDD8C8` | `#1E3650` |
| `--border-strong` | `#C8C3B3` | `#2A4A68` |
| `--success` | `#16a34a` | `#4ade80` |
| `--warning` | `#d97706` | `#fbbf24` |
| `--danger` | `#dc2626` | `#f87171` |
| `--info` | `#2563eb` | `#60a5fa` |

El toggle de tema está en el footer del `Sidebar`. El `ThemeProvider` aplica `dark` class al `<html>`.

### Colores de estado (StatusBadge)
- PENDING / NEW → `--warning` + `--warning-muted`
- CONFIRMED / CONTACTED → `--info` + `--info-muted`
- DONE / QUALIFIED / CONVERTED → `--success` + `--success-muted`
- CANCELLED / DISCARDED → `--danger` + `--danger-muted`

---

## Estructura de Módulos

### `/dashboard`
Server Component. Queries paralelas con `Promise.all`: conteo de citas/leads/propuestas, próximas citas, últimos leads. Componentes: `MetricsGrid`, `UpcomingAppointments`, `LatestLeads`, `DashboardGreeting`.

### `/appointments`
- Lista: `AppointmentsViewClient` → toggle tabla/calendario
  - **Tabla** (`AppointmentsTable`): columnas empresa, email, teléfono, fecha, hora, estado, responsable, archivos
  - **Calendario** (`AppointmentCalendar`): vista mensual, navegación mes a mes, píldoras por día coloreadas por estado, clic navega al detalle
- Detalle/edición: `AppointmentForm` con `FileUploadZone`
- Filtros: estado, búsqueda texto, rango de fechas

### `/leads`
- Lista: `LeadsTable` con columnas empresa, contacto, sector, fuente, estado, archivos
- Detalle/edición: `LeadForm`
- Filtros: estado, búsqueda texto

### `/proposals`
- Lista: `ProposalsTable` con columnas empresa, estado, valor, archivos, enviado, creado
- Detalle/edición: `ProposalForm` con `FileUploadZone` (múltiples archivos)
- `ProposalStatusBadge`: badge específico para el enum `ProposalStatus`

### `/prospect-search`
- `ProspectSearchForm` + `ProspectResultsTable`
- Actualmente usa mock data (`lib/mock-prospects.ts`)
- Preparado para providers externos: `lib/prospect-providers/google-places.ts`, `lib/prospect-providers/hunter.ts`
- Botón "Guardar como lead" crea un Lead desde el prospecto

---

## Componentes UI Reutilizables (`components/ui/`)

| Componente | Props clave |
|---|---|
| `Button` | `variant?: "primary"\|"secondary"\|"danger"\|"ghost"`, `size?`, `isLoading?` |
| `Input` | Wrapper de `<input>` con estilos de variables CSS |
| `Select` | Wrapper de `<select>` |
| `Textarea` | Wrapper de `<textarea>` |
| `StatusBadge` | `status: AppointmentStatus\|LeadStatus`, `size?: "sm"\|"md"` |
| `MetricCard` | `title`, `value`, `icon`, `trend?` |
| `DataTable<T>` | `columns: Column<T>[]`, `data: T[]`, `onRowDoubleClick?`, `actions?` |
| `EmptyState` | `icon?`, `title`, `description`, `action?` |
| `FileUploadZone` | Ver sección Sistema de Archivos |
| `Modal` | `open`, `onClose`, `title`, `children` |

---

## Layout

```
app/layout.tsx
  ThemeProvider
    html (Plus Jakarta Sans, h-full)
      body
        Sidebar (w-56 fijo, 2-column grid nav, theme toggle en footer)
        main
          Header (breadcrumb: "Inicio / [Página actual]")
          PageContainer (children)
```

`Sidebar`: navegación con íconos + texto, estado activo con `--nav-active-bg` / `--nav-active-text`.

---

## Despliegue

### Docker (producción)
- Imagen multi-stage: deps → builder → runner
- Stage runner: `node:20-alpine`, usuario `nextjs` (no root)
- `UPLOAD_DIR=/app/uploads`, volumen Docker `crm_uploads` montado en `/app/uploads`
- Prisma CLI disponible en `/app/node_modules/.bin/prisma` (copiado explícitamente en Dockerfile)
- Puerto: `3000`

### Comandos VPS
```bash
# Aplicar migraciones
docker exec n8n-crm-avancia-1 npx prisma migrate deploy
# Si falla con "not found":
docker exec n8n-crm-avancia-1 node /app/node_modules/prisma/build/index.js migrate deploy

# Permisos uploads
docker exec -u root n8n-crm-avancia-1 chown nextjs:nodejs /app/uploads

# Rebuild
docker compose up -d --build crm-avancia
```

### Variables de entorno requeridas
```env
DATABASE_URL="postgresql://user:pass@host:5432/crm_avancia"
UPLOAD_DIR="/app/uploads"   # solo en producción Docker
```

---

## Migraciones Prisma

| Migración | Descripción |
|---|---|
| `20260513113608_init` | Schema inicial: User, Appointment, Lead, ProspectSearch |
| `20260513175327_add_proposals` | Modelo Proposal con PDF único |
| `20260519111818_add_multi_files` | Drop columnas pdf de Proposal; nuevas tablas AppointmentFile y ProposalFile |

---

## Convenciones de Código

- **Serialización**: las páginas Server Component siempre convierten `Date` a `string` (`.toISOString()`) antes de pasar a Client Components. Los tipos `Serialized*` están definidos en los componentes de tabla.
- **Validadores**: Zod schemas en `lib/validators/*.schema.ts`. Se usan en Server Actions con `schema.safeParse()` y en formularios con `zodResolver()`.
- **Eliminación en cascada**: `onDelete: Cascade` en FK de archivos. La Server Action `delete*` también elimina archivos del disco con `deleteFiles(filenames[])`.
- **Sin seed**: la BD se crea vacía. El usuario añade datos manualmente.
- **IDs**: todos `cuid()`.
- **Comentarios**: solo cuando el "por qué" no es obvio.
